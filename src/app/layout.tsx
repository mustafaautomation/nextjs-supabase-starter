import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { AuthNav } from '@/components/auth-nav';
import './globals.css';

export const metadata: Metadata = {
  title: { default: 'Notes starter', template: '%s · Notes starter' },
  description: 'Next.js 16 and Supabase starter with auth, notes CRUD and row-level security.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <header className="site-header">
          <Link href="/" className="brand">
            Notes starter
          </Link>
          <nav aria-label="Account">
            <Suspense fallback={null}>
              <AuthNav />
            </Suspense>
          </nav>
        </header>
        <main id="main">{children}</main>
      </body>
    </html>
  );
}
