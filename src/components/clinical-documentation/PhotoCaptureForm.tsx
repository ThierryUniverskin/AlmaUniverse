'use client';

import React from 'react';
import { PhotoSessionFormData, PhotoSession } from '@/types';
import { PhotoSourceSelector } from './PhotoSourceSelector';
import { PhotoSlot } from './PhotoSlot';
import { PhotoConsentSection } from './PhotoConsentSection';
import { PhotoSessionsLoader } from './PhotoSessionsLoader';
import { DocumentationTooltip } from './DocumentationTooltip';

export interface PhotoCaptureFormProps {
  formData: PhotoSessionFormData;
  onChange: (data: PhotoSessionFormData) => void;
  disabled?: boolean;
  patientName: string;
  patientId?: string;
  onSkip?: () => void;
}

export function PhotoCaptureForm({
  formData,
  onChange,
  disabled = false,
  patientName,
  patientId,
  onSkip,
}: PhotoCaptureFormProps) {
  const handleSourceSelect = (source: PhotoSessionFormData['source']) => {
    onChange({ ...formData, source });
  };

  // Load photos from a previous session
  const handleLoadFromPrevious = (session: PhotoSession) => {
    onChange({
      ...formData,
      source: session.source,
      frontalPhoto: session.frontalPhotoUrl,
      leftProfilePhoto: session.leftProfilePhotoUrl,
      rightProfilePhoto: session.rightProfilePhotoUrl,
      // Don't auto-set consent - doctor must re-confirm for new session
    });
  };

  const handlePhotoCapture = (type: 'frontal' | 'left' | 'right', file: File) => {
    const key = type === 'frontal' ? 'frontalPhoto' : type === 'left' ? 'leftProfilePhoto' : 'rightProfilePhoto';
    onChange({ ...formData, [key]: file });
  };

  const handlePhotoRemove = (type: 'frontal' | 'left' | 'right') => {
    const key = type === 'frontal' ? 'frontalPhoto' : type === 'left' ? 'leftProfilePhoto' : 'rightProfilePhoto';
    onChange({ ...formData, [key]: null });
  };

  const handleConsentChange = (consent: boolean) => {
    onChange({ ...formData, photoConsentGiven: consent });
  };

  // Check if source is selected and it's 'app' (the only functional one in v1)
  const showPhotoSlots = formData.source === 'app';
  const showAlmaIQMessage = formData.source === 'almaiq';

  // Show consent section only when at least one photo has been captured
  const hasAnyPhoto = !!(formData.frontalPhoto || formData.leftProfilePhoto || formData.rightProfilePhoto);
  const showConsentSection = showPhotoSlots && hasAnyPhoto;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center mb-4">
          {/* Premium Camera Icon with gradient and glow */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-300 to-violet-400 rounded-full blur-lg opacity-20 scale-105" />
            <svg className="relative h-14 w-14" viewBox="0 0 56 56" fill="none">
              <defs>
                <linearGradient id="iconGradient3" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#9ca3af" />
                  <stop offset="100%" stopColor="#7c3aed" />
                </linearGradient>
                <filter id="iconShadow3" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#7c3aed" floodOpacity="0.15"/>
                </filter>
              </defs>
              <circle cx="28" cy="28" r="27" fill="white" filter="url(#iconShadow3)" />
              <circle cx="28" cy="28" r="25" fill="url(#iconGradient3)" opacity="0.05" />
              {/* Camera body */}
              <rect x="14" y="20" width="28" height="20" rx="3" stroke="url(#iconGradient3)" strokeWidth="1.5" fill="none" />
              {/* Lens */}
              <circle cx="28" cy="30" r="6" stroke="url(#iconGradient3)" strokeWidth="1.5" fill="none" />
              <circle cx="28" cy="30" r="3" stroke="url(#iconGradient3)" strokeWidth="1.5" fill="none" />
              {/* Flash */}
              <rect x="35" y="24" width="3" height="2" rx="0.5" fill="url(#iconGradient3)" />
              {/* Top bump */}
              <path d="M22 20v-2a2 2 0 012-2h8a2 2 0 012 2v2" stroke="url(#iconGradient3)" strokeWidth="1.5" fill="none" />
            </svg>
          </div>
        </div>
        <h1 className="text-2xl font-semibold text-stone-900 mb-1">
          Photo Collection
        </h1>
        <p className="text-stone-500 text-sm">
          for {patientName}
        </p>
      </div>

      {/* Photo Source Selection */}
      <div className="bg-white rounded-xl border border-stone-200 p-6">
        <h2 className="text-base font-semibold text-stone-900 mb-4">
          Capture Method
        </h2>
        <PhotoSourceSelector
          selectedSource={formData.source}
          onSelect={handleSourceSelect}
          disabled={disabled}
        />

        {/* Load from Previous Session */}
        {patientId && (
          <div className="mt-4 pt-4 border-t border-stone-100">
            <PhotoSessionsLoader
              patientId={patientId}
              onLoadSession={handleLoadFromPrevious}
              disabled={disabled}
            />
          </div>
        )}

        {/* Skip Option */}
        {onSkip && (
          <div className="mt-6 pt-6 border-t border-stone-200">
            <button
              type="button"
              onClick={onSkip}
              disabled={disabled}
              className="w-full flex items-center justify-center gap-2 py-3 text-sm text-stone-500 hover:text-stone-700 transition-colors disabled:opacity-50"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Skip photo collection for now
            </button>
          </div>
        )}
      </div>

      {/* AlmaIQ Coming Soon Message */}
      {showAlmaIQMessage && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
          <div className="h-12 w-12 mx-auto rounded-full bg-amber-100 flex items-center justify-center mb-3">
            <svg className="h-6 w-6 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
          </div>
          <h3 className="text-base font-semibold text-amber-900 mb-1">
            AlmaIQ Integration Coming Soon
          </h3>
          <p className="text-sm text-amber-700">
            The AlmaIQ device integration is currently in development.
            Please use &ldquo;Capture via App&rdquo; for now.
          </p>
        </div>
      )}

      {/* Photo Slots - Only show when App is selected */}
      {showPhotoSlots && (
        <div className="bg-white rounded-xl border border-stone-200 p-6">
          <h2 className="text-base font-semibold text-stone-900 mb-1">
            Facial Photos
          </h2>
          <p className="text-sm text-stone-500 mb-6">
            Capture frontal and profile photos. Only the frontal photo is required.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <PhotoSlot
              type="frontal"
              photo={formData.frontalPhoto}
              onCapture={(file) => handlePhotoCapture('frontal', file)}
              onRemove={() => handlePhotoRemove('frontal')}
              required
              disabled={disabled}
              guideImageSrc="/images/front_photo_final.webp"
            />
            <PhotoSlot
              type="right-profile"
              photo={formData.rightProfilePhoto}
              onCapture={(file) => handlePhotoCapture('right', file)}
              onRemove={() => handlePhotoRemove('right')}
              disabled={disabled}
              guideImageSrc="/images/right_side_photo_final.webp"
            />
            <PhotoSlot
              type="left-profile"
              photo={formData.leftProfilePhoto}
              onCapture={(file) => handlePhotoCapture('left', file)}
              onRemove={() => handlePhotoRemove('left')}
              disabled={disabled}
              guideImageSrc="/images/left_side_photo_final.webp"
            />
          </div>

          {/* Photo Tips */}
          <div className="mt-6 bg-stone-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-stone-700 mb-3">Photo Tips</h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
              <li className="flex items-center gap-2 text-sm text-stone-600">
                <svg className="h-4 w-4 text-purple-500 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                </svg>
                Face the Camera Directly
              </li>
              <li className="flex items-center gap-2 text-sm text-stone-600">
                <svg className="h-4 w-4 text-purple-500 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                </svg>
                Use Good Lighting
              </li>
              <li className="flex items-center gap-2 text-sm text-stone-600">
                <svg className="h-4 w-4 text-purple-500 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                </svg>
                Keep Your Skin Bare
              </li>
              <li className="flex items-center gap-2 text-sm text-stone-600">
                <svg className="h-4 w-4 text-purple-500 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                </svg>
                Neutral Expression
              </li>
              <li className="flex items-center gap-2 text-sm text-stone-600">
                <svg className="h-4 w-4 text-purple-500 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                </svg>
                Hair Pulled Back
              </li>
              <li className="flex items-center gap-2 text-sm text-stone-600">
                <svg className="h-4 w-4 text-purple-500 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                </svg>
                High-Quality Image
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Photo Consent Section - Only show when photos have been captured */}
      {showConsentSection && (
        <PhotoConsentSection
          consentGiven={formData.photoConsentGiven}
          onConsentChange={handleConsentChange}
          disabled={disabled}
        />
      )}

      {/* Footer Note with Tooltip */}
      <div className="text-center">
        <DocumentationTooltip
          message="Capture standardized facial photos for documentation purposes."
        />
      </div>
    </div>
  );
}

// Helper function to create empty form data
export function getEmptyPhotoForm(): PhotoSessionFormData {
  return {
    source: null,
    frontalPhoto: null,
    leftProfilePhoto: null,
    rightProfilePhoto: null,
    photoConsentGiven: false,
  };
}
