/**
 * Mock Serum Recommendations Generator
 *
 * Generates realistic mock AI responses for personalized serum recommendations.
 * Used for testing and development until the real API is integrated.
 */

import {
  SerumIngredient,
  SerumConfiguration,
  SerumRecommendationsResponse,
  IngredientRecommendation,
  IngredientCategory,
} from '@/types';
import { SERUM_INGREDIENTS, getUSAvailableIngredients, createIngredient } from './serumIngredients';

// ============================================================================
// Mock Recommendation Categories
// ============================================================================

// Ingredients grouped by recommendation level for a typical "anti-aging + redness" profile
const MOCK_HIGHLY_RECOMMENDED = ['niacinamide', 'madecassoside', 'sod'];
const MOCK_RECOMMENDED = ['zinc', 'd-panthenol', 'vitamin-c'];
const MOCK_CAN_BE_USED = ['ferulic-acid', 'dmae', 'arbutin', 'tranexamic-acid', 'rutin-tx', 'azelaic-acid', 'lactopeptide'];
const MOCK_SHOULD_NOT_BE_USED = ['isoflavones', 'kojic-acid']; // e.g., due to sensitivity
const MOCK_CANNOT_BE_USED = ['retinal', 'glycolic-acid', 'salicylic-acid']; // e.g., pregnancy/exfoliant sensitivity

// ============================================================================
// Mock Data Generator
// ============================================================================

/**
 * Generate mock ingredient recommendations based on available ingredients
 */
export function generateMockIngredientRecommendations(): IngredientRecommendation[] {
  const availableIngredients = getUSAvailableIngredients();
  const recommendations: IngredientRecommendation[] = [];

  for (const ingredient of availableIngredients) {
    let category: IngredientCategory;

    if (MOCK_HIGHLY_RECOMMENDED.includes(ingredient.id)) {
      category = 'highly_recommended';
    } else if (MOCK_RECOMMENDED.includes(ingredient.id)) {
      category = 'recommended';
    } else if (MOCK_SHOULD_NOT_BE_USED.includes(ingredient.id)) {
      category = 'should_not_be_used';
    } else if (MOCK_CANNOT_BE_USED.includes(ingredient.id)) {
      category = 'cannot_be_used';
    } else {
      category = 'can_be_used';
    }

    recommendations.push({ ingredient, category });
  }

  // Sort by category priority
  const categoryOrder: Record<IngredientCategory, number> = {
    highly_recommended: 0,
    recommended: 1,
    can_be_used: 2,
    should_not_be_used: 3,
    cannot_be_used: 4,
  };

  return recommendations.sort((a, b) => categoryOrder[a.category] - categoryOrder[b.category]);
}

/**
 * Get ingredient data by ID
 */
function getIngredient(id: string): typeof SERUM_INGREDIENTS[0] | undefined {
  return SERUM_INGREDIENTS.find((i) => i.id === id);
}

// ============================================================================
// Serum Descriptions
// ============================================================================

const FACE_DESCRIPTIONS = {
  clinical: `We selected the Clinical serum option for you because it offers a comprehensive approach to address your key skin concerns, especially dryness and dehydration, mild redness, and early oxidative stress. Your skin's natural thinness makes it more vulnerable to moisture loss and sensitivity, so this formulation focuses on strengthening the skin barrier, soothing inflammation, and protecting against environmental damage. The morning serum combines powerful antioxidants like Vitamin C and SOD to brighten your complexion, even out tone, and combat oxidative stress, while Niacinamide supports barrier function. In the evening, ingredients like Madecassoside, D-Panthenol, and Zinc work synergistically to reduce redness, regulate oiliness in your T-zone, and enhance hydration and barrier function.`,
  advanced: `The Advanced serum option provides a balanced approach for your skin concerns with a focus on brightening and barrier repair. The morning serum features Niacinamide at double concentration for enhanced barrier support and Vitamin C for antioxidant protection and radiance. The evening formula combines Madecassoside to calm and repair with D-Panthenol for deep hydration. This option is ideal if you prefer a more streamlined routine while still addressing multiple concerns effectively.`,
  minimalist: `The Minimalist serum option delivers targeted care with carefully selected hero ingredients. Your morning serum focuses on Niacinamide at enhanced concentration to strengthen your barrier and regulate sebum production. The evening serum features Madecassoside to soothe and repair overnight. This approach is perfect if you prefer simplicity or have sensitive skin that responds better to fewer active ingredients.`,
};

const EYE_DESCRIPTIONS = {
  advanced: `This eye contour serum addresses puffiness, fine lines, and dark circles with a synergistic blend of actives. DMAE provides an immediate firming effect, D-Panthenol deeply hydrates the delicate eye area, and Niacinamide strengthens the skin barrier while reducing discoloration. Apply morning and evening for best results.`,
  minimalist: `A targeted eye treatment featuring DMAE at enhanced concentration for visible firming and lifting of the delicate eye contour area. This streamlined formula is ideal for those who prefer minimal product layering or have sensitive skin around the eyes.`,
};

const NECK_DESCRIPTIONS = {
  advanced: `This neck and décolleté serum targets sagging, crepey texture, and uneven tone common in this often-neglected area. Niacinamide improves elasticity and evens skin tone, SOD provides powerful antioxidant protection, and Madecassoside promotes collagen synthesis and soothes the skin. Apply morning and evening, extending from jawline to chest.`,
  minimalist: `A focused treatment for the neck and décolleté featuring Niacinamide at double concentration to improve skin texture, firmness, and tone. This efficient formula addresses the key concerns of this delicate area without overwhelming the skin.`,
};

/**
 * Generate mock serum recommendations
 */
export function generateMockSerumRecommendations(): SerumRecommendationsResponse {
  // Face serums - always included
  const treatFace = {
    clinical: {
      am: [
        createIngredient(getIngredient('niacinamide')!, 2),  // x2 for higher efficacy
        createIngredient(getIngredient('sod')!, 1),
        createIngredient(getIngredient('vitamin-c')!, 1),
      ],
      pm: [
        createIngredient(getIngredient('madecassoside')!, 2),
        createIngredient(getIngredient('d-panthenol')!, 1),
        createIngredient(getIngredient('zinc')!, 1),
      ],
      description: FACE_DESCRIPTIONS.clinical,
    },
    advanced: {
      am: [
        createIngredient(getIngredient('niacinamide')!, 2),
        createIngredient(getIngredient('vitamin-c')!, 1),
      ],
      pm: [
        createIngredient(getIngredient('madecassoside')!, 1),
        createIngredient(getIngredient('d-panthenol')!, 1),
      ],
      description: FACE_DESCRIPTIONS.advanced,
    },
    minimalist: {
      am: [
        createIngredient(getIngredient('niacinamide')!, 2),
      ],
      pm: [
        createIngredient(getIngredient('madecassoside')!, 1),
      ],
      description: FACE_DESCRIPTIONS.minimalist,
    },
  };

  // Eye serums - include for patients with eye contour concerns
  const treatEyes = {
    advanced: {
      ingredients: [
        createIngredient(getIngredient('dmae')!, 1),
        createIngredient(getIngredient('d-panthenol')!, 1),
        createIngredient(getIngredient('niacinamide')!, 1),
      ],
      description: EYE_DESCRIPTIONS.advanced,
    },
    minimalist: {
      ingredients: [
        createIngredient(getIngredient('dmae')!, 2),
      ],
      description: EYE_DESCRIPTIONS.minimalist,
    },
  };

  // Neck serums - include for patients with neck concerns
  const treatNeck = {
    advanced: {
      ingredients: [
        createIngredient(getIngredient('niacinamide')!, 1),
        createIngredient(getIngredient('sod')!, 1),
        createIngredient(getIngredient('madecassoside')!, 1),
      ],
      description: NECK_DESCRIPTIONS.advanced,
    },
    minimalist: {
      ingredients: [
        createIngredient(getIngredient('niacinamide')!, 2),
      ],
      description: NECK_DESCRIPTIONS.minimalist,
    },
  };

  return {
    treatFace,
    treatEyes,
    treatNeck,
    ingredientRecommendations: generateMockIngredientRecommendations(),
  };
}

/**
 * Convert mock response to initial serum configurations
 */
export function createInitialSerumConfigs(
  response: SerumRecommendationsResponse,
  defaultOption: 'clinical' | 'advanced' | 'minimalist' = 'clinical'
): SerumConfiguration[] {
  const configs: SerumConfiguration[] = [];

  // Face config (always included)
  const faceOption = defaultOption;
  const faceData = response.treatFace[faceOption];
  configs.push({
    type: 'face',
    option: faceOption,
    serums: [
      { timeOfDay: 'AM', ingredients: [...faceData.am] },
      { timeOfDay: 'PM', ingredients: [...faceData.pm] },
    ],
    isAiRecommended: true,
    description: faceData.description,
  });

  // Eye config (if recommended)
  if (response.treatEyes) {
    const eyeOption = defaultOption === 'clinical' ? 'advanced' : defaultOption;
    const eyeData = response.treatEyes[eyeOption as 'advanced' | 'minimalist'];
    configs.push({
      type: 'eye',
      option: eyeOption,
      serums: [{ timeOfDay: 'AM&PM', ingredients: [...eyeData.ingredients] }],
      isAiRecommended: true,
      description: eyeData.description,
    });
  }

  // Neck config (if recommended)
  if (response.treatNeck) {
    const neckOption = defaultOption === 'clinical' ? 'advanced' : defaultOption;
    const neckData = response.treatNeck[neckOption as 'advanced' | 'minimalist'];
    configs.push({
      type: 'neck',
      option: neckOption,
      serums: [{ timeOfDay: 'AM&PM', ingredients: [...neckData.ingredients] }],
      isAiRecommended: true,
      description: neckData.description,
    });
  }

  return configs;
}

/**
 * Update configuration when option changes
 */
export function updateConfigForOption(
  response: SerumRecommendationsResponse,
  type: 'face' | 'eye' | 'neck',
  newOption: 'clinical' | 'advanced' | 'minimalist'
): SerumConfiguration {
  if (type === 'face') {
    const faceData = response.treatFace[newOption];
    return {
      type: 'face',
      option: newOption,
      serums: [
        { timeOfDay: 'AM', ingredients: [...faceData.am] },
        { timeOfDay: 'PM', ingredients: [...faceData.pm] },
      ],
      isAiRecommended: true,
      description: faceData.description,
    };
  }

  // Eye and Neck don't have 'clinical' option
  const effectiveOption = newOption === 'clinical' ? 'advanced' : newOption;

  if (type === 'eye' && response.treatEyes) {
    const eyeData = response.treatEyes[effectiveOption as 'advanced' | 'minimalist'];
    return {
      type: 'eye',
      option: effectiveOption,
      serums: [{ timeOfDay: 'AM&PM', ingredients: [...eyeData.ingredients] }],
      isAiRecommended: true,
      description: eyeData.description,
    };
  }

  if (type === 'neck' && response.treatNeck) {
    const neckData = response.treatNeck[effectiveOption as 'advanced' | 'minimalist'];
    return {
      type: 'neck',
      option: effectiveOption,
      serums: [{ timeOfDay: 'AM&PM', ingredients: [...neckData.ingredients] }],
      isAiRecommended: true,
      description: neckData.description,
    };
  }

  // Fallback - should not happen
  return {
    type,
    option: effectiveOption,
    serums: [{ timeOfDay: 'AM&PM', ingredients: [] }],
    isAiRecommended: false,
    description: '',
  };
}
