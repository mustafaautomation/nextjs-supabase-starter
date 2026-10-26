# nextjs-supabase-starter

[![CI](https://github.com/mustafaautomation/nextjs-supabase-starter/actions/workflows/ci.yml/badge.svg)](https://github.com/mustafaautomation/nextjs-supabase-starter/actions/workflows/ci.yml)

A small **Next.js 16 + Supabase** starter: email and password sign-in, one CRUD feature (private notes), and Postgres row-level security doing the access control, with the tests to prove it. Every push runs unit tests, RLS tests against a real local Supabase stack, and Playwright end-to-end tests with axe accessibility checks; any failure blocks the build.

Personal open-source project, built with AI coding agents.

## What's in it

- **Auth** with `@supabase/ssr`: sign up, sign in, sign out, cookie sessions. `src/proxy.ts` (Next 16's replacement for middleware) refreshes the session with `getClaims()` and redirects signed-out visitors away from `/notes`. Server Actions re-check the user themselves instead of trusting the proxy, and `?next=` only accepts same-site paths.
- **Notes CRUD** with Server Actions and `useActionState`: create, edit, delete, newest first. Inputs are validated with zod on the server, and the same limits are enforced again in Postgres with `CHECK` constraints.
- **Row-level security** in `supabase/migrations/`: owners can select, insert, update and delete only their own rows, signed-out (`anon`) requests are refused, and a trigger stops a note from being moved to another user.
- **Cache Components** are left on (the Next 16 default for new apps), so session reads sit behind `<Suspense>` and the static shell still prerenders.
- **Accessibility**: labelled fields, `aria-invalid` and `aria-describedby` on errors, a live region for form status, and a skip link. Checked with axe in CI.

## Tests

| Layer                               | Where                                     | What it proves                                                                                                                                                                                                                        |
| ----------------------------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Unit (Vitest)                       | `tests/unit`                              | Validation rules and limits, redirect rules, open-redirect protection.                                                                                                                                                                |
| RLS (Vitest + supabase-js)          | `tests/rls`                               | Runs against the local stack with the **publishable key only**. Another user can't read, update, delete or plant notes, the owner can't hand a note away, anon gets `42501`, and the DB rejects blank or oversized titles.            |
| E2E (Playwright, headless Chromium) | `tests/e2e/auth.spec.ts`, `notes.spec.ts` | Sign-up, sign-in, sign-out, a wrong password, a duplicate email, redirects in both directions, full create, edit and delete (checked again after a reload), ordering, validation, and two accounts that never see each other's notes. |
| Accessibility (axe)                 | `tests/e2e/a11y.spec.ts`                  | No WCAG 2.1 A/AA violations on the home, login and signup pages, the login form with errors, or the notes page (empty, with a note, and in edit mode).                                                                                |

## CI (`.github/workflows/ci.yml`)

All three jobs must pass:

1. **checks**: Prettier, ESLint (zero warnings), `tsc`, unit tests, production build.
2. **e2e**: `supabase start` (Postgres, Auth, PostgREST and the API gateway; unused services are excluded) applies the migration, runs `supabase db lint`, then the RLS tests, a production build served with `next start`, and Playwright with axe.
3. **secrets**: gitleaks over the full git history.

## Run it locally

You need Node 24, Docker and the [Supabase CLI](https://supabase.com/docs/guides/local-development/cli/getting-started).

```bash
npm ci
npm run db:start          # local Supabase; applies supabase/migrations
npm run env:local         # writes .env.local with the local URL + publishable key
npm run dev               # http://localhost:3000

npm test                  # unit
npm run test:rls          # RLS against the local stack
npx playwright install chromium
npm run test:e2e          # starts `next dev` itself if nothing is running on :3000
```

The local stack has email confirmation turned off (`supabase/config.toml`) so tests can sign up and get a session straight away. On a hosted project, confirmation is on by default; the sign-up form handles that by asking the user to check their inbox.

## Use with a hosted Supabase project

1. `supabase link --project-ref <your-ref>` then `supabase db push` to apply the migration.
2. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (see `.env.example`). Both are public values; the app never needs the service-role or secret key.
3. Add your site URL under Auth → URL Configuration.

## Layout

```
src/proxy.ts                    session refresh + redirects
src/lib/supabase/{server,proxy}.ts
src/lib/{auth,validation,routes}.ts
src/app/(auth)/                 login, signup, actions
src/app/notes/                  page, actions, forms
supabase/migrations/            table, constraints, trigger, RLS policies
tests/{unit,rls,e2e}/
```

## License

MIT
