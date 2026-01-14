'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { useSidebarOffset } from '@/context/LayoutContext';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  message?: string;
  fullScreen?: boolean;
}

const sizeStyles = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
};

function LoadingSpinner({ size = 'md', className, message, fullScreen = false }: LoadingSpinnerProps) {
  const sidebarOffset = useSidebarOffset();

  const spinner = (
    <div className={cn('flex flex-col items-center justify-center gap-4', className)}>
      {/* Premium minimal spinner */}
      <div className="relative">
        <div
          className={cn(
            'rounded-full border-2 border-stone-200',
            sizeStyles[size]
          )}
        />
        <div
          className={cn(
            'absolute inset-0 rounded-full border-2 border-transparent border-t-sage-500',
            'animate-spin',
            sizeStyles[size]
          )}
        />
      </div>
      {message && (
        <p className="text-sm text-stone-500 tracking-snug">{message}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div
        className="fixed inset-0 flex items-center justify-center bg-ivory-100/90 backdrop-blur-sm z-50 transition-[padding] duration-300"
        style={{ paddingLeft: sidebarOffset }}
      >
        {spinner}
      </div>
    );
  }

  return spinner;
}

export { LoadingSpinner };
export type { LoadingSpinnerProps };
