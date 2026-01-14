'use client';

import React, { useState, useEffect } from 'react';
import { useSidebarOffset } from '@/context/LayoutContext';
import { getCategoryById, VisibilityLevel, getAssessmentLabel } from '@/lib/skinWellnessCategories';
import { SkinWellnessDetail, getCategoryDetails } from '@/lib/skinWellnessDetails';
import {
  getParameterScoreConfig,
  getScoreColor,
  calculateCategoryScore,
} from '@/lib/skinParameterOptions';

interface CategoryDetailModalProps {
  categoryId: string;
  isOpen: boolean;
  onClose: () => void;
  onSave?: (categoryId: string, details: SkinWellnessDetail[]) => void;
  visibilityLevel?: VisibilityLevel;
  onVisibilityChange?: (categoryId: string, level: VisibilityLevel) => void;
  initialDetails?: SkinWellnessDetail[]; // Pass stored details from parent
}

// Get color for severity based on level
function getSeverityColor(level: VisibilityLevel): string {
  if (level === 0) return '#10B981';      // Green - Optimal
  if (level < 4) return '#34D399';         // Light green - Needs Improvement
  if (level < 7) return '#FBBF24';         // Yellow/amber - Attention Needed
  return '#EF4444';                         // Red - Focus Area
}

export function CategoryDetailModal({
  categoryId,
  isOpen,
  onClose,
  onSave,
  visibilityLevel = 5,
  onVisibilityChange,
  initialDetails: propsInitialDetails,
}: CategoryDetailModalProps) {
  const sidebarOffset = useSidebarOffset();
  const category = getCategoryById(categoryId);
  // Use passed details if available, otherwise fetch from default
  const initialDetails = propsInitialDetails || getCategoryDetails(categoryId);
  const [details, setDetails] = useState<SkinWellnessDetail[]>(initialDetails);
  const [localLevel, setLocalLevel] = useState<VisibilityLevel>(visibilityLevel);
  const [expandedParameters, setExpandedParameters] = useState<Set<string>>(new Set());
  const [initialDetailsSnapshot, setInitialDetailsSnapshot] = useState<SkinWellnessDetail[]>([]);
  const [initialLevelSnapshot, setInitialLevelSnapshot] = useState<VisibilityLevel>(visibilityLevel);

  // Reset details and level when category or initialDetails changes
  useEffect(() => {
    // Use provided details or fetch default, ensure aiScoreValue is set
    const sourceDetails = propsInitialDetails || getCategoryDetails(categoryId);
    const categoryDetails = sourceDetails.map((detail) => ({
      ...detail,
      aiScoreValue: detail.aiScoreValue ?? detail.scoreValue, // Preserve original AI score
    }));
    setDetails(categoryDetails);
    setLocalLevel(visibilityLevel);
    setExpandedParameters(new Set());
    // Store snapshots to detect changes
    setInitialDetailsSnapshot(categoryDetails);
    setInitialLevelSnapshot(visibilityLevel);
  }, [categoryId, visibilityLevel, propsInitialDetails]);

  // Check if there are unsaved changes (visibility level or parameter scores)
  const hasChanges = (): boolean => {
    if (localLevel !== initialLevelSnapshot) return true;
    if (details.length !== initialDetailsSnapshot.length) return true;
    return details.some((detail, idx) => {
      const initial = initialDetailsSnapshot[idx];
      return initial && detail.scoreValue !== initial.scoreValue;
    });
  };

  if (!isOpen || !category) return null;

  const handleScoreChange = (key: string, newScore: number) => {
    setDetails((prev) => {
      const updated = prev.map((detail) =>
        detail.key === key ? { ...detail, scoreValue: newScore } : detail
      );
      // Auto-calculate category visibility score based on parameter scores
      const newCategoryScore = calculateCategoryScore(updated) as VisibilityLevel;
      setLocalLevel(newCategoryScore);
      return updated;
    });
  };

  const toggleParameterExpanded = (key: string) => {
    setExpandedParameters((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const handleLevelChange = (newLevel: number) => {
    const clampedLevel = Math.max(0, Math.min(10, newLevel)) as VisibilityLevel;
    setLocalLevel(clampedLevel);
  };

  const handleSave = () => {
    // Save visibility level
    if (onVisibilityChange && localLevel !== initialLevelSnapshot) {
      onVisibilityChange(categoryId, localLevel);
    }
    // Save parameter details
    if (onSave) {
      onSave(categoryId, details);
    }
    onClose();
  };

  const handleCancel = () => {
    // Revert all changes
    setDetails(initialDetailsSnapshot);
    setLocalLevel(initialLevelSnapshot);
    onClose();
  };

  const severityLabel = getAssessmentLabel(localLevel);
  const severityColor = getSeverityColor(localLevel);

  const handleBackdropClick = (e: React.MouseEvent) => {
    // Always stop propagation to prevent parent handlers (like slice deselection)
    e.stopPropagation();
    // Only allow closing via backdrop if no changes were made
    if (!hasChanges()) {
      onClose();
    }
  };

  const handleXClick = () => {
    // Only allow closing via X if no changes were made
    if (!hasChanges()) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-[padding] duration-300"
      style={{ paddingLeft: sidebarOffset }}
      onClick={handleBackdropClick}
    >
      <div
        className="bg-white rounded-2xl shadow-xl max-w-lg w-full mx-4 max-h-[85vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="px-6 py-4 border-b border-stone-200 flex items-center gap-3"
          style={{ backgroundColor: category.color + '15' }}
        >
          <div
            className="w-4 h-4 rounded-full flex-shrink-0"
            style={{ backgroundColor: category.color }}
          />
          <h2 className="text-lg font-semibold text-stone-900">{category.name}</h2>
          <button
            onClick={handleXClick}
            className={`ml-auto p-1 transition-colors ${
              hasChanges()
                ? 'text-stone-300 cursor-not-allowed'
                : 'text-stone-400 hover:text-stone-600'
            }`}
            title={hasChanges() ? 'Save or cancel changes first' : 'Close'}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
          {/* Visibility Score Section */}
          <div className="bg-stone-50 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-stone-700">Visibility Score</span>
              <div className="flex items-center gap-2">
                <span
                  className="text-sm font-medium italic"
                  style={{ color: severityColor }}
                >
                  {severityLabel}
                </span>
                <span
                  className="text-lg font-bold"
                  style={{ color: severityColor }}
                >
                  {localLevel}/10
                </span>
              </div>
            </div>

            {/* Slider */}
            <div className="relative pt-1">
              <input
                type="range"
                min="0"
                max="10"
                value={localLevel}
                onChange={(e) => handleLevelChange(parseInt(e.target.value))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, ${category.color} 0%, ${category.color} ${localLevel * 10}%, #E5E7EB ${localLevel * 10}%, #E5E7EB 100%)`,
                }}
              />
              {/* Tick marks */}
              <div className="flex justify-between mt-1 px-0.5">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((tick) => (
                  <div
                    key={tick}
                    className="flex flex-col items-center"
                    style={{ width: '18px' }}
                  >
                    <div
                      className={`w-0.5 h-1.5 rounded-full ${
                        tick <= localLevel ? 'opacity-60' : 'bg-stone-300'
                      }`}
                      style={{
                        backgroundColor: tick <= localLevel ? category.color : undefined,
                      }}
                    />
                    <span className="text-[10px] text-stone-400 mt-0.5">{tick}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Severity scale legend */}
            <div className="flex justify-between text-[10px] text-stone-500 pt-1">
              <span className="text-emerald-600">Optimal</span>
              <span className="text-emerald-500">Needs Improvement</span>
              <span className="text-amber-500">Attention Needed</span>
              <span className="text-red-500">Focus Area</span>
            </div>
          </div>

          {/* Parameter Details */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-stone-600 uppercase tracking-wide">
              Detailed Observations
            </h3>
            {details.map((detail) => {
              const config = getParameterScoreConfig(detail.key);
              const scoreColor = config
                ? getScoreColor(detail.key, detail.scoreValue)
                : '#9CA3AF';
              const maxScore = config?.maxScore || 4;
              const isExpanded = expandedParameters.has(detail.key);

              return (
                <div
                  key={detail.key}
                  className="border border-stone-200 rounded-xl overflow-hidden"
                >
                  {/* Compact View - Always visible */}
                  <div className="px-4 py-3 flex items-start gap-3">
                    {/* Score Circle */}
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mt-0.5"
                      style={{ backgroundColor: scoreColor }}
                    >
                      {detail.scoreValue}
                    </div>

                    {/* Label and AI Text */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-sm font-medium text-stone-800">
                          {detail.label}
                        </span>
                        <span
                          className="text-xs font-medium flex-shrink-0"
                          style={{ color: scoreColor }}
                        >
                          {detail.scoreValue}/{maxScore}
                        </span>
                      </div>
                      <p className="text-sm text-stone-600 leading-relaxed">
                        {detail.description}
                      </p>
                    </div>

                    {/* Edit Button */}
                    {config && (
                      <button
                        onClick={() => toggleParameterExpanded(detail.key)}
                        className={`p-1.5 rounded-lg transition-colors flex-shrink-0 ${
                          isExpanded
                            ? 'bg-sky-100 text-sky-600'
                            : 'hover:bg-stone-100 text-stone-400 hover:text-stone-600'
                        }`}
                        title={isExpanded ? 'Close options' : 'Edit score'}
                      >
                        <svg
                          className="w-4 h-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          {isExpanded ? (
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                          )}
                        </svg>
                      </button>
                    )}
                  </div>

                  {/* Expanded Score Options */}
                  {config && isExpanded && (
                    <div className="px-4 py-3 bg-stone-50 border-t border-stone-200 space-y-2">
                      <div className="text-[10px] uppercase tracking-wide text-stone-400 mb-2">
                        {config.type === 'conditional' ? 'Select Assessment' : 'Select Severity'}
                      </div>
                      {config.options.map((option) => {
                        const isSelected = detail.scoreValue === option.value;
                        const isAiScore = (detail.aiScoreValue ?? detail.scoreValue) === option.value;
                        const optionColor = getScoreColor(detail.key, option.value);

                        return (
                          <label
                            key={option.value}
                            className={`flex items-start gap-3 p-2.5 rounded-lg cursor-pointer transition-colors ${
                              isSelected
                                ? 'bg-white border border-stone-200 shadow-sm'
                                : 'hover:bg-white/50'
                            }`}
                          >
                            <input
                              type="radio"
                              name={`score-${detail.key}`}
                              value={option.value}
                              checked={isSelected}
                              onChange={() => handleScoreChange(detail.key, option.value)}
                              className="mt-0.5 w-4 h-4 text-sky-600 border-stone-300 focus:ring-sky-500"
                            />
                            <div className="flex-1">
                              <div className="flex items-start gap-2">
                                <span
                                  className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                                  style={{ backgroundColor: optionColor }}
                                >
                                  {option.value}
                                </span>
                                <span
                                  className={`text-sm leading-relaxed ${
                                    isSelected
                                      ? 'font-medium text-stone-900'
                                      : 'text-stone-600'
                                  }`}
                                >
                                  {/* Show AI personalized text at original AI score, standard text for others */}
                                  {isAiScore ? detail.description : option.label}
                                </span>
                              </div>
                              {/* AI badge for original AI score */}
                              {isAiScore && (
                                <span className="ml-7 mt-1 inline-flex items-center text-[10px] text-sky-600 font-medium">
                                  <svg className="w-3 h-3 mr-0.5" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                                  </svg>
                                  AI Assessment
                                </span>
                              )}
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            {details.length === 0 && (
              <p className="text-sm text-stone-500 text-center py-8">
                No detailed parameters available for this category.
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-stone-200 flex justify-end gap-3">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-sm font-medium text-stone-600 hover:text-stone-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>

      {/* Custom slider styles */}
      <style jsx>{`
        input[type='range']::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: white;
          border: 3px solid ${category.color};
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
          transition: transform 0.15s ease;
        }
        input[type='range']::-webkit-slider-thumb:hover {
          transform: scale(1.1);
        }
        input[type='range']::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: white;
          border: 3px solid ${category.color};
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
        }
      `}</style>
    </div>
  );
}
