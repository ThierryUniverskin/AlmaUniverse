'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { getPasswordStrength } from '@/lib/validation';

interface PasswordStrengthProps {
  password: string;
}

function PasswordStrength({ password }: PasswordStrengthProps) {
  const { score, label, requirements } = getPasswordStrength(password);

  const barColors = {
    0: 'bg-stone-200',
    1: 'bg-error-500',
    2: 'bg-warning-500',
    3: 'bg-success-500',
  };

  return (
    <div className="space-y-3">
      {/* Progress bar */}
      <div className="flex gap-1">
        {[0, 1, 2].map((index) => (
          <div
            key={index}
            className={cn(
              'h-1 flex-1 rounded-full transition-colors duration-300',
              index < score ? barColors[score as keyof typeof barColors] : 'bg-stone-200'
            )}
          />
        ))}
      </div>

      {/* Requirements checklist */}
      <div className="space-y-1.5">
        <p className="text-xs text-stone-500 font-medium">Must contain at least;</p>
        {requirements.map((req) => (
          <div key={req.label} className="flex items-center gap-2">
            {req.met ? (
              <svg className="w-4 h-4 text-success-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-stone-300" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
              </svg>
            )}
            <span className={cn('text-xs', req.met ? 'text-stone-600' : 'text-stone-400')}>
              {req.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export { PasswordStrength };
export type { PasswordStrengthProps };
