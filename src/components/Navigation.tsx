'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';

export default function Navigation() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent to-secondary-accent">
                Gravity
              </span>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-4">
              <Link href="/" className={`inline-flex items-center px-3 pt-1 border-b-2 text-sm font-medium transition-colors ${pathname === '/' ? 'border-accent text-text-primary' : 'border-transparent text-text-secondary hover:border-slate-300 hover:text-text-primary'}`}>
                Home
              </Link>
              <Link href="/experiments" className={`inline-flex items-center px-3 pt-1 border-b-2 text-sm font-medium transition-colors ${pathname.startsWith('/experiments') ? 'border-accent text-text-primary' : 'border-transparent text-text-secondary hover:border-slate-300 hover:text-text-primary'}`}>
                Experiments
              </Link>
              <Link href="/samples" className={`inline-flex items-center px-3 pt-1 border-b-2 text-sm font-medium transition-colors ${pathname.startsWith('/samples') ? 'border-accent text-text-primary' : 'border-transparent text-text-secondary hover:border-slate-300 hover:text-text-primary'}`}>
                Samples
              </Link>
              <Link href="/categories" className={`inline-flex items-center px-3 pt-1 border-b-2 text-sm font-medium transition-colors ${pathname.startsWith('/categories') ? 'border-accent text-text-primary' : 'border-transparent text-text-secondary hover:border-slate-300 hover:text-text-primary'}`}>
                Categories
              </Link>
              <Link href="/assistant" className={`inline-flex items-center px-3 pt-1 border-b-2 text-sm font-medium transition-colors ${pathname === '/assistant' ? 'border-accent text-text-primary' : 'border-transparent text-text-secondary hover:border-slate-300 hover:text-text-primary'}`}>
                <svg className="w-4 h-4 mr-1.5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                AI Assistant
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FFD166]/20 text-[#D9A01C] border border-[#FFD166]/50 uppercase tracking-wider">
                  Coming Soon
                </span>
              </Link>
            </div>
          </div>

          {user && (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-secondary-accent flex items-center justify-center text-white text-sm font-bold shadow-sm">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-semibold text-text-primary px-1">{user.username}</span>
              </div>
              <button
                onClick={logout}
                className="px-3 py-1.5 rounded-md text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-slate-100 transition-colors"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
