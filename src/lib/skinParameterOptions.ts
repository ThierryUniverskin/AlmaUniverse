/**
 * Skin Parameter Score Options
 *
 * Standardized text options for each skin parameter score level.
 * These are used when a doctor wants to change the AI-assigned score.
 * The doctor selects from these pre-defined options rather than editing free text.
 */

export type ParameterScoreType = 'severity' | 'conditional';

export interface ScoreOption {
  value: number;
  label: string;
}

export interface ParameterScoreConfig {
  type: ParameterScoreType;
  maxScore: number;
  options: ScoreOption[];
}

/**
 * Get color for severity score (1-4 or 1-5 scale)
 * Lower is better (green), higher is worse (red)
 */
export function getSeverityColor(score: number, maxScore: number): string {
  const ratio = (score - 1) / (maxScore - 1); // 0 to 1
  if (ratio === 0) return '#10B981';      // Green - best
  if (ratio <= 0.33) return '#34D399';    // Light green
  if (ratio <= 0.66) return '#FBBF24';    // Yellow/amber
  if (ratio < 1) return '#F97316';        // Orange
  return '#EF4444';                        // Red - worst
}

/**
 * Get color for conditional score (1-3 scale for "is redness due to X")
 * 1 = No redness, 2 = Not this cause, 3 = Confirmed cause
 */
export function getConditionalColor(score: number): string {
  if (score === 1) return '#9CA3AF';  // Gray - no redness detected
  if (score === 2) return '#3B82F6';  // Blue - redness not due to this
  return '#EF4444';                    // Red - redness due to this condition
}

/**
 * All parameter score configurations
 * Keyed by parameter key (matches SkinWellnessDetail.key)
 */
export const PARAMETER_SCORE_OPTIONS: Record<string, ParameterScoreConfig> = {
  // ============================================
  // RADIANCE (Yellow) - 1-4 scale
  // ============================================
  complexion: {
    type: 'severity',
    maxScore: 4,
    options: [
      { value: 1, label: 'Clear with a healthy glow; no signs of dullness.' },
      { value: 2, label: 'Slight dullness with a minor loss of radiance.' },
      { value: 3, label: 'Dull with noticeable uneven skin tone.' },
      { value: 4, label: 'Pronounced uneven skin tone and early signs of aging.' },
    ],
  },
  tiredness: {
    type: 'severity',
    maxScore: 4,
    options: [
      { value: 1, label: 'Eyes appear refreshed with no dark circles or puffiness.' },
      { value: 2, label: 'Slight dark circles or minimal puffiness under the eyes.' },
      { value: 3, label: 'Noticeable dark circles and puffiness indicating tiredness.' },
      { value: 4, label: 'Pronounced dark circles, puffiness, and sagging skin under the eyes.' },
    ],
  },
  sun_damage: {
    type: 'severity',
    maxScore: 4,
    options: [
      { value: 1, label: 'Even skin tone with no noticeable hyperpigmentation.' },
      { value: 2, label: 'Slight hyperpigmentation or minimal sunspots are present.' },
      { value: 3, label: 'Noticeable hyperpigmentation, sunspots, and uneven skin tone.' },
      { value: 4, label: 'Extensive hyperpigmentation and sunspots. Skin appears aged beyond chronological age.' },
    ],
  },

  // ============================================
  // SKIN AGING (Pink) - 1-4 scale
  // ============================================
  wrinkles: {
    type: 'severity',
    maxScore: 4,
    options: [
      { value: 1, label: 'No visible wrinkles; skin appears smooth.' },
      { value: 2, label: 'Visible wrinkles, especially around the eyes and mouth.' },
      { value: 3, label: 'Deep wrinkles across the forehead, around the eyes, and mouth.' },
      { value: 4, label: 'Extensive deep wrinkles covering most facial areas.' },
    ],
  },
  fine_lines: {
    type: 'severity',
    maxScore: 4,
    options: [
      { value: 1, label: 'No visible fine lines; skin appears smooth and youthful.' },
      { value: 2, label: 'Fine lines are noticeable around the eyes and mouth.' },
      { value: 3, label: 'Fine lines are prominent and appear in multiple facial areas.' },
      { value: 4, label: 'Extensive fine lines across the face.' },
    ],
  },
  elasticity_sagging: {
    type: 'severity',
    maxScore: 4,
    options: [
      { value: 1, label: 'Skin is firm and elastic; no sagging observed.' },
      { value: 2, label: 'Slight loss of elasticity; skin bounces back when gently pinched.' },
      { value: 3, label: 'Mild sagging observed, particularly around the jawline and cheeks.' },
      { value: 4, label: 'Extensive sagging and drooping skin across; skin lacks elasticity.' },
    ],
  },
  volume: {
    type: 'severity',
    maxScore: 4,
    options: [
      { value: 1, label: 'Full facial contours with no signs of volume loss.' },
      { value: 2, label: 'Slight hollowing in cheeks or temples.' },
      { value: 3, label: 'Visible loss of volume in cheeks and temples. Hollow appearance.' },
      { value: 4, label: 'Pronounced hollowing in facial areas, affecting overall facial contours.' },
    ],
  },

  // ============================================
  // VISIBLE REDNESS (Red) - 1-5 scale for main, 1-3 for conditional
  // ============================================
  redness_present: {
    type: 'severity',
    maxScore: 5,
    options: [
      { value: 1, label: 'There is no visible redness on the skin.' },
      { value: 2, label: 'Barely noticeable redness upon close inspection, primarily in the cheeks.' },
      { value: 3, label: 'Noticeable redness particularly around the nose and cheeks.' },
      { value: 4, label: 'Clearly visible redness across the cheeks and nose area.' },
      { value: 5, label: 'Intense redness that is highly visible and covers extensive areas of the face.' },
    ],
  },
  couperose_present: {
    type: 'severity',
    maxScore: 5,
    options: [
      { value: 1, label: 'No visible broken capillaries or spider veins.' },
      { value: 2, label: 'Some noticeable broken capillaries upon close examination.' },
      { value: 3, label: 'Noticeable broken capillaries, primarily on the cheeks.' },
      { value: 4, label: 'Clearly visible broken capillaries on cheeks and nose.' },
      { value: 5, label: 'Extensive presence of broken capillaries across multiple facial areas.' },
    ],
  },
  // Conditional parameters for redness causes
  is_rosacea: {
    type: 'conditional',
    maxScore: 3,
    options: [
      { value: 1, label: 'No redness detected.' },
      { value: 2, label: 'Redness not attributed to rosacea.' },
      { value: 3, label: 'Redness linked to rosacea, indicated by persistent redness and visible blood vessels.' },
    ],
  },
  is_sunburn: {
    type: 'conditional',
    maxScore: 3,
    options: [
      { value: 1, label: 'No redness detected.' },
      { value: 2, label: 'Redness not attributed to sunburn.' },
      { value: 3, label: 'Redness caused by sunburn, with symptoms like peeling or overexposure to the sun.' },
    ],
  },
  is_contact_dermatitis: {
    type: 'conditional',
    maxScore: 3,
    options: [
      { value: 1, label: 'No redness detected.' },
      { value: 2, label: 'Redness not attributed to contact dermatitis.' },
      { value: 3, label: 'Redness results from contact dermatitis, with symptoms like localized rash and itching.' },
    ],
  },
  is_eczema: {
    type: 'conditional',
    maxScore: 3,
    options: [
      { value: 1, label: 'No redness detected.' },
      { value: 2, label: 'Redness not attributed to eczema.' },
      { value: 3, label: 'Redness is consistent with eczema, including dry, flaky, and itchy patches.' },
    ],
  },
  is_infections: {
    type: 'conditional',
    maxScore: 3,
    options: [
      { value: 1, label: 'No redness detected.' },
      { value: 2, label: 'Redness not attributed to infections.' },
      { value: 3, label: 'Redness may be caused by a skin infection, evidenced by pustules or severe inflammation.' },
    ],
  },
  is_acne: {
    type: 'conditional',
    maxScore: 3,
    options: [
      { value: 1, label: 'No redness detected.' },
      { value: 2, label: 'Redness not attributed to acne-prone skin.' },
      { value: 3, label: 'Redness is linked to acne-prone skin, with symptoms like pimples, blackheads, or cysts.' },
    ],
  },
  is_allergic_reaction: {
    type: 'conditional',
    maxScore: 3,
    options: [
      { value: 1, label: 'No redness detected.' },
      { value: 2, label: 'Redness not attributed to allergic reaction.' },
      { value: 3, label: 'Redness linked to an allergic reaction, indicated by hives, swelling, or other allergic symptoms.' },
    ],
  },

  // ============================================
  // HYDRATION (Blue) - 1-4 scale
  // ============================================
  observed_dryness: {
    type: 'severity',
    maxScore: 4,
    options: [
      { value: 1, label: 'Skin is well-moisturized, smooth, and supple; no dryness observed.' },
      { value: 2, label: 'Minimal dryness; skin feels slightly tight after cleansing but normalizes quickly.' },
      { value: 3, label: 'Noticeable tightness and slight flakiness. Skin appears slightly dull.' },
      { value: 4, label: 'Clearly visible flakiness, rough texture and dry patches.' },
    ],
  },
  observed_dehydration: {
    type: 'severity',
    maxScore: 4,
    options: [
      { value: 1, label: 'Skin is well-hydrated with a healthy glow.' },
      { value: 2, label: 'Minimal dehydration; skin feels slightly tight but retains elasticity.' },
      { value: 3, label: 'Visible dull skin with minor tightness; fine lines may be more noticeable.' },
      { value: 4, label: 'Skin is extremely dehydrated, lacks elasticity, and has pronounced fine lines, and roughness.' },
    ],
  },
  predictive_factors_dryness: {
    type: 'severity',
    maxScore: 4,
    options: [
      { value: 1, label: 'None' },
      { value: 2, label: 'Age-related decrease in oil production.' },
      { value: 3, label: 'Thin skin prone to dryness.' },
      { value: 4, label: 'Skin conditions such as eczema and psoriasis contributing to dryness.' },
    ],
  },
  predictive_factors_dehydration: {
    type: 'severity',
    maxScore: 4,
    options: [
      { value: 1, label: 'None' },
      { value: 2, label: 'Age-related decrease in natural moisturizing factors.' },
      { value: 3, label: 'Thin skin susceptible to dehydration.' },
      { value: 4, label: 'Skin conditions such as rosacea affecting hydration.' },
    ],
  },

  // ============================================
  // SHINE APPEARANCE (Orange) - 1-4 scale
  // ============================================
  oiliness: {
    type: 'severity',
    maxScore: 4,
    options: [
      { value: 1, label: 'Skin is matte with no oiliness or shine.' },
      { value: 2, label: 'Noticeable shine and slight greasiness in the T-zone.' },
      { value: 3, label: 'Greasy texture and shine extend to the cheeks.' },
      { value: 4, label: 'Intense shine and greasy feel across most of the face.' },
    ],
  },
  pores: {
    type: 'severity',
    maxScore: 4,
    options: [
      { value: 1, label: 'No pores, skin texture appears smooth.' },
      { value: 2, label: 'Pores appear enlarged in the T-zone.' },
      { value: 3, label: 'Enlarged pores are more evident and extend beyond the T-zone.' },
      { value: 4, label: 'Pores are significantly enlarged and very visible across most of the face.' },
    ],
  },

  // ============================================
  // SKIN TEXTURE (Grey) - 1-4 scale (scarring 1-3)
  // ============================================
  rough_bumpy_skin: {
    type: 'severity',
    maxScore: 4,
    options: [
      { value: 1, label: 'Skin is smooth.' },
      { value: 2, label: 'Noticeable small raised bumps in cheeks or forehead.' },
      { value: 3, label: 'Pronounced roughness and bumps across multiple facial areas.' },
      { value: 4, label: 'Extensive roughness with numerous raised bumps covering large areas of the face.' },
    ],
  },
  dull_skin: {
    type: 'severity',
    maxScore: 4,
    options: [
      { value: 1, label: 'Skin appears radiant and bright with no signs of dullness.' },
      { value: 2, label: 'Minimal loss of radiance; skin looks slightly less vibrant.' },
      { value: 3, label: 'Pronounced dullness; skin has a visible greyish appearance.' },
      { value: 4, label: 'Skin is extensively dull with a significant greyish tone, appearing lifeless.' },
    ],
  },
  uneven_skin_texture: {
    type: 'severity',
    maxScore: 4,
    options: [
      { value: 1, label: 'Skin texture is smooth and even throughout.' },
      { value: 2, label: 'Noticeable unevenness with slight rough or flaky areas.' },
      { value: 3, label: 'Pronounced uneven texture with rough, flaky areas in several regions.' },
      { value: 4, label: 'Extensive unevenness with significant roughness and flakiness across the face.' },
    ],
  },
  roughness: {
    type: 'severity',
    maxScore: 4,
    options: [
      { value: 1, label: 'Skin feels smooth and soft to the touch.' },
      { value: 2, label: 'Noticeable roughness making the skin feel slightly coarse.' },
      { value: 3, label: 'Skin feels rough in several areas, noticeable to the touch.' },
      { value: 4, label: 'Skin is very rough throughout, feeling coarse and abrasive.' },
    ],
  },
  scarring: {
    type: 'severity',
    maxScore: 3,
    options: [
      { value: 1, label: 'No visible scars.' },
      { value: 2, label: 'Noticeable small scars, such as minor acne scars in specific areas.' },
      { value: 3, label: 'Pronounced scarring affecting skin texture in multiple areas.' },
    ],
  },

  // ============================================
  // VISIBLE BLEMISHES (Green) - 1-4 scale
  // ============================================
  comedones: {
    type: 'severity',
    maxScore: 4,
    options: [
      { value: 1, label: 'No visible blackheads or whiteheads.' },
      { value: 2, label: 'Presence of a few blackheads and whiteheads. Minimal clogged pores.' },
      { value: 3, label: 'Multiple blackheads and whiteheads in areas like the nose and chin.' },
      { value: 4, label: 'Numerous blackheads and whiteheads across various facial areas, indicating significant clogged pores.' },
    ],
  },
  pustules: {
    type: 'severity',
    maxScore: 4,
    options: [
      { value: 1, label: 'No visible pustules.' },
      { value: 2, label: 'A few small, inflamed, pus-filled lesions are present.' },
      { value: 3, label: 'Multiple pustules are visible, often red at the base.' },
      { value: 4, label: 'Numerous pustules across various areas of the face, indicating significant inflammation.' },
    ],
  },
  papules: {
    type: 'severity',
    maxScore: 4,
    options: [
      { value: 1, label: 'No visible papules.' },
      { value: 2, label: 'A few small, raised, red bumps are present.' },
      { value: 3, label: 'Multiple papules are noticeable in certain areas.' },
      { value: 4, label: 'Numerous papules across various facial areas, indicating increased inflammation.' },
    ],
  },
  nodules: {
    type: 'severity',
    maxScore: 4,
    options: [
      { value: 1, label: 'No visible nodules.' },
      { value: 2, label: 'A few large, painful, solid lesions are present, lodged deep within the skin.' },
      { value: 3, label: 'Multiple nodules are noticeable, causing discomfort.' },
      { value: 4, label: 'Numerous nodules across various facial areas, indicating severe deep acne.' },
    ],
  },
  cysts: {
    type: 'severity',
    maxScore: 4,
    options: [
      { value: 1, label: 'No visible cysts.' },
      { value: 2, label: 'A few deep, painful, pus-filled lesions are present; may cause scarring.' },
      { value: 3, label: 'Multiple cysts are noticeable, indicating severe acne.' },
      { value: 4, label: 'Numerous cysts across various facial areas, suggesting severe acne prone to scarring.' },
    ],
  },

  // ============================================
  // UNEVEN TONE & DARK SPOTS (Brown) - various scales
  // ============================================
  melasma: {
    type: 'severity',
    maxScore: 4,
    options: [
      { value: 1, label: 'No visible signs of melasma.' },
      { value: 2, label: 'Visible dark patches on the cheeks, forehead, or upper lip.' },
      { value: 3, label: 'Pronounced dark, symmetric patches on the face.' },
      { value: 4, label: 'Extensive dark patches covering large areas of the face.' },
    ],
  },
  post_inflammatory_hyperpigmentation: {
    type: 'severity',
    maxScore: 4,
    options: [
      { value: 1, label: 'No visible signs of PIH.' },
      { value: 2, label: 'Noticeable dark spots from previous acne, eczema, or injuries.' },
      { value: 3, label: 'Pronounced dark spots clearly visible and contrasting with surrounding skin.' },
      { value: 4, label: 'Extensive dark spots covering large areas indicating significant PIH.' },
    ],
  },
  age_sun_spots: {
    type: 'severity',
    maxScore: 4,
    options: [
      { value: 1, label: 'No visible signs of age or sun spots.' },
      { value: 2, label: 'Noticeable flat, brown or gray spots on sun-exposed areas.' },
      { value: 3, label: 'Pronounced age or sun spots that stand out against the surrounding skin.' },
      { value: 4, label: 'Extensive flat, dark spots in large areas of the face indicating advanced sun damage.' },
    ],
  },
  freckles: {
    type: 'severity',
    maxScore: 3,
    options: [
      { value: 1, label: 'No visible freckles.' },
      { value: 2, label: 'Some minor, flat, brown marks, likely genetic freckles.' },
      { value: 3, label: 'Multiple freckles spread across the face; more pronounced with sun exposure.' },
    ],
  },
  moles: {
    type: 'severity',
    maxScore: 3,
    options: [
      { value: 1, label: 'No visible moles.' },
      { value: 2, label: 'A few small, dark brown spots or growths are present; likely benign moles.' },
      { value: 3, label: 'Multiple moles of varying sizes and shapes are present.' },
    ],
  },
  skin_tone: {
    type: 'severity',
    maxScore: 4,
    options: [
      { value: 1, label: 'Skin tone is even and uniform.' },
      { value: 2, label: 'Noticeable unevenness with areas of discoloration.' },
      { value: 3, label: 'Pronounced unevenness with clear areas of discoloration.' },
      { value: 4, label: 'Extensive unevenness with large areas of discoloration; highly conspicuous.' },
    ],
  },
  predictive_factors_hyperpigmentation: {
    type: 'severity',
    maxScore: 2,
    options: [
      { value: 1, label: 'None' },
      { value: 2, label: 'Genetic and age-related factors indicate a higher risk of developing pigmentation disorders like melasma or sun spots.' },
    ],
  },

  // ============================================
  // EYE CONTOUR - 1-3 scale
  // ============================================
  fine_lines_wrinkles: {
    type: 'severity',
    maxScore: 3,
    options: [
      { value: 1, label: 'No visible fine lines or wrinkles around the eyes.' },
      { value: 2, label: 'Visible fine lines and shallow wrinkles are noticeable.' },
      { value: 3, label: 'Significant wrinkles and fine lines are clearly visible.' },
    ],
  },
  eye_bags: {
    type: 'severity',
    maxScore: 3,
    options: [
      { value: 1, label: 'No noticeable swelling or puffiness directly beneath the eyes.' },
      { value: 2, label: 'Visible swelling or puffiness beneath the eyes caused by natural aging.' },
      { value: 3, label: 'Significant and persistent swelling or puffiness giving a drooping look under the eyes.' },
    ],
  },
  hollowed_eyes: {
    type: 'severity',
    maxScore: 3,
    options: [
      { value: 1, label: 'The area around the eyes does not appear sunken or hollowed.' },
      { value: 2, label: 'Noticeable sunken appearance around the eyes, making the eyes look tired.' },
      { value: 3, label: 'Significant hollowing around the eyes is clearly visible and affects facial appearance.' },
    ],
  },
  puffy_eyes: {
    type: 'severity',
    maxScore: 3,
    options: [
      { value: 1, label: 'No visible swelling or puffiness around the eyes.' },
      { value: 2, label: 'Noticeable swelling around the eyes due to environmental factors.' },
      { value: 3, label: 'Extensive short-term swelling around the eyes, very prominent and affects appearance.' },
    ],
  },
  dark_circles: {
    type: 'severity',
    maxScore: 3,
    options: [
      { value: 1, label: 'No dark discoloration is visible under the eyes.' },
      { value: 2, label: 'Visible dark circles under the eyes, noticeable but not severe.' },
      { value: 3, label: 'Significant dark discoloration under the eyes is clearly visible.' },
    ],
  },

  // ============================================
  // NECK & DECOLLETE - 1-4 scale
  // ============================================
  photoaging: {
    type: 'severity',
    maxScore: 4,
    options: [
      { value: 1, label: 'Skin appears smooth with no visible fine lines or wrinkles.' },
      { value: 2, label: 'Slight fine lines or minimal texture changes observed.' },
      { value: 3, label: 'Visible wrinkles and fine lines are present, with moderate texture changes.' },
      { value: 4, label: 'Extensive wrinkles and pronounced texture changes indicating significant photoaging.' },
    ],
  },
  hyperpigmentation: {
    type: 'severity',
    maxScore: 4,
    options: [
      { value: 1, label: 'Even skin tone with no visible sunspots or discoloration.' },
      { value: 2, label: 'Barely noticeable uneven skin tone or a few faint sunspots.' },
      { value: 3, label: 'Dark spots and uneven tone covering significant areas.' },
      { value: 4, label: 'Extensive, dark, and highly visible pigmentation changes.' },
    ],
  },
  dryness_dehydration: {
    type: 'severity',
    maxScore: 4,
    options: [
      { value: 1, label: 'Skin is adequately hydrated with no visible dryness or flakiness.' },
      { value: 2, label: 'Slight dryness or minor flakiness in some areas.' },
      { value: 3, label: 'Visible dry patches or flakiness in multiple areas.' },
      { value: 4, label: 'Extensive dryness with significant flakiness or scaling.' },
    ],
  },
  textural_changes: {
    type: 'severity',
    maxScore: 4,
    options: [
      { value: 1, label: 'Skin appears smooth and firm with no crepey texture.' },
      { value: 2, label: 'Slight crepey skin or minor irregularities.' },
      { value: 3, label: 'Visible crepey skin or moderate texture irregularities.' },
      { value: 4, label: 'Significant crepey skin and pronounced texture irregularities.' },
    ],
  },
  elasticity_loss: {
    type: 'severity',
    maxScore: 4,
    options: [
      { value: 1, label: 'Skin appears firm with no visible sagging or loss of elasticity.' },
      { value: 2, label: 'Minor loss of firmness with slight sagging.' },
      { value: 3, label: 'Visible sagging and reduced skin firmness.' },
      { value: 4, label: 'Pronounced sagging and significant firmness loss.' },
    ],
  },
  redness: {
    type: 'severity',
    maxScore: 4,
    options: [
      { value: 1, label: 'No visible redness or irritation in the neck or décolleté.' },
      { value: 2, label: 'Slight redness in localized areas.' },
      { value: 3, label: 'Visible redness across multiple areas.' },
      { value: 4, label: 'Pronounced redness covering significant portions of the neck and décolleté.' },
    ],
  },
  acne_prone_skin: {
    type: 'severity',
    maxScore: 4,
    options: [
      { value: 1, label: 'No visible signs of acne.' },
      { value: 2, label: 'Mild acne signs, such as a few comedones, small pustules, or papules.' },
      { value: 3, label: 'Moderate acne with noticeable pustules, papules, or nodules.' },
      { value: 4, label: 'Severe acne, including multiple pustules, nodules, or cysts.' },
    ],
  },
};

/**
 * Get score configuration for a parameter
 */
export function getParameterScoreConfig(key: string): ParameterScoreConfig | undefined {
  return PARAMETER_SCORE_OPTIONS[key];
}

/**
 * Get the standardized label for a given score value
 */
export function getScoreLabel(key: string, score: number): string | undefined {
  const config = PARAMETER_SCORE_OPTIONS[key];
  if (!config) return undefined;
  const option = config.options.find((opt) => opt.value === score);
  return option?.label;
}

/**
 * Get appropriate color for a parameter score
 */
export function getScoreColor(key: string, score: number): string {
  const config = PARAMETER_SCORE_OPTIONS[key];
  if (!config) return '#9CA3AF'; // Default gray

  if (config.type === 'conditional') {
    return getConditionalColor(score);
  }
  return getSeverityColor(score, config.maxScore);
}

/**
 * Parameters excluded from category score calculation
 */
const EXCLUDED_PARAMETERS = new Set(['freckles', 'moles']);

/**
 * Parameters with 50% weight (divided by 2)
 */
const HALF_WEIGHT_PARAMETERS = new Set([
  'predictive_factors_hyperpigmentation',
  'predictive_factors_dryness',
  'predictive_factors_dehydration',
]);

/**
 * Parameters with 130% boost
 */
const BOOSTED_PARAMETERS = new Set(['redness_present', 'couperose_present']);

/**
 * Calculate normalized score (0-10) for a parameter
 */
export function getNormalizedScore(key: string, score: number): number | null {
  const config = PARAMETER_SCORE_OPTIONS[key];
  if (!config) return null;

  // Exclude conditional parameters from scoring
  if (config.type === 'conditional') return null;

  // Exclude specific parameters
  if (EXCLUDED_PARAMETERS.has(key)) return null;

  // Calculate base normalized score: ((score - 1) / (maxScore - 1)) * 10
  const maxScore = config.maxScore;
  let normalized = maxScore > 1 ? ((score - 1) / (maxScore - 1)) * 10 : 0;

  // Apply 130% boost for redness parameters
  if (BOOSTED_PARAMETERS.has(key)) {
    normalized = normalized * 1.3;
  }

  // Apply 50% weight for predictive factors
  if (HALF_WEIGHT_PARAMETERS.has(key)) {
    normalized = normalized / 2;
  }

  // Cap at 10
  return Math.min(10, normalized);
}

/**
 * Calculate category visibility score (0-10) based on parameter scores
 * Uses MAX-based approach: worst parameter determines category score
 */
export function calculateCategoryScore(
  parameters: Array<{ key: string; scoreValue: number }>
): number {
  let maxNormalized = 0;

  for (const param of parameters) {
    const normalized = getNormalizedScore(param.key, param.scoreValue);
    if (normalized !== null && normalized > maxNormalized) {
      maxNormalized = normalized;
    }
  }

  // Round to nearest integer
  return Math.round(maxNormalized);
}
