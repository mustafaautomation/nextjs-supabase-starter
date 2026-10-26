import type { Metadata } from 'next';
import { Suspense } from 'react';
import { signUp } from '../actions';
import { AuthForm } from '../auth-form';

export const metadata: Metadata = { title: 'Create account' };

export default function SignupPage() {
  return (
    <section className="narrow">
      <h1>Create an account</h1>
      <Suspense fallback={<p>Loading…</p>}>
        <AuthForm mode="signup" action={signUp} />
      </Suspense>
    </section>
  );
}
