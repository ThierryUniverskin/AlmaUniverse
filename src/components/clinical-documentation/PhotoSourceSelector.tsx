'use client';

import React from 'react';
import { PhotoSource } from '@/types';
import { useToast } from '@/components/ui';

export interface PhotoSourceSelectorProps {
  selectedSource: PhotoSource | null;
  onSelect: (source: PhotoSource) => void;
  disabled?: boolean;
}

export function PhotoSourceSelector({
  selectedSource,
  onSelect,
  disabled = false,
}: PhotoSourceSelectorProps) {
  const { showToast } = useToast();

  const handleAlmaIQSelect = () => {
    if (disabled) return;
    showToast('AlmaIQ capture will be available soon.', 'info');
    // Still select it to show it's acknowledged, but don't proceed
    onSelect('almaiq');
  };

  const handleAppSelect = () => {
    if (disabled) return;
    onSelect('app');
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-stone-600">
        Choose how you would like to capture photos for this patient.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* AlmaIQ Device Card */}
        <button
          type="button"
          onClick={handleAlmaIQSelect}
          disabled={disabled}
          className={`
            relative p-5 rounded-xl border-2 text-left transition-all
            ${selectedSource === 'almaiq'
              ? 'border-purple-500 bg-purple-50'
              : 'border-stone-200 bg-white hover:border-stone-300'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          {/* Coming Soon Badge */}
          <div className="absolute top-3 right-3">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
              Coming Soon
            </span>
          </div>

          {/* Icon - Alma IQ skin scanner with chin rest and light rays */}
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center mb-3">
            <svg className="h-6 w-6 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              {/* Scanner arc/dome */}
              <path d="M4 12a8 8 0 0116 0" />
              {/* Light rays from scanner */}
              <path d="M7 10l2 2M17 10l-2 2M12 6v3" strokeLinecap="round" />
              {/* Face outline being scanned */}
              <ellipse cx="12" cy="15" rx="3" ry="4" />
              {/* Chin rest */}
              <path d="M8 20h8" strokeLinecap="round" />
              <path d="M9 20v-1a3 3 0 016 0v1" />
            </svg>
          </div>

          <h3 className="text-base font-semibold text-stone-900 mb-1">
            Capture via AlmaIQ
          </h3>
          <p className="text-sm text-stone-500">
            Use the AlmaIQ imaging device to capture standardized photos.
          </p>
        </button>

        {/* Capture via App Card */}
        <button
          type="button"
          onClick={handleAppSelect}
          disabled={disabled}
          className={`
            relative p-5 rounded-xl border-2 text-left transition-all
            ${selectedSource === 'app'
              ? 'border-purple-500 bg-purple-50'
              : 'border-stone-200 bg-white hover:border-stone-300'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          {/* Icon - Simple smartphone */}
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center mb-3">
            <svg className="h-6 w-6 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="5" y="2" width="14" height="20" rx="2.5" />
              <path d="M12 18h.01" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>

          <h3 className="text-base font-semibold text-stone-900 mb-1">
            Capture via App
          </h3>
          <p className="text-sm text-stone-500">
            Upload or capture photos directly using your device.
          </p>
        </button>
      </div>
    </div>
  );
}
