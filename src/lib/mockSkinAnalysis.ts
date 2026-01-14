/**
 * Mock Skin Analysis Data Generator
 *
 * Generates fake skin analysis results for v1 implementation.
 * Uses a seeded random number generator for consistent results per photoSessionId.
 *
 * NO REAL AI - This is purely for UX validation.
 * NO DATABASE PERSISTENCE - Results are generated on the fly.
 */

import {
  SKIN_WELLNESS_CATEGORIES,
  SkinAnalysisResult,
  SkinWellnessAnalysis,
  ImageQualityAssessment,
  PatientAttributes,
  VisibilityLevel,
} from './skinWellnessCategories';

/**
 * Simple seeded random number generator
 * Using a linear congruential generator (LCG)
 */
function createSeededRandom(seed: string): () => number {
  // Convert string seed to numeric hash
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }

  // LCG parameters (same as glibc)
  const a = 1103515245;
  const c = 12345;
  const m = Math.pow(2, 31);

  let current = Math.abs(hash);

  return () => {
    current = (a * current + c) % m;
    return current / m;
  };
}

/**
 * Generate mock analysis results for all categories
 *
 * @param photoSessionId - Used as seed for consistent results
 * @returns Array of results for all 10 categories with dysfunction scores 0-10
 */
export function generateMockAnalysis(photoSessionId: string): SkinAnalysisResult[] {
  const random = createSeededRandom(photoSessionId);

  return SKIN_WELLNESS_CATEGORIES.map((category) => {
    // Generate a random dysfunction score (0-10)
    // Weighted towards middle values to look more realistic
    // Distribution: 0 (Optimal) rare, 1-6 (mid-range) most common, 7-10 (Focus Area) less common
    const rawRandom = random();
    let visibilityLevel: VisibilityLevel;

    if (rawRandom < 0.05) {
      visibilityLevel = 0;  // 5% - Optimal
    } else if (rawRandom < 0.12) {
      visibilityLevel = 1;  // 7% - Needs Improvement (low)
    } else if (rawRandom < 0.22) {
      visibilityLevel = 2;  // 10%
    } else if (rawRandom < 0.35) {
      visibilityLevel = 3;  // 13%
    } else if (rawRandom < 0.50) {
      visibilityLevel = 4;  // 15% - Attention Needed (low)
    } else if (rawRandom < 0.65) {
      visibilityLevel = 5;  // 15%
    } else if (rawRandom < 0.78) {
      visibilityLevel = 6;  // 13%
    } else if (rawRandom < 0.88) {
      visibilityLevel = 7;  // 10% - Focus Area (low)
    } else if (rawRandom < 0.95) {
      visibilityLevel = 8;  // 7%
    } else if (rawRandom < 0.98) {
      visibilityLevel = 9;  // 3%
    } else {
      visibilityLevel = 10; // 2% - Maximum concern
    }

    return {
      categoryId: category.id,
      visibilityLevel,
    };
  });
}

/**
 * Get mock analysis for a specific category
 *
 * @param photoSessionId - Used as seed
 * @param categoryId - Category to retrieve
 * @returns Single result or undefined if category not found
 */
export function getMockAnalysisForCategory(
  photoSessionId: string,
  categoryId: string
): SkinAnalysisResult | undefined {
  const allResults = generateMockAnalysis(photoSessionId);
  return allResults.find((r) => r.categoryId === categoryId);
}

/**
 * Pre-defined mock results for demo/testing
 * Use this when you want consistent, visually balanced results
 * Scale: 0 (Optimal), 1-3 (Needs Improvement), 4-6 (Attention Needed), 7-10 (Focus Area)
 */
export const DEMO_ANALYSIS_RESULTS: SkinAnalysisResult[] = [
  { categoryId: 'radiance', visibilityLevel: 3 },        // Needs Improvement
  { categoryId: 'smoothness', visibilityLevel: 5 },      // Attention Needed
  { categoryId: 'redness', visibilityLevel: 2 },         // Needs Improvement
  { categoryId: 'hydration', visibilityLevel: 4 },       // Attention Needed
  { categoryId: 'shine', visibilityLevel: 6 },           // Attention Needed
  { categoryId: 'texture', visibilityLevel: 4 },         // Attention Needed
  { categoryId: 'blemishes', visibilityLevel: 1 },       // Needs Improvement
  { categoryId: 'tone', visibilityLevel: 5 },            // Attention Needed
  { categoryId: 'eye-contour', visibilityLevel: 7 },     // Focus Area
  { categoryId: 'neck-decollete', visibilityLevel: 2 },  // Needs Improvement
];

/**
 * Mock skin health overview messages
 */
const SKIN_HEALTH_OVERVIEWS = [
  "Your skin appears generally healthy and well-maintained, with good overall radiance and hydration. Some mild variations in texture and tone are visible, which are common and can be addressed with consistent skincare. Your complexion shows a nice natural glow.",
  "Your skin is generally healthy and youthful, with no signs of premature aging or dehydration. However, there are a few areas that need attention, especially mild surface texture variations and some associated redness, as well as slight uneven tone. Focusing on these concerns will help improve your skin's clarity and overall appearance.",
  "Overall, your skin displays a healthy foundation with balanced hydration levels. Some visible texture and mild blemishes are present, which are typical and treatable. Your skin tone is relatively even with minor variations that can be smoothed with targeted care.",
  "Your complexion shows good underlying health with adequate moisture levels. There are some areas of visible texture and subtle tone variations that could benefit from attention. The skin around your eyes appears well-maintained, and your overall radiance is good.",
  "Your skin presents with a healthy baseline and natural luminosity. Some mild surface irregularities and subtle redness are visible, which are common concerns. With proper care, these areas can be improved while maintaining your skin's natural healthy appearance.",
];

/**
 * Mock image quality assessments
 */
const IMAGE_QUALITY_PRESETS: ImageQualityAssessment[] = [
  {
    qualityScore: 10,
    clearImage: "The image is high resolution and very clear, allowing for detailed visualization of the skin texture and features. No pixelation or significant blur is present.",
    lighting: "Lighting is even and natural, with no harsh shadows or bright spots on the face. The illumination is well-distributed across all areas.",
    focus: "The image is sharply focused, with all areas of the face clearly visible and well-defined.",
    trueColors: "Colors appear true-to-life with no evidence of post-processing filters. Skin tones are accurately represented.",
    background: "The background is neutral and unobtrusive, ensuring full attention is on the face.",
    preparation: "The face is free of makeup, eyeglasses, and hats. Hair is pulled back, and the entire face is fully visible with no obstructions.",
    resultsSummary: "Your photo meets all the essential guidelines for a high-quality skin assessment image. The clarity, lighting, focus, color accuracy, background, and preparation are all excellent.",
    tipsToImprove: "No improvements needed. Continue to use similar conditions for future photos to maintain this high standard.",
  },
  {
    qualityScore: 8,
    clearImage: "The image has good resolution with clear visibility of most skin features. Minor softness in some areas but overall quite usable.",
    lighting: "Lighting is generally good with even distribution. Slight shadows under the eyes but not affecting assessment quality.",
    focus: "Good focus across most of the face. Edges are slightly softer but central features are well-defined.",
    trueColors: "Colors are accurate with natural skin tone representation. No visible filters applied.",
    background: "Background is appropriate and doesn't distract from the subject.",
    preparation: "Face is properly prepared with minimal obstructions. Good visibility of key areas.",
    resultsSummary: "Your photo is of good quality and suitable for skin assessment. Minor improvements could enhance future captures.",
    tipsToImprove: "Consider slightly brighter, more even lighting and ensure the camera is held steady to improve sharpness.",
  },
  {
    qualityScore: 6,
    clearImage: "The image has adequate resolution but some areas lack detail. Slight blur affects texture visibility in certain zones.",
    lighting: "Lighting is somewhat uneven with visible shadows on one side. This may affect accurate assessment of that area.",
    focus: "Focus is acceptable but not optimal. Some facial areas appear slightly soft.",
    trueColors: "Colors are mostly accurate though slight warmth is detected. Skin tones are reasonably represented.",
    background: "Background is acceptable but slightly busy in areas.",
    preparation: "Face is mostly visible though hair partially covers forehead edges.",
    resultsSummary: "Your photo is usable for basic skin assessment but could be improved for more accurate results.",
    tipsToImprove: "Use natural daylight facing a window, hold camera steadier, and ensure hair is fully pulled back from face.",
  },
];

/**
 * Generate mock image quality assessment
 */
export function generateMockImageQuality(photoSessionId: string): ImageQualityAssessment {
  const random = createSeededRandom(photoSessionId + '-quality');
  const randomValue = random();

  // Bias towards higher quality (most photos should be decent)
  if (randomValue < 0.6) {
    return IMAGE_QUALITY_PRESETS[0]; // 60% get perfect score
  } else if (randomValue < 0.9) {
    return IMAGE_QUALITY_PRESETS[1]; // 30% get good score
  } else {
    return IMAGE_QUALITY_PRESETS[2]; // 10% get acceptable score
  }
}

/**
 * Generate mock skin health overview
 */
export function generateMockSkinHealthOverview(photoSessionId: string): string {
  const random = createSeededRandom(photoSessionId + '-health');
  const index = Math.floor(random() * SKIN_HEALTH_OVERVIEWS.length);
  return SKIN_HEALTH_OVERVIEWS[index];
}

/**
 * Generate mock patient attributes
 */
export function generateMockPatientAttributes(photoSessionId: string): PatientAttributes {
  const random = createSeededRandom(photoSessionId + '-attributes');

  const genders: PatientAttributes['gender'][] = ['male', 'female', 'other'];
  const eyeColors: PatientAttributes['eyeColor'][] = ['brown', 'blue', 'green', 'hazel', 'gray', 'amber'];
  const fitzTypes: PatientAttributes['fitzpatrickType'][] = ['I', 'II', 'III', 'IV', 'V', 'VI'];
  const skinThicknesses: PatientAttributes['skinThickness'][] = ['thin', 'thick'];
  const skinTypes: PatientAttributes['skinType'][] = ['normal', 'dry', 'oily', 'combination', 'sensitive'];

  return {
    gender: genders[Math.floor(random() * genders.length)],
    eyeColor: eyeColors[Math.floor(random() * eyeColors.length)],
    fitzpatrickType: fitzTypes[Math.floor(random() * fitzTypes.length)],
    skinThickness: skinThicknesses[Math.floor(random() * skinThicknesses.length)],
    skinType: skinTypes[Math.floor(random() * skinTypes.length)],
  };
}

/**
 * Generate complete skin wellness analysis
 */
export function generateFullAnalysis(photoSessionId: string): SkinWellnessAnalysis {
  return {
    categories: generateMockAnalysis(photoSessionId),
    skinHealthOverview: generateMockSkinHealthOverview(photoSessionId),
    imageQuality: generateMockImageQuality(photoSessionId),
    patientAttributes: generateMockPatientAttributes(photoSessionId),
  };
}
