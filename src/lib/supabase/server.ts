import 'server-only';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { connection } from 'next/server';
import { supabaseEnv } from '@/lib/env';

/** A Supabase client for Server Components and Server Actions, acting as the signed-in user. */
export async function createClient() {
  const cookieStore = await cookies();
  // Supabase checks token expiry against the clock. Mark this as request-time work so
  // Cache Components never tries to include it in a prerender or runtime prefetch.
  await connection();
  const { url, key } = supabaseEnv();

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Called from a Server Component, where cookies are read-only.
          // The proxy refreshes the session cookie on every request, so this is safe to ignore.
        }
      },
    },
  });
}
