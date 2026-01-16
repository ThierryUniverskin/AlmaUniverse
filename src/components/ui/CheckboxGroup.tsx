'use client';

import React from 'react';

export interface CheckboxOption {
  value: string;
  label: string;
}

export interface CheckboxGroupProps {
  label: string;
  options: readonly CheckboxOption[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  disabled?: boolean;
  columns?: 2 | 3 | 4;
}

export function CheckboxGroup({
  label,
  options,
  selectedValues,
  onChange,
  disabled = false,
  columns = 2,
}: CheckboxGroupProps) {
  const handleToggle = (value: string) => {
    if (disabled) return;

    if (selectedValues.includes(value)) {
      onChange(selectedValues.filter(v => v !== value));
    } else {
      onChange([...selectedValues, value]);
    }
  };

  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
  };

  return (
    <div>
      <label className="block text-sm font-medium text-stone-700 mb-3">
        {label}
      </label>
      <div className={`grid ${gridCols[columns]} gap-3`}>
        {options.map(option => (
          <label
            key={option.value}
            className={`
              flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors min-h-[52px]
              ${selectedValues.includes(option.value)
                ? 'border-purple-500 bg-purple-50'
                : 'border-stone-200 hover:border-stone-300'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <input
              type="checkbox"
              checked={selectedValues.includes(option.value)}
              onChange={() => handleToggle(option.value)}
              disabled={disabled}
              className="checkbox-custom mt-0.5"
            />
            <span className="text-sm text-stone-700">{option.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
