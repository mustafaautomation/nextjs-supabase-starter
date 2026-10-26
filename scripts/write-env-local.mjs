// Writes .env.local from `supabase status -o env` for the local stack.
// Only the public URL and publishable key are written; .env.local is git-ignored.
import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const out = execFileSync('supabase', ['status', '-o', 'env'], { encoding: 'utf8' });
const vars = Object.fromEntries(
  out
    .split('\n')
    .map((line) => line.match(/^([A-Z_]+)="?([^"]*)"?$/))
    .filter(Boolean)
    .map((m) => [m[1], m[2]]),
);
const url = vars.API_URL;
const key = vars.PUBLISHABLE_KEY || vars.ANON_KEY;
if (!url || !key) {
  console.error(
    'Could not find API_URL and PUBLISHABLE_KEY/ANON_KEY in `supabase status -o env`. Is the stack running?',
  );
  process.exit(1);
}
writeFileSync('.env.local', `NEXT_PUBLIC_SUPABASE_URL=${url}\nNEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=${key}\n`);
console.log('wrote .env.local (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)');
