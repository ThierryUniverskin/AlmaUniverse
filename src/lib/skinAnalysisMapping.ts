/**
 * SkinXS API Response Mapping
 *
 * Maps the SkinXS diagnostic API response to our internal data structures.
 */

import type { PatientAttributes, ImageQualityAssessment } from './skinWellnessCategories';
import type { SkinWellnessDetail } from './skinWellnessDetails';

// ============================================================================
// API Response Types
// ============================================================================

export interface SkinXSApiResponse {
  diagnostic_id: string;
  diagnostic_creation_date: string;
  language: string;
  diagnostic: SkinXSDiagnostic;
}

export interface SkinXSDiagnostic {
  characteristics: SkinXSCharacteristics;
  characteristics_translated?: SkinXSCharacteristicsTranslated;
  summary: SkinXSSummary;
  scores: SkinXSScores;
  yellow: SkinXSCategoryData;
  pink: SkinXSCategoryData;
  red: SkinXSCategoryData;
  blue: SkinXSCategoryData;
  orange: SkinXSCategoryData;
  grey: SkinXSCategoryData;
  green: SkinXSCategoryData;
  brown: SkinXSCategoryData;
  eye: SkinXSCategoryData;
  neck: SkinXSCategoryData;
  image_quality: SkinXSImageQuality;
}

export interface SkinXSCharacteristics {
  gender: string;
  age_group: string;
  estimated_age: number;
  ethnicity: string;
  eye_color: string;
  hair_color: string;
  phototype: number;
  skin_thickness: string;
  skin_type: string;
  skin_age: string;
}

export interface SkinXSCharacteristicsTranslated {
  gender: string;
  age_group: string;
  estimated_age: number;
  ethnicity: string;
  eye_color: string;
  hair_color: string;
  phototype: string;
  skin_thickness: string;
  skin_type: string;
  skin_age: string;
}

export interface SkinXSSummary {
  skin_health: string;
  skin_concerns_priority: string[];
}

export interface SkinXSScores {
  yellow: number;
  pink: number;
  red: number;
  blue: number;
  orange: number;
  grey: number;
  green: number;
  brown: number;
  eye: number;
  neck: number;
}

export interface SkinXSCategoryData {
  results_summary: string;
  dysfunction_score: number;
  skin_concern_name: string;
  skin_concern_assessment: string;
  [key: string]: string | number | boolean | undefined;
}

export interface SkinXSImageQuality {
  clear_image: string;
  lighting: string;
  focus: string;
  true_colors: string;
  background: string;
  preparation: string;
  results_summary: string;
  quality_score: number;
  tips_to_improve_quality: string;
}

// ============================================================================
// Category Mapping: API color → Our category ID
// ============================================================================

export const API_COLOR_TO_CATEGORY_ID: Record<string, string> = {
  yellow: 'radiance',
  pink: 'smoothness',
  red: 'redness',
  blue: 'hydration',
  orange: 'shine',
  grey: 'texture',
  green: 'blemishes',
  brown: 'tone',
  eye: 'eye-contour',
  neck: 'neck-decollete',
};

export const CATEGORY_ID_TO_API_COLOR: Record<string, string> = {
  radiance: 'yellow',
  smoothness: 'pink',
  redness: 'red',
  hydration: 'blue',
  shine: 'orange',
  texture: 'grey',
  blemishes: 'green',
  tone: 'brown',
  'eye-contour': 'eye',
  'neck-decollete': 'neck',
};

// ============================================================================
// Parameter Mapping: API keys → Our keys
// ============================================================================

// Parameters to extract from each category (text field → our key)
export const CATEGORY_PARAMETERS: Record<string, string[]> = {
  yellow: ['complexion', 'tiredness', 'sun_damage'],
  pink: ['wrinkles', 'fine_lines', 'elasticity_sagging', 'volume'],
  red: [
    'redness_present',
    'couperose_present',
    'is_rosacea',
    'is_sunburn',
    'is_contact_dermatitis',
    'is_eczema',
    'is_psoriasis', // Store but don't display
    'is_infections',
    'is_acne',
    'is_allergic_reaction',
  ],
  blue: [
    'observed_dryness',
    'observed_dehydration',
    'predictive_factors_dryness',
    'predictive_factors_dehydration',
  ],
  orange: ['oiliness', 'pores'],
  grey: ['rough_bumpy_skin', 'dull_skin', 'uneven_skin_texture', 'roughness', 'scarring'],
  green: ['comedones', 'pustules', 'papules', 'nodules', 'cysts'],
  brown: [
    'melasma',
    'post_inflammatory_hyperpigmentation',
    'age_sun_spots',
    'freckles',
    'moles',
    'skin_tone',
    'predictive_factors_hyperpigmentation',
  ],
  eye: ['fine_lines_wrinkles', 'eye_bags', 'hollowed_eyes', 'puffy_eyes', 'dark_circles'],
  neck: [
    'photoaging',
    'hyperpigmentation',
    'dryness_dehydration',
    'textural_changes',
    'elasticity_loss',
    'redness',
    'acne_prone_skin',
  ],
};

// API key normalization (handle hyphen vs underscore differences)
const normalizeApiKey = (key: string): string => {
  // API uses 'fine-lines_wrinkles' but we use 'fine_lines_wrinkles'
  return key.replace(/-/g, '_');
};

// Parameter labels for display
export const PARAMETER_LABELS: Record<string, string> = {
  complexion: 'Complexion',
  tiredness: 'Tiredness Signs',
  sun_damage: 'Sun Damage',
  wrinkles: 'Wrinkles',
  fine_lines: 'Fine Lines',
  elasticity_sagging: 'Elasticity & Sagging',
  volume: 'Volume',
  redness_present: 'Redness Present',
  couperose_present: 'Couperose Present',
  is_rosacea: 'Is the redness due to rosacea?',
  is_sunburn: 'Is the redness due to sunburn?',
  is_contact_dermatitis: 'Is the redness due to contact dermatitis?',
  is_eczema: 'Is the redness due to eczema?',
  is_psoriasis: 'Is the redness due to psoriasis?',
  is_infections: 'Is the redness due to infections?',
  is_acne: 'Is the redness due to acne?',
  is_allergic_reaction: 'Is the redness due to allergic reaction?',
  observed_dryness: 'Observed Dryness',
  observed_dehydration: 'Observed Dehydration',
  predictive_factors_dryness: 'Predictive Factors for Dryness',
  predictive_factors_dehydration: 'Predictive Factors for Dehydration',
  oiliness: 'Oiliness',
  pores: 'Pores',
  rough_bumpy_skin: 'Rough & Bumpy Skin',
  dull_skin: 'Dull Skin',
  uneven_skin_texture: 'Uneven Skin Texture',
  roughness: 'Roughness',
  scarring: 'Scarring',
  comedones: 'Comedones',
  pustules: 'Pustules',
  papules: 'Papules',
  nodules: 'Nodules',
  cysts: 'Cysts',
  melasma: 'Melasma',
  post_inflammatory_hyperpigmentation: 'Post-Inflammatory Hyperpigmentation',
  age_sun_spots: 'Age & Sun Spots',
  freckles: 'Freckles',
  moles: 'Moles',
  skin_tone: 'Skin Tone',
  predictive_factors_hyperpigmentation: 'Predictive Factors for Hyperpigmentation',
  fine_lines_wrinkles: 'Fine Lines & Wrinkles',
  eye_bags: 'Eye Bags',
  hollowed_eyes: 'Hollowed Eyes',
  puffy_eyes: 'Puffy Eyes',
  dark_circles: 'Dark Circles',
  photoaging: 'Photoaging',
  hyperpigmentation: 'Hyperpigmentation',
  dryness_dehydration: 'Dryness & Dehydration',
  textural_changes: 'Textural Changes',
  elasticity_loss: 'Elasticity Loss',
  redness: 'Redness',
  acne_prone_skin: 'Acne-Prone Skin',
};

// Parameters that should not be displayed in the UI
export const HIDDEN_PARAMETERS = new Set(['is_psoriasis']);

// ============================================================================
// Mapping Functions
// ============================================================================

/**
 * Map phototype number to Fitzpatrick roman numeral
 */
export function mapPhototype(phototype: number): PatientAttributes['fitzpatrickType'] {
  const mapping: Record<number, PatientAttributes['fitzpatrickType']> = {
    1: 'I',
    2: 'II',
    3: 'III',
    4: 'IV',
    5: 'V',
    6: 'VI',
  };
  return mapping[phototype] || 'II';
}

/**
 * Map API gender to our gender type
 */
export function mapGender(gender: string): PatientAttributes['gender'] {
  const normalized = gender.toLowerCase();
  if (normalized === 'male') return 'male';
  if (normalized === 'female') return 'female';
  return 'other';
}

/**
 * Map API eye color to our eye color type
 */
export function mapEyeColor(eyeColor: string): PatientAttributes['eyeColor'] {
  const normalized = eyeColor.toLowerCase();
  const mapping: Record<string, PatientAttributes['eyeColor']> = {
    brown: 'brown',
    blue: 'blue',
    green: 'green',
    hazel: 'hazel',
    gray: 'gray',
    grey: 'gray',
    amber: 'amber',
  };
  return mapping[normalized] || 'brown';
}

/**
 * Map API skin thickness to our type
 */
export function mapSkinThickness(thickness: string): PatientAttributes['skinThickness'] {
  const normalized = thickness.toLowerCase();
  if (normalized === 'thin') return 'thin';
  if (normalized === 'thick') return 'thick';
  return 'thin'; // Default
}

/**
 * Map API skin type to our type
 */
export function mapSkinType(skinType: string): PatientAttributes['skinType'] {
  const normalized = skinType.toLowerCase();
  const mapping: Record<string, PatientAttributes['skinType']> = {
    normal: 'normal',
    dry: 'dry',
    oily: 'oily',
    combination: 'combination',
    sensitive: 'sensitive',
  };
  return mapping[normalized] || 'normal';
}

/**
 * Map API characteristics to PatientAttributes
 */
export function mapPatientAttributes(characteristics: SkinXSCharacteristics): PatientAttributes {
  return {
    gender: mapGender(characteristics.gender),
    eyeColor: mapEyeColor(characteristics.eye_color),
    fitzpatrickType: mapPhototype(characteristics.phototype),
    skinThickness: mapSkinThickness(characteristics.skin_thickness),
    skinType: mapSkinType(characteristics.skin_type),
  };
}

/**
 * Extract category details (parameters with descriptions and scores)
 */
export function extractCategoryDetails(
  categoryData: SkinXSCategoryData,
  apiColor: string
): SkinWellnessDetail[] {
  const parameters = CATEGORY_PARAMETERS[apiColor] || [];
  const details: SkinWellnessDetail[] = [];

  for (const paramKey of parameters) {
    // Get the description text (paramKey as text field)
    const description = categoryData[paramKey];
    // Get the multichoice score (paramKey_multichoices)
    const scoreKey = `${paramKey}_multichoices`;
    const score = categoryData[scoreKey];

    // Handle API key normalization for eye category
    let actualKey = paramKey;
    if (apiColor === 'eye' && paramKey === 'fine_lines_wrinkles') {
      // API might use 'fine-lines_wrinkles'
      const altDescription = categoryData['fine-lines_wrinkles'];
      const altScore = categoryData['fine-lines_wrinkles_multichoices'];
      if (altDescription !== undefined) {
        details.push({
          key: 'fine_lines_wrinkles',
          label: PARAMETER_LABELS['fine_lines_wrinkles'] || paramKey,
          description: String(altDescription),
          scoreValue: typeof altScore === 'number' ? altScore : 1,
          aiScoreValue: typeof altScore === 'number' ? altScore : 1,
        });
        continue;
      }
    }

    if (typeof description === 'string' && typeof score === 'number') {
      details.push({
        key: normalizeApiKey(actualKey),
        label: PARAMETER_LABELS[normalizeApiKey(actualKey)] || actualKey,
        description: description,
        scoreValue: score,
        aiScoreValue: score,
      });
    }
  }

  return details;
}

/**
 * Extract all parameter multichoice scores for database storage
 */
export function extractParameterScores(diagnostic: SkinXSDiagnostic): Record<string, number> {
  const scores: Record<string, number> = {};
  const apiColors = ['yellow', 'pink', 'red', 'blue', 'orange', 'grey', 'green', 'brown', 'eye', 'neck'];

  for (const color of apiColors) {
    const categoryData = diagnostic[color as keyof SkinXSDiagnostic] as SkinXSCategoryData;
    if (!categoryData) continue;

    const parameters = CATEGORY_PARAMETERS[color] || [];
    for (const paramKey of parameters) {
      const scoreKey = `${paramKey}_multichoices`;
      const score = categoryData[scoreKey];

      // Handle API key variations
      let normalizedKey = normalizeApiKey(paramKey);
      if (typeof score === 'number') {
        scores[normalizedKey] = score;
      } else {
        // Try alternative key format (e.g., fine-lines_wrinkles)
        const altKey = paramKey.replace(/_/g, '-');
        const altScoreKey = `${altKey}_multichoices`;
        const altScore = categoryData[altScoreKey];
        if (typeof altScore === 'number') {
          scores[normalizedKey] = altScore;
        }
      }
    }
  }

  return scores;
}

/**
 * Map image quality data
 */
export function mapImageQuality(imageQuality: SkinXSImageQuality): ImageQualityAssessment {
  return {
    qualityScore: imageQuality.quality_score,
    clearImage: imageQuality.clear_image,
    lighting: imageQuality.lighting,
    focus: imageQuality.focus,
    trueColors: imageQuality.true_colors,
    background: imageQuality.background,
    preparation: imageQuality.preparation,
    resultsSummary: imageQuality.results_summary,
    tipsToImprove: imageQuality.tips_to_improve_quality,
  };
}

/**
 * Map category scores from API to our structure
 */
export function mapCategoryScores(scores: SkinXSScores): Record<string, number> {
  return {
    radiance: scores.yellow,
    smoothness: scores.pink,
    redness: scores.red,
    hydration: scores.blue,
    shine: scores.orange,
    texture: scores.grey,
    blemishes: scores.green,
    tone: scores.brown,
    'eye-contour': scores.eye,
    'neck-decollete': scores.neck,
  };
}

/**
 * Get all category details from the API response
 */
export function getAllCategoryDetails(
  diagnostic: SkinXSDiagnostic
): Record<string, SkinWellnessDetail[]> {
  const allDetails: Record<string, SkinWellnessDetail[]> = {};
  const apiColors = ['yellow', 'pink', 'red', 'blue', 'orange', 'grey', 'green', 'brown', 'eye', 'neck'];

  for (const color of apiColors) {
    const categoryId = API_COLOR_TO_CATEGORY_ID[color];
    const categoryData = diagnostic[color as keyof SkinXSDiagnostic] as SkinXSCategoryData;

    if (categoryData) {
      allDetails[categoryId] = extractCategoryDetails(categoryData, color);
    }
  }

  return allDetails;
}

/**
 * Parse full API response into database-ready format
 */
export interface ParsedAnalysisResult {
  diagnosticId: string;
  apiLanguage: string;
  rawResponse: SkinXSDiagnostic;
  rawResponseTranslated: SkinXSCharacteristicsTranslated | null;

  // Patient attributes
  gender: string;
  ageGroup: string;
  estimatedAge: number;
  ethnicity: string;
  eyeColor: string;
  hairColor: string;
  phototype: number;
  skinThickness: string;
  skinType: string;
  skinAge: string;

  // Summary
  skinHealthOverview: string;
  priorityConcerns: string[];

  // Category scores
  scoreRadiance: number;
  scoreSmoothness: number;
  scoreRedness: number;
  scoreHydration: number;
  scoreShine: number;
  scoreTexture: number;
  scoreBlemishes: number;
  scoreTone: number;
  scoreEyeContour: number;
  scoreNeckDecollete: number;

  // Parameter scores
  parameterScores: Record<string, number>;

  // Image quality
  imageQualityScore: number;
  imageQualitySummary: string;

  // Mapped data for UI
  patientAttributes: PatientAttributes;
  categoryDetails: Record<string, SkinWellnessDetail[]>;
  imageQuality: ImageQualityAssessment;
}

export function parseApiResponse(response: SkinXSApiResponse): ParsedAnalysisResult {
  const { diagnostic } = response;
  const { characteristics, summary, scores, image_quality } = diagnostic;

  return {
    diagnosticId: response.diagnostic_id,
    apiLanguage: response.language,
    rawResponse: diagnostic,
    rawResponseTranslated: diagnostic.characteristics_translated || null,

    // Patient attributes (raw)
    gender: characteristics.gender,
    ageGroup: characteristics.age_group,
    estimatedAge: characteristics.estimated_age,
    ethnicity: characteristics.ethnicity,
    eyeColor: characteristics.eye_color,
    hairColor: characteristics.hair_color,
    phototype: characteristics.phototype,
    skinThickness: characteristics.skin_thickness,
    skinType: characteristics.skin_type,
    skinAge: characteristics.skin_age,

    // Summary
    skinHealthOverview: summary.skin_health,
    priorityConcerns: summary.skin_concerns_priority,

    // Category scores
    scoreRadiance: scores.yellow,
    scoreSmoothness: scores.pink,
    scoreRedness: scores.red,
    scoreHydration: scores.blue,
    scoreShine: scores.orange,
    scoreTexture: scores.grey,
    scoreBlemishes: scores.green,
    scoreTone: scores.brown,
    scoreEyeContour: scores.eye,
    scoreNeckDecollete: scores.neck,

    // Parameter scores
    parameterScores: extractParameterScores(diagnostic),

    // Image quality
    imageQualityScore: image_quality.quality_score,
    imageQualitySummary: image_quality.results_summary,

    // Mapped for UI
    patientAttributes: mapPatientAttributes(characteristics),
    categoryDetails: getAllCategoryDetails(diagnostic),
    imageQuality: mapImageQuality(image_quality),
  };
}
