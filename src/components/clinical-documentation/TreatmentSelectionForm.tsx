'use client';

import React, { useState } from 'react';
import { TreatmentSelectionFormData, SelectedTreatment, TreatmentCategory, DoctorProcedure } from '@/types';
import { TREATMENT_CATEGORIES } from '@/lib/treatmentCategories';
import { TreatmentCategorySection } from './TreatmentCategorySection';
import { TreatmentSelectionModal } from './TreatmentSelectionModal';
import { DocumentationTooltip } from './DocumentationTooltip';

export interface TreatmentSelectionFormProps {
  formData: TreatmentSelectionFormData;
  onChange: (data: TreatmentSelectionFormData) => void;
  disabled?: boolean;
  patientName: string;
  selectedConcerns?: string[];
  doctorId?: string;
  accessToken?: string;
}

export function TreatmentSelectionForm({
  formData,
  onChange,
  disabled = false,
  patientName,
  selectedConcerns = [],
  doctorId,
  accessToken,
}: TreatmentSelectionFormProps) {
  // Accordion expansion state - EBD expanded by default
  const [expandedSections, setExpandedSections] = useState<TreatmentCategory[]>(['ebd']);

  // Modal state
  const [activeModal, setActiveModal] = useState<TreatmentCategory | null>(null);

  // Toggle accordion section
  const toggleSection = (category: TreatmentCategory) => {
    setExpandedSections(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  // Get treatments for a specific category
  const getTreatmentsByCategory = (category: TreatmentCategory): SelectedTreatment[] => {
    return formData.selectedTreatments.filter(t => t.type === category);
  };

  // Get count for badge
  const getCategoryCount = (category: TreatmentCategory): number => {
    return getTreatmentsByCategory(category).length;
  };

  // Add a treatment
  const handleAddTreatment = (treatment: SelectedTreatment) => {
    // Check if already selected
    const exists = formData.selectedTreatments.some(t =>
      (t.type === 'ebd' && t.deviceId === treatment.deviceId) ||
      (t.type !== 'ebd' && t.procedureId === treatment.procedureId)
    );

    if (exists) return;

    onChange({
      ...formData,
      selectedTreatments: [...formData.selectedTreatments, treatment],
    });
  };

  // Update a treatment
  const handleUpdateTreatment = (category: TreatmentCategory, index: number, updated: SelectedTreatment) => {
    // Find the global index
    let globalIndex = 0;
    let categoryCount = 0;

    for (let i = 0; i < formData.selectedTreatments.length; i++) {
      if (formData.selectedTreatments[i].type === category) {
        if (categoryCount === index) {
          globalIndex = i;
          break;
        }
        categoryCount++;
      }
    }

    const newTreatments = [...formData.selectedTreatments];
    newTreatments[globalIndex] = updated;

    onChange({
      ...formData,
      selectedTreatments: newTreatments,
    });
  };

  // Remove a treatment
  const handleRemoveTreatment = (category: TreatmentCategory, index: number) => {
    // Find the global index
    let globalIndex = 0;
    let categoryCount = 0;

    for (let i = 0; i < formData.selectedTreatments.length; i++) {
      if (formData.selectedTreatments[i].type === category) {
        if (categoryCount === index) {
          globalIndex = i;
          break;
        }
        categoryCount++;
      }
    }

    onChange({
      ...formData,
      selectedTreatments: formData.selectedTreatments.filter((_, i) => i !== globalIndex),
    });
  };

  // Handle new procedure created in modal
  const handleProcedureCreated = (procedure: DoctorProcedure) => {
    // Add the newly created procedure as a selected treatment
    const newTreatment: SelectedTreatment = {
      type: procedure.category,
      procedureId: procedure.id,
      sessionCount: 1,
      notes: '',
    };
    handleAddTreatment(newTreatment);
  };

  // Get selected IDs for the current modal category
  const getSelectedIds = (): string[] => {
    if (!activeModal) return [];

    return formData.selectedTreatments
      .filter(t => t.type === activeModal)
      .map(t => t.type === 'ebd' ? t.deviceId! : t.procedureId!)
      .filter(Boolean);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center mb-4">
          {/* Premium Treatment Selection Icon */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-300 to-violet-400 rounded-full blur-lg opacity-20 scale-105" />
            <svg className="relative h-14 w-14" viewBox="0 0 56 56" fill="none">
              <defs>
                <linearGradient id="treatmentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#9ca3af" />
                  <stop offset="100%" stopColor="#7c3aed" />
                </linearGradient>
                <filter id="treatmentShadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#7c3aed" floodOpacity="0.15"/>
                </filter>
              </defs>
              <circle cx="28" cy="28" r="27" fill="white" filter="url(#treatmentShadow)" />
              <circle cx="28" cy="28" r="25" fill="url(#treatmentGradient)" opacity="0.05" />
              {/* Medical cross with aesthetic elements */}
              <rect x="24" y="16" width="8" height="24" rx="1" stroke="url(#treatmentGradient)" strokeWidth="1.5" fill="none" />
              <rect x="16" y="24" width="24" height="8" rx="1" stroke="url(#treatmentGradient)" strokeWidth="1.5" fill="none" />
              {/* Sparkle accents */}
              <circle cx="18" cy="18" r="1.5" fill="url(#treatmentGradient)" opacity="0.5" />
              <circle cx="38" cy="18" r="1" fill="url(#treatmentGradient)" opacity="0.4" />
              <circle cx="38" cy="38" r="1.5" fill="url(#treatmentGradient)" opacity="0.5" />
            </svg>
          </div>
        </div>
        <h1 className="text-2xl font-semibold text-stone-900 mb-1">
          Treatment Selection
        </h1>
        <p className="text-stone-500 text-sm">
          for {patientName}
        </p>
      </div>

      {/* Accordion Sections */}
      <div className="space-y-3">
        {TREATMENT_CATEGORIES.map(category => (
          <TreatmentCategorySection
            key={category.id}
            category={category}
            isExpanded={expandedSections.includes(category.id)}
            onToggle={() => toggleSection(category.id)}
            selectedTreatments={getTreatmentsByCategory(category.id)}
            count={getCategoryCount(category.id)}
            onAddClick={() => setActiveModal(category.id)}
            onUpdateTreatment={(index, treatment) => handleUpdateTreatment(category.id, index, treatment)}
            onRemoveTreatment={(index) => handleRemoveTreatment(category.id, index)}
            disabled={disabled}
            doctorId={doctorId}
            accessToken={accessToken}
          />
        ))}
      </div>

      {/* Footer Note with Tooltip */}
      <div className="text-center">
        <DocumentationTooltip
          message="Select treatments for this clinical session across all categories. All selections are entered by the physician for documentation purposes. The system does not provide treatment recommendations."
        />
      </div>

      {/* Selection Modal */}
      <TreatmentSelectionModal
        isOpen={activeModal !== null}
        category={activeModal}
        onClose={() => setActiveModal(null)}
        onSelect={handleAddTreatment}
        onProcedureCreated={handleProcedureCreated}
        selectedIds={getSelectedIds()}
        selectedConcerns={selectedConcerns}
        doctorId={doctorId}
        accessToken={accessToken}
      />
    </div>
  );
}

// Helper function to create empty form data
export function getEmptyTreatmentSelectionForm(): TreatmentSelectionFormData {
  return {
    selectedTreatments: [],
  };
}
