import { readFileSync } from 'node:fs';
import { expect, type Page } from '@playwright/test';

export interface Account {
  email: string;
  password: string;
  name: string;
}

export function accounts(): { run: string; accounts: Record<'admin' | 'reviewer' | 'seller' | 'buyer', Account>; env: { DB_URL: string } } {
  return JSON.parse(readFileSync('e2e/.auth/accounts.json', 'utf8'));
}

export async function signIn(page: Page, account: Account) {
  await page.goto('/login');
  await page.getByLabel('Email').fill(account.email);
  await page.getByLabel('Password').fill(account.password);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(/\/dashboard/);
}

export async function signOut(page: Page) {
  await page.getByRole('button', { name: 'Account menu' }).click();
  await page.getByRole('menuitem', { name: 'Sign out' }).click();
  await expect(page.getByRole('link', { name: 'Sign in' })).toBeVisible();
}

/** Reads the "Showing a–b of N" summary on the marketplace. */
export async function resultTotal(page: Page): Promise<number> {
  const text = await page.getByText(/Showing \d+–\d+ of \d+/).innerText();
  return Number(text.match(/of (\d+)/)![1]);
}
