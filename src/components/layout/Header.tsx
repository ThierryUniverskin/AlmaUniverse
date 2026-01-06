'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';

function Header() {
  const { state } = useAuth();

  return (
    <header className="absolute top-0 left-0 right-0 z-10 px-6 py-4 flex items-center justify-between">
      {/* Left - Welcome message with avatar */}
      <div className="flex items-center gap-3">
        {state.doctor && (
          <>
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center overflow-hidden shadow-sm">
              <span className="text-sm font-semibold text-purple-700">
                {state.doctor.firstName[0]}{state.doctor.lastName[0]}
              </span>
            </div>
            <span className="text-stone-800 font-medium">
              Welcome, Dr. {state.doctor.firstName} {state.doctor.lastName}
            </span>
          </>
        )}
      </div>

      {/* Right - Notification icon with white background */}
      <button className="h-10 w-10 rounded-lg bg-white shadow-sm flex items-center justify-center text-stone-500 hover:text-stone-700 transition-colors">
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      </button>
    </header>
  );
}

export { Header };
