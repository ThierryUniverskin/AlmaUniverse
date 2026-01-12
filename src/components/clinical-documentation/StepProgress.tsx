'use client';

import React from 'react';

interface Step {
  number: number;
  label: string;
}

export interface StepProgressProps {
  currentStep: 1 | 2 | 3 | 4 | 5 | 6;
  steps?: Step[];
}

const defaultSteps: Step[] = [
  { number: 1, label: 'Patient' },
  { number: 2, label: 'Health' },
  { number: 3, label: 'Photos' },
  { number: 4, label: 'Concerns' },
  { number: 5, label: 'Treatment' },
  { number: 6, label: 'Summary' },
];

export function StepProgress({ currentStep, steps = defaultSteps }: StepProgressProps) {
  return (
    <div className="flex items-center gap-1">
      {steps.map((step, index) => {
        const isCompleted = currentStep > step.number;
        const isCurrent = currentStep === step.number;
        const isUpcoming = currentStep < step.number;

        return (
          <React.Fragment key={step.number}>
            {/* Step indicator */}
            <div
              className={`
                flex items-center justify-center rounded-full text-xs font-medium transition-all
                ${isCurrent
                  ? 'px-2.5 py-1 gap-1.5 bg-purple-600 text-white'
                  : isCompleted
                    ? 'w-6 h-6 bg-purple-100 text-purple-600'
                    : 'w-6 h-6 bg-stone-100 text-stone-400'
                }
              `}
            >
              {isCompleted ? (
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
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
                  w-2 sm:w-3 h-px
                  ${isCompleted ? 'bg-purple-300' : 'bg-stone-200'}
                `}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
