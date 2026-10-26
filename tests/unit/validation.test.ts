import { describe, expect, it } from 'vitest';
import { credentialsSchema, noteIdSchema, noteSchema, parseForm } from '@/lib/validation';

function form(values: Record<string, string>): FormData {
  const f = new FormData();
  for (const [k, v] of Object.entries(values)) f.set(k, v);
  return f;
}

describe('credentials', () => {
  it('normalises the email and accepts an 8+ character password', () => {
    const r = parseForm(credentialsSchema, form({ email: '  Alice@Example.COM ', password: 'correct horse' }), [
      'email',
      'password',
    ]);
    expect(r).toEqual({ ok: true, data: { email: 'alice@example.com', password: 'correct horse' } });
  });

  it.each([
    [{ email: 'not-an-email', password: 'longenough' }, 'email', 'Enter a valid email address.'],
    [{ email: 'a@b.co', password: 'short' }, 'password', 'Password must be at least 8 characters.'],
    [{ email: 'a@b.co', password: 'x'.repeat(73) }, 'password', 'Password must be at most 72 characters.'],
    [{ password: 'longenough' }, 'email', 'Enter a valid email address.'],
    [{ email: 'a@b.co' }, 'password', 'Password is required.'],
  ])('rejects %j with a message on %s', (values, field, message) => {
    const r = parseForm(credentialsSchema, form(values), ['email', 'password']);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.fieldErrors[field]).toBe(message);
  });
});

describe('notes', () => {
  it('trims the title and defaults the body to empty', () => {
    const r = parseForm(noteSchema, form({ title: '  Groceries  ' }), ['title', 'body']);
    expect(r).toEqual({ ok: true, data: { title: 'Groceries', body: '' } });
  });

  it('keeps body whitespace as typed', () => {
    const r = parseForm(noteSchema, form({ title: 't', body: '  line 1\nline 2 ' }), ['title', 'body']);
    expect(r.ok && r.data.body).toBe('  line 1\nline 2 ');
  });

  it.each([
    [{ title: '' }, 'title', 'Title is required.'],
    [{ title: '    ' }, 'title', 'Title is required.'],
    [{}, 'title', 'Title is required.'],
    [{ title: 'x'.repeat(121) }, 'title', 'Title must be at most 120 characters.'],
    [{ title: 'ok', body: 'x'.repeat(2001) }, 'body', 'Note must be at most 2000 characters.'],
  ])('rejects %j', (values, field, message) => {
    const r = parseForm(noteSchema, form(values), ['title', 'body']);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.fieldErrors[field]).toBe(message);
  });

  it('accepts the exact limits (120 / 2000)', () => {
    const r = parseForm(noteSchema, form({ title: 'x'.repeat(120), body: 'y'.repeat(2000) }), ['title', 'body']);
    expect(r.ok).toBe(true);
  });

  it('ignores fields that were not asked for', () => {
    const r = parseForm(noteSchema, form({ title: 'a', user_id: 'someone-else' }), ['title', 'body']);
    expect(r.ok && r.data).toEqual({ title: 'a', body: '' });
  });

  it('only accepts UUID note ids', () => {
    expect(noteIdSchema.safeParse('6f1c2a7e-8f43-4b8e-9a51-0d7c1f4e2b33').success).toBe(true);
    expect(noteIdSchema.safeParse('1 or 1=1').success).toBe(false);
    expect(noteIdSchema.safeParse(null).success).toBe(false);
  });
});
