'use client';

import React, { useState } from 'react';
import { createPortal } from 'react-dom';

export interface PhotoConsentSectionProps {
  consentGiven: boolean;
  onConsentChange: (consent: boolean) => void;
  disabled?: boolean;
}

export function PhotoConsentSection({
  consentGiven,
  onConsentChange,
  disabled = false,
}: PhotoConsentSectionProps) {
  const [showInfoPopover, setShowInfoPopover] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  // For portal mounting
  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="bg-white rounded-xl border border-stone-200 p-6">
      <h2 className="text-base font-semibold text-stone-900 mb-4">
        Patient Photo Consent
      </h2>

      {/* Consent Checkbox */}
      <div className="flex items-start gap-3">
        <div className="flex items-center h-6">
          <input
            type="checkbox"
            id="photo-consent"
            checked={consentGiven}
            onChange={(e) => onConsentChange(e.target.checked)}
            disabled={disabled}
            className="h-5 w-5 rounded border-stone-300 text-purple-600 focus:ring-purple-500 focus:ring-offset-0 disabled:opacity-50 cursor-pointer accent-purple-600"
          />
        </div>
        <div className="flex-1">
          <label
            htmlFor="photo-consent"
            className="text-sm text-stone-700 cursor-pointer select-none"
          >
            I confirm, on the patient&apos;s behalf, that consent has been provided for photo capture, storage, and skin wellness use.
          </label>

          {/* Info Icon with Hover Tooltip */}
          <div
            className="relative inline-block ml-2 align-middle"
            onMouseEnter={() => setShowInfoPopover(true)}
            onMouseLeave={() => setShowInfoPopover(false)}
          >
            <button
              type="button"
              className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-stone-100 hover:bg-purple-100 transition-colors"
              aria-label="More information about consent"
            >
              <svg className="h-3.5 w-3.5 text-stone-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4m0-4h.01" />
              </svg>
            </button>

            {/* Info Tooltip - Positioned above on desktop */}
            {showInfoPopover && (
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-80 z-50">
                <div className="bg-white border border-stone-200 rounded-xl shadow-lg p-4 text-sm">
                  <div className="flex items-start justify-between mb-2">
                    <span className="font-medium text-stone-900">Consent Details</span>
                  </div>
                  <p className="text-stone-600 mb-3">
                    I confirm that the patient has been informed and has consented to:
                  </p>
                  <ul className="space-y-2 text-stone-600">
                    <li className="flex items-start gap-2">
                      <span className="text-purple-500 mt-0.5">•</span>
                      <span>the capture and secure storage of facial photographs for clinical documentation purposes; and</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-500 mt-0.5">•</span>
                      <span>the use of these photographs for non-medical skin wellness analysis and cosmetic skincare personalization.</span>
                    </li>
                  </ul>
                  <p className="text-stone-400 text-xs mt-3">
                    The patient understands that these photographs are not used for medical diagnosis and that consent may be withdrawn according to applicable privacy laws.
                  </p>
                  {/* Arrow pointing down */}
                  <div className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-white" />
                  <div className="absolute left-1/2 -translate-x-1/2 -bottom-[9px] w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-stone-200 -z-10" />
                </div>
              </div>
            )}
          </div>

          {/* Required indicator */}
          <span className="ml-2 text-xs font-medium text-red-500">*Required</span>
        </div>
      </div>

      {/* Privacy Notice Link */}
      <div className="mt-4 pl-8">
        <button
          type="button"
          onClick={() => setShowPrivacyModal(true)}
          className="text-sm text-purple-600 hover:text-purple-700 underline underline-offset-2"
        >
          View privacy notice for patient images
        </button>
      </div>

      {/* Privacy Notice Modal */}
      {mounted && showPrivacyModal && createPortal(
        <div
          className="fixed inset-0 z-[9999] bg-black/60 flex items-center justify-center p-4"
          onClick={() => setShowPrivacyModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200">
              <h3 className="text-lg font-semibold text-stone-900">
                Privacy Notice for Patient Images
              </h3>
              <button
                type="button"
                onClick={() => setShowPrivacyModal(false)}
                className="h-8 w-8 rounded-full hover:bg-stone-100 flex items-center justify-center transition-colors"
              >
                <svg className="h-5 w-5 text-stone-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <div className="prose prose-sm prose-stone max-w-none">
                <h4 className="text-base font-semibold text-stone-900 mb-3">Purpose of Photo Collection</h4>
                <p className="text-stone-600 mb-4">
                  Facial photographs are collected to support clinical documentation and to enable personalized skin wellness recommendations. These images help track skin health over time and provide context for non-medical skincare guidance.
                </p>

                <h4 className="text-base font-semibold text-stone-900 mb-3">How Photos Are Used</h4>
                <ul className="text-stone-600 space-y-2 mb-4">
                  <li><strong>Clinical Documentation:</strong> Photos are stored securely as part of the patient&apos;s record for reference during consultations.</li>
                  <li><strong>Skin Wellness Analysis:</strong> Images may be analyzed to provide personalized, non-medical skincare and cosmetic recommendations.</li>
                  <li><strong>No Medical Diagnosis:</strong> Photos are not used for medical diagnosis or treatment decisions.</li>
                </ul>

                <h4 className="text-base font-semibold text-stone-900 mb-3">Data Security</h4>
                <p className="text-stone-600 mb-4">
                  All photographs are encrypted during transmission and storage. Access is restricted to authorized healthcare providers involved in the patient&apos;s care. We employ industry-standard security measures to protect patient data.
                </p>

                <h4 className="text-base font-semibold text-stone-900 mb-3">Patient Rights</h4>
                <ul className="text-stone-600 space-y-2 mb-4">
                  <li><strong>Access:</strong> Patients may request copies of their stored photographs.</li>
                  <li><strong>Deletion:</strong> Patients may request deletion of their photographs, subject to legal retention requirements.</li>
                  <li><strong>Withdrawal:</strong> Consent may be withdrawn at any time by contacting the practice.</li>
                </ul>

                <h4 className="text-base font-semibold text-stone-900 mb-3">Data Retention</h4>
                <p className="text-stone-600 mb-4">
                  Photographs are retained in accordance with applicable healthcare record retention laws and practice policies. Upon request for deletion, images will be removed within 30 days, unless retention is required by law.
                </p>

                <h4 className="text-base font-semibold text-stone-900 mb-3">Contact</h4>
                <p className="text-stone-600">
                  For questions about this privacy notice or to exercise data rights, please contact your healthcare provider or the practice&apos;s privacy officer.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-stone-200">
              <button
                type="button"
                onClick={() => setShowPrivacyModal(false)}
                className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-full font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
