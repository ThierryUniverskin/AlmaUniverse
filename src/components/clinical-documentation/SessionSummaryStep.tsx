'use client';

import React from 'react';
import { Patient, SelectedTreatment, PhotoSessionFormData } from '@/types';
import { SessionSummaryCard } from './SessionSummaryCard';
import { SkinWellnessContextBreak } from './SkinWellnessContextBreak';

export interface SessionSummaryStepProps {
  patient: Patient;
  skinConcerns: string[]; // Concern IDs
  treatments: SelectedTreatment[];
  photoSessionId: string | null;
  photoConsentGiven: boolean;
  photoData: PhotoSessionFormData;
  generalNotes: string;
  onGeneralNotesChange: (notes: string) => void;
  onFinishSession: () => Promise<void>;
  onContinueToWellness: () => void;
  onBack: () => void;
  isSubmitting: boolean;
  doctorId?: string;
  accessToken?: string;
}

/**
 * SessionSummaryStep - Step 6 of the clinical documentation wizard
 *
 * Shows a summary of all clinical documentation and provides a hard context
 * break before the optional Skin Wellness Mode.
 *
 * This screen is critical for SaMD compliance - it clearly separates clinical
 * documentation from non-medical wellness features.
 */
export function SessionSummaryStep({
  patient,
  skinConcerns,
  treatments,
  photoSessionId,
  photoData,
  generalNotes,
  onGeneralNotesChange,
  onFinishSession,
  onContinueToWellness,
  onBack,
  isSubmitting,
  doctorId,
  accessToken,
}: SessionSummaryStepProps) {
  const patientName = `${patient.firstName} ${patient.lastName}`;
  const sessionDateTime = new Date().toLocaleString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  // Check if we have photos (needed for Skin Wellness)
  const hasPhotos = !!photoSessionId;

  // Convert File objects to URL strings for display
  const getPhotoUrl = (photo: File | string | null): string | null => {
    if (!photo) return null;
    if (typeof photo === 'string') return photo;
    return URL.createObjectURL(photo);
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Centered Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center mb-4">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-300 to-violet-400 rounded-full blur-lg opacity-20 scale-105" />
            <svg className="relative h-14 w-14" viewBox="0 0 56 56" fill="none">
              <defs>
                <linearGradient id="summaryIconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#9ca3af" />
                  <stop offset="100%" stopColor="#7c3aed" />
                </linearGradient>
                <filter id="summaryIconShadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#7c3aed" floodOpacity="0.15"/>
                </filter>
              </defs>
              <circle cx="28" cy="28" r="27" fill="white" filter="url(#summaryIconShadow)" />
              <circle cx="28" cy="28" r="25" fill="url(#summaryIconGradient)" opacity="0.05" />
              <path d="M20 18h10a2 2 0 012 2v16a2 2 0 01-2 2H20a2 2 0 01-2-2V20a2 2 0 012-2z" stroke="url(#summaryIconGradient)" strokeWidth="1.5" fill="none" />
              <path d="M22 24h6M22 28h6M22 32h4" stroke="url(#summaryIconGradient)" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M34 22v14a2 2 0 002 2h2" stroke="url(#summaryIconGradient)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            </svg>
          </div>
        </div>
        <h1 className="text-2xl font-semibold text-stone-900 mb-2">
          Session Summary
        </h1>
        <p className="text-stone-500">
          Review the clinical documentation recorded so far. Choose what to do next.
        </p>
      </div>

      {/* Summary Card */}
      <SessionSummaryCard
        patientName={patientName}
        sessionDateTime={sessionDateTime}
        skinConcerns={skinConcerns}
        treatments={treatments}
        frontalPhoto={getPhotoUrl(photoData.frontalPhoto)}
        leftProfilePhoto={getPhotoUrl(photoData.leftProfilePhoto)}
        rightProfilePhoto={getPhotoUrl(photoData.rightProfilePhoto)}
        doctorId={doctorId}
        accessToken={accessToken}
      />

      {/* General Notes Section */}
      <div className="mt-6 bg-white border border-stone-200 rounded-2xl shadow-soft overflow-hidden">
        <div className="px-6 py-4 border-b border-stone-100">
          <label htmlFor="general-notes" className="block text-sm font-semibold text-stone-900">
            General Notes & Comments
          </label>
          <p className="text-xs text-stone-500 mt-0.5">
            Add any additional notes or comments for this session.
          </p>
        </div>
        <div className="p-4">
          <textarea
            id="general-notes"
            value={generalNotes}
            onChange={(e) => onGeneralNotesChange(e.target.value)}
            disabled={isSubmitting}
            placeholder="Enter any additional observations, recommendations, or follow-up notes..."
            className="w-full min-h-[100px] px-4 py-3 text-sm text-stone-700 bg-stone-50 border border-stone-200 rounded-xl resize-y focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-stone-400"
          />
        </div>
      </div>

      {/* Hard Context Break */}
      <SkinWellnessContextBreak />

      {/* Action Buttons */}
      <div className="mt-6 space-y-4">
        {/* Primary and Secondary buttons side by side */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Finish Session - Primary/Default */}
          <button
            type="button"
            onClick={onFinishSession}
            disabled={isSubmitting}
            className="flex-1 flex flex-col items-center justify-center px-6 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="font-semibold text-base mb-1">Finish Session</span>
            <span className="text-xs text-purple-200">
              Saves clinical documentation and returns to patient record.
            </span>
          </button>

          {/* Continue to Skin Wellness - Secondary */}
          <button
            type="button"
            onClick={onContinueToWellness}
            disabled={isSubmitting || !hasPhotos}
            className="flex-1 flex flex-col items-center justify-center px-6 py-4 bg-white border-2 border-purple-200 hover:border-purple-400 hover:bg-purple-50 text-purple-700 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-purple-200"
          >
            <span className="font-semibold text-base mb-1">Continue to Skin Wellness Mode</span>
            <span className="text-xs text-stone-500">
              {hasPhotos
                ? 'Cosmetic skin appearance analysis and skincare suggestions (non-medical).'
                : 'Photos required for Skin Wellness Mode.'}
            </span>
          </button>
        </div>

        {/* Back button */}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={onBack}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-4 py-2 text-sm text-stone-500 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Treatment Selection
          </button>
        </div>
      </div>
    </div>
  );
}
