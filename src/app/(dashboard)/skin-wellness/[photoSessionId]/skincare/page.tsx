'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { SkinWellnessStepProgress } from '@/components/skin-wellness/SkinWellnessStepProgress';
import { SkincareCategorySection, ProductSelectionModal } from '@/components/skincare';
import {
  UNIVERSKIN_PRODUCTS,
  UNIVERSKIN_CATEGORIES,
  groupProductsByCategory,
  formatProductPrice,
  calculateTotalPrice,
  getRecommendedProducts,
  productToSelection,
} from '@/lib/universkinProducts';
import { UniverskinCategory, UniverskinProduct, SelectedUniverskinProduct } from '@/types';

/**
 * Skincare Selection Page
 *
 * Shows personalized skincare products organized by category in accordion cards.
 * AI recommends one product per category based on skin analysis.
 * Doctors can remove recommended products and add new ones.
 */
export default function SkincareSelectionPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { state: authState } = useAuth();

  const photoSessionId = params.photoSessionId as string;

  // Get patientId from URL params or sessionStorage
  const [patientId, setPatientId] = useState<string | null>(null);
  const [clinicalSessionId, setClinicalSessionId] = useState<string | null>(null);

  useEffect(() => {
    const urlPatientId = searchParams.get('patientId');
    const urlSessionId = searchParams.get('clinicalSessionId');

    if (urlPatientId) {
      setPatientId(urlPatientId);
    } else {
      const storedPatientId = sessionStorage.getItem('clinicalDocPatientId');
      if (storedPatientId) {
        setPatientId(storedPatientId);
      }
    }

    if (urlSessionId) {
      setClinicalSessionId(urlSessionId);
    } else {
      const storedSessionId = sessionStorage.getItem('clinicalDocSessionId');
      if (storedSessionId) {
        setClinicalSessionId(storedSessionId);
      }
    }
  }, [searchParams]);

  // Product state
  const [products] = useState<UniverskinProduct[]>(UNIVERSKIN_PRODUCTS);
  const [selections, setSelections] = useState<SelectedUniverskinProduct[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Set<UniverskinCategory>>(new Set());
  const [modalCategory, setModalCategory] = useState<{ id: UniverskinCategory; label: string } | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Get AI recommended products
  const recommendedProducts = useMemo(() => getRecommendedProducts(products), [products]);
  const recommendedProductIds = useMemo(() => recommendedProducts.map((p) => p.id), [recommendedProducts]);

  // Initialize with AI recommendations on first load
  useEffect(() => {
    if (!isInitialized && recommendedProducts.length > 0) {
      const initialSelections = recommendedProducts.map(productToSelection);
      setSelections(initialSelections);

      // Expand categories that have products
      const categoriesWithProducts = new Set(recommendedProducts.map((p) => p.category));
      setExpandedCategories(categoriesWithProducts);

      setIsInitialized(true);
    }
  }, [isInitialized, recommendedProducts]);

  // Group products by category
  const groupedProducts = useMemo(() => groupProductsByCategory(products), [products]);

  // Get visible categories (exclude 'treat' for now)
  const visibleCategories = UNIVERSKIN_CATEGORIES.filter((cat) => cat.id !== 'treat');

  // Get selections per category
  const selectionsByCategory = useMemo(() => {
    const byCategory: Record<UniverskinCategory, SelectedUniverskinProduct[]> = {
      cleanse: [],
      prep: [],
      treat: [],
      strengthen: [],
      sunscreen: [],
      kit: [],
    };

    selections.forEach((sel) => {
      const product = products.find((p) => p.id === sel.productId);
      if (product) {
        byCategory[product.category].push(sel);
      }
    });

    return byCategory;
  }, [selections, products]);

  // Toggle category expansion
  const toggleCategory = (categoryId: UniverskinCategory) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  // Open product selection modal
  const openModal = (category: { id: UniverskinCategory; label: string }) => {
    setModalCategory(category);
  };

  // Close modal
  const closeModal = () => {
    setModalCategory(null);
  };

  // Add product from modal
  const handleSelectProduct = (product: UniverskinProduct) => {
    setSelections((prev) => [...prev, productToSelection(product)]);
    closeModal();
  };

  // Update product quantity
  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) return;
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    setSelections((prev) =>
      prev.map((s) =>
        s.productId === productId
          ? { ...s, quantity, priceCents: product.defaultPriceCents * quantity }
          : s
      )
    );
  };

  // Remove product
  const handleRemoveProduct = (productId: string) => {
    setSelections((prev) => prev.filter((s) => s.productId !== productId));
  };

  // Navigation
  const handleBack = () => {
    let url = `/skin-wellness/${photoSessionId}`;
    const params = new URLSearchParams();
    if (patientId) params.set('patientId', patientId);
    if (clinicalSessionId) params.set('clinicalSessionId', clinicalSessionId);
    if (params.toString()) url += `?${params.toString()}`;
    router.push(url);
  };

  const handleFinish = () => {
    // Clear session storage and return to dashboard
    sessionStorage.removeItem('clinicalDocStep');
    sessionStorage.removeItem('clinicalDocPatientId');
    sessionStorage.removeItem('clinicalDocSessionId');
    sessionStorage.removeItem('clinicalDocPhotoSessionId');
    sessionStorage.removeItem('clinicalDocSkinConcerns');
    sessionStorage.removeItem('clinicalDocTreatments');
    sessionStorage.removeItem('clinicalDocPhotoForm');
    sessionStorage.removeItem('clinicalDocMedicalHistory');

    router.push('/dashboard');
  };

  // Calculate totals
  const totalCents = calculateTotalPrice(selections);
  const totalItems = selections.reduce((sum, s) => sum + s.quantity, 0);

  return (
    <div className="min-h-full relative bg-gradient-to-b from-sky-100 via-sky-50 to-sky-50/50">
      {/* Top bar with doctor name (left) and step progress (right) */}
      <div className="absolute top-6 left-6 right-6 lg:top-8 lg:left-10 lg:right-10 z-10 flex items-center justify-between">
        {/* Doctor name with avatar */}
        <div className="flex items-center gap-2.5">
          {authState.doctor && (
            <>
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-sky-100 to-sky-200 flex items-center justify-center shadow-sm">
                <span className="text-xs font-semibold text-sky-700">
                  {authState.doctor.firstName[0]}{authState.doctor.lastName[0]}
                </span>
              </div>
              <span className="text-sm font-medium text-stone-600">
                {authState.doctor.title ? `${authState.doctor.title} ` : ''}{authState.doctor.firstName} {authState.doctor.lastName}
              </span>
            </>
          )}
        </div>

        {/* Step Progress with frosted glass */}
        <div className="bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-sm border border-sky-100">
          <SkinWellnessStepProgress currentStep={3} />
        </div>
      </div>

      {/* Content */}
      <div className="relative max-w-3xl mx-auto px-6 pt-20 pb-8">
        {/* Header */}
        <div className="mb-6">
          {/* Centered logo */}
          <div className="flex items-center justify-center mb-3">
            <img
              src="/images/skinxs-logo.svg"
              alt="SkinXS"
              className="h-10 w-auto"
            />
          </div>
          {/* Title */}
          <div className="text-center">
            <h1 className="text-xl font-semibold text-stone-800 mb-1">
              Personalized Skincare Routine
            </h1>
            <p className="text-sm text-stone-500">
              AI-recommended products based on the skin analysis
            </p>
          </div>
        </div>

        {/* Category Accordion Sections */}
        <div className="space-y-3 mb-6">
          {visibleCategories.map((category) => (
            <SkincareCategorySection
              key={category.id}
              category={category}
              isExpanded={expandedCategories.has(category.id)}
              onToggle={() => toggleCategory(category.id)}
              selectedProducts={selectionsByCategory[category.id]}
              products={products}
              recommendedProductIds={recommendedProductIds}
              onAddClick={() => openModal(category)}
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveProduct={handleRemoveProduct}
            />
          ))}
        </div>

        {/* Order Summary */}
        {selections.length > 0 && (
          <div className="bg-gradient-to-br from-sky-500 to-sky-600 rounded-xl p-4 text-white shadow-lg mb-6">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sky-100 text-sm">Routine Total</span>
              <span className="text-2xl font-bold">{formatProductPrice(totalCents)}</span>
            </div>
            <p className="text-sky-200 text-xs">
              {selections.length} product{selections.length !== 1 ? 's' : ''} &middot; {totalItems} item{totalItems !== 1 ? 's' : ''} total
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 mb-6">
          <Button
            variant="outline"
            size="lg"
            className="flex-1"
            onClick={handleBack}
          >
            Back
          </Button>
          <Button
            size="lg"
            className="flex-1 bg-sky-600 hover:bg-sky-700 active:bg-sky-800 focus:ring-sky-500/30"
            onClick={handleFinish}
          >
            {selections.length > 0 ? 'Complete' : 'Skip'}
          </Button>
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-stone-400 text-center leading-relaxed">
          Product recommendations are based on cosmetic appearance analysis.
          They do not diagnose or treat medical conditions.
        </p>
      </div>

      {/* Product Selection Modal */}
      {modalCategory && (
        <ProductSelectionModal
          isOpen={true}
          onClose={closeModal}
          category={modalCategory}
          products={products}
          selectedProductIds={selections.map((s) => s.productId)}
          recommendedProductIds={recommendedProductIds}
          onSelectProduct={handleSelectProduct}
        />
      )}
    </div>
  );
}
