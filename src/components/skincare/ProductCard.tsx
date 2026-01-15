'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { UniverskinProduct, SelectedUniverskinProduct } from '@/types';
import { formatProductPrice } from '@/lib/universkinProducts';

interface ProductCardProps {
  product: UniverskinProduct;
  selection?: SelectedUniverskinProduct;
  onAdd: (selection: SelectedUniverskinProduct) => void;
  onUpdate: (selection: SelectedUniverskinProduct) => void;
  onRemove: (productId: string) => void;
  className?: string;
}

/**
 * Product card for skincare selection.
 * Features:
 * - Product name and description
 * - Size selector (if multiple sizes)
 * - Quantity selector
 * - Price display
 * - Add/Remove toggle
 */
export function ProductCard({
  product,
  selection,
  onAdd,
  onUpdate,
  onRemove,
  className,
}: ProductCardProps) {
  const isSelected = !!selection;
  const [localSize, setLocalSize] = useState(product.defaultSize);
  const [localQuantity, setLocalQuantity] = useState(1);

  // Use selection values if selected, otherwise local state
  const currentSize = selection?.size ?? localSize;
  const currentQuantity = selection?.quantity ?? localQuantity;

  // Get price (for now, same price regardless of size - can be enhanced later)
  const priceCents = product.defaultPriceCents;

  const handleSizeChange = (newSize: string) => {
    if (isSelected) {
      onUpdate({
        ...selection,
        size: newSize,
      });
    } else {
      setLocalSize(newSize);
    }
  };

  const handleQuantityChange = (delta: number) => {
    const newQuantity = Math.max(1, currentQuantity + delta);
    if (isSelected) {
      onUpdate({
        ...selection,
        quantity: newQuantity,
      });
    } else {
      setLocalQuantity(newQuantity);
    }
  };

  const handleToggle = () => {
    if (isSelected) {
      onRemove(product.id);
    } else {
      onAdd({
        productId: product.id,
        size: localSize,
        quantity: localQuantity,
        priceCents: priceCents * localQuantity,
      });
    }
  };

  // Calculate display price (unit price * quantity)
  const totalPrice = priceCents * currentQuantity;

  return (
    <div
      className={cn(
        'relative bg-white rounded-xl border transition-all duration-200',
        isSelected
          ? 'border-sky-300 shadow-md ring-1 ring-sky-200'
          : 'border-stone-200 hover:border-sky-200 hover:shadow-sm',
        className
      )}
    >
      {/* Selected indicator */}
      {isSelected && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-sky-500 rounded-full flex items-center justify-center shadow-sm">
          <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      )}

      <div className="p-4">
        {/* Product Image Placeholder */}
        <div className="aspect-square bg-gradient-to-br from-sky-50 to-stone-50 rounded-lg mb-3 flex items-center justify-center">
          <svg
            className="w-12 h-12 text-sky-200"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          >
            <path d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611l-4.396.732a2.25 2.25 0 01-1.478-.4L12 19.5l-2.261 1.145a2.25 2.25 0 01-1.478.4l-4.396-.732c-1.717-.293-2.3-2.379-1.067-3.611L5 14.5" />
          </svg>
        </div>

        {/* Product Info */}
        <div className="mb-3">
          <h3 className="font-semibold text-stone-800 text-sm leading-tight mb-1">
            {product.name}
          </h3>
          <p className="text-xs text-stone-500 line-clamp-2">{product.description}</p>
        </div>

        {/* Size Selector (if multiple sizes) */}
        {product.availableSizes.length > 1 && (
          <div className="mb-3">
            <label className="text-xs font-medium text-stone-500 mb-1.5 block">Size</label>
            <div className="flex gap-1.5">
              {product.availableSizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => handleSizeChange(size)}
                  className={cn(
                    'px-2.5 py-1 text-xs font-medium rounded-md transition-colors',
                    currentSize === size
                      ? 'bg-sky-100 text-sky-700 border border-sky-200'
                      : 'bg-stone-50 text-stone-600 border border-stone-200 hover:border-sky-200'
                  )}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quantity and Price Row */}
        <div className="flex items-center justify-between mb-3">
          {/* Quantity Selector */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleQuantityChange(-1)}
              disabled={currentQuantity <= 1}
              className={cn(
                'w-7 h-7 rounded-md flex items-center justify-center transition-colors',
                'border border-stone-200 text-stone-500',
                currentQuantity <= 1
                  ? 'opacity-40 cursor-not-allowed'
                  : 'hover:border-sky-200 hover:text-sky-600'
              )}
            >
              <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M2 6h8" strokeLinecap="round" />
              </svg>
            </button>
            <span className="w-6 text-center text-sm font-medium text-stone-800">
              {currentQuantity}
            </span>
            <button
              type="button"
              onClick={() => handleQuantityChange(1)}
              className="w-7 h-7 rounded-md flex items-center justify-center border border-stone-200 text-stone-500 hover:border-sky-200 hover:text-sky-600 transition-colors"
            >
              <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 2v8M2 6h8" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* Price */}
          <div className="text-right">
            <div className="text-lg font-semibold text-stone-800">
              {formatProductPrice(totalPrice)}
            </div>
            {currentQuantity > 1 && (
              <div className="text-xs text-stone-400">
                {formatProductPrice(priceCents)} each
              </div>
            )}
          </div>
        </div>

        {/* Add/Remove Button */}
        <button
          type="button"
          onClick={handleToggle}
          className={cn(
            'w-full py-2.5 rounded-lg font-medium text-sm transition-all duration-200',
            isSelected
              ? 'bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100'
              : 'bg-sky-600 text-white hover:bg-sky-700 shadow-sm'
          )}
        >
          {isSelected ? (
            <span className="flex items-center justify-center gap-1.5">
              <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                  clipRule="evenodd"
                />
              </svg>
              Selected
            </span>
          ) : (
            <span className="flex items-center justify-center gap-1.5">
              <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
              </svg>
              Add
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
