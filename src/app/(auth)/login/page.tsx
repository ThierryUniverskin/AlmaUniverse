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

  // Redirect if already authenticated
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
    // Don't redirect here - let the useEffect handle it when state.isAuthenticated becomes true
  };

  // Don't render if already authenticated
  if (state.isAuthenticated) {
    return null;
  }

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-white">
        {/* Left Side - Form */}
        <div className="w-full lg:w-1/2 flex flex-col">
          {/* Header */}
          <header className="flex items-center justify-between px-8 py-5">
            <Image
              src="/images/Alma Universe logo copy@4x.png"
              alt="Alma Universe"
              width={130}
              height={38}
              className="h-9 w-auto"
            />
            <div className="flex items-center gap-3 text-sm">
              <span className="text-stone-500">Don&apos;t have an account?</span>
              <Link
                href="#"
                className="px-5 py-2.5 text-stone-700 font-medium border border-stone-300 rounded-full hover:bg-stone-50 transition-colors"
              >
                Register
              </Link>
            </div>
          </header>

          {/* Form Container */}
          <div className="flex-1 flex items-center justify-center px-8 py-8">
            <div className="w-full max-w-sm">
              {/* User Icon */}
              <div className="flex justify-center mb-6">
                <div className="h-14 w-14 rounded-full bg-stone-100 flex items-center justify-center">
                  <svg
                    className="h-7 w-7 text-stone-400"
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
              <div className="text-center mb-8">
                <h1 className="text-2xl font-semibold text-stone-900 mb-1.5">
                  Login to your account
                </h1>
                <p className="text-stone-500 text-sm">
                  Enter your details to login.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                {/* Email Field */}
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">
                    Email Address<span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-stone-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
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
                      className="w-full pl-11 pr-4 py-3 bg-white border border-stone-200 rounded-lg text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">
                    Password<span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-stone-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
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
                      className="w-full pl-11 pr-12 py-3 bg-white border border-stone-200 rounded-lg text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-stone-600"
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

                {/* Forgot Password - Centered */}
                <div className="text-center">
                  <Link href="#" className="text-sm text-stone-500 hover:text-purple-700 transition-colors">
                    Forgot password?
                  </Link>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-4 bg-purple-700 hover:bg-purple-800 text-white font-medium rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Logging in...' : 'Login'}
                </button>
              </form>

              {/* Demo credentials hint */}
              <div className="mt-6 p-3 rounded-lg bg-purple-50 border border-purple-100">
                <p className="text-xs text-purple-700 text-center">
                  Demo: <span className="font-medium">doctor@alma.health</span> / <span className="font-medium">alma2024</span>
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <footer className="px-8 py-5 flex items-center justify-between text-sm text-stone-400">
            <span>&copy; 2026 SkinXS</span>
            <button className="flex items-center gap-1.5 hover:text-stone-600 transition-colors">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
              <span>ENG</span>
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
          </footer>
        </div>

        {/* Right Side - Branded Hero */}
        <div className="hidden lg:block w-1/2 relative">
            {/* Background Image */}
            <Image
              src="/images/iStock-2097461666.jpg"
              alt=""
              fill
              className="object-cover"
              priority
            />

            {/* Content Overlay */}
            <div className="relative z-10 h-full flex flex-col items-center justify-center px-12">
              {/* Center - Logo */}
              <Image
                src="/images/Alma Universe logo@4x.png"
                alt="Alma Universe"
                width={400}
                height={128}
                className="h-32 w-auto"
              />

              {/* Footer Links */}
              <div className="absolute bottom-12 flex items-center gap-2 text-sm text-white/70">
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
