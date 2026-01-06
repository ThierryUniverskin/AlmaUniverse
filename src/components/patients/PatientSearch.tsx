'use client';

import React from 'react';
import { Input } from '@/components/ui';

interface PatientSearchProps {
  value: string;
  onChange: (value: string) => void;
}

function PatientSearch({ value, onChange }: PatientSearchProps) {
  return (
    <div className="relative w-full max-w-md">
      <Input
        type="search"
        placeholder="Search patients by name..."
        value={value}
        onChange={e => onChange(e.target.value)}
        leftIcon={
          <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        }
      />
    </div>
  );
}

export { PatientSearch };
