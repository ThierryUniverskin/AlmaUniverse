'use client';

import React from 'react';

export interface YesNoToggleProps {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
  required?: boolean;
}

/**
 * Modern iOS-style toggle switch for Yes/No questions
 */
export function YesNoToggle({
  label,
  value,
  onChange,
  disabled = false,
  required = false,
}: YesNoToggleProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <label className="text-sm font-medium text-stone-700 flex-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="flex items-center gap-2">
        {/* Yes/No labels outside the toggle */}
        <span className={`text-xs font-medium transition-colors ${value ? 'text-stone-300' : 'text-stone-500'}`}>
          No
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={value}
          onClick={() => !disabled && onChange(!value)}
          disabled={disabled}
          className={`
            relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full
            border-2 border-transparent transition-colors duration-200 ease-in-out
            focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2
            ${value
              ? 'bg-purple-600'
              : 'bg-stone-300'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <span className="sr-only">{label}</span>
          {/* Toggle knob */}
          <span
            className={`
              pointer-events-none inline-block h-5 w-5 transform rounded-full
              bg-white shadow-md ring-0 transition duration-200 ease-in-out
              ${value ? 'translate-x-5' : 'translate-x-0'}
            `}
          />
        </button>
        <span className={`text-xs font-medium transition-colors ${value ? 'text-purple-600' : 'text-stone-300'}`}>
          Yes
        </span>
      </div>
    </div>
  );
}
