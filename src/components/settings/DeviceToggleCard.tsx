'use client';

import React from 'react';
import { EBDDevice } from '@/types';
import { getFitzpatrickColor, getDowntimeColor } from '@/lib/ebdDevices';
import { cn } from '@/lib/utils';

export interface DeviceToggleCardProps {
  device: EBDDevice;
  isSelected: boolean;
  onToggle: () => void;
  disabled?: boolean;
  isToggling?: boolean;
}

export function DeviceToggleCard({
  device,
  isSelected,
  onToggle,
  disabled = false,
  isToggling = false,
}: DeviceToggleCardProps) {
  const fitzColors = getFitzpatrickColor(device.fitzpatrick);
  const downtimeColors = getDowntimeColor(device.downtime);

  return (
    <div
      className={cn(
        'relative bg-white rounded-xl border p-4 transition-all',
        isSelected
          ? 'border-purple-300 ring-1 ring-purple-200'
          : 'border-stone-200 hover:border-stone-300',
        disabled && 'opacity-50'
      )}
    >
      <div className="flex gap-4">
        {/* Device Image - 3:5 aspect ratio */}
        <div className="flex-shrink-0">
          <div className="w-16 h-[107px] rounded-lg overflow-hidden bg-stone-100 border border-stone-200">
            <img
              src={device.imageUrl || `/images/ebd/${device.id}.webp`}
              alt={device.name}
              className="w-full h-full object-contain"
              onError={(e) => { e.currentTarget.src = '/images/ebd-placeholder.webp'; }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header with name and toggle */}
          <div className="flex items-start justify-between gap-3 mb-1">
            <h3 className="text-sm font-semibold text-stone-900 leading-tight pr-2">
              {device.name}
            </h3>
            {/* Toggle Switch */}
            <button
              type="button"
              role="switch"
              aria-checked={isSelected}
              onClick={onToggle}
              disabled={disabled || isToggling}
              className={cn(
                'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2',
                isSelected ? 'bg-purple-600' : 'bg-stone-200',
                (disabled || isToggling) && 'cursor-not-allowed opacity-50'
              )}
            >
              {isToggling ? (
                <span className="absolute inset-0 flex items-center justify-center">
                  <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                </span>
              ) : (
                <span
                  className={cn(
                    'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                    isSelected ? 'translate-x-5' : 'translate-x-0'
                  )}
                />
              )}
            </button>
          </div>

          {/* Description */}
          <p className="text-[11px] text-stone-500 line-clamp-2 mb-2">
            {device.description}
          </p>

          {/* Badges */}
          <div className="flex items-center gap-1.5 mb-2">
            <span className={cn(
              'inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium',
              fitzColors.bg,
              fitzColors.text
            )}>
              Fitz {device.fitzpatrick}
            </span>
            <span className={cn(
              'inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium',
              downtimeColors.bg,
              downtimeColors.text
            )}>
              {device.downtime === 'None' ? 'No' : device.downtime} Downtime
            </span>
          </div>

          {/* Treats tags */}
          {device.treats.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {device.treats.map((treat, idx) => (
                <span
                  key={idx}
                  className="px-1.5 py-0.5 text-[10px] bg-purple-50 text-purple-600 rounded"
                >
                  {treat}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
