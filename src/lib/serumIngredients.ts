/**
 * Serum Ingredients Module
 *
 * Handles fetching and managing personalized serum ingredients.
 * Follows the same pattern as Universkin products with:
 * - Static fallback array for offline support
 * - Database fetching with fallback
 * - Country-specific availability
 */

import { SerumIngredientData, SerumIngredient, SerumConfiguration, SerumType } from '@/types';
import { DbSerumIngredient } from '@/types/database';
import { logger } from './logger';

// ============================================================================
// Static Fallback Data (21 ingredients)
// ============================================================================

export const SERUM_INGREDIENTS: SerumIngredientData[] = [
  // Yellow (Radiance)
  { id: 'sod', name: 'SOD', baseConcentration: 2.0, color: '#D4A84B', displayOrder: 1 },
  { id: 'ferulic-acid', name: 'Ferulic Acid', baseConcentration: 1.0, color: '#D4A84B', displayOrder: 2 },

  // Pink (Smoothness/Anti-aging)
  { id: 'vitamin-c', name: 'Vitamin C', baseConcentration: 7.0, color: '#D668B0', displayOrder: 3 },
  { id: 'isoflavones', name: 'Isoflavones', baseConcentration: 2.0, color: '#D668B0', displayOrder: 4 },
  { id: 'dmae', name: 'DMAE', baseConcentration: 2.5, color: '#D668B0', displayOrder: 5 },
  { id: 'madecassoside', name: 'Madecassoside', baseConcentration: 1.0, color: '#D668B0', displayOrder: 6 },
  { id: 'retinal', name: 'Retinal', baseConcentration: 0.2, color: '#D668B0', displayOrder: 7 },
  { id: 'retinol', name: 'Retinol', baseConcentration: 0.2, color: '#D668B0', displayOrder: 8 },

  // Red (Redness/Vascular)
  { id: 'niacinamide', name: 'Niacinamide', baseConcentration: 4.0, color: '#C13050', displayOrder: 9 },
  { id: 'rutin-tx', name: 'Rutin-TX', baseConcentration: 3.0, color: '#C13050', displayOrder: 10 },
  { id: 'azelaic-acid', name: 'Azelaic Acid', baseConcentration: 5.4, color: '#C13050', displayOrder: 11 },

  // Blue (Hydration)
  { id: 'aloe-vera', name: 'Aloe Vera', baseConcentration: 5.4, color: '#4A9BE8', displayOrder: 12 },
  { id: 'd-panthenol', name: 'D-Panthenol', baseConcentration: 5.0, color: '#4A9BE8', displayOrder: 13 },

  // Orange (Oil control)
  { id: 'zinc', name: 'Zinc', baseConcentration: 2.5, color: '#E07030', displayOrder: 14 },

  // Grey (Texture/Exfoliation)
  { id: 'glycolic-acid', name: 'Glycolic Acid', baseConcentration: 7.0, color: '#A89880', displayOrder: 15 },
  { id: 'salicylic-acid', name: 'Salicylic Acid', baseConcentration: 2.0, color: '#A89880', displayOrder: 16 },
  { id: 'phytic-acid', name: 'Phytic Acid', baseConcentration: 2.0, color: '#A89880', displayOrder: 17 },

  // Green (Blemishes)
  { id: 'lactopeptide', name: 'Lactopeptide', baseConcentration: 3.5, color: '#2DA850', displayOrder: 18 },

  // Brown (Pigmentation/Tone)
  { id: 'arbutin', name: 'Arbutin', baseConcentration: 3.0, color: '#8B5A2B', displayOrder: 19 },
  { id: 'kojic-acid', name: 'Kojic Acid', baseConcentration: 2.0, color: '#8B5A2B', displayOrder: 20 },
  { id: 'tranexamic-acid', name: 'Tranexamic Acid', baseConcentration: 4.0, color: '#8B5A2B', displayOrder: 21 },
];

// Ingredients NOT available in US (for static fallback)
const US_UNAVAILABLE_INGREDIENTS = ['phytic-acid', 'retinol', 'aloe-vera'];

// ============================================================================
// Pricing Constants
// ============================================================================

export const SERUM_PRICING = {
  US: {
    duoBaseCents: 7500,     // $75 base for Face (duo packaging)
    soloBaseCents: 4500,    // $45 base for Eye/Neck (solo packaging)
    capsuleCents: 1100,     // $11 per capsule
  },
  // Add other countries as needed
};

export const SERUM_DURATION_DAYS = 60; // 2 months

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get access token from localStorage
 */
function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const storageKey = `sb-${new URL(supabaseUrl).hostname.split('.')[0]}-auth-token`;
  const storedSession = localStorage.getItem(storageKey);
  const sessionData = storedSession ? JSON.parse(storedSession) : null;
  return sessionData?.access_token || null;
}

/**
 * Convert database row to SerumIngredientData
 */
function dbToIngredient(db: DbSerumIngredient): SerumIngredientData {
  return {
    id: db.id,
    name: db.name,
    baseConcentration: Number(db.base_concentration),
    color: db.color,
    displayOrder: db.display_order,
  };
}

// ============================================================================
// Sync Lookup Functions (Static Data)
// ============================================================================

/**
 * Get ingredient by ID from static data (sync)
 */
export function getIngredientById(id: string): SerumIngredientData | undefined {
  return SERUM_INGREDIENTS.find((i) => i.id === id);
}

/**
 * Get all ingredients from static data (sync)
 */
export function getAllIngredients(): SerumIngredientData[] {
  return SERUM_INGREDIENTS;
}

/**
 * Get available ingredients for US from static data (sync)
 */
export function getUSAvailableIngredients(): SerumIngredientData[] {
  return SERUM_INGREDIENTS.filter((i) => !US_UNAVAILABLE_INGREDIENTS.includes(i.id));
}

// ============================================================================
// Async Fetch Functions (Database with Fallback)
// ============================================================================

/**
 * Fetch all active ingredients from database
 */
export async function fetchIngredients(): Promise<SerumIngredientData[]> {
  const accessToken = getAccessToken();
  if (!accessToken) {
    logger.warn('[SerumIngredients] No access token, using static data');
    return SERUM_INGREDIENTS;
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const response = await fetch(
      `${supabaseUrl}/rest/v1/serum_ingredients?is_active=eq.true&order=display_order`,
      {
        headers: {
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      logger.warn('[SerumIngredients] Database fetch failed, using static data');
      return SERUM_INGREDIENTS;
    }

    const data: DbSerumIngredient[] = await response.json();
    return data.map(dbToIngredient);
  } catch (error) {
    logger.error('[SerumIngredients] Error fetching ingredients:', error);
    return SERUM_INGREDIENTS;
  }
}

/**
 * Fetch available ingredients for a specific country
 */
export async function fetchAvailableIngredients(countryCode: string): Promise<SerumIngredientData[]> {
  const accessToken = getAccessToken();
  if (!accessToken) {
    logger.warn('[SerumIngredients] No access token, using static data');
    return countryCode === 'US' ? getUSAvailableIngredients() : SERUM_INGREDIENTS;
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;

    // First get ingredient IDs available in the country
    const countryResponse = await fetch(
      `${supabaseUrl}/rest/v1/country_serum_ingredients?country_code=eq.${countryCode}&is_available=eq.true&select=ingredient_id`,
      {
        headers: {
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!countryResponse.ok) {
      logger.warn('[SerumIngredients] Country fetch failed, using static data');
      return countryCode === 'US' ? getUSAvailableIngredients() : SERUM_INGREDIENTS;
    }

    const countryData = await countryResponse.json();
    const ingredientIds = countryData.map((row: { ingredient_id: string }) => row.ingredient_id);

    if (ingredientIds.length === 0) {
      logger.warn(`[SerumIngredients] No ingredients available in ${countryCode}`);
      return [];
    }

    // Fetch the actual ingredients
    const ingredientIdsParam = ingredientIds.map((id: string) => `"${id}"`).join(',');
    const ingredientsResponse = await fetch(
      `${supabaseUrl}/rest/v1/serum_ingredients?id=in.(${ingredientIdsParam})&is_active=eq.true&order=display_order`,
      {
        headers: {
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!ingredientsResponse.ok) {
      logger.warn('[SerumIngredients] Ingredients fetch failed, using static data');
      return countryCode === 'US' ? getUSAvailableIngredients() : SERUM_INGREDIENTS;
    }

    const ingredients: DbSerumIngredient[] = await ingredientsResponse.json();
    return ingredients.map(dbToIngredient);
  } catch (error) {
    logger.error('[SerumIngredients] Error fetching country ingredients:', error);
    return countryCode === 'US' ? getUSAvailableIngredients() : SERUM_INGREDIENTS;
  }
}

// ============================================================================
// Pricing Functions
// ============================================================================

/**
 * Calculate the effective concentration (base × capsules)
 */
export function getConcentration(ingredient: SerumIngredient): number {
  return ingredient.baseConcentration * ingredient.capsules;
}

/**
 * Format concentration for display (e.g., "4.0%")
 */
export function formatConcentration(ingredient: SerumIngredient): string {
  const concentration = getConcentration(ingredient);
  // Show 1 decimal place, or none if it's a whole number
  return concentration % 1 === 0
    ? `${concentration}%`
    : `${concentration.toFixed(1)}%`;
}

/**
 * Count total capsules in a serum configuration
 */
export function countTotalCapsules(config: SerumConfiguration): number {
  return config.serums.reduce(
    (total, serum) =>
      total + serum.ingredients.reduce((sum, ing) => sum + ing.capsules, 0),
    0
  );
}

/**
 * Calculate price for a serum configuration
 * Face (duo): $75 + (total capsules × $11)
 * Eye/Neck (solo): $45 + (capsules × $11)
 */
export function calculateSerumPrice(config: SerumConfiguration, country = 'US'): number {
  const pricing = SERUM_PRICING[country as keyof typeof SERUM_PRICING] || SERUM_PRICING.US;
  const totalCapsules = countTotalCapsules(config);

  const baseCents = config.type === 'face' ? pricing.duoBaseCents : pricing.soloBaseCents;
  return baseCents + (totalCapsules * pricing.capsuleCents);
}

/**
 * Calculate total price for all serum configurations
 */
export function calculateTotalSerumPrice(configs: SerumConfiguration[], country = 'US'): number {
  return configs.reduce((total, config) => total + calculateSerumPrice(config, country), 0);
}

/**
 * Format price in dollars
 */
export function formatSerumPrice(priceCents: number): string {
  return `$${(priceCents / 100).toFixed(0)}`;
}

/**
 * Calculate price per month for a serum configuration
 */
export function calculatePricePerMonth(config: SerumConfiguration, country = 'US'): number {
  const totalPrice = calculateSerumPrice(config, country);
  const months = SERUM_DURATION_DAYS / 30;
  return Math.round(totalPrice / months);
}

// ============================================================================
// Configuration Helpers
// ============================================================================

/**
 * Get max ingredients allowed per serum based on option
 */
export function getMaxIngredientsForOption(type: SerumType, option: string): number {
  if (type === 'face') {
    switch (option) {
      case 'clinical':
        return 3; // 3+3
      case 'advanced':
        return 2; // 2+2
      case 'minimalist':
        return 1; // 1+1
      default:
        return 3; // custom defaults to clinical max
    }
  } else {
    // Eye and Neck
    switch (option) {
      case 'advanced':
        return 3;
      case 'minimalist':
        return 1;
      default:
        return 3;
    }
  }
}

/**
 * Get available options for a serum type
 */
export function getOptionsForType(type: SerumType): string[] {
  if (type === 'face') {
    return ['clinical', 'advanced', 'minimalist'];
  }
  return ['advanced', 'minimalist'];
}

/**
 * Create ingredient with default 1 capsule
 */
export function createIngredient(data: SerumIngredientData, capsules: 1 | 2 | 3 = 1): SerumIngredient {
  return {
    id: data.id,
    name: data.name,
    baseConcentration: data.baseConcentration,
    capsules,
    color: data.color,
  };
}

/**
 * Get expected total capsules for a serum type and option
 */
export function getExpectedCapsules(type: SerumType, option: string): { min: number; max: number } {
  if (type === 'face') {
    switch (option) {
      case 'clinical':
        return { min: 6, max: 18 }; // 3+3 with x1, or 3+3 with x3
      case 'advanced':
        return { min: 4, max: 12 }; // 2+2 with x1, or 2+2 with x3
      case 'minimalist':
        return { min: 2, max: 6 }; // 1+1 with x1, or 1+1 with x3
      default:
        return { min: 2, max: 18 };
    }
  } else {
    switch (option) {
      case 'advanced':
        return { min: 3, max: 9 }; // 3 with x1 to x3
      case 'minimalist':
        return { min: 1, max: 3 }; // 1 with x1 to x3
      default:
        return { min: 1, max: 9 };
    }
  }
}
