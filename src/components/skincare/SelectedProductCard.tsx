'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { UniverskinProduct, SelectedUniverskinProduct } from '@/types';
import { formatProductPrice } from '@/lib/universkinProducts';

interface SelectedProductCardProps {
  product: UniverskinProduct;
  selection: SelectedUniverskinProduct;
  onUpdateQuantity: (quantity: number) => void;
  onRemove: () => void;
  isRecommended?: boolean;
  disabled?: boolean;
}

/**
 * Card displaying a selected product with image, quantity controls, and price.
 * Similar to SelectedTreatmentCard but for skincare products.
 */
export function SelectedProductCard({
  product,
  selection,
  onUpdateQuantity,
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

  return (
    <div
      className={cn(
        'relative flex items-start gap-3 p-3 rounded-lg border bg-white transition-colors',
        isRecommended
          ? 'border-sky-200 bg-sky-50/50'
          : 'border-stone-200 hover:border-stone-300'
      )}
    >
      {/* Product Image */}
      <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-stone-100">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-stone-300"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
            >
              <path d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082" />
            </svg>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h4 className="text-sm font-medium text-stone-800 leading-tight">{product.name}</h4>
            <p className="text-xs text-stone-500 mt-0.5">{selection.size}</p>
            {isRecommended && (
              <span className="inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded-full bg-sky-100 text-sky-700 text-xs font-medium">
                <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" />
                </svg>
                AI Recommended
              </span>
            )}
          </div>

          {/* Remove Button */}
          <button
            type="button"
            onClick={onRemove}
            disabled={disabled}
            className="flex-shrink-0 p-1 rounded-md text-stone-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </button>
        </div>

        {/* Quantity and Price Row */}
        <div className="flex items-center justify-between mt-2">
          {/* Quantity Controls */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleDecrease}
              disabled={disabled || selection.quantity <= 1}
              className={cn(
                'w-6 h-6 rounded flex items-center justify-center border transition-colors',
                selection.quantity <= 1
                  ? 'border-stone-200 text-stone-300 cursor-not-allowed'
                  : 'border-stone-300 text-stone-600 hover:border-sky-300 hover:text-sky-600'
              )}
            >
              <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M2 6h8" strokeLinecap="round" />
              </svg>
            </button>
            <span className="w-8 text-center text-sm font-medium text-stone-800">
              {selection.quantity}
            </span>
            <button
              type="button"
              onClick={handleIncrease}
              disabled={disabled}
              className="w-6 h-6 rounded flex items-center justify-center border border-stone-300 text-stone-600 hover:border-sky-300 hover:text-sky-600 transition-colors"
            >
              <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 2v8M2 6h8" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* Price */}
          <div className="text-right">
            <span className="text-sm font-semibold text-stone-800">
              {formatProductPrice(totalPrice)}
            </span>
            {selection.quantity > 1 && (
              <span className="text-xs text-stone-400 ml-1">
                ({formatProductPrice(product.defaultPriceCents)} ea)
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
