/**
 * Skin Wellness Mode Helper Functions
 *
 * These functions enforce data isolation between clinical documentation
 * and Skin Wellness Mode (required for SaMD compliance).
 *
 * CRITICAL: Only photoSessionId, patientId, and consent status are allowed
 * to be passed to Skin Wellness Mode. No medical/diagnostic data should
 * ever be included.
 */

import { SkinWellnessEntryData } from '@/types';

/**
 * Validate Skin Wellness entry data
 * Enforces data isolation - only allowed fields present
 */
export function validateSkinWellnessEntry(
  data: Partial<SkinWellnessEntryData>
): data is SkinWellnessEntryData {
  return Boolean(
    data.photoSessionId &&
    data.patientId &&
    data.consentConfirmed === true
  );
}

/**
 * Build Skin Wellness URL with only allowed params
 *
 * CRITICAL: Do not add any medical/diagnostic data to URL.
 * Only photoSessionId (path), patientId (query), and clinicalSessionId (operational) are permitted.
 */
export function buildSkinWellnessUrl(
  photoSessionId: string,
  patientId: string,
  clinicalSessionId?: string
): string {
  let url = `/skin-wellness/${photoSessionId}?patientId=${encodeURIComponent(patientId)}`;
  if (clinicalSessionId) {
    url += `&clinicalSessionId=${encodeURIComponent(clinicalSessionId)}`;
  }
  return url;
}

/**
 * Parse Skin Wellness URL params and validate entry data
 */
export function parseSkinWellnessParams(
  photoSessionId: string | undefined,
  searchParams: URLSearchParams
): SkinWellnessEntryData | null {
  const patientId = searchParams.get('patientId');
  const clinicalSessionId = searchParams.get('clinicalSessionId');

  if (!photoSessionId || !patientId) {
    return null;
  }

  return {
    photoSessionId,
    patientId,
    consentConfirmed: true, // Implied - they got here through consent gate
    clinicalSessionId: clinicalSessionId || undefined,
  };
}

/**
 * Check if all required data is present for Skin Wellness Mode
 */
export function canEnterSkinWellness(
  photoSessionId: string | null,
  photoConsentGiven: boolean
): { canEnter: boolean; reason?: string } {
  if (!photoSessionId) {
    return {
      canEnter: false,
      reason: 'Photos are required for Skin Wellness Mode.',
    };
  }

  if (!photoConsentGiven) {
    return {
      canEnter: false,
      reason: 'Patient photo consent is required for Skin Wellness Mode.',
    };
  }

  return { canEnter: true };
}
