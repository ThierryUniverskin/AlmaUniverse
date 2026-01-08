'use client';

import React from 'react';

export interface YesNoToggleProps {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
  required?: boolean;
}

export function YesNoToggle({
  label,
  value,
  onChange,
  disabled = false,
  required = false,
}: YesNoToggleProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <label className="text-sm font-medium text-stone-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => !disabled && onChange(true)}
          disabled={disabled}
          className={`
            px-4 py-2 text-sm font-medium rounded-full transition-colors
            ${value
              ? 'bg-purple-600 text-white'
              : 'bg-white text-stone-600 border border-stone-200 hover:border-stone-300'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          Yes
        </button>
        <button
          type="button"
          onClick={() => !disabled && onChange(false)}
          disabled={disabled}
          className={`
            px-4 py-2 text-sm font-medium rounded-full transition-colors
            ${!value
              ? 'bg-purple-600 text-white'
              : 'bg-white text-stone-600 border border-stone-200 hover:border-stone-300'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          No
        </button>
      </div>
    </div>
  );
}
