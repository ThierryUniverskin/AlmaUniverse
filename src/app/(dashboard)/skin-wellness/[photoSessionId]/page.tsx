'use client';

import React from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { parseSkinWellnessParams } from '@/lib/skinWellness';

/**
 * Skin Wellness Mode Page (Stub)
 *
 * This page is separate from clinical documentation to enforce data isolation.
 * It only receives: photoSessionId and patientId
 *
 * NO medical/diagnostic data should ever be passed to or accessible from this page:
 * - No skin concerns
 * - No selected treatments
 * - No medical history
 * - No recovery preferences
 */
export default function SkinWellnessPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const photoSessionId = params.photoSessionId as string;
  const entryData = parseSkinWellnessParams(photoSessionId, searchParams);

  // Invalid entry - missing required parameters
  if (!entryData) {
    return (
      <div className="min-h-full flex items-center justify-center p-8">
        <div className="max-w-md text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <svg
              className="h-8 w-8 text-red-600"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
              />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-stone-900 mb-2">
            Invalid Entry
          </h1>
          <p className="text-stone-500 mb-6">
            Missing required parameters. Please access Skin Wellness Mode through the clinical documentation flow.
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-100 to-violet-100 rounded-2xl flex items-center justify-center mb-4">
            <svg
              className="h-8 w-8 text-purple-600"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-stone-900 mb-2">
            Skin Wellness Mode
          </h1>
          <p className="text-stone-500">
            Non-medical appearance observations and cosmetic skincare suggestions.
          </p>
        </div>

        {/* Important Notice */}
        <div className="bg-purple-50 border border-purple-100 rounded-2xl p-6 mb-8">
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <svg
                className="h-6 w-6 text-purple-600"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-semibold text-purple-900 mb-1">
                Important Notice
              </h2>
              <p className="text-sm text-purple-700 leading-relaxed">
                Skin Wellness Mode is independent of clinical documentation and provides
                non-medical, cosmetic-only suggestions. This feature analyzes skin appearance
                for general wellness purposes and should not be used for medical diagnosis
                or treatment decisions.
              </p>
            </div>
          </div>
        </div>

        {/* Coming Soon Placeholder */}
        <div className="bg-white border border-stone-200 rounded-2xl p-8 text-center">
          <div className="mx-auto w-12 h-12 bg-stone-100 rounded-xl flex items-center justify-center mb-4">
            <svg
              className="h-6 w-6 text-stone-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-stone-900 mb-2">
            Coming Soon
          </h3>
          <p className="text-sm text-stone-500 mb-6 max-w-sm mx-auto">
            The Skin Wellness analysis feature is currently under development.
            Check back soon for personalized cosmetic skincare suggestions.
          </p>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Go Back
          </button>
        </div>

        {/* Debug info (only in development) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 p-4 bg-stone-100 rounded-lg text-xs font-mono text-stone-500">
            <p>photoSessionId: {entryData.photoSessionId}</p>
            <p>patientId: {entryData.patientId}</p>
            <p>consentConfirmed: {String(entryData.consentConfirmed)}</p>
          </div>
        )}
      </div>
    </div>
  );
}
