import { expect, test } from '@playwright/test';
import { addNote, signUp } from './helpers';

test('create, edit and delete a note', async ({ page }) => {
  await signUp(page);
  await expect(page.getByText('No notes yet.')).toBeVisible();

  await addNote(page, 'Buy milk', 'Two litres');
  const list = page.getByRole('list', { name: 'Notes' });
  await expect(list.getByText('Two litres')).toBeVisible();

  await list.getByRole('button', { name: 'Edit Buy milk' }).click();
  const edit = page.getByRole('form', { name: 'Edit Buy milk' });
  await edit.getByLabel('Title').fill('Buy oat milk');
  await edit.getByRole('button', { name: 'Save' }).click();
  await expect(list.getByRole('heading', { name: 'Buy oat milk' })).toBeVisible();
  await expect(list.getByRole('heading', { name: 'Buy milk', exact: true })).toHaveCount(0);

  // Survives a reload: it really was saved in Postgres.
  await page.reload();
  await expect(list.getByRole('heading', { name: 'Buy oat milk' })).toBeVisible();

  await list.getByRole('button', { name: 'Delete Buy oat milk' }).click();
  await expect(list).toHaveCount(0);
  await expect(page.getByText('No notes yet.')).toBeVisible();
});

test('notes are newest first', async ({ page }) => {
  await signUp(page);
  await addNote(page, 'First');
  await addNote(page, 'Second');
  await expect(page.getByRole('list', { name: 'Notes' }).getByRole('heading')).toHaveText(['Second', 'First']);
});

test('validation errors are shown and nothing is saved', async ({ page }) => {
  await signUp(page);
  const form = page.getByRole('form', { name: 'New note' });
  await form.getByLabel('Title').fill('   ');
  await form.getByRole('button', { name: 'Add note' }).click();
  await expect(form.getByText('Title is required.')).toBeVisible();
  await expect(form.getByLabel('Title')).toHaveAttribute('aria-invalid', 'true');
  await page.reload();
  await expect(page.getByText('No notes yet.')).toBeVisible();
});

test("one account never sees another account's notes", async ({ browser }) => {
  const alicePage = await browser.newPage();
  await signUp(alicePage);
  await addNote(alicePage, 'Alice only');

  const bobPage = await browser.newPage();
  await signUp(bobPage);
  await expect(bobPage.getByText('No notes yet.')).toBeVisible();
  await expect(bobPage.getByText('Alice only')).toHaveCount(0);

  await alicePage.close();
  await bobPage.close();
});
