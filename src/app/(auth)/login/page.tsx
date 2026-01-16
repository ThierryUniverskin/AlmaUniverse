'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const { state, login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!state.isLoading && state.isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [state.isAuthenticated, state.isLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const result = await login({ email, password });

    if (!result.success) {
      setError(result.error || 'Login failed');
      setIsSubmitting(false);
    }
  };

  if (state.isAuthenticated) {
    return null;
  }

  return (
    <div className="fixed inset-0 flex bg-white">
      {/* Background image for tablet portrait */}
      <div className="hidden md:block lg:hidden absolute inset-0 z-0">
        <Image
          src="/images/iStock-2097461666.jpg"
          alt=""
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/60" />
      </div>

      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col relative z-10">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4">
          <Image
            src="/images/Alma Universe logo copy@4x.png"
            alt="Alma Universe"
            width={120}
            height={35}
            className="h-8 w-auto md:hidden lg:block"
          />
          <div className="hidden md:block lg:hidden w-20" />
          <div className="flex items-center gap-2 text-sm">
            <span className="text-stone-500 md:text-white/70 lg:text-stone-500 hidden sm:inline">Don&apos;t have an account?</span>
            <Link
              href="#"
              className="px-4 py-2 text-stone-700 md:text-white lg:text-stone-700 font-medium border border-stone-300 md:border-white/30 lg:border-stone-300 rounded-full hover:bg-stone-50 md:hover:bg-white/10 lg:hover:bg-stone-50 transition-colors text-sm"
            >
              Register
            </Link>
          </div>
        </header>

        {/* Main Content - fills remaining space */}
        <main className="flex-1 flex flex-col items-center justify-center px-6">
          <div className="w-full max-w-sm">
            {/* Logo + Tagline for tablet portrait */}
            <div className="hidden md:block lg:hidden text-center mb-6">
              <Image
                src="/images/Alma Universe logo@4x.png"
                alt="Alma Universe"
                width={240}
                height={80}
                className="h-16 w-auto mx-auto mb-3"
              />
              <p className="text-white/70 text-sm leading-relaxed max-w-xs mx-auto">
                An integrated clinical and practice ecosystem for intelligent aesthetic care
              </p>
            </div>

            {/* User Icon */}
            <div className="flex justify-center mb-4">
              <div className="h-12 w-12 rounded-full bg-stone-100 md:bg-white/20 lg:bg-stone-100 flex items-center justify-center">
                <svg
                  className="h-6 w-6 text-stone-400 md:text-white/70 lg:text-stone-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
            </div>

            {/* Title */}
            <div className="text-center mb-6">
              <h1 className="text-xl font-semibold text-stone-900 md:text-white lg:text-stone-900 mb-1">
                Login to your account
              </h1>
              <p className="text-stone-500 md:text-white/60 lg:text-stone-500 text-sm">
                Enter your details to login.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-red-50 md:bg-red-500/20 lg:bg-red-50 border border-red-200 md:border-red-400/30 lg:border-red-200">
                  <p className="text-sm text-red-700 md:text-red-200 lg:text-red-700">{error}</p>
                </div>
              )}

              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-stone-700 md:text-white/90 lg:text-stone-700 mb-1.5">
                  Email Address<span className="text-red-500 md:text-red-400 lg:text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-stone-400 md:text-white/50 lg:text-stone-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="2" y="4" width="20" height="16" rx="2" />
                      <path d="M22 6l-10 7L2 6" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="hello@demo.com"
                    required
                    autoComplete="email"
                    autoFocus
                    className="w-full pl-11 pr-4 py-3 bg-white md:bg-white/10 lg:bg-white border border-stone-200 md:border-white/20 lg:border-stone-200 rounded-lg text-stone-900 md:text-white lg:text-stone-900 placeholder:text-stone-400 md:placeholder:text-white/40 lg:placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 md:focus:ring-white/30 lg:focus:ring-purple-500/20 focus:border-purple-500 md:focus:border-white/40 lg:focus:border-purple-500 transition-all"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-medium text-stone-700 md:text-white/90 lg:text-stone-700 mb-1.5">
                  Password<span className="text-red-500 md:text-red-400 lg:text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-stone-400 md:text-white/50 lg:text-stone-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="3" y="11" width="18" height="11" rx="2" />
                      <circle cx="12" cy="16" r="1" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                    className="w-full pl-11 pr-12 py-3 bg-white md:bg-white/10 lg:bg-white border border-stone-200 md:border-white/20 lg:border-stone-200 rounded-lg text-stone-900 md:text-white lg:text-stone-900 placeholder:text-stone-400 md:placeholder:text-white/40 lg:placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 md:focus:ring-white/30 lg:focus:ring-purple-500/20 focus:border-purple-500 md:focus:border-white/40 lg:focus:border-purple-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 md:text-white/50 lg:text-stone-400 hover:text-stone-600 md:hover:text-white/70 lg:hover:text-stone-600"
                  >
                    {showPassword ? (
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Forgot Password */}
              <div className="text-center">
                <Link href="#" className="text-sm text-stone-500 md:text-white/60 lg:text-stone-500 hover:text-purple-700 md:hover:text-white lg:hover:text-purple-700 transition-colors">
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 bg-purple-700 md:bg-white lg:bg-purple-700 hover:bg-purple-800 md:hover:bg-white/90 lg:hover:bg-purple-800 text-white md:text-purple-700 lg:text-white font-medium rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Logging in...' : 'Login'}
              </button>
            </form>
          </div>
        </main>

        {/* Footer */}
        <footer className="flex items-center justify-between px-6 py-4 text-sm text-stone-400 md:text-white/50 lg:text-stone-400">
          <span>&copy; 2026 SkinXS</span>
          <button className="flex items-center gap-1.5 hover:text-stone-600 md:hover:text-white/70 lg:hover:text-stone-600 transition-colors">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
            <span>ENG</span>
          </button>
        </footer>
      </div>

      {/* Right Side - Branded Hero (desktop only) */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <Image
          src="/images/iStock-2097461666.jpg"
          alt=""
          fill
          className="object-cover"
          priority
        />

        <div className="relative z-10 h-full w-full flex flex-col items-center justify-center px-12">
          <div className="text-center">
            <Image
              src="/images/Alma Universe logo@4x.png"
              alt="Alma Universe"
              width={400}
              height={128}
              className="h-32 w-auto mx-auto"
            />
            <p className="mt-6 text-xl text-white/90 font-normal max-w-md leading-relaxed">
              An integrated clinical and practice ecosystem for intelligent aesthetic care
            </p>
          </div>

          <div className="absolute bottom-8 flex items-center gap-2 text-sm text-white/70">
            <Link href="#" className="hover:text-white transition-colors">Privacy Notice Doctors</Link>
            <span className="text-white/40">•</span>
            <Link href="#" className="hover:text-white transition-colors">Privacy Notice Patients</Link>
            <span className="text-white/40">•</span>
            <Link href="#" className="hover:text-white transition-colors">Legal</Link>
            <span className="text-white/40">•</span>
            <Link href="#" className="hover:text-white transition-colors">Terms of use</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
