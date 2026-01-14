/**
 * EBD Device Recommendation System
 *
 * Scores and ranks EBD devices based on patient criteria:
 * - Fitzpatrick skin type (safety compatibility)
 * - Recovery time preferences (downtime matching)
 * - Selected skin concerns (treatment matching)
 */

import { EBDDevice, FitzpatrickType, RecoveryTimePreference } from '@/types';

// ============================================================================
// TYPES
// ============================================================================

export type DeviceDowntime = 'None' | 'Minimal' | 'Some';

export type RecommendationReasonCode =
  | 'concern-match'      // Treats patient's skin concerns
  | 'fitzpatrick-safe'   // Safe for patient's skin type
  | 'downtime-ok'        // Within recovery preferences
  | 'fitzpatrick-warn'   // Outside typical range for skin type
  | 'downtime-warn';     // Longer downtime than preferred

export interface DeviceRecommendationScore {
  deviceId: string;
  isRecommended: boolean;
  score: number; // 0-100 scale
  matchedConcerns: string[]; // Concern IDs that matched
  fitzpatrickMatch: 'compatible' | 'incompatible' | 'unknown';
  downtimeMatch: 'acceptable' | 'unacceptable' | 'unknown';
  reasonCodes: RecommendationReasonCode[];
}

export interface RecommendationCriteria {
  selectedConcerns: string[];
  fitzpatrickSkinType?: FitzpatrickType;
  recoveryTimePreferences?: RecoveryTimePreference[];
}

// ============================================================================
// MAPPING TABLES
// ============================================================================

/**
 * Maps skin concern IDs to device "treats" strings for matching
 *
 * Device treats[] contains strings like: 'Melasma', 'Texture (pores, scars)',
 * 'Wrinkles', 'Pigmentation', 'Redness', 'Vascularity', 'Dark spots', etc.
 *
 * We match by checking if ANY of the target strings appear in the device treats.
 */
export const CONCERN_TO_TREATS_MAP: Record<string, string[]> = {
  // Skin Appearance & Texture
  'acne-active': ['Redness', 'Texture'],
  'acne-scarring': ['Texture', 'Redness'],
  'wrinkles': ['Wrinkles', 'Fine lines', 'Skin quality'],
  'uneven-texture': ['Texture', 'Skin quality'],
  'skin-laxity': ['Skin quality', 'Wrinkles', 'laxity'],
  'large-pores': ['Texture', 'pores'],

  // Pigmentation & Color
  'hyperpigmentation': ['Pigmentation', 'Dark spots'],
  'melasma': ['Melasma', 'Pigmentation'],
  'pih': ['Pigmentation', 'Dark spots'],
  'sun-damage': ['Sun damage', 'Pigmentation', 'Dark spots'],
  'rosacea': ['Redness', 'Vascularity', 'rosacea'],

  // Vascular & Lesional
  'telangiectasia': ['Vascularity', 'Redness', 'telangiectasia'],
  'vascular-lesions': ['Vascularity', 'vascular'],
  'redness-vascular': ['Redness', 'Vascularity'],

  // Scar & Lesion-Related
  'scar-remodeling': ['Texture', 'Skin quality', 'scars'],
  'stretch-marks': ['Texture', 'Skin quality'],
  'pigmented-lesions': ['Pigmentation', 'Dark spots'],
};

/**
 * Maps patient recovery time preferences to acceptable device downtime levels
 *
 * Patient selects which recovery times they accept (multi-select).
 * We find which downtime levels are acceptable across all their preferences.
 */
export const RECOVERY_TO_DOWNTIME_MAP: Record<RecoveryTimePreference, DeviceDowntime[]> = {
  'same-day': ['None'],
  '1-2-days': ['None', 'Minimal'],
  '3-5-days': ['None', 'Minimal', 'Some'],
  'more-than-5-days': ['None', 'Minimal', 'Some'],
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Fitzpatrick type ordering for range comparisons
 */
const FITZPATRICK_ORDER: FitzpatrickType[] = ['I', 'II', 'III', 'IV', 'V', 'VI'];

/**
 * Checks if a patient's Fitzpatrick type is within a device's supported range
 *
 * @param patientFitzpatrick - Patient's Fitzpatrick type (I-VI) or undefined
 * @param deviceFitzpatrick - Device's supported range (e.g., "I-VI", "I-IV")
 * @returns true if compatible, false if incompatible, null if can't determine
 */
export function isFitzpatrickCompatible(
  patientFitzpatrick: FitzpatrickType | undefined,
  deviceFitzpatrick: string
): boolean | null {
  if (!patientFitzpatrick) return null;

  // Parse device range (e.g., "I-VI" -> ['I', 'VI'])
  const match = deviceFitzpatrick.match(/^(I{1,3}|IV|V|VI)-(I{1,3}|IV|V|VI)$/);
  if (!match) return null;

  const minType = match[1] as FitzpatrickType;
  const maxType = match[2] as FitzpatrickType;

  const patientIndex = FITZPATRICK_ORDER.indexOf(patientFitzpatrick);
  const minIndex = FITZPATRICK_ORDER.indexOf(minType);
  const maxIndex = FITZPATRICK_ORDER.indexOf(maxType);

  if (patientIndex === -1 || minIndex === -1 || maxIndex === -1) return null;

  return patientIndex >= minIndex && patientIndex <= maxIndex;
}

/**
 * Gets all acceptable downtime levels based on patient preferences
 *
 * If patient accepts "1-2-days" and "3-5-days", acceptable downtimes are:
 * None, Minimal, Some (union of both preference mappings)
 */
function getAcceptableDowntimes(
  preferences: RecoveryTimePreference[]
): DeviceDowntime[] {
  const acceptable = new Set<DeviceDowntime>();

  for (const pref of preferences) {
    const downtimes = RECOVERY_TO_DOWNTIME_MAP[pref];
    if (downtimes) {
      downtimes.forEach(d => acceptable.add(d));
    }
  }

  return Array.from(acceptable);
}

/**
 * Calculates concern matching score between device and patient concerns
 *
 * @param deviceTreats - Array of conditions the device treats
 * @param selectedConcerns - Array of patient's concern IDs
 * @param matchedConcernsOut - Output array to collect matched concern IDs
 * @returns Score from 0-40 based on proportion of concerns matched
 */
function calculateConcernScore(
  deviceTreats: string[],
  selectedConcerns: string[],
  matchedConcernsOut: string[]
): number {
  if (selectedConcerns.length === 0) return 0;

  let matchCount = 0;
  const deviceTreatsLower = deviceTreats.map(t => t.toLowerCase());

  for (const concernId of selectedConcerns) {
    const targetTreats = CONCERN_TO_TREATS_MAP[concernId] || [];

    // Check if device treats ANY of the target strings (case-insensitive partial match)
    const hasMatch = targetTreats.some(target =>
      deviceTreatsLower.some(dt => dt.includes(target.toLowerCase()))
    );

    if (hasMatch) {
      matchCount++;
      matchedConcernsOut.push(concernId);
    }
  }

  // Score based on proportion of concerns matched (max 40 points)
  return Math.round((matchCount / selectedConcerns.length) * 40);
}

// ============================================================================
// MAIN SCORING FUNCTION
// ============================================================================

/**
 * Scores all devices based on available patient criteria
 *
 * KEY DESIGN PRINCIPLE: When data is missing, we DON'T penalize the device.
 * - No fitzpatrick data? All devices get "unknown" status (neutral)
 * - No recovery preferences? All devices get "unknown" status (neutral)
 * - No skin concerns? Devices score based on other criteria only
 *
 * @param devices - Array of EBD devices to score
 * @param criteria - Patient criteria (concerns, fitzpatrick, recovery preferences)
 * @returns Array of scores, one per device
 */
export function scoreDevicesForPatient(
  devices: EBDDevice[],
  criteria: RecommendationCriteria
): DeviceRecommendationScore[] {
  return devices.map(device => {
    let score = 0;
    let maxPossibleScore = 0;
    const matchedConcerns: string[] = [];
    const reasonCodes: RecommendationReasonCode[] = [];

    // === 1. Skin Concern Matching (40 points possible) ===
    if (criteria.selectedConcerns.length > 0) {
      maxPossibleScore += 40;
      const concernScore = calculateConcernScore(
        device.treats,
        criteria.selectedConcerns,
        matchedConcerns
      );
      score += concernScore;
      if (concernScore > 0) {
        reasonCodes.push('concern-match');
      }
    }

    // === 2. Fitzpatrick Compatibility (30 points possible) ===
    let fitzpatrickMatch: 'compatible' | 'incompatible' | 'unknown' = 'unknown';
    if (criteria.fitzpatrickSkinType) {
      maxPossibleScore += 30;
      const isCompatible = isFitzpatrickCompatible(
        criteria.fitzpatrickSkinType,
        device.fitzpatrick
      );

      if (isCompatible === true) {
        score += 30;
        fitzpatrickMatch = 'compatible';
        reasonCodes.push('fitzpatrick-safe');
      } else if (isCompatible === false) {
        fitzpatrickMatch = 'incompatible';
        reasonCodes.push('fitzpatrick-warn');
      }
    }

    // === 3. Downtime/Recovery Compatibility (30 points possible) ===
    let downtimeMatch: 'acceptable' | 'unacceptable' | 'unknown' = 'unknown';
    if (criteria.recoveryTimePreferences && criteria.recoveryTimePreferences.length > 0) {
      maxPossibleScore += 30;
      const acceptableDowntimes = getAcceptableDowntimes(criteria.recoveryTimePreferences);

      if (acceptableDowntimes.includes(device.downtime as DeviceDowntime)) {
        score += 30;
        downtimeMatch = 'acceptable';
        reasonCodes.push('downtime-ok');
      } else {
        downtimeMatch = 'unacceptable';
        reasonCodes.push('downtime-warn');
      }
    }

    // === Calculate final percentage ===
    // If no criteria at all, all devices are "not recommended" (score 0)
    const normalizedScore = maxPossibleScore > 0
      ? Math.round((score / maxPossibleScore) * 100)
      : 0;

    // A device is "recommended" if:
    // 1. Score >= 50% AND
    // 2. Fitzpatrick is not 'incompatible' (safe or unknown is OK) AND
    // 3. Downtime is not 'unacceptable' (acceptable or unknown is OK) AND
    // 4. At least one positive match (concern or downtime or fitzpatrick)
    const isRecommended =
      normalizedScore >= 50 &&
      fitzpatrickMatch !== 'incompatible' &&
      downtimeMatch !== 'unacceptable' &&
      reasonCodes.some(r => ['concern-match', 'downtime-ok', 'fitzpatrick-safe'].includes(r));

    return {
      deviceId: device.id,
      isRecommended,
      score: normalizedScore,
      matchedConcerns,
      fitzpatrickMatch,
      downtimeMatch,
      reasonCodes,
    };
  });
}

/**
 * Splits devices into recommended and other categories
 *
 * @param devices - Array of EBD devices
 * @param criteria - Patient criteria
 * @returns Object with recommendedDevices (sorted by score) and otherDevices
 */
export function getRecommendedDevices(
  devices: EBDDevice[],
  criteria: RecommendationCriteria
): {
  recommendedDevices: EBDDevice[];
  otherDevices: EBDDevice[];
  scoreMap: Map<string, DeviceRecommendationScore>;
} {
  const scores = scoreDevicesForPatient(devices, criteria);
  const scoreMap = new Map(scores.map(s => [s.deviceId, s]));

  // Split into recommended and other
  const recommended = devices
    .filter(d => scoreMap.get(d.id)?.isRecommended)
    .sort((a, b) => (scoreMap.get(b.id)?.score || 0) - (scoreMap.get(a.id)?.score || 0));

  const other = devices.filter(d => !scoreMap.get(d.id)?.isRecommended);

  return {
    recommendedDevices: recommended,
    otherDevices: other,
    scoreMap,
  };
}
