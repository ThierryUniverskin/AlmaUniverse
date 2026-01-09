'use client';

import React from 'react';
import { SelectedTreatment, TreatmentCategory } from '@/types';
import { TreatmentCategoryMeta, getCategorySingularLabel } from '@/lib/treatmentCategories';
import { SelectedTreatmentCard } from './SelectedTreatmentCard';

export interface TreatmentCategorySectionProps {
  category: TreatmentCategoryMeta;
  isExpanded: boolean;
  onToggle: () => void;
  selectedTreatments: SelectedTreatment[];
  count: number;
  onAddClick: () => void;
  onUpdateTreatment: (index: number, treatment: SelectedTreatment) => void;
  onRemoveTreatment: (index: number) => void;
  disabled?: boolean;
  doctorId?: string;
  accessToken?: string;
}

// Category-specific icons
function CategoryIcon({ category, className = '' }: { category: TreatmentCategory; className?: string }) {
  const iconClass = `${className} text-stone-400`;

  switch (category) {
    case 'ebd':
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M10 14h4v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
          <rect x="9" y="11" width="6" height="3" rx="0.5" />
          <path d="M10.5 11l-1.5-5h6l-1.5 5" strokeLinejoin="round" />
          <path d="M12 5V3" strokeLinecap="round" />
          <path d="M9 6L8 4.5" strokeLinecap="round" />
          <path d="M15 6l1-1.5" strokeLinecap="round" />
        </svg>
      );
    case 'toxin':
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          {/* Syringe icon */}
          <path d="M19.5 4.5l-1 1m0 0l-4-1-9 9 5 5 9-9-1-4z" strokeLinejoin="round" />
          <path d="M5.5 18.5l-1 1" strokeLinecap="round" />
          <path d="M10 14l-2-2" strokeLinecap="round" />
          <path d="M12 12l-2-2" strokeLinecap="round" />
        </svg>
      );
    case 'injectable':
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          {/* Vial/tube icon */}
          <rect x="8" y="4" width="8" height="16" rx="2" />
          <path d="M8 8h8" strokeLinecap="round" />
          <path d="M11 12h2" strokeLinecap="round" />
          <path d="M11 15h2" strokeLinecap="round" />
        </svg>
      );
    case 'other':
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          {/* Aesthetic/sparkle icon */}
          <path d="M12 3v2m0 14v2M3 12h2m14 0h2" strokeLinecap="round" />
          <path d="M5.6 5.6l1.4 1.4m10 10l1.4 1.4M5.6 18.4l1.4-1.4m10-10l1.4-1.4" strokeLinecap="round" />
          <circle cx="12" cy="12" r="4" />
        </svg>
      );
  }
}

export function TreatmentCategorySection({
  category,
  isExpanded,
  onToggle,
  selectedTreatments,
  count,
  onAddClick,
  onUpdateTreatment,
  onRemoveTreatment,
  disabled = false,
  doctorId,
  accessToken,
}: TreatmentCategorySectionProps) {
  const singularLabel = getCategorySingularLabel(category.id);

  return (
    <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
      {/* Accordion Header */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-stone-50 transition-colors"
        disabled={disabled}
      >
        <div className="flex items-center gap-3">
          <CategoryIcon category={category.id} className="h-5 w-5" />
          <span className="font-medium text-stone-900">{category.label}</span>
          {count > 0 && (
            <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-purple-100 text-purple-700 text-xs font-medium">
              {count}
            </span>
          )}
        </div>
        <svg
          className={`h-5 w-5 text-stone-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
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
        <div className="px-4 pb-4 border-t border-stone-100">
          {/* Selected treatments list */}
          {selectedTreatments.length === 0 ? (
            <div className="text-center py-6 bg-stone-50 rounded-lg border border-dashed border-stone-200 mt-4">
              <CategoryIcon category={category.id} className="h-8 w-8 mx-auto text-stone-300 mb-2" />
              <p className="text-sm text-stone-500">
                No {category.label.toLowerCase()} selected yet.
              </p>
              <p className="text-xs text-stone-400 mt-1">
                Click the button below to add {category.label.toLowerCase()}.
              </p>
            </div>
          ) : (
            <div className="space-y-3 mt-4">
              {selectedTreatments.map((treatment, index) => (
                <SelectedTreatmentCard
                  key={treatment.deviceId || treatment.procedureId}
                  treatment={treatment}
                  onUpdate={(updated) => onUpdateTreatment(index, updated)}
                  onRemove={() => onRemoveTreatment(index)}
                  disabled={disabled}
                  doctorId={doctorId}
                  accessToken={accessToken}
                />
              ))}
            </div>
          )}

          {/* Add button */}
          <button
            type="button"
            onClick={onAddClick}
            disabled={disabled}
            className={`
              w-full mt-4 flex items-center justify-center gap-2 py-3
              bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg
              text-purple-700 font-medium text-sm
              transition-colors
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Add {singularLabel}
          </button>
        </div>
      )}
    </div>
  );
}
