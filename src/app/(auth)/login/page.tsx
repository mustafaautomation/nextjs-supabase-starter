import type { Metadata } from 'next';
import { Suspense } from 'react';
import { signIn } from '../actions';
import { AuthForm } from '../auth-form';

export const metadata: Metadata = { title: 'Sign in' };

export default function LoginPage() {
  return (
    <section className="narrow">
      <h1>Sign in</h1>
      <Suspense fallback={<p>Loading…</p>}>
        <AuthForm mode="login" action={signIn} />
      </Suspense>
    </section>
  );
}
