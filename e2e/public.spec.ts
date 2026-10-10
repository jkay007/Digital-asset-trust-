import { expect, test } from '@playwright/test';
import { resultTotal } from './fixtures';

test.describe('public site', () => {
  test('homepage presents the hero, categories, featured listings and disclaimers', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Acquire regulated financial businesses');
    await expect(page.getByRole('search', { name: 'Search opportunities' })).toBeVisible();

    const categories = page.locator('section[aria-labelledby="categories-heading"] a[href^="/categories/"]');
    await expect(categories).toHaveCount(10);
    for (const name of [
      'Banks & Financial Institutions',
      'Payments & EMIs',
      'Crypto & Digital Assets',
      'Financial Licences',
      'Forex & Brokerage',
      'Investment Firms & Funds',
      'Casino & iGaming',
      'Payment Gateways & Banking Infrastructure',
      'Insurance',
      'Other Financial Businesses',
    ]) {
      await expect(page.getByRole('heading', { name, exact: true })).toBeVisible();
    }

    const featured = page.locator('section[aria-labelledby="featured-heading"] article');
    await expect(featured.first()).toBeVisible();
    // Demo data is labelled on every card.
    const count = await featured.count();
    for (let i = 0; i < count; i++) await expect(featured.nth(i).getByText('Demo listing')).toBeVisible();

    await expect(page.getByRole('main').getByRole('heading', { name: 'Important notice' })).toBeVisible();
    await expect(page.getByText(/licences and authorisations are frequently not transferable/i).first()).toBeVisible();
    await expect(page.getByText(/not offers, solicitations or guarantees/i).first()).toBeVisible();
    await expect(page.getByText(/requires? prior regulatory approval/i).first()).toBeVisible();
  });

  test('hero search carries filters to the marketplace', async ({ page }) => {
    await page.goto('/');
    await page.getByLabel('Category').selectOption({ label: 'Payments & EMIs' });
    await page.getByRole('button', { name: 'Search' }).click();
    await expect(page).toHaveURL(/\/marketplace\?category=payments-emis/);
    const cards = page.locator('main article');
    await expect(cards.first()).toBeVisible();
    const n = await cards.count();
    for (let i = 0; i < n; i++) await expect(cards.nth(i)).toContainText('Payments & EMIs');
  });

  test('marketplace filters, sorting, pagination and reset', async ({ page }) => {
    await page.goto('/marketplace');
    const total = await resultTotal(page);
    expect(total).toBeGreaterThan(12);
    await expect(page.getByText(`Showing 1–12 of ${total}`)).toBeVisible();

    // Pagination
    await page.getByRole('button', { name: 'Next page' }).click();
    await expect(page).toHaveURL(/page=2/);
    await expect(page.getByText(`Showing 13–24 of ${total}`)).toBeVisible();

    // Verification filter (desktop sidebar)
    const sidebar = page.getByRole('complementary', { name: 'Filters' });
    await sidebar.getByLabel('Documents Reviewed').check();
    await expect(page).toHaveURL(/verification=documents_reviewed/);
    await expect(page).not.toHaveURL(/page=2/);
    const filtered = await resultTotal(page);
    expect(filtered).toBeLessThan(total);
    const cards = page.locator('main article');
    for (let i = 0; i < (await cards.count()); i++) await expect(cards.nth(i)).toContainText('Documents Reviewed');

    // Price range in EUR equivalent
    await sidebar.getByLabel('Minimum').selectOption('1000000');
    await sidebar.getByLabel('Maximum').selectOption('5000000');
    await expect(page).toHaveURL(/min=1000000/);
    await expect(page).toHaveURL(/max=5000000/);
    await expect(page.getByText('Listings with price on request are excluded')).toBeVisible();

    // Transaction type and operating status
    await sidebar.getByLabel('Full acquisition (100%)').check();
    await sidebar.getByLabel('Operating', { exact: true }).check();
    await expect(page).toHaveURL(/type=full_acquisition/);
    await expect(page).toHaveURL(/operating=operating/);

    // Remove a single filter via its chip
    await page.getByRole('button', { name: 'Remove filter: Documents Reviewed' }).click();
    await expect(page).not.toHaveURL(/verification=/);

    // Reset all
    await page.getByRole('button', { name: 'Reset all' }).click();
    await expect(page).toHaveURL(/\/marketplace$/);
    await expect(page.getByText(`Showing 1–12 of ${total}`)).toBeVisible();

    // Sorting by price (high to low): the first card is the most expensive
    await page.getByLabel('Sort by').selectOption('price_desc');
    await expect(page).toHaveURL(/sort=price_desc/);
    await expect(page.locator('main article').first()).toContainText('CHF');

    // Category and jurisdiction selects
    await sidebar.getByLabel('Category').selectOption('insurance');
    await expect(page).toHaveURL(/category=insurance/);
    for (const card of await page.locator('main article').all()) await expect(card).toContainText('Insurance');
    await sidebar.getByLabel('Jurisdiction').selectOption('malta');
    await expect(page).toHaveURL(/jurisdiction=malta/);
    await expect(page.locator('main article')).toHaveCount(1);
  });

  test('keyword search and empty state', async ({ page }) => {
    await page.goto('/marketplace');
    await page.getByLabel('Search opportunities').fill('casino');
    await expect(page).toHaveURL(/q=casino/);
    await expect(page.locator('main article').first()).toContainText(/casino/i);
    await page.getByLabel('Search opportunities').fill('zzzqqqxxx');
    await expect(page.getByText('No opportunities match these filters')).toBeVisible();
    await page.getByRole('button', { name: 'Reset filters' }).last().click();
    await expect(page).toHaveURL(/\/marketplace$/);
  });

  test('asset detail page shows structured deal information and demo safeguards', async ({ page }) => {
    await page.goto('/marketplace');
    const first = page.locator('main article').first();
    const title = (await first.getByRole('heading').innerText()).trim();
    await first.getByRole('link').first().click();
    await expect(page).toHaveURL(/\/listings\//);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(title);
    await expect(page.getByText('Demo listing: for illustration only')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Deal information' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Licence & regulator' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Verification', exact: true })).toBeVisible();
    await expect(page.getByText('Regulatory considerations')).toBeVisible();
    await expect(page.getByText('Enquiries are disabled for demo listings')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Send confidential enquiry' })).toHaveCount(0);
    await expect(page.getByRole('heading', { name: 'Related opportunities' })).toBeVisible();
    await expect(page.locator('section[aria-labelledby="related-heading"] article').first()).toBeVisible();
  });

  test('SEO category and jurisdiction pages', async ({ page }) => {
    await page.goto('/categories/insurance');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Insurance');
    await expect(page).toHaveTitle(/Insurance companies and brokers for sale \| Global Financial Assets/);
    for (const card of await page.locator('main article').all()) await expect(card).toContainText('Insurance');

    await page.goto('/jurisdictions/malta');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Opportunities in Malta');
    await expect(page.getByText('Regulatory context')).toBeVisible();
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /Malta/);

    await page.goto('/jurisdictions');
    await expect(page.getByRole('heading', { name: 'European Union' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Caribbean & Atlantic' })).toBeVisible();
  });

  test('not-found handling', async ({ page }) => {
    await page.goto('/this-page-does-not-exist');
    await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible();
    await page.goto('/listings/not-a-real-listing');
    await expect(page.getByRole('heading', { name: 'Listing not available' })).toBeVisible();
    await page.goto('/categories/not-a-category');
    await expect(page.getByRole('heading', { name: 'Category not found' })).toBeVisible();
  });

  test('protected areas redirect anonymous visitors to sign in', async ({ page }) => {
    await page.goto('/dashboard/saved');
    await expect(page).toHaveURL(/\/login\?redirect=%2Fdashboard%2Fsaved/);
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/login\?redirect=%2Fadmin/);
  });

  test('sign-in form validates input and rejects bad credentials', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page.getByText('Enter a valid email address')).toBeVisible();
    await page.getByLabel('Email').fill('nobody@e2e.test');
    await page.getByLabel('Password').fill('wrong-password-1');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page.getByText('Incorrect email or password.')).toBeVisible();
  });
});
