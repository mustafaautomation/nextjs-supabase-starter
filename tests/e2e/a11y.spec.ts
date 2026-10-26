import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { addNote, signUp } from './helpers';

async function expectNoViolations(page: Page) {
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  const summary = results.violations.map((v) => `${v.id} (${v.impact}): ${v.nodes.length} node(s) - ${v.help}`);
  expect(summary).toEqual([]);
}

for (const path of ['/', '/login', '/signup']) {
  test(`axe: ${path} has no WCAG A/AA violations`, async ({ page }) => {
    await page.goto(path);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expectNoViolations(page);
  });
}

test('axe: login form with validation errors has no violations', async ({ page }) => {
  await page.goto('/login');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.getByText('Enter a valid email address.')).toBeVisible();
  await expectNoViolations(page);
});

test('axe: notes page (with a note, and in edit mode) has no violations', async ({ page }) => {
  await signUp(page);
  await expectNoViolations(page);
  await addNote(page, 'Accessible note', 'Body text');
  await expectNoViolations(page);
  await page.getByRole('button', { name: 'Edit Accessible note' }).click();
  await expect(page.getByRole('form', { name: 'Edit Accessible note' })).toBeVisible();
  await expectNoViolations(page);
});
