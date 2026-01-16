'use client';

import React, { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import {
  SerumConfiguration,
  SerumType,
  SerumOption,
  SerumIngredient,
  IngredientRecommendation,
  SerumRecommendationsResponse,
} from '@/types';
import {
  calculateTotalSerumPrice,
  formatSerumPrice,
} from '@/lib/serumIngredients';
import { updateConfigForOption } from '@/lib/mockSerumRecommendations';
import { SerumTypeSection } from './SerumTypeSection';

interface TreatSectionProps {
  isExpanded: boolean;
  onToggle: () => void;
  configs: SerumConfiguration[];
  recommendations: IngredientRecommendation[];
  apiResponse: SerumRecommendationsResponse;
  onConfigsChange: (configs: SerumConfiguration[]) => void;
  disabled?: boolean;
}

/**
 * TreatSection Component
 *
 * Accordion section for personalized serums:
 * - Header with serum icon and total price
 * - Three subsections: Treat Face, Treat Eye, Treat Neck
 * - Shows/hides based on AI recommendations
 */
export function TreatSection({
  isExpanded,
  onToggle,
  configs,
  recommendations,
  apiResponse,
  onConfigsChange,
  disabled = false,
}: TreatSectionProps) {
  // Calculate total price
  const totalCents = calculateTotalSerumPrice(configs);
  const configCount = configs.length;

  // Find config by type
  const getConfig = (type: SerumType) => configs.find((c) => c.type === type);
  const faceConfig = getConfig('face');
  const eyeConfig = getConfig('eye');
  const neckConfig = getConfig('neck');

  // Update a specific config
  const updateConfig = useCallback(
    (type: SerumType, updater: (config: SerumConfiguration) => SerumConfiguration) => {
      onConfigsChange(
        configs.map((config) => (config.type === type ? updater(config) : config))
      );
    },
    [configs, onConfigsChange]
  );

  // Remove a config
  const removeConfig = useCallback(
    (type: SerumType) => {
      onConfigsChange(configs.filter((config) => config.type !== type));
    },
    [configs, onConfigsChange]
  );

  // Add a config back with default settings
  const addConfig = useCallback(
    (type: SerumType) => {
      // Get default option based on type
      const defaultOption = type === 'face' ? 'clinical' : 'advanced';
      const newConfig = updateConfigForOption(apiResponse, type, defaultOption);

      // Insert in correct order: face, eye, neck
      const typeOrder: SerumType[] = ['face', 'eye', 'neck'];
      const newConfigs = [...configs, newConfig].sort(
        (a, b) => typeOrder.indexOf(a.type) - typeOrder.indexOf(b.type)
      );
      onConfigsChange(newConfigs);
    },
    [apiResponse, configs, onConfigsChange]
  );

  // Determine which serum types can be added
  const availableToAdd: SerumType[] = (['face', 'eye', 'neck'] as SerumType[]).filter(
    (type) => !configs.find((c) => c.type === type)
  );

  // Handle option change - reset to AI-recommended config for that option
  const handleOptionChange = useCallback(
    (type: SerumType, newOption: SerumOption) => {
      // Skip if trying to change to 'custom' (not a valid preset option)
      if (newOption === 'custom') return;

      const newConfig = updateConfigForOption(
        apiResponse,
        type,
        newOption as 'clinical' | 'advanced' | 'minimalist'
      );
      updateConfig(type, () => newConfig);
    },
    [apiResponse, updateConfig]
  );

  // Handle ingredient changes - mark as custom if different from AI
  const handleIngredientChange = useCallback(
    (type: SerumType, serumIndex: number, ingredientIndex: number, ingredient: SerumIngredient) => {
      updateConfig(type, (config) => {
        const newSerums = [...config.serums];
        const newIngredients = [...newSerums[serumIndex].ingredients];
        newIngredients[ingredientIndex] = ingredient;
        newSerums[serumIndex] = { ...newSerums[serumIndex], ingredients: newIngredients };

        return {
          ...config,
          serums: newSerums,
          option: 'custom',
          isAiRecommended: false,
        };
      });
    },
    [updateConfig]
  );

  // Handle ingredient removal
  const handleIngredientRemove = useCallback(
    (type: SerumType, serumIndex: number, ingredientIndex: number) => {
      updateConfig(type, (config) => {
        const newSerums = [...config.serums];
        const newIngredients = [...newSerums[serumIndex].ingredients];
        newIngredients.splice(ingredientIndex, 1);
        newSerums[serumIndex] = { ...newSerums[serumIndex], ingredients: newIngredients };

        return {
          ...config,
          serums: newSerums,
          option: 'custom',
          isAiRecommended: false,
        };
      });
    },
    [updateConfig]
  );

  // Handle ingredient addition
  const handleIngredientAdd = useCallback(
    (type: SerumType, serumIndex: number, ingredient: SerumIngredient) => {
      updateConfig(type, (config) => {
        const newSerums = [...config.serums];
        const newIngredients = [...newSerums[serumIndex].ingredients, ingredient];
        newSerums[serumIndex] = { ...newSerums[serumIndex], ingredients: newIngredients };

        return {
          ...config,
          serums: newSerums,
          option: 'custom',
          isAiRecommended: false,
        };
      });
    },
    [updateConfig]
  );

  // Handle time of day change (for Eye/Neck serums)
  const handleTimeOfDayChange = useCallback(
    (type: SerumType, serumIndex: number, timeOfDay: 'AM' | 'PM' | 'AM&PM') => {
      updateConfig(type, (config) => {
        const newSerums = [...config.serums];
        newSerums[serumIndex] = { ...newSerums[serumIndex], timeOfDay };

        return {
          ...config,
          serums: newSerums,
          option: 'custom',
          isAiRecommended: false,
        };
      });
    },
    [updateConfig]
  );

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-xl border border-sky-100 overflow-hidden shadow-sm">
      {/* Accordion Header */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-sky-50/50 transition-colors"
        disabled={disabled}
      >
        <div className="flex items-center gap-3">
          {/* Serum bottle icon */}
          <svg className="h-5 w-5 text-sky-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            {/* Serum dropper */}
            <path d="M12 3v3" strokeLinecap="round" />
            <path d="M9 6h6l1 3H8l1-3z" strokeLinejoin="round" />
            <path d="M8 9v10a3 3 0 003 3h2a3 3 0 003-3V9" strokeLinejoin="round" />
            <path d="M12 14v4" strokeLinecap="round" />
          </svg>
          <span className="font-medium text-stone-800">Treat</span>
          {configCount > 0 && (
            <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-sky-100 text-sky-700 text-xs font-medium">
              {configCount}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Total price */}
          {totalCents > 0 && (
            <span className="text-sm font-medium text-sky-700">
              {formatSerumPrice(totalCents)}
            </span>
          )}

          {/* Chevron */}
          <svg
            className={cn(
              'h-5 w-5 text-stone-400 transition-transform duration-200',
              isExpanded && 'rotate-180'
            )}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Accordion Content */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-sky-100">
          <div className="space-y-6 pt-4">
            {/* Face section */}
            {faceConfig && (
              <SerumTypeSection
                config={faceConfig}
                recommendations={recommendations}
                onOptionChange={(option) => handleOptionChange('face', option)}
                onIngredientChange={(serumIndex, ingredientIndex, ingredient) =>
                  handleIngredientChange('face', serumIndex, ingredientIndex, ingredient)
                }
                onIngredientRemove={(serumIndex, ingredientIndex) =>
                  handleIngredientRemove('face', serumIndex, ingredientIndex)
                }
                onIngredientAdd={(serumIndex, ingredient) =>
                  handleIngredientAdd('face', serumIndex, ingredient)
                }
                onRemove={() => removeConfig('face')}
                disabled={disabled}
              />
            )}

            {/* Divider */}
            {faceConfig && (eyeConfig || neckConfig) && (
              <div className="border-t border-stone-200" />
            )}

            {/* Eye section */}
            {eyeConfig && (
              <SerumTypeSection
                config={eyeConfig}
                recommendations={recommendations}
                onOptionChange={(option) => handleOptionChange('eye', option)}
                onIngredientChange={(serumIndex, ingredientIndex, ingredient) =>
                  handleIngredientChange('eye', serumIndex, ingredientIndex, ingredient)
                }
                onIngredientRemove={(serumIndex, ingredientIndex) =>
                  handleIngredientRemove('eye', serumIndex, ingredientIndex)
                }
                onIngredientAdd={(serumIndex, ingredient) =>
                  handleIngredientAdd('eye', serumIndex, ingredient)
                }
                onTimeOfDayChange={(serumIndex, timeOfDay) =>
                  handleTimeOfDayChange('eye', serumIndex, timeOfDay)
                }
                onRemove={() => removeConfig('eye')}
                disabled={disabled}
              />
            )}

            {/* Neck section */}
            {neckConfig && (
              <SerumTypeSection
                config={neckConfig}
                recommendations={recommendations}
                onOptionChange={(option) => handleOptionChange('neck', option)}
                onIngredientChange={(serumIndex, ingredientIndex, ingredient) =>
                  handleIngredientChange('neck', serumIndex, ingredientIndex, ingredient)
                }
                onIngredientRemove={(serumIndex, ingredientIndex) =>
                  handleIngredientRemove('neck', serumIndex, ingredientIndex)
                }
                onIngredientAdd={(serumIndex, ingredient) =>
                  handleIngredientAdd('neck', serumIndex, ingredient)
                }
                onTimeOfDayChange={(serumIndex, timeOfDay) =>
                  handleTimeOfDayChange('neck', serumIndex, timeOfDay)
                }
                onRemove={() => removeConfig('neck')}
                disabled={disabled}
              />
            )}

            {/* Add Serum buttons when some types are removed */}
            {availableToAdd.length > 0 && (
              <div className="pt-2">
                {configs.length > 0 && (
                  <div className="border-t border-stone-200 pt-4 mb-3" />
                )}
                <div className="flex flex-wrap gap-2">
                  {availableToAdd.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => addConfig(type)}
                      disabled={disabled}
                      className={cn(
                        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg',
                        'border border-dashed border-sky-300 hover:border-sky-400',
                        'text-xs font-medium text-sky-600 hover:text-sky-700',
                        'hover:bg-sky-50 transition-colors',
                        disabled && 'opacity-50 cursor-not-allowed'
                      )}
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      Add {type === 'face' ? 'Face Serum' : type === 'eye' ? 'Eye Serum' : 'Neck Serum'}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Empty state - only show if no configs and no add buttons visible */}
            {configs.length === 0 && availableToAdd.length === 0 && (
              <div className="text-center py-8">
                <svg className="w-12 h-12 mx-auto text-stone-200 mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 3v3" strokeLinecap="round" />
                  <path d="M9 6h6l1 3H8l1-3z" strokeLinejoin="round" />
                  <path d="M8 9v10a3 3 0 003 3h2a3 3 0 003-3V9" strokeLinejoin="round" />
                </svg>
                <p className="text-stone-400 text-sm">No personalized serums configured</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
