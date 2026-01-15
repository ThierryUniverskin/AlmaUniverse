'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { SkinWellnessStepProgress } from '@/components/skin-wellness/SkinWellnessStepProgress';
import { CategoryTabs, ProductCard, SelectedProductsSummary } from '@/components/skincare';
import {
  UNIVERSKIN_PRODUCTS,
  UNIVERSKIN_CATEGORIES,
  groupProductsByCategory,
  formatProductPrice,
  calculateTotalPrice,
} from '@/lib/universkinProducts';
import { UniverskinCategory, UniverskinProduct, SelectedUniverskinProduct } from '@/types';

/**
 * Skincare Selection Page
 *
 * Shows personalized skincare products organized by category.
 * Allows doctors to select products, sizes, and quantities for patients.
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
    // Try URL params first, then sessionStorage
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
  const [activeCategory, setActiveCategory] = useState<UniverskinCategory>('cleanse');
  const [selections, setSelections] = useState<SelectedUniverskinProduct[]>([]);

  // Group products by category
  const groupedProducts = useMemo(() => groupProductsByCategory(products), [products]);

  // Get visible categories (exclude 'treat' for now)
  const visibleCategories = UNIVERSKIN_CATEGORIES.filter((cat) => cat.id !== 'treat');

  // Count selections per category
  const selectionCounts = useMemo(() => {
    const counts: Record<UniverskinCategory, number> = {
      cleanse: 0,
      prep: 0,
      treat: 0,
      strengthen: 0,
      sunscreen: 0,
      kit: 0,
    };

    selections.forEach((sel) => {
      const product = products.find((p) => p.id === sel.productId);
      if (product) {
        counts[product.category]++;
      }
    });

    return counts;
  }, [selections, products]);

  // Get selection for a specific product
  const getSelection = (productId: string): SelectedUniverskinProduct | undefined => {
    return selections.find((s) => s.productId === productId);
  };

  // Add product to selections
  const handleAddProduct = (selection: SelectedUniverskinProduct) => {
    setSelections((prev) => [...prev, selection]);
  };

  // Update existing selection
  const handleUpdateProduct = (selection: SelectedUniverskinProduct) => {
    setSelections((prev) =>
      prev.map((s) =>
        s.productId === selection.productId
          ? { ...selection, priceCents: products.find((p) => p.id === selection.productId)?.defaultPriceCents! * selection.quantity }
          : s
      )
    );
  };

  // Remove product from selections
  const handleRemoveProduct = (productId: string) => {
    setSelections((prev) => prev.filter((s) => s.productId !== productId));
  };

  // Update quantity from summary panel
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

  // Calculate total
  const totalCents = calculateTotalPrice(selections);

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
      <div className="relative max-w-5xl mx-auto px-6 pt-20 pb-8">
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
              Personalized Skincare
            </h1>
            <p className="text-sm text-stone-500">
              Select products based on the skin analysis
            </p>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="mb-6">
          <CategoryTabs
            activeCategory={activeCategory}
            onChange={setActiveCategory}
            productCounts={selectionCounts}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Product Grid - 2 columns on lg, spans 2/3 */}
          <div className="lg:col-span-2">
            {/* Category Header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-stone-800">
                {visibleCategories.find((c) => c.id === activeCategory)?.label}
              </h2>
              <span className="text-sm text-stone-500">
                {groupedProducts[activeCategory]?.length || 0} product{(groupedProducts[activeCategory]?.length || 0) !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Products Grid */}
            {groupedProducts[activeCategory]?.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {groupedProducts[activeCategory].map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    selection={getSelection(product.id)}
                    onAdd={handleAddProduct}
                    onUpdate={handleUpdateProduct}
                    onRemove={handleRemoveProduct}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white/60 rounded-xl border border-sky-100">
                <svg
                  className="w-12 h-12 text-sky-200 mx-auto mb-3"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611l-4.396.732a2.25 2.25 0 01-1.478-.4L12 19.5l-2.261 1.145a2.25 2.25 0 01-1.478.4l-4.396-.732c-1.717-.293-2.3-2.379-1.067-3.611L5 14.5" />
                </svg>
                <p className="text-stone-500">No products available in this category yet.</p>
              </div>
            )}
          </div>

          {/* Summary Panel - Sticky on desktop */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24 space-y-4">
              {/* Selected Products Summary */}
              <SelectedProductsSummary
                selections={selections}
                products={products}
                onRemove={handleRemoveProduct}
                onUpdateQuantity={handleUpdateQuantity}
              />

              {/* Empty State when no selections */}
              {selections.length === 0 && (
                <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-sky-100 p-6 text-center">
                  <div className="w-12 h-12 bg-sky-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-sky-400" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M6 5v1H4.667a1.75 1.75 0 00-1.743 1.598l-.826 9.5A1.75 1.75 0 003.84 19H16.16a1.75 1.75 0 001.743-1.902l-.826-9.5A1.75 1.75 0 0015.333 6H14V5a4 4 0 00-8 0zm4-2.5A2.5 2.5 0 007.5 5v1h5V5A2.5 2.5 0 0010 2.5z" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-stone-700 mb-1">No products selected</p>
                  <p className="text-xs text-stone-500">
                    Browse categories and add products to create a personalized skincare routine.
                  </p>
                </div>
              )}

              {/* Order Total */}
              {selections.length > 0 && (
                <div className="bg-gradient-to-br from-sky-500 to-sky-600 rounded-xl p-4 text-white shadow-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sky-100 text-sm">Order Total</span>
                    <span className="text-2xl font-bold">{formatProductPrice(totalCents)}</span>
                  </div>
                  <p className="text-sky-200 text-xs">
                    {selections.length} product{selections.length !== 1 ? 's' : ''} &middot; {selections.reduce((sum, s) => sum + s.quantity, 0)} item{selections.reduce((sum, s) => sum + s.quantity, 0) !== 1 ? 's' : ''} total
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
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
          </div>
        </div>
      </div>
    </div>
  );
}
