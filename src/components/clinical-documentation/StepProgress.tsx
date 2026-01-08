'use client';

import React from 'react';

interface Step {
  number: number;
  label: string;
}

export interface StepProgressProps {
  currentStep: 1 | 2 | 3;
  steps?: Step[];
}

const defaultSteps: Step[] = [
  { number: 1, label: 'Patient' },
  { number: 2, label: 'Health' },
  { number: 3, label: 'Photos' },
];

export function StepProgress({ currentStep, steps = defaultSteps }: StepProgressProps) {
  return (
    <div className="flex items-center gap-2">
      {steps.map((step, index) => (
        <React.Fragment key={step.number}>
          {/* Step pill */}
          <div
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
              transition-colors
              ${currentStep >= step.number
                ? 'bg-purple-100 text-purple-700'
                : 'bg-stone-100 text-stone-400'
              }
            `}
          >
            {currentStep > step.number ? (
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <span className="w-3.5 text-center">{step.number}</span>
            )}
            <span>{step.label}</span>
          </div>

          {/* Connector dash (not after last step) */}
          {index < steps.length - 1 && (
            <div
              className={`
                w-4 h-px
                ${currentStep > step.number ? 'bg-purple-300' : 'bg-stone-200'}
              `}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
