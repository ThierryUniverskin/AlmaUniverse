'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { UniverskinProduct, UniverskinCategory, SelectedUniverskinProduct } from '@/types';
import { formatProductPrice } from '@/lib/universkinProducts';

interface ProductSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: { id: UniverskinCategory; label: string };
  products: UniverskinProduct[];
  selectedProductIds: string[];
  recommendedProductIds: string[];
  onSelectProduct: (product: UniverskinProduct) => void;
}

/**
 * Modal for selecting products from a specific category.
 * Shows product image, name, description, and price.
 */
export function ProductSelectionModal({
  isOpen,
  onClose,
  category,
  products,
  selectedProductIds,
  recommendedProductIds,
  onSelectProduct,
}: ProductSelectionModalProps) {
  if (!isOpen) return null;

  // Filter products for this category
  const categoryProducts = products.filter((p) => p.category === category.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[85vh] mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200">
          <div>
            <h2 className="text-lg font-semibold text-stone-800">
              Add {category.label} Product
            </h2>
            <p className="text-sm text-stone-500">
              Select a product to add to the routine
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </button>
        </div>

        {/* Product List */}
        <div className="flex-1 overflow-y-auto p-4">
          {categoryProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-stone-500">No products available in this category.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {categoryProducts.map((product) => {
                const isSelected = selectedProductIds.includes(product.id);
                const isRecommended = recommendedProductIds.includes(product.id);

                return (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => !isSelected && onSelectProduct(product)}
                    disabled={isSelected}
                    className={cn(
                      'w-full flex items-start gap-4 p-4 rounded-xl border text-left transition-all',
                      isSelected
                        ? 'border-sky-300 bg-sky-50 cursor-not-allowed'
                        : 'border-stone-200 hover:border-sky-200 hover:bg-sky-50/50 cursor-pointer'
                    )}
                  >
                    {/* Product Image */}
                    <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-stone-100">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg
                            className="w-10 h-10 text-stone-300"
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

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-medium text-stone-800">{product.name}</h3>
                          <p className="text-xs text-stone-500 mt-0.5">{product.defaultSize}</p>
                        </div>
                        <span className="text-lg font-semibold text-stone-800">
                          {formatProductPrice(product.defaultPriceCents)}
                        </span>
                      </div>

                      <p className="text-sm text-stone-500 mt-2 line-clamp-2">
                        {product.description}
                      </p>

                      {/* Badges */}
                      <div className="flex items-center gap-2 mt-2">
                        {isRecommended && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-sky-100 text-sky-700 text-xs font-medium">
                            <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" />
                            </svg>
                            AI Recommended
                          </span>
                        )}
                        {isSelected && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-stone-200 text-stone-600 text-xs font-medium">
                            <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                            </svg>
                            Already Added
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-stone-200 bg-stone-50">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-lg border border-stone-300 text-stone-700 font-medium text-sm hover:bg-stone-100 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
