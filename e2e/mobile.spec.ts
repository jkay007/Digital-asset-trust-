import { expect, test } from '@playwright/test';

test.describe('responsive layout (mobile)', () => {
  test('navigation menu opens and links work', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Open navigation menu' }).click();
    const nav = page.getByRole('navigation', { name: 'Mobile' });
    await expect(nav).toBeVisible();
    await nav.getByRole('link', { name: 'Marketplace' }).click();
    await expect(page).toHaveURL(/\/marketplace/);
  });

  test('marketplace filters open in a sheet and apply', async ({ page }) => {
    await page.goto('/marketplace');
    await page.getByRole('button', { name: /Filters/ }).click();
    const sheet = page.getByRole('dialog');
    await sheet.getByLabel('Regulator Record Checked').check();
    await expect(page).toHaveURL(/verification=regulator_record_checked/);
    await sheet.getByRole('button', { name: /Show \d+ results?/ }).click();
    await expect(sheet).toBeHidden();
    await expect(page.locator('main article').first()).toContainText('Regulator Record Checked');
  });

  test('pages have no horizontal overflow', async ({ page }) => {
    for (const path of ['/', '/marketplace', '/verification', '/login']) {
      await page.goto(path);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow, `horizontal overflow on ${path}`).toBeLessThanOrEqual(1);
    }
  });
});
