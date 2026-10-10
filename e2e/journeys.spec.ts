import { expect, test, type Browser, type Page } from '@playwright/test';
import { accounts, signIn, type Account } from './fixtures';

/**
 * Critical journeys across roles, run in order against the real backend:
 * seller submits -> reviewer requests changes -> seller resubmits -> admin
 * approves (unpublished) -> reviewer-recorded verification -> admin publishes ->
 * anonymous enquiry -> buyer saves + mandate -> admin handles enquiry, marks sold.
 */
test.describe.configure({ mode: 'serial' });

const { run, accounts: acc } = accounts();
const listingTitle = `Authorised EMI journey ${run}`;
let submissionUrl = '';
let adminListingUrl = '';
let publicListingUrl = '';

async function as(browser: Browser, account: Account | null): Promise<Page> {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  if (account) await signIn(page, account);
  return page;
}

async function register(page: Page, kind: 'buyer' | 'seller', account: Account) {
  await page.goto(`/register/${kind}`);
  await page.getByLabel('Full name').fill(account.name);
  await page.getByLabel('Work email').fill(account.email);
  await page.getByLabel('Company').fill(`${account.name} Holdings`);
  await page.getByLabel('Country').fill('Ireland');
  if (kind === 'buyer') await page.getByLabel('Buyer type').selectOption('strategic');
  await page.getByLabel(/^Password/).fill(account.password);
  await page.getByLabel('Confirm password').fill(account.password);
  await page.getByLabel(/I accept the/).check();
  await page.getByRole('button', { name: `Create ${kind} account` }).click();
}

test('seller registers, validation blocks an incomplete submission, then submits with a private document', async ({ browser }) => {
  const page = await as(browser, null);
  await register(page, 'seller', acc.seller);
  await expect(page).toHaveURL(/\/dashboard\/submissions\/new/);

  await page.getByLabel('Listing title').fill(listingTitle);
  await page.getByRole('button', { name: 'Submit for review' }).click();
  await expect(page.getByText('Please complete the highlighted fields before submitting for review.')).toBeVisible();
  await expect(page.getByText('Select a category')).toBeVisible();
  await expect(page.getByText('Please confirm the declaration')).toBeVisible();

  await page.getByLabel('Category').selectOption({ label: 'Payments & EMIs' });
  await page.getByLabel('Jurisdiction').selectOption({ label: 'Malta' });
  await page.getByLabel('Summary').fill('Authorised electronic money institution with an active safeguarding account and passporting.');
  await page.getByLabel('Description').fill('The company issues e-money accounts to SMEs.\n\nManagement will support a transition.');
  await page.getByLabel('Transaction type').selectOption('full_acquisition');
  await page.getByLabel('Operating status').selectOption('operating');
  await page.getByRole('textbox', { name: 'Asking price', exact: true }).fill('1500000');
  await page.getByLabel('Licence / authorisation type').fill('Electronic money institution licence');
  await page.getByLabel('Regulator').fill('Malta Financial Services Authority (MFSA)');
  await page.getByLabel('Licence or registration number').fill('E2E-LIC-001');
  await page.getByLabel('Included assets').fill('EMI licence held by the target\nSafeguarding account');
  await page.getByLabel('Highlights').fill('Passporting notifications in place');
  await page.getByLabel('Company legal name').fill(`E2E Confidential Payments Ltd ${run}`);
  await page.getByLabel('Contact email').fill(acc.seller.email);
  await page.getByLabel(/I confirm that I am authorised/).check();

  await page.getByRole('button', { name: 'Save draft' }).click();
  await expect(page).toHaveURL(/\/dashboard\/submissions\/[0-9a-f-]{36}$/);
  submissionUrl = page.url();
  await expect(page.getByText('Draft', { exact: true })).toBeVisible();

  await page.getByLabel('Document type').selectOption('licence');
  await page.getByLabel('File').setInputFiles({
    name: 'emi-licence.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from(`%PDF-1.4 e2e licence ${run}`),
  });
  await page.getByRole('button', { name: 'Upload' }).click();
  await expect(page.getByText('emi-licence.pdf').first()).toBeVisible();

  await page.getByRole('button', { name: 'Submit for review' }).click();
  await expect(page).toHaveURL(/\/dashboard\/submissions$/);
  const row = page.getByRole('row', { name: new RegExp(listingTitle) });
  await expect(row).toContainText('Submitted');
  await page.context().close();
});

test('the submitted listing is not public', async ({ browser }) => {
  const page = await as(browser, null);
  await page.goto(`/marketplace?q=${run}`);
  await expect(page.getByText('No opportunities match these filters')).toBeVisible();
  await page.context().close();
});

test('reviewer starts review, opens the document via the audited function and requests changes, but cannot approve', async ({ browser }) => {
  const page = await as(browser, acc.reviewer);
  await page.goto('/admin/submissions');
  await page.getByRole('link', { name: listingTitle }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(listingTitle);
  await expect(page.getByText(`E2E Confidential Payments Ltd ${run}`)).toBeVisible();

  await page.getByRole('button', { name: 'Start review' }).click();
  await expect(page.getByText('Under review').first()).toBeVisible();
  await expect(page.getByRole('button', { name: 'Approve' })).toHaveCount(0);
  await expect(page.getByText('Approval and rejection require an administrator.')).toBeVisible();

  // The function returns a 60-second signed URL; the browser fetches it as a download.
  const signedRequest = page.context().waitForEvent('request', (r) => r.url().includes('/storage/v1/object/sign/confidential-documents/'));
  await page.getByRole('button', { name: 'Open' }).click();
  const request = await signedRequest;
  const response = await request.response();
  expect(response?.status()).toBe(200);
  const body = await page.request.get(request.url());
  expect(await body.text()).toContain(`e2e licence ${run}`);

  await page.getByRole('button', { name: 'Request changes' }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByLabel('Feedback to the seller').fill('Please describe where client funds are safeguarded.');
  await dialog.getByRole('button', { name: 'Send feedback' }).click();
  await expect(page.getByText('Changes requested').first()).toBeVisible();
  await page.context().close();
});

test('seller sees the feedback, edits and resubmits', async ({ browser }) => {
  const page = await as(browser, acc.seller);
  await page.goto(submissionUrl);
  await expect(page.getByText('Changes requested by our reviewers')).toBeVisible();
  await expect(page.getByText('Please describe where client funds are safeguarded.')).toBeVisible();
  await page.getByLabel('Description').fill('Client funds are safeguarded with an EU credit institution.\n\nManagement will support a transition.');
  await page.getByRole('button', { name: 'Resubmit for review' }).click();
  await expect(page).toHaveURL(/\/dashboard\/submissions$/);
  await expect(page.getByRole('row', { name: new RegExp(listingTitle) })).toContainText('Submitted');
  await page.context().close();
});

test('admin approves (unpublished), records verification and publishes', async ({ browser }) => {
  const page = await as(browser, acc.admin);
  await page.goto('/admin/submissions');
  await page.getByRole('link', { name: listingTitle }).click();
  await page.getByRole('button', { name: 'Approve' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Approve' }).click();
  await expect(page).toHaveURL(/\/admin\/listings\/[0-9a-f-]{36}$/);
  adminListingUrl = page.url();
  await expect(page.getByText('Approved (unpublished)').first()).toBeVisible();
  await expect(page.getByText('Approved but not public.')).toBeVisible();

  // Still not public after approval.
  const anon = await as(browser, null);
  await anon.goto(`/marketplace?q=${run}`);
  await expect(anon.getByText('No opportunities match these filters')).toBeVisible();

  // Record a verification check.
  await page.getByLabel('Verification level').selectOption('company_checked');
  await page.getByLabel('Source reference').fill('Malta Business Registry extract');
  await page.getByRole('button', { name: 'Record verification' }).click();
  await expect(page.locator('section[aria-labelledby="verification-panel"] span[title]').first()).toContainText('Company Checked');
  await expect(page.getByText('Recorded by you')).toBeVisible();

  await page.getByRole('button', { name: 'Publish' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Publish' }).click();
  await expect(page.getByText('Published', { exact: true }).first()).toBeVisible();
  await page.getByRole('link', { name: 'View public page' }).click();
  await expect(page).toHaveURL(/\/listings\//);
  publicListingUrl = new URL(page.url()).pathname;

  await anon.goto(`/marketplace?q=${run}`);
  const card = anon.locator('main article').first();
  await expect(card).toContainText(listingTitle);
  await expect(card).toContainText('Company Checked');
  await expect(card.getByText('Demo listing')).toHaveCount(0);
  // Confidential details never reach the public page.
  await anon.goto(publicListingUrl);
  await expect(anon.getByRole('heading', { level: 1 })).toHaveText(listingTitle);
  await expect(anon.getByText(`E2E Confidential Payments Ltd ${run}`)).toHaveCount(0);
  await expect(anon.getByText('E2E-LIC-001')).toHaveCount(0);
  await anon.context().close();
  await page.context().close();
});

test('an anonymous visitor sends a confidential enquiry', async ({ browser }) => {
  const page = await as(browser, null);
  await page.goto(publicListingUrl);
  await page.getByRole('button', { name: 'Send confidential enquiry' }).click();
  await expect(page.getByText('Please enter your full name')).toBeVisible();
  await expect(page.getByText('You must agree before sending an enquiry')).toBeVisible();

  await page.getByLabel('Full name').fill('Quinn Visitor');
  await page.getByLabel('Email').fill(`visitor-${run}@e2e.test`);
  await page.getByLabel('Company').fill('Visitor Capital');
  await page.getByLabel('Buyer type').selectOption('private_equity');
  await page.getByLabel('Message').fill('We would like to discuss an acquisition of this EMI in the next six months.');
  await page.getByLabel(/I agree to the/).check();
  await page.getByRole('button', { name: 'Send confidential enquiry' }).click();
  await expect(page.getByText('Enquiry received')).toBeVisible();
  await page.context().close();
});

test('a buyer registers, saves the listing and registers a matching mandate', async ({ browser }) => {
  const page = await as(browser, null);
  await register(page, 'buyer', acc.buyer);
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole('heading', { name: /Welcome, Bram/ })).toBeVisible();

  await page.goto(publicListingUrl);
  await page.getByRole('button', { name: `Save ${listingTitle}` }).click();
  await expect(page.getByRole('button', { name: `Remove ${listingTitle} from saved listings` })).toHaveAttribute('aria-pressed', 'true');
  await page.goto('/dashboard/saved');
  await expect(page.locator('main article').filter({ hasText: listingTitle })).toBeVisible();

  await page.goto('/dashboard/mandates/new');
  await page.getByLabel('Mandate title').fill(`EU EMI up to EUR 2m ${run}`);
  await page.getByLabel('Payments & EMIs').check();
  await page.getByLabel('Maximum budget').fill('2000000');
  await page.getByRole('button', { name: 'Register mandate' }).click();
  await expect(page).toHaveURL(/\/dashboard\/mandates\/[0-9a-f-]{36}$/);
  await expect(page.locator('section[aria-labelledby="matches-heading"] article').filter({ hasText: listingTitle })).toBeVisible();

  // Buyers cannot reach the admin console.
  await page.goto('/admin');
  await expect(page.getByRole('heading', { name: 'You do not have access to this area' })).toBeVisible();
  await page.context().close();
});

test('admin handles the enquiry, marks the listing sold and the audit log records it', async ({ browser }) => {
  const page = await as(browser, acc.admin);
  await page.goto('/admin/enquiries');
  const item = page.locator('li').filter({ hasText: 'Quinn Visitor' });
  await expect(item).toContainText(listingTitle);
  await expect(item).toContainText('NDA requested');
  await item.getByLabel('Change status').selectOption('responded');
  await expect(page.getByText('Enquiry updated')).toBeVisible();

  await page.goto(adminListingUrl);
  await page.getByRole('button', { name: 'Mark as sold' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Mark as sold' }).click();
  await expect(page.getByText('Sold', { exact: true }).first()).toBeVisible();

  await page.goto('/admin/audit');
  await expect(page.getByText('asset.status_changed').first()).toBeVisible();
  await expect(page.getByText('document.accessed').first()).toBeVisible();

  const anon = await as(browser, null);
  await anon.goto(publicListingUrl);
  await expect(anon.getByText('This opportunity has been sold')).toBeVisible();
  await expect(anon.getByRole('button', { name: 'Send confidential enquiry' })).toHaveCount(0);
  await anon.context().close();
  await page.context().close();
});
