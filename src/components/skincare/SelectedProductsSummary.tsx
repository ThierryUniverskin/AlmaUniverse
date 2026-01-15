'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { UniverskinProduct, SelectedUniverskinProduct } from '@/types';
import { formatProductPrice, calculateTotalPrice } from '@/lib/universkinProducts';

interface SelectedProductsSummaryProps {
  selections: SelectedUniverskinProduct[];
  products: UniverskinProduct[];
  onRemove: (productId: string) => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  className?: string;
}

/**
 * Collapsible summary panel showing selected products with totals.
 */
export function SelectedProductsSummary({
  selections,
  products,
  onRemove,
  onUpdateQuantity,
  className,
}: SelectedProductsSummaryProps) {
  if (selections.length === 0) {
    return null;
  }

  // Create lookup map for products
  const productMap = new Map(products.map((p) => [p.id, p]));

  // Calculate total
  const totalCents = calculateTotalPrice(selections);

  return (
    <div className={cn('bg-white/90 backdrop-blur-sm rounded-xl border border-sky-100 shadow-sm', className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-sky-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-sky-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-sky-600" viewBox="0 0 20 20" fill="currentColor">
              <path d="M6 5v1H4.667a1.75 1.75 0 00-1.743 1.598l-.826 9.5A1.75 1.75 0 003.84 19H16.16a1.75 1.75 0 001.743-1.902l-.826-9.5A1.75 1.75 0 0015.333 6H14V5a4 4 0 00-8 0zm4-2.5A2.5 2.5 0 007.5 5v1h5V5A2.5 2.5 0 0010 2.5zM7.5 10a2.5 2.5 0 005 0V8.75a.75.75 0 011.5 0V10a4 4 0 01-8 0V8.75a.75.75 0 011.5 0V10z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-stone-800 text-sm">Selected Products</h3>
            <p className="text-xs text-stone-500">{selections.length} item{selections.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-semibold text-sky-700">{formatProductPrice(totalCents)}</div>
          <div className="text-xs text-stone-500">Total</div>
        </div>
      </div>

      {/* Items List */}
      <div className="divide-y divide-sky-50 max-h-64 overflow-y-auto">
        {selections.map((selection) => {
          const product = productMap.get(selection.productId);
          if (!product) return null;

          return (
            <div key={selection.productId} className="flex items-center gap-3 p-3">
              {/* Product Info */}
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-stone-800 truncate">{product.name}</h4>
                <p className="text-xs text-stone-500">
                  {selection.size} &middot; {formatProductPrice(product.defaultPriceCents)} each
                </p>
              </div>

              {/* Quantity Control */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => onUpdateQuantity(selection.productId, selection.quantity - 1)}
                  disabled={selection.quantity <= 1}
                  className={cn(
                    'w-6 h-6 rounded flex items-center justify-center text-stone-400 hover:text-sky-600 hover:bg-sky-50 transition-colors',
                    selection.quantity <= 1 && 'opacity-40 cursor-not-allowed'
                  )}
                >
                  <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M2 6h8" strokeLinecap="round" />
                  </svg>
                </button>
                <span className="w-5 text-center text-sm font-medium text-stone-800">{selection.quantity}</span>
                <button
                  type="button"
                  onClick={() => onUpdateQuantity(selection.productId, selection.quantity + 1)}
                  className="w-6 h-6 rounded flex items-center justify-center text-stone-400 hover:text-sky-600 hover:bg-sky-50 transition-colors"
                >
                  <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 2v8M2 6h8" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              {/* Price */}
              <div className="w-16 text-right text-sm font-medium text-stone-700">
                {formatProductPrice(selection.priceCents)}
              </div>

              {/* Remove Button */}
              <button
                type="button"
                onClick={() => onRemove(selection.productId)}
                className="w-6 h-6 rounded flex items-center justify-center text-stone-400 hover:text-red-500 hover:bg-red-50 transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                </svg>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
