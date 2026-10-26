import { randomUUID } from 'node:crypto';
import { expect, type Page } from '@playwright/test';

export function newAccount() {
  return { email: `e2e-${randomUUID()}@example.test`, password: `pw-${randomUUID().slice(0, 12)}` };
}

export async function signUp(page: Page, account = newAccount()) {
  await page.goto('/signup');
  await page.getByLabel('Email').fill(account.email);
  await page.getByLabel('Password').fill(account.password);
  await page.getByRole('button', { name: 'Create account' }).click();
  await expect(page).toHaveURL(/\/notes$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Your notes' })).toBeVisible();
  return account;
}

export async function addNote(page: Page, title: string, body = '') {
  const form = page.getByRole('form', { name: 'New note' });
  await form.getByLabel('Title').fill(title);
  if (body) await form.getByLabel('Note').fill(body);
  await form.getByRole('button', { name: 'Add note' }).click();
  await expect(page.getByRole('list', { name: 'Notes' }).getByRole('heading', { name: title })).toBeVisible();
}
