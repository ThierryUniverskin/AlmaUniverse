/**
 * Skin Wellness Categories
 *
 * Defines the 10 appearance categories for cosmetic skin analysis visualization.
 * These categories describe visible surface features only - NO medical terminology.
 *
 * CRITICAL: Category order is FIXED and must never be sorted by value.
 * Numbers are internal only - never shown to users.
 */

export interface SkinWellnessCategory {
  id: string;
  name: string;
  color: string; // Hex color for visualization
  order: number; // Fixed position (1-10), never changes
}

/**
 * 10 Appearance Categories with Fixed Order and Colors
 *
 * Order matches the clockwise arrangement in the flower visualization.
 * Colors are carefully chosen to be distinct and non-medical.
 */
export const SKIN_WELLNESS_CATEGORIES: SkinWellnessCategory[] = [
  { id: 'radiance', name: 'Skin Radiance', color: '#D4A84B', order: 1 },         // vibrant yellow
  { id: 'smoothness', name: 'Skin Aging', color: '#D668B0', order: 2 },  // vibrant pink
  { id: 'redness', name: 'Visible Redness', color: '#C13050', order: 3 },        // vibrant red
  { id: 'hydration', name: 'Hydration Appearance', color: '#4A9BE8', order: 4 }, // vibrant blue
  { id: 'shine', name: 'Shine Appearance', color: '#E07030', order: 5 },         // vibrant orange
  { id: 'texture', name: 'Skin Texture', color: '#A89880', order: 6 },           // warm grey
  { id: 'blemishes', name: 'Visible Blemishes', color: '#2DA850', order: 7 },    // vibrant green
  { id: 'tone', name: 'Uneven Tone & Dark Spots', color: '#8B5A2B', order: 8 },  // warm brown
  { id: 'eye-contour', name: 'Eye Contour', color: '#9B7BB8', order: 9 },        // purple
  { id: 'neck-decollete', name: 'Neck & Decollete', color: '#4AA8A0', order: 10 }, // teal
];

/**
 * Visibility Level Labels
 *
 * These are the ONLY labels shown to users.
 * Internal numeric values (0-4) must NEVER be displayed.
 */
export const VISIBILITY_LABELS = [
  'Not visible',
  'Very subtle',
  'Mildly visible',
  'Clearly visible',
  'Prominent',
] as const;

/**
 * Internal visibility level type (0-4)
 * Used for calculations only, never shown to users
 */
export type VisibilityLevel = 0 | 1 | 2 | 3 | 4;

/**
 * Skin analysis result for a single category
 */
export interface SkinAnalysisResult {
  categoryId: string;
  visibilityLevel: VisibilityLevel;
}

/**
 * Image quality assessment
 */
export interface ImageQualityAssessment {
  qualityScore: number; // 1-10
  clearImage: string;
  lighting: string;
  focus: string;
  trueColors: string;
  background: string;
  preparation: string;
  resultsSummary: string;
  tipsToImprove: string;
}

/**
 * Patient attributes detected by AI
 */
export interface PatientAttributes {
  gender: 'male' | 'female' | 'other';
  eyeColor: 'brown' | 'blue' | 'green' | 'hazel' | 'gray' | 'amber';
  fitzpatrickType: 'I' | 'II' | 'III' | 'IV' | 'V' | 'VI';
  skinThickness: 'thin' | 'thick';
  skinType: 'normal' | 'dry' | 'oily' | 'combination' | 'sensitive';
}

/**
 * Complete skin wellness analysis result
 */
export interface SkinWellnessAnalysis {
  categories: SkinAnalysisResult[];
  skinHealthOverview: string;
  imageQuality: ImageQualityAssessment;
  patientAttributes: PatientAttributes;
}

/**
 * Get visibility label from internal level
 * Use this to convert internal values to user-facing text
 */
export function getVisibilityLabel(level: VisibilityLevel): string {
  return VISIBILITY_LABELS[level];
}

/**
 * Get category by ID
 */
export function getCategoryById(id: string): SkinWellnessCategory | undefined {
  return SKIN_WELLNESS_CATEGORIES.find((cat) => cat.id === id);
}

/**
 * Get category by order (1-based)
 */
export function getCategoryByOrder(order: number): SkinWellnessCategory | undefined {
  return SKIN_WELLNESS_CATEGORIES.find((cat) => cat.order === order);
}

/**
 * Petal size calculation
 *
 * Converts visibility level to petal length percentage.
 * Even "not visible" shows a minimal dot (20%) to indicate the category exists.
 */
export function getPetalSizePercent(level: VisibilityLevel): number {
  const sizeMap: Record<VisibilityLevel, number> = {
    0: 20, // Not visible - minimal dot
    1: 40, // Very subtle
    2: 60, // Mildly visible
    3: 80, // Clearly visible
    4: 100, // Prominent - full petal
  };
  return sizeMap[level];
}
