/**
 * Skin Wellness Validation
 *
 * Handles saving doctor-validated skin diagnostics and tracking changes
 * for future ML improvement.
 */

import { SkinAnalysisResult, PatientAttributes } from './skinWellnessCategories';
import { SkinWellnessDetail } from './skinWellnessDetails';
import { logger } from './logger';

// ============================================================================
// Types
// ============================================================================

/**
 * Score change tracking
 */
export interface ScoreChange {
  categoryId: string;
  aiValue: number;
  doctorValue: number;
}

/**
 * Detail parameter change tracking
 */
export interface DetailChange {
  categoryId: string;
  parameterKey: string;
  parameterName: string;
  aiValue: number;
  doctorValue: number;
}

/**
 * Attribute change tracking
 */
export interface AttributeChange {
  field: keyof PatientAttributes;
  aiValue: string;
  doctorValue: string;
}

/**
 * Complete modifications record for ML training
 */
export interface ValidationModifications {
  scoreChanges: ScoreChange[];
  detailChanges: DetailChange[];
  attributeChanges: AttributeChange[];
  overviewChanged: boolean;
  concernsChanged: boolean;
  totalChanges: number;
}

/**
 * Data to save for a validated diagnostic
 */
export interface ValidatedDiagnosticData {
  photoSessionId: string;
  skinAnalysisId: string;
  doctorId: string;
  validatedScores: SkinAnalysisResult[];
  validatedDetails: Record<string, SkinWellnessDetail[]>;
  validatedAttributes: PatientAttributes | null;
  validatedOverviewText: string;
  priorityFaceConcerns: string[];
  priorityAdditionalConcerns: string[];
  concernsManuallyEdited: boolean;
  modifications: ValidationModifications;
}

/**
 * Saved validation record
 */
export interface SkinAnalysisValidation {
  id: string;
  skinAnalysisId: string;
  photoSessionId: string;
  doctorId: string;
  validatedScores: SkinAnalysisResult[];
  validatedDetails: Record<string, SkinWellnessDetail[]> | null;
  validatedAttributes: PatientAttributes | null;
  validatedOverviewText: string | null;
  priorityFaceConcerns: string[];
  priorityAdditionalConcerns: string[];
  concernsManuallyEdited: boolean;
  modifications: ValidationModifications | null;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get access token from localStorage
 */
function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const storageKey = `sb-${new URL(supabaseUrl).hostname.split('.')[0]}-auth-token`;
  const storedSession = localStorage.getItem(storageKey);
  const sessionData = storedSession ? JSON.parse(storedSession) : null;
  return sessionData?.access_token || null;
}

/**
 * Compute modifications between AI analysis and doctor's validated data
 */
export function computeModifications(
  aiScores: SkinAnalysisResult[],
  doctorScores: SkinAnalysisResult[],
  aiDetails: Record<string, SkinWellnessDetail[]> | null,
  doctorDetails: Record<string, SkinWellnessDetail[]>,
  aiAttributes: PatientAttributes | null,
  doctorAttributes: PatientAttributes | null,
  aiOverviewText: string | null,
  doctorOverviewText: string,
  aiConcerns: { face: string[]; additional: string[] },
  doctorConcerns: { face: string[]; additional: string[] },
  concernsManuallyEdited: boolean
): ValidationModifications {
  const scoreChanges: ScoreChange[] = [];
  const detailChanges: DetailChange[] = [];
  const attributeChanges: AttributeChange[] = [];

  // Track score changes
  for (const doctorScore of doctorScores) {
    const aiScore = aiScores.find((s) => s.categoryId === doctorScore.categoryId);
    if (aiScore && aiScore.visibilityLevel !== doctorScore.visibilityLevel) {
      scoreChanges.push({
        categoryId: doctorScore.categoryId,
        aiValue: aiScore.visibilityLevel,
        doctorValue: doctorScore.visibilityLevel,
      });
    }
  }

  // Track detail parameter changes
  if (aiDetails) {
    for (const [categoryId, doctorParams] of Object.entries(doctorDetails)) {
      const aiParams = aiDetails[categoryId] || [];
      for (const doctorParam of doctorParams) {
        const aiParam = aiParams.find((p) => p.key === doctorParam.key);
        // Compare doctor's current value to AI original (use aiScoreValue if available)
        const aiValue = doctorParam.aiScoreValue ?? aiParam?.scoreValue;
        if (aiValue !== undefined && aiValue !== doctorParam.scoreValue) {
          detailChanges.push({
            categoryId,
            parameterKey: doctorParam.key,
            parameterName: doctorParam.label,
            aiValue,
            doctorValue: doctorParam.scoreValue,
          });
        }
      }
    }
  }

  // Track attribute changes
  if (aiAttributes && doctorAttributes) {
    const attributeKeys: (keyof PatientAttributes)[] = [
      'gender',
      'eyeColor',
      'fitzpatrickType',
      'skinThickness',
      'skinType',
    ];
    for (const key of attributeKeys) {
      if (aiAttributes[key] !== doctorAttributes[key]) {
        attributeChanges.push({
          field: key,
          aiValue: String(aiAttributes[key]),
          doctorValue: String(doctorAttributes[key]),
        });
      }
    }
  }

  // Check if overview text changed
  const overviewChanged = (aiOverviewText || '') !== doctorOverviewText;

  // Check if concerns changed
  const concernsChanged = concernsManuallyEdited;

  const totalChanges =
    scoreChanges.length +
    detailChanges.length +
    attributeChanges.length +
    (overviewChanged ? 1 : 0) +
    (concernsChanged ? 1 : 0);

  return {
    scoreChanges,
    detailChanges,
    attributeChanges,
    overviewChanged,
    concernsChanged,
    totalChanges,
  };
}

// ============================================================================
// Database Operations
// ============================================================================

/**
 * Save or update validated diagnostic
 *
 * Uses upsert with photo_session_id as unique key.
 * If a validation already exists for this session, it will be overwritten.
 */
export async function saveValidatedDiagnostic(
  data: ValidatedDiagnosticData
): Promise<SkinAnalysisValidation | null> {
  const accessToken = getAccessToken();
  if (!accessToken) {
    logger.error('[SkinWellnessValidation] No access token');
    return null;
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const apiKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    // Prepare database record
    const dbRecord = {
      skin_analysis_id: data.skinAnalysisId,
      photo_session_id: data.photoSessionId,
      doctor_id: data.doctorId,
      validated_scores: data.validatedScores,
      validated_details: data.validatedDetails,
      validated_attributes: data.validatedAttributes,
      validated_overview_text: data.validatedOverviewText,
      priority_face_concerns: data.priorityFaceConcerns,
      priority_additional_concerns: data.priorityAdditionalConcerns,
      concerns_manually_edited: data.concernsManuallyEdited,
      modifications: data.modifications,
      updated_at: new Date().toISOString(),
    };

    // Upsert: insert or update on conflict
    const response = await fetch(
      `${supabaseUrl}/rest/v1/skin_analysis_validations?on_conflict=photo_session_id`,
      {
        method: 'POST',
        headers: {
          apikey: apiKey,
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          Prefer: 'resolution=merge-duplicates,return=representation',
        },
        body: JSON.stringify(dbRecord),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      logger.error('[SkinWellnessValidation] Save failed:', response.status, errorText);
      return null;
    }

    const result = await response.json();
    const saved = result[0];

    if (!saved) {
      logger.error('[SkinWellnessValidation] No data returned from save');
      return null;
    }

    logger.log('[SkinWellnessValidation] Saved validation:', saved.id);

    return {
      id: saved.id,
      skinAnalysisId: saved.skin_analysis_id,
      photoSessionId: saved.photo_session_id,
      doctorId: saved.doctor_id,
      validatedScores: saved.validated_scores,
      validatedDetails: saved.validated_details,
      validatedAttributes: saved.validated_attributes,
      validatedOverviewText: saved.validated_overview_text,
      priorityFaceConcerns: saved.priority_face_concerns || [],
      priorityAdditionalConcerns: saved.priority_additional_concerns || [],
      concernsManuallyEdited: saved.concerns_manually_edited,
      modifications: saved.modifications,
      createdAt: saved.created_at,
      updatedAt: saved.updated_at,
    };
  } catch (error) {
    logger.error('[SkinWellnessValidation] Error saving:', error);
    return null;
  }
}

/**
 * Get existing validation for a photo session
 */
export async function getValidatedDiagnostic(
  photoSessionId: string
): Promise<SkinAnalysisValidation | null> {
  const accessToken = getAccessToken();
  if (!accessToken) {
    logger.error('[SkinWellnessValidation] No access token');
    return null;
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const apiKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    const response = await fetch(
      `${supabaseUrl}/rest/v1/skin_analysis_validations?photo_session_id=eq.${photoSessionId}&select=*`,
      {
        headers: {
          apikey: apiKey,
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      logger.error('[SkinWellnessValidation] Fetch failed:', response.status);
      return null;
    }

    const data = await response.json();
    const row = data[0];

    if (!row) {
      return null;
    }

    return {
      id: row.id,
      skinAnalysisId: row.skin_analysis_id,
      photoSessionId: row.photo_session_id,
      doctorId: row.doctor_id,
      validatedScores: row.validated_scores,
      validatedDetails: row.validated_details,
      validatedAttributes: row.validated_attributes,
      validatedOverviewText: row.validated_overview_text,
      priorityFaceConcerns: row.priority_face_concerns || [],
      priorityAdditionalConcerns: row.priority_additional_concerns || [],
      concernsManuallyEdited: row.concerns_manually_edited,
      modifications: row.modifications,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  } catch (error) {
    logger.error('[SkinWellnessValidation] Error fetching:', error);
    return null;
  }
}

/**
 * Delete validation for a photo session
 * Used when doctor wants to reset to AI values
 */
export async function deleteValidatedDiagnostic(photoSessionId: string): Promise<boolean> {
  const accessToken = getAccessToken();
  if (!accessToken) {
    logger.error('[SkinWellnessValidation] No access token');
    return false;
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const apiKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    const response = await fetch(
      `${supabaseUrl}/rest/v1/skin_analysis_validations?photo_session_id=eq.${photoSessionId}`,
      {
        method: 'DELETE',
        headers: {
          apikey: apiKey,
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      logger.error('[SkinWellnessValidation] Delete failed:', response.status);
      return false;
    }

    logger.log('[SkinWellnessValidation] Deleted validation for session:', photoSessionId);
    return true;
  } catch (error) {
    logger.error('[SkinWellnessValidation] Error deleting:', error);
    return false;
  }
}
