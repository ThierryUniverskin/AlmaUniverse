'use client';

import React, { useState } from 'react';

export interface DocumentationTooltipProps {
  message: string;
}

export function DocumentationTooltip({ message }: DocumentationTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="text-xs text-stone-400">
        For documentation purposes only
      </span>
      <div
        className="relative inline-block"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        <button
          type="button"
          onFocus={() => setIsVisible(true)}
          onBlur={() => setIsVisible(false)}
          className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-stone-100 hover:bg-purple-100 transition-colors"
          aria-label="More information"
        >
          <svg className="h-3.5 w-3.5 text-stone-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4m0-4h.01" />
          </svg>
        </button>

        {/* Tooltip - White card style matching PhotoConsentSection */}
        {isVisible && (
          <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-72 z-50">
            <div className="bg-white border border-stone-200 rounded-xl shadow-lg p-3 text-sm">
              <p className="text-stone-600 text-left">{message}</p>
              {/* Arrow pointing down */}
              <div className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-white" />
              <div className="absolute left-1/2 -translate-x-1/2 -bottom-[9px] w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-stone-200 -z-10" />
            </div>
          </div>
        )}
      </div>
    </span>
  );
}
