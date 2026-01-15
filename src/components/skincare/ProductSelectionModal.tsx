'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useSidebarOffset } from '@/context/LayoutContext';
import { UniverskinProduct, UniverskinCategory } from '@/types';
import { formatProductPrice } from '@/lib/universkinProducts';
import { ImageLightbox } from '@/components/ui/ImageLightbox';

interface ProductSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: { id: UniverskinCategory; label: string };
  products: UniverskinProduct[];
  selectedProductIds: string[];
  recommendedProductIds: string[];
  onSelectProduct: (product: UniverskinProduct, size?: string) => void;
}

/**
 * Modal for selecting products from a specific category.
 * Matches EBD device modal design with sidebar offset centering.
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
  const [mounted, setMounted] = useState(false);
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});
  const [lightboxImage, setLightboxImage] = useState<{ src: string; alt: string } | null>(null);
  const sidebarOffset = useSidebarOffset();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Filter and sort products: recommended first, then others
  const { recommendedProducts, otherProducts } = useMemo(() => {
    const categoryProducts = products.filter((p) => p.category === category.id);
    const recommended = categoryProducts.filter((p) => recommendedProductIds.includes(p.id));
    const others = categoryProducts.filter((p) => !recommendedProductIds.includes(p.id));
    return { recommendedProducts: recommended, otherProducts: others };
  }, [products, category.id, recommendedProductIds]);

  // Initialize default sizes
  useEffect(() => {
    if (isOpen) {
      const defaults: Record<string, string> = {};
      [...recommendedProducts, ...otherProducts].forEach((p) => {
        defaults[p.id] = p.defaultSize;
      });
      setSelectedSizes(defaults);
    }
  }, [isOpen, recommendedProducts, otherProducts]);

  if (!mounted || !isOpen) return null;

  const handleSelectProduct = (product: UniverskinProduct) => {
    const size = selectedSizes[product.id] || product.defaultSize;
    onSelectProduct(product, size);
    onClose();
  };

  const handleSizeChange = (productId: string, size: string) => {
    setSelectedSizes((prev) => ({ ...prev, [productId]: size }));
  };

  const renderProductCard = (product: UniverskinProduct, isRecommended: boolean) => {
    const isSelected = selectedProductIds.includes(product.id);
    const hasMultipleSizes = product.availableSizes && product.availableSizes.length > 1;
    const currentSize = selectedSizes[product.id] || product.defaultSize;

    return (
      <div
        key={product.id}
        className={`
          border rounded-xl p-4 transition-colors
          ${isSelected
            ? 'border-stone-200 bg-stone-100 opacity-60'
            : isRecommended
              ? 'border-emerald-200 bg-gradient-to-r from-emerald-50/50 to-white hover:border-emerald-300'
              : 'border-stone-200 bg-stone-50 hover:border-sky-300 hover:bg-sky-50'
          }
        `}
      >
        {/* Recommendation badge above image */}
        {isRecommended && (
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-100 text-emerald-700">
              <svg className="h-3 w-3 mr-1" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              Recommended
            </span>
          </div>
        )}
        <div className="flex gap-4">
          {/* Product Image - 2:3 ratio with object-cover, clickable */}
          <div className="flex-shrink-0">
            <div
              className={`w-[56px] h-[84px] rounded-lg overflow-hidden bg-white border border-stone-200 ${
                product.imageUrl ? 'cursor-pointer hover:border-sky-300 hover:shadow-md transition-all group' : ''
              }`}
              onClick={(e) => {
                if (product.imageUrl) {
                  e.stopPropagation();
                  setLightboxImage({ src: product.imageUrl, alt: product.name });
                }
              }}
            >
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-sky-50 to-sky-100">
                  <svg
                    className="w-6 h-6 text-sky-300"
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
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 mb-1">
              <div>
                <h3 className="text-sm font-semibold text-stone-900 leading-tight">
                  {product.name}
                </h3>
                {/* Size selector or display */}
                {hasMultipleSizes ? (
                  <select
                    value={currentSize}
                    onChange={(e) => handleSizeChange(product.id, e.target.value)}
                    className="mt-1 text-xs text-stone-600 bg-white border border-stone-200 rounded px-2 py-0.5 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    disabled={isSelected}
                  >
                    {product.availableSizes.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-xs text-stone-500">{product.defaultSize}</p>
                )}
                <p className="text-xs font-medium text-sky-600">
                  {formatProductPrice(product.defaultPriceCents)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleSelectProduct(product)}
                disabled={isSelected}
                className={`
                  flex-shrink-0 px-3 py-1 text-xs font-medium rounded-full transition-colors
                  ${isSelected
                    ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                    : isRecommended
                      ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                      : 'bg-sky-100 text-sky-700 hover:bg-sky-200'
                  }
                `}
              >
                {isSelected ? 'Added' : 'Select'}
              </button>
            </div>
            <p className="text-[11px] text-stone-500">
              {product.description}
            </p>
          </div>
        </div>
      </div>
    );
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 transition-[padding] duration-300"
      style={{ paddingLeft: sidebarOffset }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-2xl max-h-[85vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header with close button */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200">
          <h2 id="modal-title" className="text-lg font-semibold text-stone-900">
            Add {category.label} Product
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
            aria-label="Close"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Product List */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {recommendedProducts.length === 0 && otherProducts.length === 0 ? (
            <div className="text-center py-8 text-sm text-stone-500">
              No products available in this category.
            </div>
          ) : (
            <div className="space-y-4">
              {/* Recommended Products Section */}
              {recommendedProducts.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-5 w-5 rounded-full bg-emerald-100 flex items-center justify-center">
                      <svg className="h-3 w-3 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="text-sm font-semibold text-stone-800">
                      Recommended
                    </h3>
                    <span className="text-xs text-stone-400">
                      ({recommendedProducts.length})
                    </span>
                  </div>
                  <div className="space-y-3">
                    {recommendedProducts.map((product) => renderProductCard(product, true))}
                  </div>
                </div>
              )}

              {/* Divider */}
              {recommendedProducts.length > 0 && otherProducts.length > 0 && (
                <div className="border-t border-stone-200 my-2" />
              )}

              {/* Other Products Section */}
              {otherProducts.length > 0 && (
                <div>
                  {recommendedProducts.length > 0 && (
                    <h3 className="text-sm font-medium text-stone-500 mb-3">
                      Other Products
                    </h3>
                  )}
                  <div className="space-y-3">
                    {otherProducts.map((product) => renderProductCard(product, false))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 border-t border-stone-100 bg-stone-50">
          <p className="text-xs text-stone-500 text-center">
            {recommendedProducts.length + otherProducts.length} product{recommendedProducts.length + otherProducts.length !== 1 ? 's' : ''} available
          </p>
        </div>
      </div>

      {/* Image Lightbox */}
      {lightboxImage && (
        <ImageLightbox
          src={lightboxImage.src}
          alt={lightboxImage.alt}
          onClose={() => setLightboxImage(null)}
        />
      )}
    </div>
  );

  return createPortal(modalContent, document.body);
}
