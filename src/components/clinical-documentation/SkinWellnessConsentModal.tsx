'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useSidebarOffset } from '@/context/LayoutContext';

export interface SkinWellnessConsentModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * SkinWellnessConsentModal - Consent gate for entering Skin Wellness Mode
 *
 * This modal appears when the user attempts to enter Skin Wellness Mode
 * without having provided photo consent. It requires explicit consent
 * before proceeding.
 */
export function SkinWellnessConsentModal({
  isOpen,
  onConfirm,
  onCancel,
}: SkinWellnessConsentModalProps) {
  const [consentChecked, setConsentChecked] = useState(false);
  const [mounted, setMounted] = useState(false);
  const sidebarOffset = useSidebarOffset();

  // For portal mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setConsentChecked(false);
    }
  }, [isOpen]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

  const handleConfirm = () => {
    if (consentChecked) {
      onConfirm();
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] bg-black/60 flex items-center justify-center p-4 transition-[padding] duration-300"
      style={{ paddingLeft: sidebarOffset }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div
        className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-100 flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-stone-900">
              Patient Photo Consent Required
            </h2>
            <p className="text-sm text-stone-500 mt-0.5">
              Consent is required to proceed to Skin Wellness Mode
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="p-1.5 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
            aria-label="Close"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          {/* Info box */}
          <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 mb-6">
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-purple-600 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4m0-4h.01" />
                </svg>
              </div>
              <div className="text-sm text-purple-800">
                <p className="font-medium mb-1">About Skin Wellness Mode</p>
                <p className="text-purple-700">
                  Skin Wellness Mode provides non-medical appearance observations and cosmetic
                  skincare suggestions. It is independent of clinical documentation.
                </p>
              </div>
            </div>
          </div>

          {/* Consent description */}
          <p className="text-sm text-stone-600 mb-4">
            To proceed, please confirm that the patient has been informed and has consented to:
          </p>

          <ul className="space-y-2 text-sm text-stone-600 mb-6">
            <li className="flex items-start gap-2">
              <span className="text-purple-500 mt-0.5">•</span>
              <span>The capture and secure storage of facial photographs for clinical documentation purposes</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-500 mt-0.5">•</span>
              <span>The use of these photographs for non-medical skin wellness analysis and cosmetic skincare personalization</span>
            </li>
          </ul>

          {/* Consent checkbox */}
          <div className="flex items-start gap-3 bg-stone-50 rounded-xl p-4 border border-stone-200">
            <div className="flex items-center h-6">
              <input
                type="checkbox"
                id="wellness-consent"
                checked={consentChecked}
                onChange={(e) => setConsentChecked(e.target.checked)}
                className="checkbox-custom h-5 w-5"
              />
            </div>
            <label
              htmlFor="wellness-consent"
              className="text-sm text-stone-700 cursor-pointer select-none leading-relaxed"
            >
              I confirm, on the patient&apos;s behalf, that consent has been provided for photo capture, storage, and skin wellness use.
            </label>
          </div>

          <p className="text-xs text-stone-400 mt-3 leading-relaxed">
            The patient understands that photographs are not used for medical diagnosis
            and that consent may be withdrawn according to applicable privacy laws.
          </p>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-stone-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-stone-600 hover:text-stone-800 hover:bg-stone-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!consentChecked}
            className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue to Skin Wellness Mode
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
