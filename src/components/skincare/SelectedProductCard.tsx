'use client';

import React, { useState } from 'react';
import { UniverskinProduct, SelectedUniverskinProduct, WhenToApply } from '@/types';
import { formatProductPrice } from '@/lib/universkinProducts';
import { ImageLightbox } from '@/components/ui/ImageLightbox';

interface SelectedProductCardProps {
  product: UniverskinProduct;
  selection: SelectedUniverskinProduct;
  onUpdateQuantity: (quantity: number) => void;
  onUpdateWhenToApply: (whenToApply: WhenToApply) => void;
  onRemove: () => void;
  isRecommended?: boolean;
  disabled?: boolean;
}

// Sun icon for AM application
function SunIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" strokeLinecap="round" />
    </svg>
  );
}

// Moon icon for PM application
function MoonIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * Card displaying a selected product with image, description, quantity controls, and price.
 * Matches the SelectedTreatmentCard design pattern.
 */
export function SelectedProductCard({
  product,
  selection,
  onUpdateQuantity,
  onUpdateWhenToApply,
  onRemove,
  isRecommended = false,
  disabled = false,
}: SelectedProductCardProps) {
  const handleDecrease = () => {
    if (selection.quantity > 1) {
      onUpdateQuantity(selection.quantity - 1);
    }
  };

  const handleIncrease = () => {
    onUpdateQuantity(selection.quantity + 1);
  };

  const totalPrice = product.defaultPriceCents * selection.quantity;

  // Application time options
  const whenToApplyOptions: WhenToApply[] = ['AM', 'PM', 'AM&PM'];

  // Lightbox state
  const [showLightbox, setShowLightbox] = useState(false);

  return (
    <div className="bg-stone-50 border border-stone-200 rounded-xl p-4">
      {/* Product info */}
      <div className="flex gap-4">
        {/* Image - 2:3 aspect ratio to match product photos, clickable */}
        <div className="flex-shrink-0">
          {product.imageUrl ? (
            <div
              className="w-[60px] h-[90px] rounded-lg overflow-hidden bg-white border border-stone-200 cursor-pointer hover:border-sky-300 hover:shadow-md transition-all group"
              onClick={() => setShowLightbox(true)}
            >
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
            </div>
          ) : (
            <div className="w-[60px] h-[90px] rounded-lg bg-gradient-to-br from-sky-50 to-sky-100 border border-sky-100 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-sky-300"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
              >
                <path d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0" />
              </svg>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header with name and remove button */}
          <div className="flex items-start justify-between gap-3 mb-1">
            <div>
              <h3 className="text-sm font-semibold text-stone-900 leading-tight">
                {product.name}
              </h3>
              <span className="text-xs text-stone-500">{selection.size}</span>
            </div>
            <button
              type="button"
              onClick={onRemove}
              disabled={disabled}
              className="flex-shrink-0 p-1 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
              aria-label="Remove product"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Description */}
          <p className="text-[11px] text-stone-500 mb-2 line-clamp-2">
            {product.description}
          </p>

          {/* Recommended badge */}
          {isRecommended && (
            <div className="mb-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-100 text-emerald-700">
                <svg className="h-3 w-3 mr-1" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                Recommended
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Controls Row - Quantity, Apply Time, Duration, Price */}
      <div className="border-t border-stone-100 pt-3 mt-3">
        <div className="flex items-start gap-3">
          {/* Quantity spinner */}
          <div className="flex-shrink-0">
            <label className="block text-[10px] font-medium text-stone-500 uppercase tracking-wide mb-1">
              Qty
            </label>
            <div className="inline-flex items-center h-[30px] border border-stone-200 rounded-lg bg-white">
              <button
                type="button"
                onClick={handleDecrease}
                disabled={disabled || selection.quantity <= 1}
                className="px-2 h-full text-stone-500 hover:text-stone-700 hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-l-lg transition-colors flex items-center"
              >
                <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14" strokeLinecap="round" />
                </svg>
              </button>
              <span className="px-3 text-sm font-medium text-stone-900 min-w-[2rem] text-center">
                {selection.quantity}
              </span>
              <button
                type="button"
                onClick={handleIncrease}
                disabled={disabled}
                className="px-2 h-full text-stone-500 hover:text-stone-700 hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-r-lg transition-colors flex items-center"
              >
                <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </div>

          {/* Apply Time Selector */}
          <div className="flex-shrink-0">
            <label className="block text-[10px] font-medium text-stone-500 uppercase tracking-wide mb-1">
              Apply
            </label>
            <div className="inline-flex items-center h-[30px] border border-stone-200 rounded-lg bg-white overflow-hidden">
              {whenToApplyOptions.map((option) => {
                const isSelected = selection.whenToApply === option;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => onUpdateWhenToApply(option)}
                    disabled={disabled}
                    className={`
                      px-2 h-full flex items-center gap-0.5 text-xs font-medium transition-colors
                      ${isSelected
                        ? 'bg-sky-100 text-sky-700'
                        : 'text-stone-500 hover:text-stone-700 hover:bg-stone-50'
                      }
                      ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                    title={option === 'AM' ? 'Morning' : option === 'PM' ? 'Evening' : 'Morning & Evening'}
                  >
                    {option === 'AM' && <SunIcon className="h-3.5 w-3.5" />}
                    {option === 'PM' && <MoonIcon className="h-3.5 w-3.5" />}
                    {option === 'AM&PM' && (
                      <>
                        <SunIcon className="h-3 w-3" />
                        <MoonIcon className="h-3 w-3" />
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Duration badge */}
          <div className="flex-shrink-0">
            <label className="block text-[10px] font-medium text-stone-500 uppercase tracking-wide mb-1">
              Duration
            </label>
            <div className="inline-flex items-center h-[30px] gap-1 px-2.5 bg-stone-100 border border-stone-200 rounded-lg">
              <svg className="h-3.5 w-3.5 text-stone-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 6v6l4 2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-xs font-medium text-stone-600">{product.durationDays}d</span>
            </div>
          </div>

          {/* Price */}
          <div className="flex-1 text-right pt-2">
            <div className="flex items-center justify-end gap-1.5 text-xs text-stone-500">
              <span>{formatProductPrice(product.defaultPriceCents)}</span>
              <span>×</span>
              <span>{selection.quantity}</span>
            </div>
            <div className="text-sm font-semibold text-sky-700">
              {formatProductPrice(totalPrice)}
            </div>
          </div>
        </div>
      </div>

      {/* Image Lightbox */}
      {showLightbox && product.imageUrl && (
        <ImageLightbox
          src={product.imageUrl}
          alt={product.name}
          onClose={() => setShowLightbox(false)}
        />
      )}
    </div>
  );
}
