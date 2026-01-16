'use client';

import React, { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { SerumIngredient, SerumIngredientData, IngredientRecommendation, IngredientCategory } from '@/types';
import { createIngredient } from '@/lib/serumIngredients';

interface IngredientDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (ingredient: SerumIngredient) => void;
  recommendations: IngredientRecommendation[];
  currentIngredient?: SerumIngredient;
  excludeIds?: string[];
  position?: { top: number; left: number; alignRight?: boolean } | null;
}

// Category display configuration
const CATEGORY_CONFIG: Record<IngredientCategory, { label: string; icon: string; color: string }> = {
  highly_recommended: {
    label: 'Highly recommended',
    icon: '✓✓✓',
    color: 'text-emerald-600',
  },
  recommended: {
    label: 'Recommended',
    icon: '✓✓',
    color: 'text-sky-600',
  },
  can_be_used: {
    label: 'Can be used',
    icon: '✓',
    color: 'text-stone-500',
  },
  should_not_be_used: {
    label: 'Should not be used',
    icon: '✗',
    color: 'text-amber-600',
  },
  cannot_be_used: {
    label: 'Cannot be used',
    icon: '✗✗',
    color: 'text-red-600',
  },
};

/**
 * IngredientDropdown Component
 *
 * Dropdown for selecting serum ingredients with:
 * - Categorized ingredient grid (3 per row)
 * - Visual indicators for recommendation levels
 * - Positioned under the clicked element
 */
export function IngredientDropdown({
  isOpen,
  onClose,
  onSelect,
  recommendations,
  currentIngredient,
  excludeIds = [],
  position,
}: IngredientDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Group recommendations by category
  const groupedRecommendations = recommendations.reduce(
    (acc, rec) => {
      // Skip already selected ingredients (except current one being edited)
      if (excludeIds.includes(rec.ingredient.id) && rec.ingredient.id !== currentIngredient?.id) {
        return acc;
      }
      if (!acc[rec.category]) {
        acc[rec.category] = [];
      }
      acc[rec.category].push(rec);
      return acc;
    },
    {} as Record<IngredientCategory, IngredientRecommendation[]>
  );

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      // Small delay to prevent immediate close
      setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 0);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleIngredientClick = (ingredientData: SerumIngredientData) => {
    // Use existing capsules if editing, otherwise default to 1
    const capsules = currentIngredient?.capsules || 1;
    const newIngredient = createIngredient(ingredientData, capsules);
    onSelect(newIngredient);
  };

  if (!isOpen) return null;

  // Order categories by priority
  const categoryOrder: IngredientCategory[] = [
    'highly_recommended',
    'recommended',
    'can_be_used',
    'should_not_be_used',
    'cannot_be_used',
  ];

  // Calculate position style
  const getPositionStyle = (): React.CSSProperties => {
    if (!position) {
      return { top: '100%', left: 0, marginTop: 4 };
    }
    if (position.alignRight) {
      return { top: position.top, right: 0 };
    }
    return { top: position.top, left: Math.max(0, position.left) };
  };

  return (
    <div
      ref={dropdownRef}
      className={cn(
        'absolute z-50 w-[460px]',
        'bg-white rounded-lg shadow-lg border border-stone-200'
      )}
      style={getPositionStyle()}
    >
      {/* Categorized ingredient list */}
      <div className="p-2">
        {categoryOrder.map((category) => {
          const items = groupedRecommendations[category];
          if (!items || items.length === 0) return null;

          const config = CATEGORY_CONFIG[category];
          const isRestricted = category === 'should_not_be_used' || category === 'cannot_be_used';

          return (
            <div key={category} className="mb-2 last:mb-0">
              {/* Category header */}
              <div className={cn('flex items-center gap-1.5 px-1.5 py-1 text-[10px] font-medium', config.color)}>
                <span>{config.icon}</span>
                <span>{config.label}</span>
              </div>

              {/* Ingredient grid - 3 per row */}
              <div className="grid grid-cols-3 gap-1 px-1">
                {items.map(({ ingredient }) => (
                  <button
                    key={ingredient.id}
                    type="button"
                    onClick={() => handleIngredientClick(ingredient)}
                    className={cn(
                      'flex items-center gap-1 px-1.5 py-1 rounded',
                      'text-[10px] font-medium transition-colors text-left',
                      isRestricted
                        ? 'bg-stone-50 text-stone-400 hover:bg-stone-100'
                        : 'bg-stone-50 text-stone-700 hover:bg-sky-50 hover:text-sky-700'
                    )}
                  >
                    {/* Color indicator */}
                    <div
                      className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                      style={{ backgroundColor: ingredient.color }}
                    />
                    <span className="truncate">{ingredient.name}</span>
                    <span className="text-[9px] text-stone-400 flex-shrink-0">{ingredient.baseConcentration}%</span>
                  </button>
                ))}
              </div>
            </div>
          );
        })}

        {/* Empty state */}
        {Object.keys(groupedRecommendations).length === 0 && (
          <div className="text-center py-4 text-stone-400 text-[10px]">
            No more ingredients available
          </div>
        )}
      </div>
    </div>
  );
}
