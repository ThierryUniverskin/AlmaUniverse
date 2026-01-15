'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { UniverskinProduct, UniverskinCategory, SelectedUniverskinProduct } from '@/types';
import { SelectedProductCard } from './SelectedProductCard';

interface SkincareCategorySectionProps {
  category: { id: UniverskinCategory; label: string };
  isExpanded: boolean;
  onToggle: () => void;
  selectedProducts: SelectedUniverskinProduct[];
  products: UniverskinProduct[];
  recommendedProductIds: string[];
  onAddClick: () => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveProduct: (productId: string) => void;
  disabled?: boolean;
}

// Category-specific icons with sky theme
function CategoryIcon({ category, className = '' }: { category: UniverskinCategory; className?: string }) {
  const iconClass = cn(className, 'text-sky-400');

  switch (category) {
    case 'cleanse':
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          {/* Water droplet / cleansing */}
          <path d="M12 21a7 7 0 01-7-7c0-3.5 7-11 7-11s7 7.5 7 11a7 7 0 01-7 7z" strokeLinejoin="round" />
          <path d="M12 17a3 3 0 01-3-3" strokeLinecap="round" />
        </svg>
      );
    case 'prep':
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          {/* Pads / cotton rounds */}
          <circle cx="12" cy="12" r="8" />
          <path d="M12 8v8M8 12h8" strokeLinecap="round" />
        </svg>
      );
    case 'strengthen':
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          {/* Shield / protection */}
          <path d="M12 3l8 4v5c0 5-3.5 9.5-8 11-4.5-1.5-8-6-8-11V7l8-4z" strokeLinejoin="round" />
          <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'sunscreen':
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          {/* Sun */}
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" strokeLinecap="round" />
        </svg>
      );
    case 'kit':
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          {/* Gift box / kit */}
          <rect x="3" y="8" width="18" height="13" rx="2" />
          <path d="M12 8v13" strokeLinecap="round" />
          <path d="M3 12h18" strokeLinecap="round" />
          <path d="M12 8c-2-2-5-2.5-5 0s3 2.5 5 2.5 5-.5 5-2.5-3-2-5 0z" />
        </svg>
      );
    case 'treat':
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          {/* Serum dropper */}
          <path d="M12 3v3" strokeLinecap="round" />
          <path d="M9 6h6l1 3H8l1-3z" strokeLinejoin="round" />
          <path d="M8 9v10a3 3 0 003 3h2a3 3 0 003-3V9" strokeLinejoin="round" />
          <path d="M12 14v4" strokeLinecap="round" />
        </svg>
      );
    default:
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="8" />
        </svg>
      );
  }
}

export function SkincareCategorySection({
  category,
  isExpanded,
  onToggle,
  selectedProducts,
  products,
  recommendedProductIds,
  onAddClick,
  onUpdateQuantity,
  onRemoveProduct,
  disabled = false,
}: SkincareCategorySectionProps) {
  // Create product lookup
  const productMap = new Map(products.map((p) => [p.id, p]));

  const count = selectedProducts.length;

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-xl border border-sky-100 overflow-hidden shadow-sm">
      {/* Accordion Header */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-sky-50/50 transition-colors"
        disabled={disabled}
      >
        <div className="flex items-center gap-3">
          <CategoryIcon category={category.id} className="h-5 w-5" />
          <span className="font-medium text-stone-800">{category.label}</span>
          {count > 0 && (
            <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-sky-100 text-sky-700 text-xs font-medium">
              {count}
            </span>
          )}
        </div>
        <svg
          className={cn(
            'h-5 w-5 text-stone-400 transition-transform duration-200',
            isExpanded && 'rotate-180'
          )}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Accordion Content */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-sky-100">
          {/* Selected products list */}
          {selectedProducts.length === 0 ? (
            <div className="text-center py-6 bg-sky-50/50 rounded-lg border border-dashed border-sky-200 mt-4">
              <CategoryIcon category={category.id} className="h-8 w-8 mx-auto text-sky-200 mb-2" />
              <p className="text-sm text-stone-500">
                No {category.label.toLowerCase()} products selected yet.
              </p>
              <p className="text-xs text-stone-400 mt-1">
                Click the button below to add products.
              </p>
            </div>
          ) : (
            <div className="space-y-2 mt-4">
              {selectedProducts.map((selection) => {
                const product = productMap.get(selection.productId);
                if (!product) return null;

                return (
                  <SelectedProductCard
                    key={selection.productId}
                    product={product}
                    selection={selection}
                    isRecommended={recommendedProductIds.includes(selection.productId)}
                    onUpdateQuantity={(qty) => onUpdateQuantity(selection.productId, qty)}
                    onRemove={() => onRemoveProduct(selection.productId)}
                    disabled={disabled}
                  />
                );
              })}
            </div>
          )}

          {/* Add button */}
          <button
            type="button"
            onClick={onAddClick}
            disabled={disabled}
            className={cn(
              'w-full mt-4 flex items-center justify-center gap-2 py-3',
              'bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-lg',
              'text-sky-700 font-medium text-sm',
              'transition-colors',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Add {category.label} Product
          </button>
        </div>
      )}
    </div>
  );
}
