'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { SkinWellnessStepProgress } from '@/components/skin-wellness/SkinWellnessStepProgress';
import { SkincareCategorySection, ProductSelectionModal, TreatSection } from '@/components/skincare';
import {
  UNIVERSKIN_PRODUCTS,
  UNIVERSKIN_CATEGORIES,
  groupProductsByCategory,
  formatProductPrice,
  calculateTotalPrice,
  calculateMinDuration,
  getRecommendedProducts,
  productToSelection,
} from '@/lib/universkinProducts';
import { calculateTotalSerumPrice, SERUM_DURATION_DAYS } from '@/lib/serumIngredients';
import {
  generateMockSerumRecommendations,
  createInitialSerumConfigs,
} from '@/lib/mockSerumRecommendations';
import {
  UniverskinCategory,
  UniverskinProduct,
  SelectedUniverskinProduct,
  WhenToApply,
  SerumConfiguration,
  IngredientRecommendation,
  SerumRecommendationsResponse,
} from '@/types';

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
  const [patientName, setPatientName] = useState<string>('');
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

  // Fetch patient name
  useEffect(() => {
    const fetchPatientName = async () => {
      if (!patientId || !authState.accessToken) return;

      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const response = await fetch(
          `${supabaseUrl}/rest/v1/patients?id=eq.${patientId}&select=first_name,last_name`,
          {
            headers: {
              apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
              Authorization: `Bearer ${authState.accessToken}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (response.ok) {
          const patients = await response.json();
          if (patients.length > 0) {
            setPatientName(`${patients[0].first_name} ${patients[0].last_name}`);
          }
        }
      } catch (error) {
        console.error('Failed to fetch patient name:', error);
      }
    };

    fetchPatientName();
  }, [patientId, authState.accessToken]);

  // Product state
  const [products] = useState<UniverskinProduct[]>(UNIVERSKIN_PRODUCTS);
  const [selections, setSelections] = useState<SelectedUniverskinProduct[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Set<UniverskinCategory>>(new Set());
  const [modalCategory, setModalCategory] = useState<{ id: UniverskinCategory; label: string } | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const pageTopRef = useRef<HTMLDivElement>(null);

  // Serum state
  const [serumConfigs, setSerumConfigs] = useState<SerumConfiguration[]>([]);
  const [serumApiResponse, setSerumApiResponse] = useState<SerumRecommendationsResponse | null>(null);
  const [serumRecommendations, setSerumRecommendations] = useState<IngredientRecommendation[]>([]);
  const [isSerumExpanded, setIsSerumExpanded] = useState(true);
  const [isSerumInitialized, setIsSerumInitialized] = useState(false);

  // Scroll to top on mount (for tablet compatibility)
  useEffect(() => {
    const scrollToTop = () => {
      if (pageTopRef.current) {
        pageTopRef.current.scrollIntoView({ behavior: 'instant', block: 'start' });
      }
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };
    scrollToTop();
    const timeoutId = setTimeout(scrollToTop, 50);
    return () => clearTimeout(timeoutId);
  }, []);

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

  // Initialize serum recommendations with mock data
  useEffect(() => {
    if (!isSerumInitialized) {
      const mockResponse = generateMockSerumRecommendations();
      const initialConfigs = createInitialSerumConfigs(mockResponse, 'clinical');

      setSerumApiResponse(mockResponse);
      setSerumRecommendations(mockResponse.ingredientRecommendations);
      setSerumConfigs(initialConfigs);
      setIsSerumInitialized(true);
    }
  }, [isSerumInitialized]);

  // Group products by category
  const groupedProducts = useMemo(() => groupProductsByCategory(products), [products]);

  // Split categories into before and after Treat section
  // Order: Cleanse, Prep, [Treat Serums], Strengthen, Sunscreen, Kits
  const categoriesBeforeTreat = UNIVERSKIN_CATEGORIES.filter(
    (cat) => cat.id === 'cleanse' || cat.id === 'prep'
  );
  const categoriesAfterTreat = UNIVERSKIN_CATEGORIES.filter(
    (cat) => cat.id === 'strengthen' || cat.id === 'sunscreen' || cat.id === 'kit'
  );

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
  const handleSelectProduct = (product: UniverskinProduct, size?: string) => {
    const selection = productToSelection(product);
    if (size) {
      selection.size = size;
    }
    setSelections((prev) => [...prev, selection]);
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

  // Update when to apply
  const handleUpdateWhenToApply = (productId: string, whenToApply: WhenToApply) => {
    setSelections((prev) =>
      prev.map((s) =>
        s.productId === productId ? { ...s, whenToApply } : s
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

  // Calculate totals (products + serums)
  const productTotalCents = calculateTotalPrice(selections);
  const serumTotalCents = calculateTotalSerumPrice(serumConfigs);
  const totalCents = productTotalCents + serumTotalCents;
  const totalItems = selections.reduce((sum, s) => sum + s.quantity, 0);
  const productMinDuration = calculateMinDuration(selections, products);
  const serumDuration = serumConfigs.length > 0 ? SERUM_DURATION_DAYS : 0;
  const minDuration = productMinDuration > 0 && serumDuration > 0
    ? Math.min(productMinDuration, serumDuration)
    : productMinDuration || serumDuration;

  return (
    <div ref={pageTopRef} className="min-h-screen relative bg-gradient-to-b from-sky-100 via-sky-50 to-sky-50/50">
      {/* Medical doodles pattern overlay - grayscale */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: 'url(/images/medical-doodles-bg.svg)',
          backgroundSize: '440px 440px',
          backgroundRepeat: 'repeat',
          filter: 'grayscale(100%)',
        }}
      />

      {/* Top bar with doctor name (left) and step progress (right) */}
      <div className="absolute top-6 left-6 right-6 md:top-7 md:left-8 md:right-8 lg:top-8 lg:left-10 lg:right-10 z-10 flex items-center justify-between">
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
      <div className="relative max-w-3xl mx-auto p-8 md:px-9 md:pt-20 lg:p-10 pb-12">
        {/* Header - matching treatment selection page */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center mb-4">
            {/* Premium Skincare Icon */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-sky-300 to-sky-400 rounded-full blur-lg opacity-20 scale-105" />
              <svg className="relative h-14 w-14" viewBox="0 0 56 56" fill="none">
                <defs>
                  <linearGradient id="skincareGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#9ca3af" />
                    <stop offset="100%" stopColor="#0ea5e9" />
                  </linearGradient>
                  <filter id="skincareShadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#0ea5e9" floodOpacity="0.15"/>
                  </filter>
                </defs>
                <circle cx="28" cy="28" r="27" fill="white" filter="url(#skincareShadow)" />
                <circle cx="28" cy="28" r="25" fill="url(#skincareGradient)" opacity="0.05" />
                {/* Serum bottle icon */}
                <path d="M24 16h8v3h-8z" stroke="url(#skincareGradient)" strokeWidth="1.5" fill="none" strokeLinejoin="round" />
                <path d="M22 19h12l2 4H20l2-4z" stroke="url(#skincareGradient)" strokeWidth="1.5" fill="none" strokeLinejoin="round" />
                <rect x="20" y="23" width="16" height="18" rx="2" stroke="url(#skincareGradient)" strokeWidth="1.5" fill="none" />
                {/* Droplet inside bottle */}
                <path d="M28 28c0 0-3 3.5-3 5.5a3 3 0 006 0c0-2-3-5.5-3-5.5z" stroke="url(#skincareGradient)" strokeWidth="1.2" fill="none" strokeLinejoin="round" />
                {/* Sparkle accents */}
                <circle cx="18" cy="18" r="1.5" fill="url(#skincareGradient)" opacity="0.5" />
                <circle cx="38" cy="18" r="1" fill="url(#skincareGradient)" opacity="0.4" />
                <circle cx="38" cy="38" r="1.5" fill="url(#skincareGradient)" opacity="0.5" />
              </svg>
            </div>
          </div>
          <h1 className="text-2xl font-semibold text-stone-900 mb-1">
            Personalized Skincare Routine
          </h1>
          <p className="text-stone-500 text-sm">
            for {patientName || 'Patient'}
          </p>
        </div>

        {/* Category Accordion Sections */}
        <div className="space-y-3 mb-6">
          {/* Cleanse and Prep categories */}
          {categoriesBeforeTreat.map((category) => (
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
              onUpdateWhenToApply={handleUpdateWhenToApply}
              onRemoveProduct={handleRemoveProduct}
            />
          ))}

          {/* Treat Section (Personalized Serums) */}
          {serumApiResponse && (
            <TreatSection
              isExpanded={isSerumExpanded}
              onToggle={() => setIsSerumExpanded((prev) => !prev)}
              configs={serumConfigs}
              recommendations={serumRecommendations}
              apiResponse={serumApiResponse}
              onConfigsChange={setSerumConfigs}
            />
          )}

          {/* Strengthen, Sunscreen, and Kits categories */}
          {categoriesAfterTreat.map((category) => (
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
              onUpdateWhenToApply={handleUpdateWhenToApply}
              onRemoveProduct={handleRemoveProduct}
            />
          ))}
        </div>

        {/* Routine Total - matching EBD treatment total design */}
        {(selections.length > 0 || serumConfigs.length > 0) && totalCents > 0 && (
          <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-sky-900">
                Estimated Total
              </span>
              <span className="text-lg font-semibold text-sky-700">
                {formatProductPrice(totalCents)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-sky-600">
                {selections.length > 0 && (
                  <span>{selections.length} product{selections.length !== 1 ? 's' : ''}</span>
                )}
                {selections.length > 0 && serumConfigs.length > 0 && <span> + </span>}
                {serumConfigs.length > 0 && (
                  <span>{serumConfigs.length} serum{serumConfigs.length !== 1 ? 's' : ''}</span>
                )}
              </p>
              <div className="flex items-center gap-1.5 text-xs text-sky-600">
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 6v6l4 2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="font-medium">{minDuration} day routine</span>
              </div>
            </div>
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
            {selections.length > 0 || serumConfigs.length > 0 ? 'Complete' : 'Skip'}
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
