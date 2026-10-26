import 'server-only';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export type CurrentUser = { id: string; email: string | null };

/** The signed-in user from verified JWT claims, or null. */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims?.sub) return null;
  const email = typeof data.claims.email === 'string' ? data.claims.email : null;
  return { id: data.claims.sub, email };
}

/** For Server Actions and pages: re-check the session close to the data, never trust the client. */
export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  return user;
}
