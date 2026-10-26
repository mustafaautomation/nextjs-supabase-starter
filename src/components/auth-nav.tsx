import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { signOut } from '@/app/(auth)/actions';

export async function AuthNav() {
  const user = await getCurrentUser();
  if (!user) {
    return (
      <>
        <Link href="/login">Sign in</Link>
        <Link href="/signup">Create account</Link>
      </>
    );
  }
  return (
    <>
      <Link href="/notes">Notes</Link>
      <span className="muted" data-testid="signed-in-as">
        {user.email}
      </span>
      <form action={signOut}>
        <button type="submit" className="link-button">
          Sign out
        </button>
      </form>
    </>
  );
}
