'use client';

import { Inter } from 'next/font/google';
import './globals.css';
import Navigation from '@/components/Navigation';
import AuthProvider, { useAuth } from '@/components/AuthProvider';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

const inter = Inter({ subsets: ['latin'] });

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user && pathname !== '/login') {
      router.push('/login');
    }
  }, [user, loading, pathname, router]);

  // Login page – no navigation bar, full-screen
  if (pathname === '/login') {
    return <>{children}</>;
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="text-center">
          <svg className="animate-spin mx-auto h-8 w-8 text-indigo-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="mt-3 text-sm text-slate-500">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated – show nothing while redirecting
  if (!user) return null;

  // Authenticated – show nav + content
  return (
    <>
      <Navigation />
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>Gravity - AI Physics Logbook</title>
        <meta name="description" content="AI-assisted experimental logbook for scientific research." />
      </head>
      <body className={`${inter.className} bg-white text-slate-900 min-h-screen`}>
        <AuthProvider>
          <AuthGuard>
            {children}
          </AuthGuard>
        </AuthProvider>
      </body>
    </html>
  );
}
