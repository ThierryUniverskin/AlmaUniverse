/**
 * Skin Wellness Detail Parameters
 *
 * Detailed sub-parameters for each skin wellness category.
 * These provide more granular cosmetic appearance observations.
 */

export interface SkinWellnessDetail {
  key: string;
  label: string;
  description: string;
}

export interface SkinWellnessCategoryDetails {
  categoryId: string;
  details: SkinWellnessDetail[];
}

/**
 * Mock detailed data for each category
 * In production, this would come from AI analysis
 */
export const MOCK_CATEGORY_DETAILS: Record<string, SkinWellnessDetail[]> = {
  radiance: [
    {
      key: 'complexion',
      label: 'Complexion',
      description: 'Your complexion appears generally even, but there is some mild dullness and a few areas of uneven tone, likely related to mild oxidative stress and acne.',
    },
    {
      key: 'tiredness',
      label: 'Tiredness Signs',
      description: 'There are no prominent signs of skin tiredness such as sagging or pronounced under-eye darkness. The skin looks relatively firm and youthful.',
    },
    {
      key: 'sun_damage',
      label: 'Sun Damage',
      description: 'There are no clear signs of significant sun damage such as marked hyperpigmentation, sun spots, or deep wrinkles. The skin shows minimal visible effects from sun exposure.',
    },
    {
      key: 'results_summary',
      label: 'Summary',
      description: 'Your skin shows mild signs of oxidative stress, mainly in the form of slight dullness and minor unevenness in tone. There are no advanced signs of tiredness or sun damage. Overall, your skin health is good, with only minor early changes that can be improved with antioxidant skincare and sun protection.',
    },
  ],
  smoothness: [
    {
      key: 'texture',
      label: 'Surface Texture',
      description: 'The skin surface shows a generally smooth texture with minor irregularities in some areas.',
    },
    {
      key: 'pores',
      label: 'Pore Appearance',
      description: 'Pores appear minimally visible with no significant enlargement or congestion.',
    },
  ],
  redness: [
    {
      key: 'distribution',
      label: 'Distribution',
      description: 'Mild diffuse redness observed primarily in the cheek area.',
    },
    {
      key: 'intensity',
      label: 'Intensity',
      description: 'Redness appears subtle and does not dominate the overall complexion.',
    },
  ],
  hydration: [
    {
      key: 'moisture_level',
      label: 'Moisture Level',
      description: 'Skin appears adequately hydrated with no visible signs of dryness or flakiness.',
    },
    {
      key: 'plumpness',
      label: 'Plumpness',
      description: 'Good skin plumpness indicating healthy hydration levels.',
    },
  ],
  shine: [
    {
      key: 'oiliness',
      label: 'Oiliness',
      description: 'Moderate shine observed in the T-zone area.',
    },
    {
      key: 'balance',
      label: 'Oil Balance',
      description: 'Oil production appears normal with slight excess in forehead region.',
    },
  ],
  texture: [
    {
      key: 'roughness',
      label: 'Roughness',
      description: 'Minimal surface roughness detected.',
    },
    {
      key: 'fine_lines',
      label: 'Fine Lines',
      description: 'Very subtle fine lines present, consistent with skin age.',
    },
  ],
  blemishes: [
    {
      key: 'active',
      label: 'Active Blemishes',
      description: 'Few minor active blemishes observed.',
    },
    {
      key: 'scarring',
      label: 'Post-Blemish Marks',
      description: 'Minimal post-inflammatory marks visible.',
    },
  ],
  tone: [
    {
      key: 'evenness',
      label: 'Evenness',
      description: 'Generally even skin tone with minor variations.',
    },
    {
      key: 'dark_spots',
      label: 'Dark Spots',
      description: 'Few subtle areas of hyperpigmentation noted.',
    },
  ],
  'eye-contour': [
    {
      key: 'darkness',
      label: 'Under-Eye Darkness',
      description: 'Minimal under-eye darkness visible.',
    },
    {
      key: 'puffiness',
      label: 'Puffiness',
      description: 'No significant puffiness observed.',
    },
  ],
  'neck-decollete': [
    {
      key: 'texture',
      label: 'Texture',
      description: 'Neck skin appears smooth with good elasticity.',
    },
    {
      key: 'tone',
      label: 'Tone Match',
      description: 'Neck tone matches facial complexion well.',
    },
  ],
};

/**
 * Get details for a specific category
 */
export function getCategoryDetails(categoryId: string): SkinWellnessDetail[] {
  return MOCK_CATEGORY_DETAILS[categoryId] || [];
}
