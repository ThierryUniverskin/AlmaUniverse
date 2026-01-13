'use client';

import React, { useState } from 'react';
import { PatientMedicalHistoryFormData, MenopausalStatus, CosmeticSensitivityType, CancerType } from '@/types';
import { YesNoToggle, CheckboxGroup, StyledSelect } from '@/components/ui';
import { MENOPAUSAL_STATUS_OPTIONS, COSMETIC_SENSITIVITY_OPTIONS, CANCER_TYPE_OPTIONS } from '@/lib/constants';
import { DocumentationTooltip } from './DocumentationTooltip';

// Inline info tooltip component for section headers
function InfoTooltip({ message, variant = 'default' }: { message: string; variant?: 'default' | 'sky' }) {
  const [isVisible, setIsVisible] = useState(false);

  const iconColor = variant === 'sky' ? 'text-sky-500' : 'text-stone-400';
  const bgColor = variant === 'sky' ? 'bg-sky-700' : 'bg-stone-800';
  const arrowColor = variant === 'sky' ? 'border-t-sky-700' : 'border-t-stone-800';

  return (
    <div className="relative inline-flex ml-2 group">
      <button
        type="button"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onFocus={() => setIsVisible(true)}
        onBlur={() => setIsVisible(false)}
        className={`${iconColor} hover:opacity-80 transition-opacity focus:outline-none`}
        aria-label="More information"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 16v-4m0-4h.01" />
        </svg>
      </button>

      {/* Tooltip popup - positioned to the right to avoid clipping */}
      {isVisible && (
        <div
          className={`absolute z-[100] left-6 top-1/2 -translate-y-1/2 w-72 px-3 py-2 ${bgColor} text-white text-xs leading-relaxed rounded-lg shadow-xl`}
          style={{ pointerEvents: 'none' }}
        >
          {message}
          {/* Arrow pointing left */}
          <div className={`absolute right-full top-1/2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-r-[6px] ${variant === 'sky' ? 'border-r-sky-700' : 'border-r-stone-800'}`} />
        </div>
      )}
    </div>
  );
}

export interface MedicalHistoryFormProps {
  formData: PatientMedicalHistoryFormData;
  onChange: (data: PatientMedicalHistoryFormData) => void;
  disabled?: boolean;
  patientName: string;
  patientSex?: 'female' | 'male' | 'other' | 'prefer-not-to-say';
}

/**
 * MedicalHistoryForm - Step 2 of the clinical documentation wizard
 *
 * RENAMED TO: "Health Background"
 *
 * This component is split into two clearly separated sections:
 *
 * SECTION 1: Clinical Medical History
 * - For physician documentation only
 * - NEVER used by AI or Skin Wellness Mode
 *
 * SECTION 2: Cosmetic Safety Profile
 * - Used to exclude cosmetic ingredients in Skin Wellness Mode
 * - Does NOT diagnose, treat, prevent, or manage medical conditions
 */
export function MedicalHistoryForm({
  formData,
  onChange,
  disabled = false,
  patientName,
  patientSex,
}: MedicalHistoryFormProps) {
  const handleChange = <K extends keyof PatientMedicalHistoryFormData>(
    field: K,
    value: PatientMedicalHistoryFormData[K]
  ) => {
    onChange({ ...formData, [field]: value });
  };

  // Hide pregnancy/menopause fields for male patients, but show rest of Cosmetic Safety Profile
  const showReproductiveFields = patientSex !== 'male';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center mb-4">
          {/* Premium Medical Clipboard Icon with gradient and glow */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-300 to-violet-400 rounded-full blur-lg opacity-20 scale-105" />
            <svg className="relative h-14 w-14" viewBox="0 0 56 56" fill="none">
              <defs>
                <linearGradient id="iconGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#9ca3af" />
                  <stop offset="100%" stopColor="#7c3aed" />
                </linearGradient>
                <filter id="iconShadow2" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#7c3aed" floodOpacity="0.15"/>
                </filter>
              </defs>
              <circle cx="28" cy="28" r="27" fill="white" filter="url(#iconShadow2)" />
              <circle cx="28" cy="28" r="25" fill="url(#iconGradient2)" opacity="0.05" />
              {/* Clipboard body */}
              <rect x="17" y="16" width="22" height="28" rx="2" stroke="url(#iconGradient2)" strokeWidth="1.5" fill="none" />
              {/* Clipboard clip */}
              <rect x="23" y="12" width="10" height="6" rx="1" stroke="url(#iconGradient2)" strokeWidth="1.5" fill="none" />
              {/* Medical cross */}
              <path d="M28 24v10M23 29h10" stroke="url(#iconGradient2)" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>
        <h1 className="text-2xl font-semibold text-stone-900 mb-1">
          Health Background
        </h1>
        <p className="text-stone-500 text-sm">
          Review and update health information for {patientName}
        </p>
      </div>

      {/* ============================================ */}
      {/* SECTION 1: CLINICAL MEDICAL HISTORY */}
      {/* ============================================ */}
      <div className="bg-white rounded-2xl border border-stone-200">
        {/* Section Header */}
        <div className="px-6 py-4 border-b border-stone-100">
          <div className="flex items-center">
            <h2 className="text-base font-semibold text-stone-900">
              Clinical Medical History
            </h2>
            <InfoTooltip
              message="This information is recorded for clinical documentation and is not used in Skin Wellness Mode or cosmetic analysis."
              variant="default"
            />
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            For physician documentation only
          </p>
        </div>

        {/* Section Content */}
        <div className="p-6 space-y-5">
          {/* Cancer History */}
          <div className="space-y-4">
            <YesNoToggle
              label="History of cancer treatment?"
              value={formData.hasCancerHistory}
              onChange={(v) => {
                if (!v) {
                  // Clear cancer types when toggling off
                  onChange({
                    ...formData,
                    hasCancerHistory: false,
                    cancerTypes: [],
                    cancerDetails: undefined,
                  });
                } else {
                  handleChange('hasCancerHistory', true);
                }
              }}
              disabled={disabled}
            />
            {formData.hasCancerHistory && (
              <div className="ml-0 space-y-4">
                <CheckboxGroup
                  label="Cancer type (select all that apply)"
                  options={CANCER_TYPE_OPTIONS}
                  selectedValues={formData.cancerTypes}
                  onChange={(values) => handleChange('cancerTypes', values as CancerType[])}
                  disabled={disabled}
                  columns={2}
                />
                {formData.cancerTypes.includes('other') && (
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">
                      Please specify (optional)
                    </label>
                    <input
                      type="text"
                      value={formData.cancerDetails || ''}
                      onChange={(e) => handleChange('cancerDetails', e.target.value || undefined)}
                      disabled={disabled}
                      placeholder="Specify other cancer type..."
                      className="w-full px-4 py-2.5 h-11 text-sm border border-stone-200 rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 placeholder-stone-400"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Current Medications */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Current medications (optional)
            </label>
            <textarea
              value={formData.currentMedications || ''}
              onChange={(e) => handleChange('currentMedications', e.target.value || undefined)}
              disabled={disabled}
              placeholder="List current medications, dosages..."
              rows={2}
              className="w-full px-4 py-2.5 text-sm border border-stone-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 placeholder-stone-400 resize-none"
            />
          </div>

          {/* Relevant Medical Conditions */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Relevant medical conditions (optional)
            </label>
            <textarea
              value={formData.relevantMedicalConditions || ''}
              onChange={(e) => handleChange('relevantMedicalConditions', e.target.value || undefined)}
              disabled={disabled}
              placeholder="Chronic conditions, previous surgeries, other relevant medical history..."
              rows={2}
              className="w-full px-4 py-2.5 text-sm border border-stone-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 placeholder-stone-400 resize-none"
            />
          </div>
        </div>
      </div>

      {/* ============================================ */}
      {/* SECTION 2: COSMETIC SAFETY PROFILE */}
      {/* ============================================ */}
      <div className="bg-white rounded-2xl border border-stone-200">
        {/* Section Header */}
        <div className="px-6 py-4 border-b border-stone-100">
          <div className="flex items-center">
            <h2 className="text-base font-semibold text-stone-900">
              Cosmetic Safety Profile
            </h2>
            <InfoTooltip
              message="The information below may be used in Skin Wellness Mode to exclude certain cosmetic ingredients for safety and tolerability. It is not used to diagnose, treat, prevent, or manage medical conditions."
              variant="default"
            />
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Used to exclude cosmetic ingredients for safety and tolerability
          </p>
        </div>

        {/* Section Content */}
        <div className="p-6 space-y-5">
          {/* Reproductive / Hormonal fields - only for non-male patients */}
          {showReproductiveFields && (
            <div className="space-y-4">
              <YesNoToggle
                label="Currently pregnant or breastfeeding?"
                value={formData.isPregnantOrBreastfeeding}
                onChange={(v) => handleChange('isPregnantOrBreastfeeding', v)}
                disabled={disabled}
              />
              <div className="flex items-center justify-between gap-4">
                <label className="text-sm font-medium text-stone-700">
                  Menopausal status
                </label>
                <StyledSelect
                  options={MENOPAUSAL_STATUS_OPTIONS}
                  value={formData.menopausalStatus || ''}
                  onChange={(value) => handleChange('menopausalStatus', (value || undefined) as MenopausalStatus | undefined)}
                  placeholder="Select..."
                  disabled={disabled}
                  className="w-48"
                />
              </div>
            </div>
          )}

          {/* Exfoliant Sensitivity */}
          <YesNoToggle
            label="Sensitivity to exfoliants (AHAs, BHAs, retinoids)?"
            value={formData.hasExfoliantSensitivity}
            onChange={(v) => handleChange('hasExfoliantSensitivity', v)}
            disabled={disabled}
          />

          {/* Cosmetic Sensitivities */}
          <div className="space-y-4">
            <CheckboxGroup
              label="Known cosmetic sensitivities (select all that apply)"
              options={COSMETIC_SENSITIVITY_OPTIONS}
              selectedValues={formData.cosmeticSensitivities}
              onChange={(values) => handleChange('cosmeticSensitivities', values as CosmeticSensitivityType[])}
              disabled={disabled}
              columns={2}
            />
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Other sensitivities (optional)
              </label>
              <input
                type="text"
                value={formData.otherSensitivities || ''}
                onChange={(e) => handleChange('otherSensitivities', e.target.value || undefined)}
                disabled={disabled}
                placeholder="Other known cosmetic sensitivities..."
                className="w-full px-4 py-2.5 h-11 text-sm border border-stone-200 rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 placeholder-stone-400"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer Note with Tooltip */}
      <div className="text-center">
        <DocumentationTooltip
          message="The information collected on this screen is used for documentation and ingredient suitability only. No automated clinical assessment or treatment recommendations are generated."
        />
      </div>
    </div>
  );
}

// Helper function to create empty form data
export function getEmptyMedicalHistoryForm(): PatientMedicalHistoryFormData {
  return {
    // CLINICAL MEDICAL HISTORY
    hasCancerHistory: false,
    cancerTypes: [],
    cancerDetails: undefined,
    currentMedications: undefined,
    relevantMedicalConditions: undefined,
    // COSMETIC SAFETY PROFILE
    isPregnantOrBreastfeeding: false,
    menopausalStatus: undefined,
    hasExfoliantSensitivity: false,
    cosmeticSensitivities: [],
    otherSensitivities: undefined,
  };
}
