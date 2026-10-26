'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Field, FormStatus } from '@/components/field';
import { initialFormState, type FormState } from '@/lib/form-state';

type Props = {
  mode: 'login' | 'signup';
  action: (prev: FormState, form: FormData) => Promise<FormState>;
};

export function AuthForm({ mode, action }: Props) {
  const [state, formAction, pending] = useActionState(action, initialFormState);
  const next = useSearchParams().get('next') ?? '';
  const isLogin = mode === 'login';

  return (
    <form action={formAction} className="card stack" noValidate>
      <input type="hidden" name="next" value={next} />
      <Field name="email" label="Email" type="email" autoComplete="email" required error={state.fieldErrors?.email} />
      <Field
        name="password"
        label="Password"
        type="password"
        autoComplete={isLogin ? 'current-password' : 'new-password'}
        required
        minLength={8}
        error={state.fieldErrors?.password}
      />
      <FormStatus error={state.error} message={state.message} />
      <button type="submit" disabled={pending}>
        {pending ? (isLogin ? 'Signing in…' : 'Creating account…') : isLogin ? 'Sign in' : 'Create account'}
      </button>
      <p className="muted">
        {isLogin ? (
          <>
            No account yet? <Link href="/signup">Create one</Link>
          </>
        ) : (
          <>
            Already have an account? <Link href="/login">Sign in</Link>
          </>
        )}
      </p>
    </form>
  );
}
