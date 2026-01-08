'use client';

import React from 'react';
import { PatientMedicalHistoryFormData, MenopausalStatus, KnownAllergyType, CancerType, RecoveryTimePreference } from '@/types';
import { YesNoToggle, CheckboxGroup, StyledSelect } from '@/components/ui';
import { MENOPAUSAL_STATUS_OPTIONS, KNOWN_ALLERGY_OPTIONS, CANCER_TYPE_OPTIONS, RECOVERY_TIME_OPTIONS } from '@/lib/constants';

export interface MedicalHistoryFormProps {
  formData: PatientMedicalHistoryFormData;
  onChange: (data: PatientMedicalHistoryFormData) => void;
  disabled?: boolean;
  patientName: string;
  patientSex?: 'female' | 'male' | 'other' | 'prefer-not-to-say';
}

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

  // Hide reproductive/hormonal section for male patients
  const showReproductiveSection = patientSex !== 'male';

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
          Medical Background
        </h1>
        <p className="text-stone-500 text-sm">
          for {patientName}
        </p>
      </div>

      {/* Disclaimer */}
      <div className="bg-stone-50 border border-stone-200 rounded-xl p-4">
        <div className="flex gap-3">
          <div className="flex-shrink-0 mt-0.5">
            <svg className="h-5 w-5 text-stone-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4m0-4h.01" />
            </svg>
          </div>
          <div>
            <p className="text-sm text-stone-600 font-medium mb-1">
              Documentation Only
            </p>
            <p className="text-sm text-stone-500">
              The information collected on this screen is used for documentation and ingredient suitability only.
              No automated clinical assessment or treatment recommendations are generated.
            </p>
          </div>
        </div>
      </div>

      {/* Section: Reproductive / Hormonal - Only show for non-male patients */}
      {showReproductiveSection && (
        <div className="bg-white rounded-xl border border-stone-200 p-6">
          <h2 className="text-base font-semibold text-stone-900 mb-1">
            Reproductive / Hormonal
          </h2>
          <p className="text-sm text-stone-500 mb-5">
            Information about hormonal status and treatments.
          </p>
          <div className="space-y-4">
            <YesNoToggle
              label="Currently pregnant or breastfeeding?"
              value={formData.isPregnantOrBreastfeeding}
              onChange={(v) => handleChange('isPregnantOrBreastfeeding', v)}
              disabled={disabled}
            />
            <YesNoToggle
              label="Currently using hormonal contraception?"
              value={formData.usesHormonalContraception}
              onChange={(v) => handleChange('usesHormonalContraception', v)}
              disabled={disabled}
            />
            <YesNoToggle
              label="Currently receiving hormone replacement therapy (HRT)?"
              value={formData.receivesHrt}
              onChange={(v) => handleChange('receivesHrt', v)}
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
        </div>
      )}

      {/* Section: Cancer History */}
      <div className="bg-white rounded-xl border border-stone-200 p-6">
        <h2 className="text-base font-semibold text-stone-900 mb-1">
          Cancer History
        </h2>
        <p className="text-sm text-stone-500 mb-5">
          Previous or current cancer treatments.
        </p>
        <div className="space-y-5">
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
            <>
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
            </>
          )}
        </div>
      </div>

      {/* Section: Skin-Related Medical Context */}
      <div className="bg-white rounded-xl border border-stone-200 p-6">
        <h2 className="text-base font-semibold text-stone-900 mb-1">
          Skin-Related Medical Context
        </h2>
        <p className="text-sm text-stone-500 mb-5">
          Current skin conditions and active lesions.
        </p>
        <div className="space-y-4">
          <YesNoToggle
            label="Currently under medical treatment for inflammatory or infectious skin conditions?"
            value={formData.hasInflammatorySkinCondition}
            onChange={(v) => handleChange('hasInflammatorySkinCondition', v)}
            disabled={disabled}
          />
          <YesNoToggle
            label="Currently experiencing active cold sores or herpes lesions?"
            value={formData.hasActiveColdSores}
            onChange={(v) => handleChange('hasActiveColdSores', v)}
            disabled={disabled}
          />
        </div>
      </div>

      {/* Section: Allergies */}
      <div className="bg-white rounded-xl border border-stone-200 p-6">
        <h2 className="text-base font-semibold text-stone-900 mb-1">
          Allergies
        </h2>
        <p className="text-sm text-stone-500 mb-5">
          Known allergies to medications and cosmetic ingredients.
        </p>
        <div className="space-y-5">
          <CheckboxGroup
            label="Known allergies (select all that apply)"
            options={KNOWN_ALLERGY_OPTIONS}
            selectedValues={formData.knownAllergies}
            onChange={(values) => handleChange('knownAllergies', values as KnownAllergyType[])}
            disabled={disabled}
            columns={2}
          />
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Other allergies (optional)
            </label>
            <input
              type="text"
              value={formData.otherAllergies || ''}
              onChange={(e) => handleChange('otherAllergies', e.target.value || undefined)}
              disabled={disabled}
              placeholder="Other known allergies..."
              className="w-full px-4 py-2.5 h-11 text-sm border border-stone-200 rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 placeholder-stone-400"
            />
          </div>
        </div>
      </div>

      {/* Section: Medications */}
      <div className="bg-white rounded-xl border border-stone-200 p-6">
        <h2 className="text-base font-semibold text-stone-900 mb-1">
          Medications
        </h2>
        <p className="text-sm text-stone-500 mb-5">
          Current medications being taken.
        </p>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">
            Current medications (optional)
          </label>
          <textarea
            value={formData.currentMedications || ''}
            onChange={(e) => handleChange('currentMedications', e.target.value || undefined)}
            disabled={disabled}
            placeholder="List current medications, dosages..."
            rows={3}
            className="w-full px-4 py-2.5 text-sm border border-stone-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 placeholder-stone-400 resize-none"
          />
        </div>
      </div>

      {/* Section: Additional Medical Information */}
      <div className="bg-white rounded-xl border border-stone-200 p-6">
        <h2 className="text-base font-semibold text-stone-900 mb-1">
          Additional Medical Information
        </h2>
        <p className="text-sm text-stone-500 mb-5">
          Any other relevant medical conditions or notes.
        </p>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">
            Relevant medical conditions (optional)
          </label>
          <textarea
            value={formData.relevantMedicalConditions || ''}
            onChange={(e) => handleChange('relevantMedicalConditions', e.target.value || undefined)}
            disabled={disabled}
            placeholder="Chronic conditions, previous surgeries, other relevant medical history..."
            rows={3}
            className="w-full px-4 py-2.5 text-sm border border-stone-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 placeholder-stone-400 resize-none"
          />
        </div>
      </div>

      {/* Section: Recovery Time Preference */}
      <div className="bg-white rounded-xl border border-stone-200 p-6">
        <h2 className="text-base font-semibold text-stone-900 mb-1">
          Acceptable Recovery Time After a Procedure
        </h2>
        <p className="text-sm text-stone-500 mb-5">
          Please indicate the maximum recovery time the patient is comfortable with.
        </p>
        <div className="space-y-3">
          {RECOVERY_TIME_OPTIONS.map(opt => (
            <label
              key={opt.value}
              className={`
                flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors
                ${formData.recoveryTimePreference === opt.value
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-stone-200 hover:border-stone-300'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <input
                type="radio"
                name="recoveryTime"
                value={opt.value}
                checked={formData.recoveryTimePreference === opt.value}
                onChange={() => !disabled && handleChange('recoveryTimePreference', opt.value as RecoveryTimePreference)}
                disabled={disabled}
                className="h-4 w-4 accent-purple-600"
              />
              <span className="text-sm text-stone-700">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Footer Note */}
      <p className="text-xs text-stone-400 text-center">
        For documentation purposes only
      </p>
    </div>
  );
}

// Helper function to create empty form data
export function getEmptyMedicalHistoryForm(): PatientMedicalHistoryFormData {
  return {
    isPregnantOrBreastfeeding: false,
    usesHormonalContraception: false,
    receivesHrt: false,
    menopausalStatus: undefined,
    hasCancerHistory: false,
    cancerTypes: [],
    cancerDetails: undefined,
    hasInflammatorySkinCondition: false,
    hasActiveColdSores: false,
    knownAllergies: [],
    otherAllergies: undefined,
    currentMedications: undefined,
    relevantMedicalConditions: undefined,
    recoveryTimePreference: undefined,
  };
}
