'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button, Input, Card } from '@/components/ui';

export default function LoginPage() {
  const { state, login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

    if (result.success) {
      router.push('/dashboard');
    } else {
      setError(result.error || 'Login failed');
      setIsSubmitting(false);
    }
  };

  // Don't render if already authenticated
  if (state.isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-ivory-100 px-4 relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 pattern-bg opacity-40" />

      {/* Gradient accents */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-sage-200/30 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-ivory-400/20 rounded-full blur-3xl" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo and Brand */}
        <div className="text-center mb-10 animate-fade-in">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-sage-500 to-sage-600 mb-6 shadow-lg">
            <svg
              className="h-8 w-8 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </div>
          <h1 className="font-display text-3xl font-medium text-stone-900 tracking-tight mb-2">
            Alma Universe
          </h1>
          <p className="text-stone-500 text-sm tracking-wide">
            Clinical workflow management
          </p>
        </div>

        {/* Login Card */}
        <Card className="animate-slide-up shadow-elevated" padding="lg" hover={false}>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 rounded-xl bg-error-50 border border-error-200/60">
                <div className="flex items-center gap-3">
                  <svg className="h-5 w-5 text-error-500 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm text-error-700">{error}</p>
                </div>
              </div>
            )}

            <Input
              label="Email address"
              type="email"
              name="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="doctor@alma.health"
              required
              autoComplete="email"
              autoFocus
            />

            <Input
              label="Password"
              type="password"
              name="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              autoComplete="current-password"
            />

            <div className="pt-2">
              <Button
                type="submit"
                fullWidth
                size="lg"
                isLoading={isSubmitting}
              >
                Sign in to your account
              </Button>
            </div>
          </form>

          {/* Demo credentials hint */}
          <div className="mt-8 pt-6 border-t border-stone-100">
            <div className="text-center">
              <p className="text-xs text-stone-400 mb-2">Demo credentials</p>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-ivory-200/50">
                <span className="text-xs font-medium text-stone-600">doctor@alma.health</span>
                <span className="text-stone-300">/</span>
                <span className="text-xs font-medium text-stone-600">alma2024</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-stone-400 mt-8 animate-fade-in">
          Secure clinical platform for healthcare professionals
        </p>
      </div>
    </div>
  );
}
