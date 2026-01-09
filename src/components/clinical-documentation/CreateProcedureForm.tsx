'use client';

import React, { useState } from 'react';
import { DoctorProcedureFormData, TreatmentCategory, OtherProcedureSubcategory } from '@/types';
import { OTHER_SUBCATEGORIES, getCategorySingularLabel } from '@/lib/treatmentCategories';

export interface CreateProcedureFormProps {
  category: Exclude<TreatmentCategory, 'ebd'>;
  onSubmit: (data: DoctorProcedureFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

export function CreateProcedureForm({
  category,
  onSubmit,
  onCancel,
  isSubmitting,
}: CreateProcedureFormProps) {
  const [formData, setFormData] = useState<DoctorProcedureFormData>({
    category,
    name: '',
    brand: '',
    description: '',
    subcategory: undefined,
  });

  const [errors, setErrors] = useState<{ name?: string }>({});

  const singularLabel = getCategorySingularLabel(category);
  const isOtherCategory = category === 'other';

  const validateForm = (): boolean => {
    const newErrors: { name?: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {/* Name (required) */}
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

        {/* Brand (optional) */}
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

        {/* Subcategory (optional for 'other' category) */}
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

        {/* Description (optional) */}
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
      </div>

      {/* Actions */}
      <div className="px-6 py-4 border-t border-stone-100 bg-stone-50 flex gap-3">
        <button
          type="button"
          onClick={onCancel}
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
              Creating...
            </>
          ) : (
            `Create & Select`
          )}
        </button>
      </div>
    </form>
  );
}
