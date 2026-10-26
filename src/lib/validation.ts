import { z } from 'zod';

export const credentialsSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email('Enter a valid email address.')),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters.')
    .max(72, 'Password must be at most 72 characters.'),
});

export const noteSchema = z.object({
  title: z.string().trim().min(1, 'Title is required.').max(120, 'Title must be at most 120 characters.'),
  body: z.string().max(2000, 'Note must be at most 2000 characters.').default(''),
});

export const noteIdSchema = z.uuid('Invalid note id.');

export type FieldErrors = Partial<Record<string, string>>;

export type ParseResult<T> = { ok: true; data: T } | { ok: false; fieldErrors: FieldErrors };

/** Validate FormData against a schema and return the first message per field. */
export function parseForm<S extends z.ZodType>(schema: S, form: FormData, fields: string[]): ParseResult<z.output<S>> {
  const raw: Record<string, unknown> = {};
  for (const field of fields) {
    const value = form.get(field);
    if (typeof value === 'string') raw[field] = value;
  }
  const result = schema.safeParse(raw);
  if (result.success) return { ok: true, data: result.data };
  const fieldErrors: FieldErrors = {};
  for (const issue of result.error.issues) {
    const key = String(issue.path[0] ?? 'form');
    fieldErrors[key] ??= key in raw || key === 'form' ? issue.message : (requiredMessage(key) ?? issue.message);
  }
  return { ok: false, fieldErrors };
}

function requiredMessage(field: string): string | undefined {
  return { email: 'Enter a valid email address.', password: 'Password is required.', title: 'Title is required.' }[
    field
  ];
}
