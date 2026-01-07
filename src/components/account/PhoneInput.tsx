'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { PhoneNumber } from '@/types';
import { COUNTRY_CODES } from '@/lib/constants';

interface PhoneInputProps {
  label: string;
  value?: PhoneNumber;
  onChange: (value: PhoneNumber) => void;
  error?: string;
  hint?: string;
  required?: boolean;
  id?: string;
}

function PhoneInput({ label, value, onChange, error, hint, required, id }: PhoneInputProps) {
  const inputId = id || label.toLowerCase().replace(/\s+/g, '-');

  const handleCountryCodeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({
      countryCode: e.target.value,
      number: value?.number || '',
    });
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      countryCode: value?.countryCode || '+1',
      number: e.target.value,
    });
  };

  return (
    <div className="w-full">
      <label
        htmlFor={inputId}
        className="block text-sm font-medium text-stone-700 mb-2 tracking-snug"
      >
        {label}
        {required && <span className="text-error-500 ml-1">*</span>}
      </label>
      <div className="flex">
        <select
          value={value?.countryCode || '+1'}
          onChange={handleCountryCodeChange}
          className={cn(
            'flex-shrink-0 w-24 px-3 py-3 rounded-l-xl border border-r-0 border-stone-200',
            'bg-stone-50 text-stone-700 text-sm',
            'focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400',
            'transition-all duration-200',
            error && 'border-error-500 focus:ring-error-500/20 focus:border-error-500'
          )}
        >
          {COUNTRY_CODES.map((country) => (
            <option key={`${country.country}-${country.code}`} value={country.code}>
              {country.flag} {country.code}
            </option>
          ))}
        </select>
        <input
          id={inputId}
          type="tel"
          value={value?.number || ''}
          onChange={handleNumberChange}
          placeholder="(555) 000-0000"
          className={cn(
            'flex-1 px-4 py-3 rounded-r-xl border border-stone-200',
            'text-stone-800 placeholder:text-stone-400 text-sm',
            'focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400',
            'transition-all duration-200',
            error && 'border-error-500 focus:ring-error-500/20 focus:border-error-500'
          )}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
        />
      </div>
      {error && (
        <p id={`${inputId}-error`} className="mt-2 text-sm text-error-600 flex items-center gap-1.5">
          <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
      {hint && !error && (
        <p id={`${inputId}-hint`} className="mt-2 text-sm text-stone-500">
          {hint}
        </p>
      )}
    </div>
  );
}

export { PhoneInput };
export type { PhoneInputProps };
