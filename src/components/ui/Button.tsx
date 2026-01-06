'use client';

import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: `
    bg-sage-600 text-white
    hover:bg-sage-700
    active:bg-sage-800
    focus:ring-sage-500/30
    shadow-sm hover:shadow-md
  `,
  secondary: `
    bg-stone-100 text-stone-700
    hover:bg-stone-200
    active:bg-stone-300
    focus:ring-stone-500/20
  `,
  outline: `
    border border-stone-200 bg-white text-stone-700
    hover:bg-stone-50 hover:border-stone-300
    active:bg-stone-100
    focus:ring-stone-500/20
  `,
  ghost: `
    bg-transparent text-stone-600
    hover:bg-stone-100 hover:text-stone-800
    active:bg-stone-200
    focus:ring-stone-500/20
  `,
  danger: `
    bg-error-600 text-white
    hover:bg-error-700
    active:bg-error-700
    focus:ring-error-500/30
  `,
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3.5 py-2 text-sm',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      fullWidth = false,
      leftIcon,
      rightIcon,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          // Base styles
          'inline-flex items-center justify-center gap-2',
          'font-medium tracking-snug rounded-xl',
          'transition-all duration-250 ease-smooth',
          'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-ivory-100',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none',
          // Variant and size
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {isLoading ? (
          <>
            <svg
              className="animate-spin h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-20"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="3"
              />
              <path
                className="opacity-80"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span className="opacity-80">Please wait...</span>
          </>
        ) : (
          <>
            {leftIcon && <span className="opacity-80">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="opacity-80">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
export type { ButtonProps, ButtonVariant, ButtonSize };
