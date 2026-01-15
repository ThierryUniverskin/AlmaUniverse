'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { UniverskinCategory } from '@/types';
import { UNIVERSKIN_CATEGORIES } from '@/lib/universkinProducts';

interface CategoryTabsProps {
  activeCategory: UniverskinCategory;
  onChange: (category: UniverskinCategory) => void;
  productCounts?: Record<UniverskinCategory, number>;
  className?: string;
}

/**
 * Horizontal scrollable category tabs for skincare product selection.
 * Uses SkinXS sky blue theme.
 */
export function CategoryTabs({
  activeCategory,
  onChange,
  productCounts,
  className,
}: CategoryTabsProps) {
  // Filter out 'treat' category (not implemented yet)
  const visibleCategories = UNIVERSKIN_CATEGORIES.filter((cat) => cat.id !== 'treat');

  return (
    <div className={cn('overflow-x-auto scrollbar-hide', className)}>
      <div className="flex gap-2 min-w-max pb-1">
        {visibleCategories.map((category) => {
          const isActive = activeCategory === category.id;
          const count = productCounts?.[category.id] ?? 0;

          return (
            <button
              key={category.id}
              type="button"
              onClick={() => onChange(category.id)}
              className={cn(
                'relative px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200',
                'focus:outline-none focus:ring-2 focus:ring-sky-400/50 focus:ring-offset-1',
                isActive
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'bg-white/80 text-stone-600 hover:bg-white hover:text-stone-800 border border-sky-100'
              )}
            >
              <span>{category.label}</span>
              {count > 0 && (
                <span
                  className={cn(
                    'ml-1.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-xs font-semibold',
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-sky-100 text-sky-700'
                  )}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
