'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4';
}

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

const paddingStyles = {
  none: '',
  sm: 'p-5',
  md: 'p-6',
  lg: 'p-8',
};

function Card({ children, className, padding = 'md', hover = true }: CardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-2xl border border-stone-200/60',
        'shadow-soft',
        'transition-all duration-350 ease-gentle',
        hover && 'hover:shadow-medium hover:border-stone-200',
        paddingStyles[padding],
        className
      )}
    >
      {children}
    </div>
  );
}

function CardHeader({ children, className }: CardHeaderProps) {
  return (
    <div className={cn('mb-5 pb-4 border-b border-stone-100', className)}>
      {children}
    </div>
  );
}

function CardTitle({ children, className, as: Tag = 'h3' }: CardTitleProps) {
  return (
    <Tag
      className={cn(
        'text-base font-semibold text-stone-800 tracking-snug',
        className
      )}
    >
      {children}
    </Tag>
  );
}

function CardContent({ children, className }: CardContentProps) {
  return <div className={cn(className)}>{children}</div>;
}

function CardFooter({ children, className }: CardFooterProps) {
  return (
    <div className={cn('mt-6 pt-5 border-t border-stone-100', className)}>
      {children}
    </div>
  );
}

export { Card, CardHeader, CardTitle, CardContent, CardFooter };
export type { CardProps, CardHeaderProps, CardTitleProps, CardContentProps, CardFooterProps };
