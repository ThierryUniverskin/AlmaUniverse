'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui';

function Header() {
  const { state, logout } = useAuth();

  return (
    <header className="h-18 bg-white/80 backdrop-blur-md border-b border-stone-200/40 px-8 flex items-center justify-between sticky top-0 z-40">
      {/* Logo */}
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-sage-500 to-sage-600 flex items-center justify-center shadow-sm">
          <svg
            className="h-5 w-5 text-white"
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
        <div>
          <span className="text-lg font-semibold text-stone-900 tracking-tight">
            Alma Universe
          </span>
          <span className="hidden sm:inline-block ml-3 text-2xs font-medium text-stone-400 uppercase tracking-widest">
            Clinical Suite
          </span>
        </div>
      </div>

      {/* User menu */}
      {state.doctor && (
        <div className="flex items-center gap-5">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-stone-800 tracking-snug">
              Dr. {state.doctor.firstName} {state.doctor.lastName}
            </p>
            <p className="text-xs text-stone-500">{state.doctor.email}</p>
          </div>

          {/* Avatar */}
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-ivory-200 to-ivory-300 border border-stone-200/50 flex items-center justify-center">
            <span className="text-sm font-semibold text-stone-600">
              {state.doctor.firstName[0]}{state.doctor.lastName[0]}
            </span>
          </div>

          {/* Logout button */}
          <div className="h-6 w-px bg-stone-200/60" />
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="text-stone-500 hover:text-stone-700 -mr-2"
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span className="sr-only">Sign out</span>
          </Button>
        </div>
      )}
    </header>
  );
}

export { Header };
