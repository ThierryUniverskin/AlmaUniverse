'use client';

import React, { useState, useRef } from 'react';
import { SkinConcernsFormData, SkinConcernCategory } from '@/types';
import {
  SKIN_CONCERN_CATEGORIES,
  SKIN_CONCERNS,
  getConcernsByCategory,
  getConcernById,
} from '@/lib/skinConcerns';
import { PreviousSessionsLoader } from './PreviousSessionsLoader';

export interface SkinConcernsFormProps {
  formData: SkinConcernsFormData;
  onChange: (data: SkinConcernsFormData) => void;
  disabled?: boolean;
  patientName: string;
  patientId?: string;
  onSkip?: () => void;
}

export function SkinConcernsForm({
  formData,
  onChange,
  disabled = false,
  patientName,
  patientId,
  onSkip,
}: SkinConcernsFormProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const dragNodeRef = useRef<HTMLDivElement | null>(null);

  const handleAddConcern = (concernId: string) => {
    if (!formData.selectedConcerns.includes(concernId)) {
      onChange({
        ...formData,
        selectedConcerns: [...formData.selectedConcerns, concernId],
      });
    }
  };

  const handleRemoveConcern = (concernId: string) => {
    onChange({
      ...formData,
      selectedConcerns: formData.selectedConcerns.filter(id => id !== concernId),
    });
  };

  const handleToggleConcern = (concernId: string) => {
    if (formData.selectedConcerns.includes(concernId)) {
      handleRemoveConcern(concernId);
    } else {
      handleAddConcern(concernId);
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    setDraggedIndex(index);
    dragNodeRef.current = e.currentTarget;
    e.currentTarget.style.opacity = '0.5';
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.style.opacity = '1';
    setDraggedIndex(null);
    setDragOverIndex(null);
    dragNodeRef.current = null;
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) return;

    const newOrder = [...formData.selectedConcerns];
    const [removed] = newOrder.splice(draggedIndex, 1);
    newOrder.splice(dropIndex, 0, removed);

    onChange({
      ...formData,
      selectedConcerns: newOrder,
    });

    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const isConcernSelected = (concernId: string) =>
    formData.selectedConcerns.includes(concernId);

  // Load concerns from a previous session
  const handleLoadFromPrevious = (concerns: string[]) => {
    onChange({
      ...formData,
      selectedConcerns: concerns,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center mb-4">
          {/* Premium Checklist Icon with gradient and glow */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-300 to-violet-400 rounded-full blur-lg opacity-20 scale-105" />
            <svg className="relative h-14 w-14" viewBox="0 0 56 56" fill="none">
              <defs>
                <linearGradient id="iconGradient4" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#9ca3af" />
                  <stop offset="100%" stopColor="#7c3aed" />
                </linearGradient>
                <filter id="iconShadow4" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#7c3aed" floodOpacity="0.15"/>
                </filter>
              </defs>
              <circle cx="28" cy="28" r="27" fill="white" filter="url(#iconShadow4)" />
              <circle cx="28" cy="28" r="25" fill="url(#iconGradient4)" opacity="0.05" />
              {/* Clipboard body */}
              <rect x="16" y="14" width="24" height="30" rx="2" stroke="url(#iconGradient4)" strokeWidth="1.5" fill="none" />
              {/* Clipboard top clip */}
              <path d="M22 14v-2a2 2 0 012-2h8a2 2 0 012 2v2" stroke="url(#iconGradient4)" strokeWidth="1.5" fill="none" />
              <rect x="22" y="10" width="12" height="4" rx="1" fill="url(#iconGradient4)" opacity="0.2" />
              {/* Checkmarks */}
              <path d="M20 24l2 2 4-4" stroke="url(#iconGradient4)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M28 23h8" stroke="url(#iconGradient4)" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M20 32l2 2 4-4" stroke="url(#iconGradient4)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M28 31h8" stroke="url(#iconGradient4)" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>
        <h1 className="text-2xl font-semibold text-stone-900 mb-1">
          Select Medical Skin Conditions
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
              Select one or more skin concerns relevant to this clinical session.
              These entries are for documentation and physician reference only.
              They do not trigger analysis or treatment recommendations.
            </p>
          </div>
        </div>
      </div>

      {/* Load from Previous Session */}
      {patientId && (
        <PreviousSessionsLoader
          patientId={patientId}
          onLoadSession={handleLoadFromPrevious}
          disabled={disabled}
        />
      )}

      {/* Selected Concerns - Tag Area */}
      {formData.selectedConcerns.length > 0 && (
        <div className="bg-white rounded-xl border border-stone-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-stone-900">
              Selected Concerns
            </h2>
            <span className="text-xs text-stone-400">
              Drag to reorder priority
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.selectedConcerns.map((concernId, index) => {
              const concern = getConcernById(concernId);
              if (!concern) return null;

              return (
                <div
                  key={concernId}
                  draggable={!disabled}
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, index)}
                  className={`
                    group flex items-center gap-2 px-3 py-1.5 rounded-full
                    bg-purple-50 border border-purple-200 text-purple-700
                    ${!disabled ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'}
                    ${dragOverIndex === index ? 'ring-2 ring-purple-400' : ''}
                    transition-all
                  `}
                >
                  {/* Drag handle */}
                  {!disabled && (
                    <svg className="h-3 w-3 text-purple-400 opacity-50 group-hover:opacity-100" viewBox="0 0 24 24" fill="currentColor">
                      <circle cx="8" cy="6" r="2" />
                      <circle cx="16" cy="6" r="2" />
                      <circle cx="8" cy="12" r="2" />
                      <circle cx="16" cy="12" r="2" />
                      <circle cx="8" cy="18" r="2" />
                      <circle cx="16" cy="18" r="2" />
                    </svg>
                  )}
                  <span className="text-sm font-medium">{concern.label}</span>
                  {/* Remove button */}
                  {!disabled && (
                    <button
                      type="button"
                      onClick={() => handleRemoveConcern(concernId)}
                      className="ml-1 h-4 w-4 rounded-full hover:bg-purple-200 flex items-center justify-center transition-colors"
                    >
                      <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Concern Categories */}
      {SKIN_CONCERN_CATEGORIES.map((category) => {
        const concerns = getConcernsByCategory(category.id);

        return (
          <div key={category.id} className="bg-white rounded-xl border border-stone-200 p-6">
            <h2 className="text-base font-semibold text-stone-900 mb-4">
              {category.label}
            </h2>
            <div className="space-y-2">
              {concerns.map((concern) => {
                const isSelected = isConcernSelected(concern.id);

                return (
                  <button
                    key={concern.id}
                    type="button"
                    onClick={() => !disabled && handleToggleConcern(concern.id)}
                    disabled={disabled}
                    className={`
                      w-full flex items-center gap-3 py-2.5 px-3 rounded-lg text-left
                      ${isSelected
                        ? 'bg-purple-50 border border-purple-200'
                        : 'bg-stone-50 border border-transparent hover:bg-stone-100'
                      }
                      ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
                      transition-colors
                    `}
                  >
                    {/* Checkbox */}
                    <div
                      className={`
                        h-5 w-5 rounded flex-shrink-0 flex items-center justify-center
                        ${isSelected
                          ? 'bg-purple-600'
                          : 'border-2 border-stone-300 bg-white'
                        }
                        transition-colors
                      `}
                    >
                      {isSelected && (
                        <svg className="h-3 w-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                    <span
                      className={`
                        text-sm
                        ${isSelected ? 'text-purple-900 font-medium' : 'text-stone-700'}
                      `}
                    >
                      {concern.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Skip Option */}
      {onSkip && (
        <div className="bg-white rounded-xl border border-stone-200 p-6">
          <button
            type="button"
            onClick={onSkip}
            disabled={disabled}
            className="w-full flex items-center justify-center gap-2 py-3 text-sm text-stone-500 hover:text-stone-700 transition-colors disabled:opacity-50"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Skip skin concerns for now
          </button>
        </div>
      )}

      {/* Footer Note */}
      <p className="text-xs text-stone-400 text-center">
        For documentation purposes only
      </p>
    </div>
  );
}

// Helper function to create empty form data
export function getEmptySkinConcernsForm(): SkinConcernsFormData {
  return {
    selectedConcerns: [],
  };
}
