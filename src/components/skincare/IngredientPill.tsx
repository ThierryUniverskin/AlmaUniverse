'use client';

import React, { useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import { SerumIngredient } from '@/types';
import { formatConcentration } from '@/lib/serumIngredients';

interface IngredientPillProps {
  ingredient: SerumIngredient;
  onRemove?: () => void;
  onClick?: () => void;
  onConcentrationChange?: (capsules: 1 | 2 | 3) => void;
  disabled?: boolean;
  showRemove?: boolean;
}

/**
 * IngredientPill Component
 *
 * Displays a single serum ingredient with:
 * - Color square (with x2/x3 badge if applicable)
 * - Ingredient name
 * - Concentration badge (clickable for concentration selector)
 * - Remove button
 */
export function IngredientPill({
  ingredient,
  onRemove,
  onClick,
  onConcentrationChange,
  disabled = false,
  showRemove = true,
}: IngredientPillProps) {
  const [showConcentrationPicker, setShowConcentrationPicker] = useState(false);
  const pillRef = useRef<HTMLDivElement>(null);
  const concentration = formatConcentration(ingredient);

  const handleConcentrationClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!disabled && onConcentrationChange) {
      setShowConcentrationPicker(!showConcentrationPicker);
    }
  };

  const handleConcentrationSelect = (capsules: 1 | 2 | 3) => {
    onConcentrationChange?.(capsules);
    setShowConcentrationPicker(false);
  };

  return (
    <div className="relative" ref={pillRef}>
      <div
        className={cn(
          'flex items-center gap-1 rounded-md border bg-white h-[26px] w-full',
          onClick && !disabled
            ? 'cursor-pointer hover:bg-stone-50 border-stone-200'
            : 'border-stone-200',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        {/* Left part: Color square + Name (clickable for ingredient change) */}
        <div
          className={cn(
            'flex items-center gap-1 pl-1.5 flex-1 min-w-0',
            onClick && !disabled && 'cursor-pointer'
          )}
          onClick={!disabled && onClick ? onClick : undefined}
        >
          {/* Color square with optional multiplier badge */}
          <div className="relative flex-shrink-0">
            <div
              className="w-3.5 h-3.5 rounded-sm"
              style={{ backgroundColor: ingredient.color }}
            />
            {ingredient.capsules > 1 && (
              <span className="absolute -bottom-0.5 -right-0.5 flex items-center justify-center w-2.5 h-2.5 bg-white border border-stone-300 rounded-sm text-[7px] font-bold text-stone-700">
                {ingredient.capsules}
              </span>
            )}
          </div>

          {/* Ingredient name */}
          <span className="text-[10px] font-medium text-stone-700 truncate">
            {ingredient.name}
          </span>
        </div>

        {/* Concentration badge (clickable for concentration change) */}
        <button
          type="button"
          onClick={handleConcentrationClick}
          disabled={disabled || !onConcentrationChange}
          className={cn(
            'flex-shrink-0 px-1 py-0.5 text-[9px] font-medium rounded-sm mx-0.5',
            'bg-stone-100 text-stone-600',
            onConcentrationChange && !disabled && 'hover:bg-sky-100 hover:text-sky-700 cursor-pointer'
          )}
        >
          {concentration}
        </button>

        {/* Remove button */}
        {showRemove && onRemove && !disabled && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="flex-shrink-0 p-0.5 mr-0.5 text-stone-400 hover:text-stone-600 transition-colors"
            aria-label={`Remove ${ingredient.name}`}
          >
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
      </div>

      {/* Concentration picker dropdown */}
      {showConcentrationPicker && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowConcentrationPicker(false)}
          />
          <div className="absolute top-full left-0 mt-1 z-50 bg-white rounded-md shadow-lg border border-stone-200 p-1">
            <div className="text-[9px] text-stone-500 px-2 py-1 font-medium">Concentration</div>
            {([1, 2, 3] as const).map((capsules) => (
              <button
                key={capsules}
                type="button"
                onClick={() => handleConcentrationSelect(capsules)}
                className={cn(
                  'w-full text-left px-2 py-1 text-[10px] rounded hover:bg-sky-50',
                  ingredient.capsules === capsules
                    ? 'bg-sky-50 text-sky-700 font-medium'
                    : 'text-stone-600'
                )}
              >
                x{capsules} - {(ingredient.baseConcentration * capsules).toFixed(1)}%
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/**
 * AddIngredientButton Component
 *
 * Dashed border button for adding new ingredients
 */
interface AddIngredientButtonProps {
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
}

export function AddIngredientButton({
  onClick,
  disabled = false,
}: AddIngredientButtonProps) {
  return (
    <button
      type="button"
      onClick={(e) => onClick(e)}
      disabled={disabled}
      className={cn(
        'flex items-center justify-center gap-1 rounded-md h-[26px] w-full',
        'border border-dashed border-stone-300 hover:border-sky-400',
        'text-[10px] font-medium text-stone-500 hover:text-sky-600',
        'transition-colors',
        disabled && 'opacity-50 cursor-not-allowed hover:border-stone-300 hover:text-stone-500'
      )}
    >
      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      Add
    </button>
  );
}
