'use client';

import React from 'react';

interface Step {
  number: number;
  label: string;
}

export interface SkinWellnessStepProgressProps {
  currentStep: 1 | 2 | 3;
  steps?: Step[];
  variant?: 'light' | 'dark';
}

const defaultSteps: Step[] = [
  { number: 1, label: 'Analysis' },
  { number: 2, label: 'Results' },
  { number: 3, label: 'Complete' },
];

export function SkinWellnessStepProgress({ currentStep, steps = defaultSteps, variant = 'light' }: SkinWellnessStepProgressProps) {
  const isDark = variant === 'dark';

  return (
    <div className="flex items-center gap-1.5">
      {steps.map((step, index) => {
        const isCompleted = currentStep > step.number;
        const isCurrent = currentStep === step.number;

        return (
          <React.Fragment key={step.number}>
            {/* Step indicator */}
            <div
              className={`
                flex items-center justify-center rounded-full text-xs font-medium transition-all
                ${isCurrent
                  ? 'px-3 py-1.5 gap-1.5 bg-sky-500 text-white shadow-sm'
                  : isCompleted
                    ? isDark
                      ? 'w-7 h-7 bg-sky-500/30 text-sky-300'
                      : 'w-7 h-7 bg-sky-100 text-sky-600'
                    : isDark
                      ? 'w-7 h-7 bg-white/10 text-white/50'
                      : 'w-7 h-7 bg-stone-100 text-stone-400'
                }
              `}
            >
              {isCompleted ? (
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : isCurrent ? (
                <>
                  <span>{step.number}</span>
                  <span className="hidden sm:inline">{step.label}</span>
                </>
              ) : (
                <span>{step.number}</span>
              )}
            </div>

            {/* Connector line (not after last step) */}
            {index < steps.length - 1 && (
              <div
                className={`
                  w-4 sm:w-6 h-0.5 rounded-full
                  ${isCompleted
                    ? isDark ? 'bg-sky-400/50' : 'bg-sky-300'
                    : isDark ? 'bg-white/20' : 'bg-stone-200'
                  }
                `}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
