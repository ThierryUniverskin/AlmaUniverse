'use client';

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useSidebarOffset } from '@/context/LayoutContext';

/**
 * EnterSkinWellnessModal - Regulatory boundary screen for entering Skin Wellness Mode
 *
 * This component creates a clear legal and cognitive boundary between:
 * - Physician-directed medical documentation, and
 * - Non-medical cosmetic analysis and skincare
 *
 * CRITICAL: This screen is load-bearing for SaMD compliance. The disclosure text
 * must not be modified without legal review. The modal must be unskippable.
 */

export interface EnterSkinWellnessModalProps {
  isOpen: boolean;
  onEnterWellness: () => Promise<void>;
  onClose: () => void;
  photoConsentGiven: boolean;
  isSubmitting: boolean;
}

export function EnterSkinWellnessModal({
  isOpen,
  onEnterWellness,
  onClose,
  photoConsentGiven,
  isSubmitting,
}: EnterSkinWellnessModalProps) {
  const [mounted, setMounted] = React.useState(false);
  const [isEntering, setIsEntering] = useState(false);
  const sidebarOffset = useSidebarOffset();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleEnterWellness = async () => {
    if (!photoConsentGiven || isSubmitting || isEntering) return;
    setIsEntering(true);
    try {
      await onEnterWellness();
    } finally {
      setIsEntering(false);
    }
  };

  if (!isOpen || !mounted) return null;

  const isAnyLoading = isSubmitting || isEntering;

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 transition-[padding] duration-300"
      style={{ paddingLeft: sidebarOffset }}
      // No onClick handler - modal cannot be dismissed by clicking outside
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal Card - with glow effect and entrance animation */}
      <div className="relative bg-white rounded-2xl shadow-elevated max-w-lg w-full overflow-hidden ring-1 ring-sky-200 shadow-[0_0_40px_-10px_rgba(14,165,233,0.3)] animate-[modalEnter_0.3s_ease-out]">
        {/* Header with gradient */}
        <div className="relative px-6 py-5 bg-gradient-to-r from-sky-50 via-sky-50 to-white border-b border-sky-100">
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            disabled={isAnyLoading}
            className="absolute top-4 right-4 p-1.5 text-stone-400 hover:text-stone-600 hover:bg-white/80 rounded-lg transition-colors disabled:opacity-50"
            aria-label="Close"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Logo and title row */}
          <div className="flex items-center gap-4 pr-8">
            <img
              src="/images/skinxs-logo.svg"
              alt="SkinXS - Skin Expert Software"
              className="h-11 w-auto"
            />
            <div>
              <h1 className="text-lg font-semibold text-stone-900">
                Skin Wellness Mode
              </h1>
              <p className="text-xs text-stone-400 italic mt-0.5">
                powered by <span className="font-medium not-italic text-sky-600">SkinXS</span>
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-5">
          {/* Primary Disclosure - MANDATORY, DO NOT MODIFY WITHOUT LEGAL REVIEW */}
          <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 mb-5">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <svg
                  className="w-5 h-5 text-sky-600"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-sm font-semibold text-sky-800 mb-1.5">
                  Important
                </h2>
                <p className="text-sm text-sky-700 leading-relaxed">
                  Skin Wellness Mode provides cosmetic skin appearance observations and
                  cosmetic skincare suggestions only.
                </p>
                <p className="text-sm text-sky-700 leading-relaxed mt-1.5">
                  It does not diagnose, treat, prevent, or manage medical conditions,
                  and it is independent of the clinical documentation recorded previously.
                </p>
              </div>
            </div>
          </div>

          {/* Data Usage Transparency */}
          <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 mb-5">
            {/* What will be used */}
            <div className="mb-3">
              <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">
                In this mode, the system may use:
              </h3>
              <ul className="space-y-1">
                <li className="flex items-center gap-2 text-sm text-stone-700">
                  <svg className="w-4 h-4 text-sky-500 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Previously captured facial photographs
                </li>
                <li className="flex items-center gap-2 text-sm text-stone-700">
                  <svg className="w-4 h-4 text-sky-500 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Patient-reported cosmetic preferences
                </li>
                <li className="flex items-center gap-2 text-sm text-stone-700">
                  <svg className="w-4 h-4 text-sky-500 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Cosmetic safety profile
                </li>
              </ul>
            </div>

            {/* Divider */}
            <div className="border-t border-stone-200 my-3" />

            {/* What will NOT be used */}
            <div>
              <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">
                It does not use:
              </h3>
              <ul className="space-y-1">
                <li className="flex items-center gap-2 text-sm text-stone-400">
                  <svg className="w-4 h-4 text-stone-300 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Clinical medical history
                </li>
                <li className="flex items-center gap-2 text-sm text-stone-400">
                  <svg className="w-4 h-4 text-stone-300 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Diagnoses or clinical concerns
                </li>
                <li className="flex items-center gap-2 text-sm text-stone-400">
                  <svg className="w-4 h-4 text-stone-300 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Selected treatments or procedures
                </li>
              </ul>
            </div>
          </div>

          {/* Consent Status */}
          <div className="mb-5">
            {photoConsentGiven ? (
              <div className="flex items-center justify-center gap-2 text-sm text-sky-600">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Patient photo consent on file
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 text-sm text-error-600">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Patient photo consent is required to continue.
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {/* Primary: Enter Skin Wellness Mode */}
            <button
              type="button"
              onClick={handleEnterWellness}
              disabled={!photoConsentGiven || isAnyLoading}
              className="w-full flex flex-col items-center justify-center px-6 py-3.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-sky-600"
            >
              {isEntering ? (
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <>
                  <span className="font-semibold text-base">Enter Skin Wellness Mode</span>
                  <span className="text-xs text-sky-100 mt-0.5">
                    Cosmetic analysis and skincare suggestions
                  </span>
                </>
              )}
            </button>

          </div>
        </div>

        {/* Footer Disclaimer */}
        <div className="px-6 py-3 bg-stone-50 border-t border-stone-100">
          <p className="text-xs text-stone-400 text-center">
            Skin Wellness Mode is optional and independent from medical evaluation and treatment decisions.
          </p>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
