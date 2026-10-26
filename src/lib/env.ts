/**
 * Public Supabase settings. Both values are safe to ship to the browser:
 * the publishable (anon) key only ever acts as `anon` or as the signed-in
 * user, so row-level security decides what it can see.
 */
export function supabaseEnv(): { url: string; key: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY. ' +
        'Run `npm run env:local` after `supabase start`, or copy .env.example to .env.local.',
    );
  }
  return { url, key };
}
