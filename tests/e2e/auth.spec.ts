import { expect, test } from '@playwright/test';
import { newAccount, signUp } from './helpers';

test('signed-out visitors are sent from /notes to /login and back after signing in', async ({ page, browser }) => {
  const account = await signUp(page);
  await page.getByRole('button', { name: 'Sign out' }).click();
  await expect(page).toHaveURL(/\/login$/);

  const fresh = await browser.newPage();
  await fresh.goto('/notes');
  await expect(fresh).toHaveURL(/\/login\?next=%2Fnotes$/);
  await fresh.getByLabel('Email').fill(account.email);
  await fresh.getByLabel('Password').fill(account.password);
  await fresh.getByRole('button', { name: 'Sign in' }).click();
  await expect(fresh).toHaveURL(/\/notes$/);
  await expect(fresh.getByTestId('signed-in-as')).toHaveText(account.email);
  await fresh.close();
});

test('a wrong password shows one generic error and keeps you signed out', async ({ page }) => {
  const account = await signUp(page);
  await page.getByRole('button', { name: 'Sign out' }).click();

  await page.getByLabel('Email').fill(account.email);
  await page.getByLabel('Password').fill('definitely-wrong');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.getByRole('alert')).toHaveText('Email or password is incorrect.');
  await expect(page).toHaveURL(/\/login/);

  await page.goto('/notes');
  await expect(page).toHaveURL(/\/login\?next=/);
});

test('sign-up validates input before calling Supabase', async ({ page }) => {
  await page.goto('/signup');
  await page.getByLabel('Email').fill('not-an-email');
  await page.getByLabel('Password').fill('short');
  await page.getByRole('button', { name: 'Create account' }).click();
  await expect(page.getByText('Enter a valid email address.')).toBeVisible();
  await expect(page.getByText('Password must be at least 8 characters.')).toBeVisible();
  await expect(page.getByLabel('Email')).toHaveAttribute('aria-invalid', 'true');
});

test('signing up twice with the same email is refused', async ({ page, browser }) => {
  const account = await signUp(page, newAccount());
  const other = await browser.newPage();
  await other.goto('/signup');
  await other.getByLabel('Email').fill(account.email);
  await other.getByLabel('Password').fill(account.password + 'x');
  await other.getByRole('button', { name: 'Create account' }).click();
  await expect(other.getByRole('alert')).toBeVisible();
  await expect(other).toHaveURL(/\/signup$/);
  await other.close();
});

test('signed-in users visiting /login are sent to /notes', async ({ page }) => {
  await signUp(page);
  await page.goto('/login');
  await expect(page).toHaveURL(/\/notes$/);
});
