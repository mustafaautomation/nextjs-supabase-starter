'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { credentialsSchema, parseForm } from '@/lib/validation';
import { safeNextPath } from '@/lib/routes';
import type { FormState } from '@/lib/form-state';

export async function signIn(_prev: FormState, form: FormData): Promise<FormState> {
  const parsed = parseForm(credentialsSchema, form, ['email', 'password']);
  if (!parsed.ok) return { fieldErrors: parsed.fieldErrors };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  // Same message for unknown email and wrong password, so the form can't be used to probe accounts.
  if (error) return { error: 'Email or password is incorrect.' };

  redirect(safeNextPath(form.get('next')));
}

export async function signUp(_prev: FormState, form: FormData): Promise<FormState> {
  const parsed = parseForm(credentialsSchema, form, ['email', 'password']);
  if (!parsed.ok) return { fieldErrors: parsed.fieldErrors };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp(parsed.data);
  if (error) return { error: error.message };
  if (!data.session) {
    // Email confirmation is on (the hosted default): no session until the link is clicked.
    return { message: 'Check your inbox to confirm your email, then sign in.' };
  }
  redirect('/notes');
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}
