'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  SerumConfiguration,
  SerumType,
  SerumOption,
  SerumIngredient,
  IngredientRecommendation,
} from '@/types';
import {
  calculateSerumPrice,
  calculatePricePerMonth,
  formatSerumPrice,
  SERUM_DURATION_DAYS,
} from '@/lib/serumIngredients';
import { ImageLightbox } from '@/components/ui/ImageLightbox';
import { OptionSwitcher } from './OptionSwitcher';
import { SerumCard } from './SerumCard';

interface SerumTypeSectionProps {
  config: SerumConfiguration;
  recommendations: IngredientRecommendation[];
  onOptionChange: (option: SerumOption) => void;
  onIngredientChange: (serumIndex: number, ingredientIndex: number, ingredient: SerumIngredient) => void;
  onIngredientRemove: (serumIndex: number, ingredientIndex: number) => void;
  onIngredientAdd: (serumIndex: number, ingredient: SerumIngredient) => void;
  onTimeOfDayChange?: (serumIndex: number, timeOfDay: 'AM' | 'PM' | 'AM&PM') => void;  // For Eye/Neck
  onRemove?: () => void;  // For removing eye/neck sections
  disabled?: boolean;
}

// Product titles for each type
const TYPE_TITLES: Record<SerumType, string> = {
  face: 'Face: Activating Serum - Duo',
  eye: 'Eye Contour: Activating Serum',
  neck: 'Neck & Décolleté: Activating Serum',
};

// Size labels
const SIZE_LABELS: Record<SerumType, string> = {
  face: '2 × 15ml',
  eye: '15ml',
  neck: '15ml',
};

// Packshot images
const PACKSHOT_IMAGES: Record<SerumType, string> = {
  face: '/images/serums/face.jpg',
  eye: '/images/serums/eye-neck.jpg',
  neck: '/images/serums/eye-neck.jpg',
};

/**
 * SerumTypeSection Component
 *
 * Section for Face/Eye/Neck serum configuration matching the SelectedProductCard design:
 * - Grey background card
 * - Clickable packshot image with lightbox
 * - Title, size, description
 * - Option switcher
 * - AM/PM ingredient selectors
 */
export function SerumTypeSection({
  config,
  recommendations,
  onOptionChange,
  onIngredientChange,
  onIngredientRemove,
  onIngredientAdd,
  onTimeOfDayChange,
  onRemove,
  disabled = false,
}: SerumTypeSectionProps) {
  const [showLightbox, setShowLightbox] = useState(false);

  const priceCents = calculateSerumPrice(config);
  const pricePerMonth = calculatePricePerMonth(config);
  const durationMonths = SERUM_DURATION_DAYS / 30;

  // Handle modifications
  const handleIngredientChange = (serumIndex: number, ingredientIndex: number, ingredient: SerumIngredient) => {
    onIngredientChange(serumIndex, ingredientIndex, ingredient);
  };

  const handleIngredientRemove = (serumIndex: number, ingredientIndex: number) => {
    onIngredientRemove(serumIndex, ingredientIndex);
  };

  const handleIngredientAdd = (serumIndex: number, ingredient: SerumIngredient) => {
    onIngredientAdd(serumIndex, ingredient);
  };

  return (
    <div className="bg-stone-50 border border-stone-200 rounded-xl p-4">
      {/* Product info section */}
      <div className="flex gap-4">
        {/* Clickable packshot image - same size as other product miniatures */}
        <div className="flex-shrink-0">
          <div
            className="w-[60px] h-[90px] rounded-lg overflow-hidden bg-white border border-stone-200 cursor-pointer hover:border-sky-300 hover:shadow-md transition-all group"
            onClick={() => setShowLightbox(true)}
          >
            <img
              src={PACKSHOT_IMAGES[config.type]}
              alt={TYPE_TITLES[config.type]}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header with title and remove button */}
          <div className="flex items-start justify-between gap-3 mb-1">
            <div>
              <h3 className="text-sm font-semibold text-stone-900 leading-tight">
                {TYPE_TITLES[config.type]}
              </h3>
              <span className="text-xs text-stone-500">{SIZE_LABELS[config.type]}</span>
            </div>
            {onRemove && (
              <button
                type="button"
                onClick={onRemove}
                disabled={disabled}
                className="flex-shrink-0 p-1 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                aria-label="Remove serum"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Description */}
          <p className="text-[11px] text-stone-500 mb-2 line-clamp-3">
            {config.description}
          </p>

          {/* AI Recommended badge */}
          {config.isAiRecommended && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-100 text-emerald-700">
              <svg className="h-3 w-3 mr-1" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              Recommended
            </span>
          )}
        </div>
      </div>

      {/* Divider with option switcher */}
      <div className="border-t border-stone-200 my-3 pt-3">
        <OptionSwitcher
          type={config.type}
          selected={config.option}
          onChange={onOptionChange}
          disabled={disabled}
        />
      </div>

      {/* AM/PM Serum ingredient selectors - always 2-column grid */}
      <div className="grid md:grid-cols-2 gap-3">
        {config.type === 'face' ? (
          // Face: AM on left, PM on right
          config.serums.map((serum, serumIndex) => (
            <SerumCard
              key={`${config.type}-${serum.timeOfDay}-${serumIndex}`}
              serum={serum}
              type={config.type}
              option={config.option}
              recommendations={recommendations}
              onIngredientChange={(ingredientIndex, ingredient) =>
                handleIngredientChange(serumIndex, ingredientIndex, ingredient)
              }
              onIngredientRemove={(ingredientIndex) =>
                handleIngredientRemove(serumIndex, ingredientIndex)
              }
              onIngredientAdd={(ingredient) =>
                handleIngredientAdd(serumIndex, ingredient)
              }
              disabled={disabled}
              hidePackshot={true}
            />
          ))
        ) : (
          // Eye/Neck: Single serum positioned based on timeOfDay
          <>
            {config.serums[0]?.timeOfDay === 'AM' && (
              <>
                <SerumCard
                  key={`${config.type}-${config.serums[0].timeOfDay}`}
                  serum={config.serums[0]}
                  type={config.type}
                  option={config.option}
                  recommendations={recommendations}
                  onIngredientChange={(ingredientIndex, ingredient) =>
                    handleIngredientChange(0, ingredientIndex, ingredient)
                  }
                  onIngredientRemove={(ingredientIndex) =>
                    handleIngredientRemove(0, ingredientIndex)
                  }
                  onIngredientAdd={(ingredient) =>
                    handleIngredientAdd(0, ingredient)
                  }
                  onTimeOfDayChange={onTimeOfDayChange ? (time) => onTimeOfDayChange(0, time) : undefined}
                  disabled={disabled}
                  hidePackshot={true}
                />
                <div /> {/* Empty right column */}
              </>
            )}
            {config.serums[0]?.timeOfDay === 'PM' && (
              <>
                <div /> {/* Empty left column */}
                <SerumCard
                  key={`${config.type}-${config.serums[0].timeOfDay}`}
                  serum={config.serums[0]}
                  type={config.type}
                  option={config.option}
                  recommendations={recommendations}
                  onIngredientChange={(ingredientIndex, ingredient) =>
                    handleIngredientChange(0, ingredientIndex, ingredient)
                  }
                  onIngredientRemove={(ingredientIndex) =>
                    handleIngredientRemove(0, ingredientIndex)
                  }
                  onIngredientAdd={(ingredient) =>
                    handleIngredientAdd(0, ingredient)
                  }
                  onTimeOfDayChange={onTimeOfDayChange ? (time) => onTimeOfDayChange(0, time) : undefined}
                  disabled={disabled}
                  hidePackshot={true}
                />
              </>
            )}
            {config.serums[0]?.timeOfDay === 'AM&PM' && (
              <div className="md:col-span-2 flex justify-center">
                <div className="w-full md:w-1/2">
                  <SerumCard
                    key={`${config.type}-${config.serums[0].timeOfDay}`}
                    serum={config.serums[0]}
                    type={config.type}
                    option={config.option}
                    recommendations={recommendations}
                    onIngredientChange={(ingredientIndex, ingredient) =>
                      handleIngredientChange(0, ingredientIndex, ingredient)
                    }
                    onIngredientRemove={(ingredientIndex) =>
                      handleIngredientRemove(0, ingredientIndex)
                    }
                    onIngredientAdd={(ingredient) =>
                      handleIngredientAdd(0, ingredient)
                    }
                    onTimeOfDayChange={onTimeOfDayChange ? (time) => onTimeOfDayChange(0, time) : undefined}
                    disabled={disabled}
                    hidePackshot={true}
                  />
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Duration, price per month, and section total */}
      <div className="border-t border-stone-200 pt-3 mt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs text-stone-500">
            <div className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-stone-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 6v6l4 2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>{durationMonths} month supply</span>
            </div>
            <span className="text-stone-300">|</span>
            <span className="font-medium text-stone-600">{formatSerumPrice(pricePerMonth)}/mo</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-500">Section total:</span>
            <span className="font-semibold text-sky-700">{formatSerumPrice(priceCents)}</span>
          </div>
        </div>
      </div>

      {/* Image Lightbox */}
      {showLightbox && (
        <ImageLightbox
          src={PACKSHOT_IMAGES[config.type]}
          alt={TYPE_TITLES[config.type]}
          onClose={() => setShowLightbox(false)}
        />
      )}
    </div>
  );
}
