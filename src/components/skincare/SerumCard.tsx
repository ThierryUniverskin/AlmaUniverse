'use client';

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Serum, SerumIngredient, SerumType, IngredientRecommendation } from '@/types';
import { getMaxIngredientsForOption } from '@/lib/serumIngredients';
import { IngredientPill, AddIngredientButton } from './IngredientPill';
import { IngredientDropdown } from './IngredientDropdown';

interface SerumCardProps {
  serum: Serum;
  type: SerumType;
  option: string;
  recommendations: IngredientRecommendation[];
  onIngredientChange: (index: number, ingredient: SerumIngredient) => void;
  onIngredientRemove: (index: number) => void;
  onIngredientAdd: (ingredient: SerumIngredient) => void;
  onConcentrationChange?: (index: number, capsules: 1 | 2 | 3) => void;
  onTimeOfDayChange?: (timeOfDay: 'AM' | 'PM' | 'AM&PM') => void;
  disabled?: boolean;
  hidePackshot?: boolean;
}

/**
 * SerumCard Component
 *
 * Displays a single serum (AM or PM) with:
 * - Time of day indicator (sun/moon icon)
 * - Grid of ingredient pills (3 per row)
 * - Add ingredient button
 * - Dropdown positioned under clicked ingredient
 */
export function SerumCard({
  serum,
  type,
  option,
  recommendations,
  onIngredientChange,
  onIngredientRemove,
  onIngredientAdd,
  onConcentrationChange,
  onTimeOfDayChange,
  disabled = false,
  hidePackshot = false,
}: SerumCardProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const pillRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  const maxIngredients = getMaxIngredientsForOption(type, option);
  const canAddMore = serum.ingredients.length < maxIngredients && !disabled;

  // Get already selected ingredient IDs
  const selectedIds = serum.ingredients.map((i) => i.id);

  const handleIngredientClick = (index: number, element: HTMLDivElement | null) => {
    setEditingIndex(index);
    if (element && containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const pillRect = element.getBoundingClientRect();
      setDropdownPosition({
        top: pillRect.bottom - containerRect.top + 4,
        left: pillRect.left - containerRect.left,
      });
    }
    setDropdownOpen(true);
  };

  const handleAddClick = (element: HTMLElement | null) => {
    setEditingIndex(null);
    if (element && containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const buttonRect = element.getBoundingClientRect();
      setDropdownPosition({
        top: buttonRect.bottom - containerRect.top + 4,
        left: buttonRect.left - containerRect.left,
      });
    }
    setDropdownOpen(true);
  };

  const handleDropdownSelect = (ingredient: SerumIngredient) => {
    if (editingIndex !== null) {
      onIngredientChange(editingIndex, ingredient);
    } else {
      onIngredientAdd(ingredient);
    }
    setDropdownOpen(false);
    setEditingIndex(null);
    setDropdownPosition(null);
  };

  const handleDropdownClose = () => {
    setDropdownOpen(false);
    setEditingIndex(null);
    setDropdownPosition(null);
  };

  const handleConcentrationChange = (index: number, capsules: 1 | 2 | 3) => {
    if (onConcentrationChange) {
      onConcentrationChange(index, capsules);
    } else {
      // Fallback: update ingredient with new capsules
      const ingredient = serum.ingredients[index];
      onIngredientChange(index, { ...ingredient, capsules });
    }
  };

  // Get time of day icon
  const TimeIcon = () => {
    if (serum.timeOfDay === 'AM') {
      return (
        <svg className="w-3.5 h-3.5 text-amber-500" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="5" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
        </svg>
      );
    }
    if (serum.timeOfDay === 'PM') {
      return (
        <svg className="w-3.5 h-3.5 text-indigo-500" viewBox="0 0 24 24" fill="currentColor">
          <path d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z" />
        </svg>
      );
    }
    // AM&PM - show both
    return (
      <div className="flex items-center gap-0.5">
        <svg className="w-3 h-3 text-amber-500" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="5" />
        </svg>
        <span className="text-stone-300 text-[10px]">/</span>
        <svg className="w-3 h-3 text-indigo-500" viewBox="0 0 24 24" fill="currentColor">
          <path d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z" />
        </svg>
      </div>
    );
  };

  // Get time label
  const getTimeLabel = () => {
    switch (serum.timeOfDay) {
      case 'AM':
        return 'AM Serum';
      case 'PM':
        return 'PM Serum';
      case 'AM&PM':
        return 'AM & PM Serum';
    }
  };

  // Time selector for Eye/Neck serums
  const TimeSelector = () => {
    if (!onTimeOfDayChange) {
      // Static display for Face serums
      return (
        <div className="flex items-center gap-1.5">
          <TimeIcon />
          <span className="text-[11px] font-medium text-stone-700">{getTimeLabel()}</span>
        </div>
      );
    }

    // Interactive selector for Eye/Neck
    return (
      <div className="inline-flex rounded-md border border-stone-200 bg-white overflow-hidden">
        {(['AM', 'PM', 'AM&PM'] as const).map((time, index) => {
          const isSelected = serum.timeOfDay === time;
          return (
            <button
              key={time}
              type="button"
              onClick={() => onTimeOfDayChange(time)}
              disabled={disabled}
              className={cn(
                'px-2 py-1 text-[10px] font-medium transition-colors flex items-center gap-1',
                index > 0 && 'border-l border-stone-200',
                isSelected
                  ? 'bg-sky-50 text-sky-700'
                  : 'text-stone-500 hover:text-stone-700 hover:bg-stone-50',
                disabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              {time === 'AM' && (
                <svg className="w-3 h-3 text-amber-500" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="12" cy="12" r="5" />
                </svg>
              )}
              {time === 'PM' && (
                <svg className="w-3 h-3 text-indigo-500" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z" />
                </svg>
              )}
              {time === 'AM&PM' && (
                <>
                  <svg className="w-2.5 h-2.5 text-amber-500" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="12" r="5" />
                  </svg>
                  <svg className="w-2.5 h-2.5 text-indigo-500 -ml-0.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z" />
                  </svg>
                </>
              )}
              <span>{time === 'AM&PM' ? 'Both' : time}</span>
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div ref={containerRef} className="bg-white rounded-lg border border-stone-200 p-3 relative">
      {/* Header with time selector */}
      <div className="flex items-center gap-1.5 mb-2">
        <TimeSelector />
      </div>

      {/* Ingredients - stacked vertically, full width */}
      <div className="flex flex-col gap-1.5">
        {serum.ingredients.map((ingredient, index) => (
          <div
            key={`${ingredient.id}-${index}`}
            ref={(el) => {
              if (el) pillRefs.current.set(index, el);
            }}
          >
            <IngredientPill
              ingredient={ingredient}
              onClick={() => {
                const el = pillRefs.current.get(index);
                handleIngredientClick(index, el || null);
              }}
              onRemove={() => onIngredientRemove(index)}
              onConcentrationChange={(capsules) => handleConcentrationChange(index, capsules)}
              disabled={disabled}
            />
          </div>
        ))}

        {/* Add button */}
        {canAddMore && (
          <div>
            <AddIngredientButton
              onClick={(e) => handleAddClick(e.currentTarget)}
              disabled={disabled}
            />
          </div>
        )}
      </div>

      {/* Empty state */}
      {serum.ingredients.length === 0 && !canAddMore && (
        <div className="text-[10px] text-stone-400 italic py-2">No ingredients</div>
      )}

      {/* Ingredient dropdown - positioned under clicked element */}
      <IngredientDropdown
        isOpen={dropdownOpen}
        onClose={handleDropdownClose}
        onSelect={handleDropdownSelect}
        recommendations={recommendations}
        currentIngredient={editingIndex !== null ? serum.ingredients[editingIndex] : undefined}
        excludeIds={selectedIds}
        position={dropdownPosition}
      />
    </div>
  );
}
