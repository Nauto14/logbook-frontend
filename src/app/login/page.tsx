'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';

export default function LoginPage() {
  const router = useRouter();
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  
  // Need username for registration in the backend API
  const [username, setUsername] = useState('');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      if (isRegister) {
        // Generate a username from email if they didn't provide one
        const finalUsername = username.trim() || email.split('@')[0] || 'User';
        await register(email, finalUsername, password, rememberMe);
      } else {
        await login(email, password, rememberMe);
      }
      router.push('/');
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen -mt-8 pt-8 flex bg-gradient-to-br from-[#F8FAFC] via-[#EEF2F6] to-[#E3F2FD] overflow-hidden">
      
      {/* BACKGROUND PARTICLES/GLOWS */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-accent/10 blur-[100px] opacity-60 mix-blend-multiply"></div>
        <div className="absolute bottom-[-10%] left-[20%] w-[40%] h-[40%] rounded-full bg-secondary-accent/10 blur-[120px] opacity-50 mix-blend-multiply"></div>
      </div>

      <div className="w-full max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-center p-4 sm:p-6 lg:p-8 z-10 gap-8 lg:gap-16">
        
        {/* LEFT SIDE: Immersive Visual */}
        <div className="hidden md:flex flex-1 relative w-full h-[600px] lg:h-[800px] items-center justify-center">
          <div className="relative w-[500px] h-[500px]">
            {/* Main Glow Card */}
            <div className="absolute inset-0 bg-gradient-to-tr from-accent/20 via-secondary-accent/20 to-transparent rounded-[4rem] blur-2xl animate-pulse"></div>
            
            {/* Abstract Physics Circles */}
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-br from-accent/40 to-secondary-accent/40 rounded-full blur-3xl animate-blob"></div>
            <div className="absolute top-1/2 right-1/4 w-72 h-72 bg-gradient-to-tr from-indigo-400/30 to-purple-400/30 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
            <div className="absolute bottom-1/4 left-1/3 w-56 h-56 bg-gradient-to-bl from-blue-300/40 to-cyan-300/40 rounded-full blur-3xl animate-blob animation-delay-4000"></div>

            {/* Glassmorphism Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10 p-12 text-center">
              <div className="relative">
                <div className="absolute -inset-4 bg-white/20 blur-xl rounded-full"></div>
                <div className="relative bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-3xl shadow-2xl">
                  <div className="w-20 h-20 mx-auto bg-gradient-to-br from-accent to-secondary-accent rounded-2xl flex items-center justify-center shadow-lg mb-6 transform -rotate-6 hover:rotate-0 transition-transform duration-500">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                  </div>
                  <h3 className="text-3xl font-bold text-slate-800 tracking-tight mb-3">AI Powered Physics</h3>
                  <p className="text-slate-600 font-medium leading-relaxed max-w-xs">
                    Advanced data analysis and experimental logging for the modern laboratory.
                  </p>
                </div>
              </div>
              
              {/* Floating Elements */}
              <div className="absolute top-10 left-10 w-12 h-12 bg-white/40 backdrop-blur-sm rounded-xl border border-white/50 shadow-lg animate-float"></div>
              <div className="absolute bottom-20 right-0 w-16 h-16 bg-accent/20 backdrop-blur-sm rounded-full border border-white/30 shadow-lg animate-float animation-delay-2000"></div>
              <div className="absolute top-1/2 -left-20 w-8 h-8 bg-secondary-accent/30 backdrop-blur-sm rounded-lg border border-white/30 shadow-lg animate-float animation-delay-4000"></div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: Login Card */}
        <div className="w-full max-w-[440px] flex-shrink-0 animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">
          <div className="bg-white/90 backdrop-blur-xl border border-white/60 rounded-3xl p-8 sm:p-10 shadow-[0_20px_60px_-15px_rgba(31,41,55,0.1)]">
            
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-secondary-accent flex items-center justify-center shadow-md">
                   <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                </div>
                <h1 className="text-xl font-bold text-text-primary tracking-tight">Gravity</h1>
              </div>
              
              <h2 className="text-2xl font-extrabold text-text-primary mb-2">Welcome Back</h2>
              <p className="text-sm text-text-secondary font-medium">Log in or create a new account to continue.</p>
            </div>

            {/* Toggle Tabs */}
            <div className="flex bg-slate-100 rounded-xl p-1 mb-8 shadow-inner">
              <button
                type="button"
                onClick={() => { setIsRegister(false); setError(''); }}
                className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all duration-200 ${!isRegister ? 'bg-white text-accent shadow-sm ring-1 ring-slate-900/5' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Log In
              </button>
              <button
                type="button"
                onClick={() => { setIsRegister(true); setError(''); }}
                className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all duration-200 ${isRegister ? 'bg-white text-accent shadow-sm ring-1 ring-slate-900/5' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Sign Up
              </button>
            </div>

            {error && (
              <div className="mb-6 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium flex items-center">
                <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Email */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </div>
                <input
                  required type="email" value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  autoComplete="email"
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-text-primary placeholder:text-slate-400 font-medium focus:bg-white focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all sm:text-sm"
                />
              </div>

              {/* Username (Register Only) */}
              {isRegister && (
                <div className="relative animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  </div>
                  <input
                    type="text" value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Full Name (optional)"
                    autoComplete="name"
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-text-primary placeholder:text-slate-400 font-medium focus:bg-white focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all sm:text-sm"
                  />
                </div>
              )}

              {/* Password */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                </div>
                <input
                  required type="password" value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password..."
                  autoComplete={isRegister ? "new-password" : "current-password"}
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-text-primary placeholder:text-slate-400 font-medium focus:bg-white focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all sm:text-sm"
                />
              </div>

              {/* Options Row */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 text-accent border-slate-300 rounded focus:ring-accent/50 cursor-pointer"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm font-medium text-slate-600 cursor-pointer">
                    Remember me
                  </label>
                </div>

                {!isRegister && (
                  <div className="text-sm">
                    <a href="#" className="font-bold text-accent hover:text-secondary-accent transition-colors">
                      Forgot password?
                    </a>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 mt-4 rounded-xl bg-gradient-to-r from-accent to-secondary-accent text-white font-bold text-sm shadow-[0_4px_14px_0_rgba(77,166,255,0.39)] hover:shadow-[0_6px_20px_rgba(77,166,255,0.23)] hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    {isRegister ? 'Creating Account...' : 'Signing In...'}
                  </span>
                ) : (
                  <span>Continue</span>
                )}
              </button>
            </form>

            {/* Account Switcher Text */}
            <div className="mt-8 text-center text-sm text-slate-600 font-medium border-b border-slate-200 pb-8">
              {isRegister ? "Already have an account? " : "Don't have an account? "}
              <button 
                type="button"
                onClick={() => { setIsRegister(!isRegister); setError(''); }}
                className="text-accent font-bold hover:text-secondary-accent hover:underline transition-all"
              >
                {isRegister ? 'Log in' : 'Sign up'}
              </button>
            </div>

            {/* Social Logins 
                Temporarily hidden according to spec option 2 until OAuth is fully implemented.
            <div className="mt-8">
              <p className="text-center text-xs font-semibold text-slate-400 mb-6 uppercase tracking-wider">Sign in with:</p>
              <div className="flex justify-center gap-4">
                <button type="button" className="w-12 h-12 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center hover:bg-white hover:shadow-md hover:border-slate-300 transition-all text-slate-600 hover:text-[#DB4437]">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/></svg>
                </button>
                <button type="button" className="w-12 h-12 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center hover:bg-white hover:shadow-md hover:border-slate-300 transition-all text-slate-600 hover:text-slate-900">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
                </button>
                <button type="button" className="w-12 h-12 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center hover:bg-white hover:shadow-md hover:border-slate-300 transition-all text-slate-600 hover:text-[#0077B5]">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                </button>
              </div>
            </div>
            */}

          </div>
        </div>

      </div>
    </div>
  );
}
