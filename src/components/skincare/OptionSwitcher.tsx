'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { SerumType, SerumOption } from '@/types';
import { getOptionsForType } from '@/lib/serumIngredients';

interface OptionSwitcherProps {
  type: SerumType;
  selected: SerumOption;
  onChange: (option: SerumOption) => void;
  disabled?: boolean;
}

// Option labels for display
const OPTION_LABELS: Record<string, string> = {
  clinical: 'Clinical',
  advanced: 'Advanced',
  minimalist: 'Minimalist',
  custom: 'Custom',
};

// Option descriptions for tooltip
const OPTION_DESCRIPTIONS: Record<string, string> = {
  clinical: '3 ingredients per serum',
  advanced: '2 ingredients per serum',
  minimalist: '1 ingredient per serum',
  custom: 'Custom configuration',
};

// Face-specific descriptions (showing AM+PM)
const FACE_DESCRIPTIONS: Record<string, string> = {
  clinical: '3+3 ingredients',
  advanced: '2+2 ingredients',
  minimalist: '1+1 ingredients',
  custom: 'Custom configuration',
};

/**
 * OptionSwitcher Component
 *
 * Segmented control for selecting serum options:
 * - Face: Clinical | Advanced | Minimalist
 * - Eye/Neck: Advanced | Minimalist
 *
 * Automatically adds "Custom" when doctor modifies the config
 */
export function OptionSwitcher({
  type,
  selected,
  onChange,
  disabled = false,
}: OptionSwitcherProps) {
  // Get available options for this serum type
  const baseOptions = getOptionsForType(type);

  // If currently on custom, show the custom option too
  const options = selected === 'custom'
    ? [...baseOptions, 'custom']
    : baseOptions;

  const descriptions = type === 'face' ? FACE_DESCRIPTIONS : OPTION_DESCRIPTIONS;

  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-stone-400 uppercase tracking-wide">Formula</span>
      <div className="inline-flex rounded-lg bg-stone-100 p-0.5">
        {options.map((option) => {
          const isSelected = selected === option;
          const isCustom = option === 'custom';

          return (
            <button
              key={option}
              type="button"
              onClick={() => !isCustom && onChange(option as SerumOption)}
              disabled={disabled || isCustom}
              title={descriptions[option]}
              className={cn(
                'px-3 py-1.5 text-[11px] font-medium transition-all rounded-md',
                isSelected
                  ? 'bg-white text-sky-700 shadow-sm'
                  : 'text-stone-500 hover:text-stone-700',
                disabled && 'opacity-50 cursor-not-allowed',
                isCustom && 'cursor-default italic'
              )}
            >
              <span>{OPTION_LABELS[option]}</span>
              {!isCustom && (
                <span className="ml-1 text-[9px] text-stone-400">
                  ({type === 'face' ? FACE_DESCRIPTIONS[option] : descriptions[option]})
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * OptionBadge Component
 *
 * Small badge showing current option (for compact display)
 */
interface OptionBadgeProps {
  option: SerumOption;
  className?: string;
}

export function OptionBadge({ option, className }: OptionBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
        option === 'custom'
          ? 'bg-amber-100 text-amber-700'
          : 'bg-sky-100 text-sky-700',
        className
      )}
    >
      {OPTION_LABELS[option]}
    </span>
  );
}
