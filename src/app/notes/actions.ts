'use server';

import { revalidatePath } from 'next/cache';
import { requireUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { noteIdSchema, noteSchema, parseForm } from '@/lib/validation';
import type { FormState } from '@/lib/form-state';

// Every action re-checks the session, and every query runs as the signed-in user,
// so the RLS policies in supabase/migrations decide which rows can be touched.

export async function createNote(_prev: FormState, form: FormData): Promise<FormState> {
  await requireUser();
  const parsed = parseForm(noteSchema, form, ['title', 'body']);
  if (!parsed.ok) return { fieldErrors: parsed.fieldErrors };

  const supabase = await createClient();
  const { error } = await supabase.from('notes').insert(parsed.data);
  if (error) return { error: 'Could not save the note. Please try again.' };

  revalidatePath('/notes');
  return { message: 'Note added.' };
}

export async function updateNote(_prev: FormState, form: FormData): Promise<FormState> {
  await requireUser();
  const id = noteIdSchema.safeParse(form.get('id'));
  if (!id.success) return { error: 'Invalid note.' };
  const parsed = parseForm(noteSchema, form, ['title', 'body']);
  if (!parsed.ok) return { fieldErrors: parsed.fieldErrors };

  const supabase = await createClient();
  const { data, error } = await supabase.from('notes').update(parsed.data).eq('id', id.data).select('id');
  if (error) return { error: 'Could not save the note. Please try again.' };
  // RLS hides other users' rows, so "not yours" and "doesn't exist" look the same: zero rows updated.
  if (!data || data.length === 0) return { error: 'Note not found.' };

  revalidatePath('/notes');
  return { message: 'Note saved.' };
}

export async function deleteNote(_prev: FormState, form: FormData): Promise<FormState> {
  await requireUser();
  const id = noteIdSchema.safeParse(form.get('id'));
  if (!id.success) return { error: 'Invalid note.' };

  const supabase = await createClient();
  const { data, error } = await supabase.from('notes').delete().eq('id', id.data).select('id');
  if (error) return { error: 'Could not delete the note. Please try again.' };
  if (!data || data.length === 0) return { error: 'Note not found.' };

  revalidatePath('/notes');
  return { message: 'Note deleted.' };
}
