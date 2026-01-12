'use client';

import React from 'react';

/**
 * SkinWellnessContextBreak - Visual divider between clinical documentation and Skin Wellness Mode
 *
 * This component creates a hard context break (required for SaMD compliance) that clearly
 * separates clinical documentation from the optional Skin Wellness Mode.
 *
 * The disclosure text is load-bearing for regulatory compliance - do not modify without
 * legal review.
 */
export function SkinWellnessContextBreak() {
  return (
    <div className="my-8">
      {/* Divider with centered label */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-stone-300 to-stone-300" />
        <span className="text-xs font-medium text-stone-400 uppercase tracking-wider whitespace-nowrap">
          Optional Next Step
        </span>
        <div className="flex-1 h-px bg-gradient-to-l from-transparent via-stone-300 to-stone-300" />
      </div>

      {/* Info card style disclosure */}
      <div className="bg-gradient-to-br from-purple-50/50 to-violet-50/50 border border-purple-100/50 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            <svg
              className="w-5 h-5 text-purple-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
              />
            </svg>
          </div>
          <div>
            <h4 className="text-sm font-medium text-purple-800 mb-1">
              Skin Wellness Mode
            </h4>
            {/* Mandatory disclosure - DO NOT MODIFY without legal review */}
            <p className="text-xs text-purple-600/80 leading-relaxed">
              Provides non-medical appearance observations and cosmetic skincare
              suggestions. Independent of the clinical documentation above.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
