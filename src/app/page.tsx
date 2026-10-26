import Link from 'next/link';

export default function Home() {
  return (
    <section className="stack">
      <h1>Notes, backed by Supabase</h1>
      <p>
        A small Next.js 16 app: email and password sign-in with Supabase Auth, and private notes you can create, edit
        and delete. Each note is protected by Postgres row-level security, so other accounts can&apos;t read or change
        it even if they call the API directly.
      </p>
      <p>
        <Link href="/signup" className="button">
          Create an account
        </Link>{' '}
        <Link href="/login">or sign in</Link>
      </p>
    </section>
  );
}
