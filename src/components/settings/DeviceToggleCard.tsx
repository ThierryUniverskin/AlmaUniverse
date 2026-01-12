'use client';

import React, { useState, useEffect } from 'react';
import { EBDDevice } from '@/types';
import { getFitzpatrickColor, getDowntimeColor } from '@/lib/ebdDevices';
import { cn } from '@/lib/utils';
import { formatPrice, parsePriceToCents, centsToInputValue, getCurrencySymbol } from '@/lib/pricing';

export interface DeviceToggleCardProps {
  device: EBDDevice;
  isSelected: boolean;
  onToggle: () => void;
  disabled?: boolean;
  isToggling?: boolean;
  priceCents: number | null; // Doctor's custom price (null = use default)
  defaultPriceCents: number | null; // Device's default price
  onPriceChange: (newPriceCents: number | null) => void;
  countryCode?: string;
  isSavingPrice?: boolean;
}

export function DeviceToggleCard({
  device,
  isSelected,
  onToggle,
  disabled = false,
  isToggling = false,
  priceCents,
  defaultPriceCents,
  onPriceChange,
  countryCode,
  isSavingPrice = false,
}: DeviceToggleCardProps) {
  const fitzColors = getFitzpatrickColor(device.fitzpatrick);
  const downtimeColors = getDowntimeColor(device.downtime);
  const currencySymbol = getCurrencySymbol(countryCode);

  // Determine effective price (custom or default)
  const effectivePrice = priceCents ?? defaultPriceCents ?? 0;
  const isUsingDefault = priceCents === null;

  // Inline editing state
  const [isEditing, setIsEditing] = useState(false);
  const [priceInput, setPriceInput] = useState('');

  // Initialize price input when starting edit
  useEffect(() => {
    if (isEditing) {
      setPriceInput(centsToInputValue(effectivePrice));
    }
  }, [isEditing, effectivePrice]);

  const handleEditClick = () => {
    if (isSelected && !disabled && !isToggling && !isSavingPrice) {
      setIsEditing(true);
    }
  };

  const handleSavePrice = () => {
    const cents = parsePriceToCents(priceInput);
    if (cents !== null && cents >= 0) {
      onPriceChange(cents);
    }
    setIsEditing(false);
  };

  const handleResetToDefault = () => {
    onPriceChange(null); // null means use default
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSavePrice();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
    }
  };

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

      {/* Price Section - Full width row at bottom, only when selected */}
      {isSelected && (
        <div className="mt-3 pt-3 border-t border-stone-100">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-500">Price per session</span>

            {isEditing ? (
              <div className="flex items-center gap-2">
                <div className="relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-stone-500 text-xs">
                    {currencySymbol}
                  </span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={priceInput}
                    onChange={(e) => setPriceInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    autoFocus
                    className="w-24 pl-6 pr-2 py-1.5 text-xs border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSavePrice}
                  disabled={isSavingPrice}
                  className="px-3 py-1.5 text-xs font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 disabled:opacity-50"
                >
                  {isSavingPrice ? '...' : 'Save'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-2 py-1.5 text-xs text-stone-500 hover:text-stone-700"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-stone-900">
                  {formatPrice(effectivePrice, countryCode)}
                </span>
                {isUsingDefault && (
                  <span className="text-[10px] text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded">default</span>
                )}
                {!isUsingDefault && defaultPriceCents !== null && (
                  <button
                    type="button"
                    onClick={handleResetToDefault}
                    disabled={disabled || isSavingPrice}
                    className="text-[10px] text-stone-400 hover:text-stone-600 underline disabled:opacity-50"
                  >
                    Reset
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleEditClick}
                  disabled={disabled || isToggling || isSavingPrice}
                  className="p-1.5 text-stone-400 hover:text-purple-600 hover:bg-purple-50 rounded-md transition-colors disabled:opacity-50"
                  title="Edit price"
                >
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
