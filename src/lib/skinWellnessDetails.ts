/**
 * Skin Wellness Detail Parameters
 *
 * Detailed sub-parameters for each skin wellness category.
 * These provide more granular cosmetic appearance observations.
 */

export interface SkinWellnessDetail {
  key: string;
  label: string;
  description: string;  // AI personalized text (read-only in UI)
  scoreValue: number;   // Current score (1-based, matches option value)
  aiScoreValue?: number; // Original AI-assigned score (stays fixed for display)
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
  // Yellow - Skin Radiance
  radiance: [
    {
      key: 'complexion',
      label: 'Complexion',
      description: 'Your complexion appears generally even, but there is some mild dullness and a few areas of uneven tone, likely related to mild oxidative stress and acne.',
      scoreValue: 2,
    },
    {
      key: 'tiredness',
      label: 'Tiredness Signs',
      description: 'There are no prominent signs of skin tiredness such as sagging or pronounced under-eye darkness. The skin looks relatively firm and youthful.',
      scoreValue: 1,
    },
    {
      key: 'sun_damage',
      label: 'Sun Damage',
      description: 'There are no clear signs of significant sun damage such as marked hyperpigmentation, sun spots, or deep wrinkles. The skin shows minimal visible effects from sun exposure.',
      scoreValue: 1,
    },
  ],

  // Pink - Skin Aging
  smoothness: [
    {
      key: 'wrinkles',
      label: 'Wrinkles',
      description: 'There are no visible wrinkles on the forehead, around the eyes, or mouth. The skin appears smooth and youthful in these areas.',
      scoreValue: 1,
    },
    {
      key: 'fine_lines',
      label: 'Fine Lines',
      description: 'There are no noticeable fine lines present on the face, including common areas such as the forehead, under the eyes, or around the mouth.',
      scoreValue: 1,
    },
    {
      key: 'elasticity_sagging',
      label: 'Elasticity & Sagging',
      description: 'The skin retains good elasticity and firmness. There are no signs of sagging or drooping in the cheeks, jawline, or under the eyes.',
      scoreValue: 1,
    },
    {
      key: 'volume',
      label: 'Volume',
      description: 'There is no visible loss of volume in the cheeks or temples. The facial contours appear full and youthful.',
      scoreValue: 1,
    },
  ],

  // Red - Visible Redness
  redness: [
    {
      key: 'redness_present',
      label: 'Redness Present',
      description: 'There is mild, patchy redness visible on both cheeks, with some areas showing slightly more pronounced erythema. The forehead and nose show minimal to no visible redness. The redness is most apparent on the cheeks, especially in areas with acne lesions.',
      scoreValue: 3,
    },
    {
      key: 'couperose_present',
      label: 'Couperose Present',
      description: 'There are no clear signs of couperose or visible thread-like capillaries on the cheeks, nose, or chin. The redness appears more diffuse and related to underlying inflammation rather than distinct blood vessels.',
      scoreValue: 1,
    },
    {
      key: 'is_rosacea',
      label: 'Is the redness due to rosacea?',
      description: 'There are no classic signs of rosacea such as persistent, central facial redness or visible capillaries. The redness is mild and more associated with acne lesions.',
      scoreValue: 2,
    },
    {
      key: 'is_sunburn',
      label: 'Is the redness due to sunburn?',
      description: 'There is no evidence of sunburn. The skin does not show the uniform, intense redness or peeling typical of recent UV damage.',
      scoreValue: 2,
    },
    {
      key: 'is_contact_dermatitis',
      label: 'Is the redness due to contact dermatitis?',
      description: 'There are no signs of acute irritation, swelling, or sharply demarcated red patches that would suggest contact dermatitis.',
      scoreValue: 2,
    },
    {
      key: 'is_eczema',
      label: 'Is the redness due to eczema?',
      description: 'There are no patchy, dry, scaly, or inflamed areas that would indicate eczema.',
      scoreValue: 2,
    },
    {
      key: 'is_infections',
      label: 'Is the redness due to infections?',
      description: 'There are no pustules, swelling, or localized areas of intense redness that would suggest a skin infection.',
      scoreValue: 2,
    },
    {
      key: 'is_acne',
      label: 'Is the redness due to acne?',
      description: 'There are multiple red papules and a few pustules on the cheeks, jawline, and chin, consistent with mild to moderate acne. The redness is mostly centered around these lesions.',
      scoreValue: 3,
    },
    {
      key: 'is_allergic_reaction',
      label: 'Is the redness due to allergic reaction?',
      description: 'There are no widespread hives, swelling, or diffuse rash that would suggest an allergic reaction.',
      scoreValue: 2,
    },
  ],

  // Blue - Hydration Appearance
  hydration: [
    {
      key: 'observed_dryness',
      label: 'Observed Dryness',
      description: 'Your skin does not show significant signs of dryness. There are no visible dry patches, flakiness, or scaling on the forehead, cheeks, or chin. The skin texture appears generally smooth and intact.',
      scoreValue: 1,
    },
    {
      key: 'observed_dehydration',
      label: 'Observed Dehydration',
      description: 'There are no clear signs of dehydration. The skin does not look dull or tight, and there is no evidence of fine dehydration lines. The overall appearance is healthy and well-hydrated.',
      scoreValue: 1,
    },
    {
      key: 'predictive_factors_dryness',
      label: 'Predictive Factors for Dryness',
      description: 'None',
      scoreValue: 1,
    },
    {
      key: 'predictive_factors_dehydration',
      label: 'Predictive Factors for Dehydration',
      description: 'None',
      scoreValue: 1,
    },
  ],

  // Orange - Shine Appearance
  shine: [
    {
      key: 'oiliness',
      label: 'Oiliness',
      description: 'Your skin shows a mild shine, especially in the T-zone (forehead, nose, and chin). The shine is not intense and does not extend significantly to the cheeks, indicating only mild oiliness.',
      scoreValue: 2,
    },
    {
      key: 'pores',
      label: 'Pores',
      description: 'Pores are moderately visible, particularly on the nose and central cheeks. They appear slightly enlarged but not extremely pronounced across the entire face.',
      scoreValue: 2,
    },
  ],

  // Grey - Skin Texture
  texture: [
    {
      key: 'rough_bumpy_skin',
      label: 'Rough & Bumpy Skin',
      description: 'You have some mild roughness and small bumps, especially on the cheeks, chin, and forehead. These are likely due to mild acne or clogged pores.',
      scoreValue: 2,
    },
    {
      key: 'dull_skin',
      label: 'Dull Skin',
      description: 'Your skin does not appear particularly dull or greyish. There is a healthy tone overall, with no significant loss of radiance.',
      scoreValue: 1,
    },
    {
      key: 'uneven_skin_texture',
      label: 'Uneven Skin Texture',
      description: 'There is mild unevenness in your skin texture, mostly from small bumps and a few rough patches, especially on the cheeks and jawline.',
      scoreValue: 2,
    },
    {
      key: 'roughness',
      label: 'Roughness',
      description: 'Mild roughness is present, mainly in areas with visible bumps and pores. The skin is not completely smooth but the roughness is not severe.',
      scoreValue: 2,
    },
    {
      key: 'scarring',
      label: 'Scarring',
      description: 'There are a few very mild atrophic scars, likely from previous acne, mostly on the cheeks. These are not deep or extensive.',
      scoreValue: 2,
    },
  ],

  // Green - Visible Blemishes
  blemishes: [
    {
      key: 'comedones',
      label: 'Comedones',
      description: 'You have multiple comedones, both blackheads and whiteheads, visible mainly on your cheeks, forehead, and chin. These are spread across the face but not in very high density.',
      scoreValue: 3,
    },
    {
      key: 'pustules',
      label: 'Pustules',
      description: 'There are a few pustules present, mostly on the cheeks and chin. These are small, inflamed, and have a red base, but they are not widespread.',
      scoreValue: 2,
    },
    {
      key: 'papules',
      label: 'Papules',
      description: 'Several papules are visible, especially on the cheeks and jawline. These are small, red, raised bumps and are moderately distributed.',
      scoreValue: 3,
    },
    {
      key: 'nodules',
      label: 'Nodules',
      description: 'No nodules are observed. There are no large, deep, or painful solid lesions present.',
      scoreValue: 1,
    },
    {
      key: 'cysts',
      label: 'Cysts',
      description: 'No cysts are seen. There are no deep, pus-filled lesions that could cause scarring.',
      scoreValue: 1,
    },
  ],

  // Brown - Uneven Tone & Dark Spots
  tone: [
    {
      key: 'melasma',
      label: 'Melasma',
      description: 'There are no clear signs of melasma. The upper lip, cheeks, and forehead do not show the characteristic symmetric, blended dark patches typical of melasma.',
      scoreValue: 1,
    },
    {
      key: 'post_inflammatory_hyperpigmentation',
      label: 'Post-Inflammatory Hyperpigmentation',
      description: 'There are several small, dark spots and patches on the cheeks and jawline, likely related to previous acne. These are consistent with mild post-inflammatory hyperpigmentation.',
      scoreValue: 2,
    },
    {
      key: 'age_sun_spots',
      label: 'Age & Sun Spots',
      description: 'No distinct, isolated sun spots or age spots are visible. The pigmentation seen is more related to post-acne changes rather than sun-induced spots.',
      scoreValue: 1,
    },
    {
      key: 'freckles',
      label: 'Freckles',
      description: 'There are no prominent freckles visible. The small brown marks present are more consistent with PIH or minor acne scarring.',
      scoreValue: 1,
    },
    {
      key: 'moles',
      label: 'Moles',
      description: 'A few small moles are present, but these are not excessive and are not included in the hyperpigmentation assessment.',
      scoreValue: 2,
    },
    {
      key: 'skin_tone',
      label: 'Skin Tone',
      description: 'Your skin tone is mostly even, but there are mild areas of unevenness due to post-inflammatory hyperpigmentation, especially on the cheeks and jawline.',
      scoreValue: 2,
    },
    {
      key: 'predictive_factors_hyperpigmentation',
      label: 'Predictive Factors for Hyperpigmentation',
      description: 'None',
      scoreValue: 1,
    },
  ],

  // Eye - Eye Contour
  'eye-contour': [
    {
      key: 'fine_lines_wrinkles',
      label: 'Fine Lines & Wrinkles',
      description: 'None observed. The skin around your eyes appears smooth without visible fine lines or wrinkles.',
      scoreValue: 1,
    },
    {
      key: 'eye_bags',
      label: 'Eye Bags',
      description: 'None observed. There is no noticeable swelling or puffiness directly beneath your eyes.',
      scoreValue: 1,
    },
    {
      key: 'hollowed_eyes',
      label: 'Hollowed Eyes',
      description: 'None observed. The area around your eyes does not appear sunken or hollowed.',
      scoreValue: 1,
    },
    {
      key: 'puffy_eyes',
      label: 'Puffy Eyes',
      description: 'None observed. There is no significant swelling or puffiness around your eyes.',
      scoreValue: 1,
    },
    {
      key: 'dark_circles',
      label: 'Dark Circles',
      description: 'None observed. There is no visible dark discoloration under your eyes.',
      scoreValue: 1,
    },
  ],

  // Neck - Neck & Decollete
  'neck-decollete': [
    {
      key: 'photoaging',
      label: 'Photoaging',
      description: 'The neck and décolleté areas are not visible, so I am unable to assess for wrinkles, fine lines, or changes in skin texture and pigmentation related to photoaging.',
      scoreValue: 1,
    },
    {
      key: 'hyperpigmentation',
      label: 'Hyperpigmentation',
      description: 'I cannot observe the décolleté for uneven skin tone, sunspots, or age spots as these areas are not shown.',
      scoreValue: 1,
    },
    {
      key: 'dryness_dehydration',
      label: 'Dryness & Dehydration',
      description: 'There is no visible neck or décolleté skin to evaluate for dryness or flakiness.',
      scoreValue: 1,
    },
    {
      key: 'textural_changes',
      label: 'Textural Changes',
      description: 'I am unable to check for thin, crinkled, or crepey skin in the neck and décolleté due to lack of visibility.',
      scoreValue: 1,
    },
    {
      key: 'elasticity_loss',
      label: 'Elasticity Loss',
      description: 'The image does not show the neck or décolleté, so I cannot assess for reduced firmness or sagging.',
      scoreValue: 1,
    },
    {
      key: 'redness',
      label: 'Redness',
      description: 'There are no visible areas of the neck or décolleté to evaluate for redness or irritation.',
      scoreValue: 1,
    },
    {
      key: 'acne_prone_skin',
      label: 'Acne-Prone Skin',
      description: 'I cannot assess the décolleté for acne or related lesions as this area is not visible.',
      scoreValue: 1,
    },
  ],
};

/**
 * Get details for a specific category
 */
export function getCategoryDetails(categoryId: string): SkinWellnessDetail[] {
  return MOCK_CATEGORY_DETAILS[categoryId] || [];
}
