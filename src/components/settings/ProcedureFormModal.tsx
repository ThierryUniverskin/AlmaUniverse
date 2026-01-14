'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useSidebarOffset } from '@/context/LayoutContext';
import { DoctorProcedure, DoctorProcedureFormData, OtherProcedureSubcategory } from '@/types';
import { OTHER_SUBCATEGORIES, getCategorySingularLabel } from '@/lib/treatmentCategories';
import { getCurrencySymbol, parsePriceToCents, centsToInputValue, DEFAULT_PROCEDURE_PRICE_CENTS } from '@/lib/pricing';

export interface ProcedureFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: DoctorProcedureFormData) => Promise<void>;
  procedure: DoctorProcedure | null; // null for create, object for edit
  category: 'toxin' | 'injectable' | 'other';
  isSubmitting: boolean;
  countryCode?: string;
}

export function ProcedureFormModal({
  isOpen,
  onClose,
  onSave,
  procedure,
  category,
  isSubmitting,
  countryCode,
}: ProcedureFormModalProps) {
  const [mounted, setMounted] = useState(false);
  const sidebarOffset = useSidebarOffset();
  const [formData, setFormData] = useState<DoctorProcedureFormData>({
    category,
    name: '',
    brand: '',
    description: '',
    subcategory: undefined,
    priceCents: DEFAULT_PROCEDURE_PRICE_CENTS,
  });
  const [priceInput, setPriceInput] = useState(centsToInputValue(DEFAULT_PROCEDURE_PRICE_CENTS));
  const [errors, setErrors] = useState<{ name?: string; price?: string }>({});
  const currencySymbol = getCurrencySymbol(countryCode);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset form when modal opens/closes or procedure changes
  useEffect(() => {
    if (isOpen) {
      if (procedure) {
        // Edit mode - populate form
        setFormData({
          category: procedure.category,
          name: procedure.name,
          brand: procedure.brand || '',
          description: procedure.description || '',
          subcategory: procedure.subcategory,
          priceCents: procedure.priceCents,
        });
        setPriceInput(centsToInputValue(procedure.priceCents));
      } else {
        // Create mode - reset form
        setFormData({
          category,
          name: '',
          brand: '',
          description: '',
          subcategory: undefined,
          priceCents: DEFAULT_PROCEDURE_PRICE_CENTS,
        });
        setPriceInput(centsToInputValue(DEFAULT_PROCEDURE_PRICE_CENTS));
      }
      setErrors({});
    }
  }, [isOpen, procedure, category]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isSubmitting) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, isSubmitting, onClose]);

  // Prevent body scroll
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

  if (!mounted || !isOpen) return null;

  const isOtherCategory = category === 'other';
  const singularLabel = getCategorySingularLabel(category);
  const isEditMode = !!procedure;

  const handlePriceChange = (value: string) => {
    setPriceInput(value);
    const cents = parsePriceToCents(value);
    if (cents !== null) {
      setFormData({ ...formData, priceCents: cents });
      if (errors.price) setErrors({ ...errors, price: undefined });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { name?: string; price?: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.priceCents || formData.priceCents <= 0) {
      newErrors.price = 'Price is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    await onSave(formData);
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 transition-[padding] duration-300"
      style={{ paddingLeft: sidebarOffset }}
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => !isSubmitting && onClose()}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200">
          <h2 className="text-lg font-semibold text-stone-900">
            {isEditMode ? `Edit ${singularLabel}` : `Add New ${singularLabel}`}
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-4 space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  if (errors.name) setErrors({ ...errors, name: undefined });
                }}
                placeholder={`e.g., ${category === 'toxin' ? 'Botox' : category === 'injectable' ? 'Juvederm Voluma' : 'TCA Peel'}`}
                className={`w-full px-3 py-2.5 text-sm border rounded-lg
                           focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
                           placeholder:text-stone-400
                           ${errors.name ? 'border-red-300 bg-red-50' : 'border-stone-200'}`}
                autoFocus
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Brand */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Brand <span className="text-stone-400 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                placeholder={`e.g., ${category === 'toxin' ? 'Allergan' : category === 'injectable' ? 'Galderma' : 'SkinCeuticals'}`}
                className="w-full px-3 py-2.5 text-sm border border-stone-200 rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
                         placeholder:text-stone-400"
              />
            </div>

            {/* Subcategory (optional for 'other') */}
            {isOtherCategory && (
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Subcategory <span className="text-stone-400 font-normal">(optional)</span>
                </label>
                <select
                  value={formData.subcategory || ''}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      subcategory: e.target.value as OtherProcedureSubcategory || undefined
                    });
                  }}
                  className={`w-full px-3 py-2.5 text-sm border rounded-lg border-stone-200
                             focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
                             ${!formData.subcategory ? 'text-stone-400' : 'text-stone-900'}`}
                >
                  <option value="">Select a subcategory...</option>
                  {OTHER_SUBCATEGORIES.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Description <span className="text-stone-400 font-normal">(optional)</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the procedure..."
                rows={3}
                className="w-full px-3 py-2.5 text-sm border border-stone-200 rounded-lg resize-none
                         focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
                         placeholder:text-stone-400"
              />
            </div>

            {/* Price per session */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Price per session <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 text-sm">
                  {currencySymbol}
                </span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={priceInput}
                  onChange={(e) => handlePriceChange(e.target.value)}
                  placeholder="250"
                  className={`w-full pl-8 pr-3 py-2.5 text-sm border rounded-lg
                             focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
                             placeholder:text-stone-400
                             ${errors.price ? 'border-red-300 bg-red-50' : 'border-stone-200'}`}
                />
              </div>
              {errors.price && (
                <p className="mt-1 text-xs text-red-600">{errors.price}</p>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-stone-100 bg-stone-50 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-stone-700 bg-white border border-stone-200 rounded-lg
                       hover:bg-stone-50 transition-colors
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !formData.name.trim()}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-purple-600 rounded-lg
                       hover:bg-purple-700 transition-colors
                       disabled:opacity-50 disabled:cursor-not-allowed
                       flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Saving...
                </>
              ) : isEditMode ? (
                'Save Changes'
              ) : (
                `Add ${singularLabel}`
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
