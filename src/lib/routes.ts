/** Pages that need a signed-in user. */
export const PROTECTED_PREFIXES = ['/notes'] as const;
/** Pages that only make sense when signed out. */
export const AUTH_PAGES = ['/login', '/signup'] as const;

function matches(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

/**
 * Where (if anywhere) the proxy should send this request.
 * This is a UX shortcut only; the data itself is protected by RLS.
 */
export function redirectFor(pathname: string, signedIn: boolean): string | null {
  if (!signedIn && PROTECTED_PREFIXES.some((p) => matches(pathname, p))) {
    return `/login?next=${encodeURIComponent(pathname)}`;
  }
  if (signedIn && AUTH_PAGES.some((p) => matches(pathname, p))) {
    return '/notes';
  }
  return null;
}

/** Only allow same-site relative paths after sign-in, so `?next=` can't be used as an open redirect. */
export function safeNextPath(next: unknown, fallback = '/notes'): string {
  if (typeof next !== 'string') return fallback;
  if (!next.startsWith('/') || next.startsWith('//') || next.startsWith('/\\')) return fallback;
  return next;
}
