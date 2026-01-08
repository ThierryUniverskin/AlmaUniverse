import { SkinConcern, SkinConcernCategory } from '@/types';

export interface SkinConcernCategoryInfo {
  id: SkinConcernCategory;
  label: string;
}

export const SKIN_CONCERN_CATEGORIES: SkinConcernCategoryInfo[] = [
  { id: 'appearance-texture', label: 'Skin Appearance & Texture' },
  { id: 'pigmentation-color', label: 'Pigmentation & Color' },
  { id: 'vascular-lesional', label: 'Vascular & Lesional' },
  { id: 'scar-lesion', label: 'Scar & Lesion-Related' },
];

export const SKIN_CONCERNS: SkinConcern[] = [
  // Skin Appearance & Texture
  { id: 'acne-active', label: 'Acne vulgaris (active)', category: 'appearance-texture' },
  { id: 'acne-scarring', label: 'Acne scarring / post-acne texture concerns', category: 'appearance-texture' },
  { id: 'wrinkles', label: 'Wrinkles / fine lines', category: 'appearance-texture' },
  { id: 'uneven-texture', label: 'Uneven skin texture / roughness', category: 'appearance-texture' },
  { id: 'skin-laxity', label: 'Skin laxity / mild sagging', category: 'appearance-texture' },
  { id: 'large-pores', label: 'Large or visible pores', category: 'appearance-texture' },

  // Pigmentation & Color
  { id: 'hyperpigmentation', label: 'Hyperpigmentation / dark spots / age spots', category: 'pigmentation-color' },
  { id: 'melasma', label: 'Melasma / persistent discoloration', category: 'pigmentation-color' },
  { id: 'pih', label: 'Post-inflammatory hyperpigmentation (PIH)', category: 'pigmentation-color' },
  { id: 'sun-damage', label: 'Sun damage / photoaged skin (pigment component)', category: 'pigmentation-color' },
  { id: 'rosacea', label: 'Rosacea / facial redness & flushing', category: 'pigmentation-color' },

  // Vascular & Lesional
  { id: 'telangiectasia', label: 'Telangiectasia / visible capillaries', category: 'vascular-lesional' },
  { id: 'vascular-lesions', label: 'Vascular lesions', category: 'vascular-lesional' },
  { id: 'redness-vascular', label: 'Redness with vascular component', category: 'vascular-lesional' },

  // Scar & Lesion-Related
  { id: 'scar-remodeling', label: 'Scar remodeling (surgical, traumatic, etc.)', category: 'scar-lesion' },
  { id: 'stretch-marks', label: 'Stretch mark concerns (clinically documented)', category: 'scar-lesion' },
  { id: 'pigmented-lesions', label: 'Benign pigmented lesions', category: 'scar-lesion' },
];

/**
 * Get concerns by category
 */
export function getConcernsByCategory(category: SkinConcernCategory): SkinConcern[] {
  return SKIN_CONCERNS.filter(concern => concern.category === category);
}

/**
 * Get a concern by its ID
 */
export function getConcernById(id: string): SkinConcern | undefined {
  return SKIN_CONCERNS.find(concern => concern.id === id);
}

/**
 * Get category info by ID
 */
export function getCategoryInfo(categoryId: SkinConcernCategory): SkinConcernCategoryInfo | undefined {
  return SKIN_CONCERN_CATEGORIES.find(cat => cat.id === categoryId);
}
