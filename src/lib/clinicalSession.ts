/**
 * Clinical Session Service
 *
 * Manages clinical evaluation sessions throughout the documentation flow.
 * Sessions are created at the start and updated as the doctor progresses.
 */

import { logger } from './logger';

// ============================================================================
// Types
// ============================================================================

export type SessionStatus = 'draft' | 'in_progress' | 'completed' | 'abandoned';
export type PhaseStatus = 'pending' | 'in_progress' | 'completed' | 'skipped';

export interface ClinicalSession {
  id: string;
  patientId: string | null;
  doctorId: string;
  photoSessionId: string | null;
  currentStep: number;
  status: SessionStatus;
  medicalStatus: PhaseStatus;
  analysisStatus: PhaseStatus;
  skincareStatus: PhaseStatus;
  hasPhotos: boolean;
  hasConcerns: boolean;
  selectedSkinConcerns: string[];
  selectedTreatments: unknown[];
  notes: string | null;
  startedAt: string;
  medicalCompletedAt: string | null;
  analysisCompletedAt: string | null;
  skincareCompletedAt: string | null;
  lastActivityAt: string;
}

export interface CreateSessionInput {
  doctorId: string;
}

export interface UpdateSessionInput {
  patientId?: string;
  photoSessionId?: string;
  currentStep?: number;
  status?: SessionStatus;
  medicalStatus?: PhaseStatus;
  analysisStatus?: PhaseStatus;
  skincareStatus?: PhaseStatus;
  hasPhotos?: boolean;
  hasConcerns?: boolean;
  selectedSkinConcerns?: string[];
  selectedTreatments?: unknown[];
  notes?: string;
  medicalCompletedAt?: string;
  analysisCompletedAt?: string;
  skincareCompletedAt?: string;
}

// ============================================================================
// Helper Functions
// ============================================================================

function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const storageKey = `sb-${new URL(supabaseUrl).hostname.split('.')[0]}-auth-token`;
  const storedSession = localStorage.getItem(storageKey);
  const sessionData = storedSession ? JSON.parse(storedSession) : null;
  return sessionData?.access_token || null;
}

function mapDbToSession(row: Record<string, unknown>): ClinicalSession {
  return {
    id: row.id as string,
    patientId: row.patient_id as string | null,
    doctorId: row.doctor_id as string,
    photoSessionId: row.photo_session_id as string | null,
    currentStep: row.current_step as number,
    status: row.status as SessionStatus,
    medicalStatus: row.medical_status as PhaseStatus,
    analysisStatus: row.analysis_status as PhaseStatus,
    skincareStatus: row.skincare_status as PhaseStatus,
    hasPhotos: row.has_photos as boolean,
    hasConcerns: row.has_concerns as boolean,
    selectedSkinConcerns: (row.selected_skin_concerns as string[]) || [],
    selectedTreatments: (row.selected_treatments as unknown[]) || [],
    notes: row.notes as string | null,
    startedAt: row.started_at as string,
    medicalCompletedAt: row.medical_completed_at as string | null,
    analysisCompletedAt: row.analysis_completed_at as string | null,
    skincareCompletedAt: row.skincare_completed_at as string | null,
    lastActivityAt: row.last_activity_at as string,
  };
}

// ============================================================================
// CRUD Operations
// ============================================================================

/**
 * Create a new clinical session (called when doctor starts documentation)
 */
export async function createClinicalSession(
  input: CreateSessionInput
): Promise<ClinicalSession | null> {
  const accessToken = getAccessToken();
  if (!accessToken) {
    logger.error('[ClinicalSession] No access token');
    return null;
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const response = await fetch(`${supabaseUrl}/rest/v1/clinical_evaluation_sessions`, {
      method: 'POST',
      headers: {
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      body: JSON.stringify({
        doctor_id: input.doctorId,
        status: 'draft',
        medical_status: 'pending',
        analysis_status: 'pending',
        skincare_status: 'pending',
        current_step: 1,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error('[ClinicalSession] Failed to create session:', response.status, errorText);
      return null;
    }

    const result = await response.json();
    return result[0] ? mapDbToSession(result[0]) : null;
  } catch (error) {
    logger.error('[ClinicalSession] Error creating session:', error);
    return null;
  }
}

/**
 * Get a clinical session by ID
 */
export async function getClinicalSession(sessionId: string): Promise<ClinicalSession | null> {
  const accessToken = getAccessToken();
  if (!accessToken) {
    logger.error('[ClinicalSession] No access token');
    return null;
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const response = await fetch(
      `${supabaseUrl}/rest/v1/clinical_evaluation_sessions?id=eq.${sessionId}&select=*`,
      {
        headers: {
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      logger.error('[ClinicalSession] Failed to fetch session:', response.status);
      return null;
    }

    const result = await response.json();
    return result[0] ? mapDbToSession(result[0]) : null;
  } catch (error) {
    logger.error('[ClinicalSession] Error fetching session:', error);
    return null;
  }
}

/**
 * Update a clinical session
 */
export async function updateClinicalSession(
  sessionId: string,
  input: UpdateSessionInput
): Promise<ClinicalSession | null> {
  const accessToken = getAccessToken();
  if (!accessToken) {
    logger.error('[ClinicalSession] No access token');
    return null;
  }

  // Map camelCase to snake_case
  const payload: Record<string, unknown> = {};
  if (input.patientId !== undefined) payload.patient_id = input.patientId;
  if (input.photoSessionId !== undefined) payload.photo_session_id = input.photoSessionId;
  if (input.currentStep !== undefined) payload.current_step = input.currentStep;
  if (input.status !== undefined) payload.status = input.status;
  if (input.medicalStatus !== undefined) payload.medical_status = input.medicalStatus;
  if (input.analysisStatus !== undefined) payload.analysis_status = input.analysisStatus;
  if (input.skincareStatus !== undefined) payload.skincare_status = input.skincareStatus;
  if (input.hasPhotos !== undefined) payload.has_photos = input.hasPhotos;
  if (input.hasConcerns !== undefined) payload.has_concerns = input.hasConcerns;
  if (input.selectedSkinConcerns !== undefined) payload.selected_skin_concerns = input.selectedSkinConcerns;
  if (input.selectedTreatments !== undefined) payload.selected_treatments = input.selectedTreatments;
  if (input.notes !== undefined) payload.notes = input.notes;
  if (input.medicalCompletedAt !== undefined) payload.medical_completed_at = input.medicalCompletedAt;
  if (input.analysisCompletedAt !== undefined) payload.analysis_completed_at = input.analysisCompletedAt;
  if (input.skincareCompletedAt !== undefined) payload.skincare_completed_at = input.skincareCompletedAt;

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const response = await fetch(
      `${supabaseUrl}/rest/v1/clinical_evaluation_sessions?id=eq.${sessionId}`,
      {
        method: 'PATCH',
        headers: {
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          Prefer: 'return=representation',
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      logger.error('[ClinicalSession] Failed to update session:', response.status, errorText);
      return null;
    }

    const result = await response.json();
    return result[0] ? mapDbToSession(result[0]) : null;
  } catch (error) {
    logger.error('[ClinicalSession] Error updating session:', error);
    return null;
  }
}

/**
 * Get recent sessions for a doctor (for resuming incomplete sessions)
 */
export async function getRecentSessions(
  doctorId: string,
  limit: number = 10
): Promise<ClinicalSession[]> {
  const accessToken = getAccessToken();
  if (!accessToken) {
    logger.error('[ClinicalSession] No access token');
    return [];
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const response = await fetch(
      `${supabaseUrl}/rest/v1/clinical_evaluation_sessions?doctor_id=eq.${doctorId}&order=last_activity_at.desc&limit=${limit}&select=*`,
      {
        headers: {
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      logger.error('[ClinicalSession] Failed to fetch sessions:', response.status);
      return [];
    }

    const result = await response.json();
    return result.map(mapDbToSession);
  } catch (error) {
    logger.error('[ClinicalSession] Error fetching sessions:', error);
    return [];
  }
}

/**
 * Get incomplete sessions for a doctor (draft or in_progress)
 */
export async function getIncompleteSessions(doctorId: string): Promise<ClinicalSession[]> {
  const accessToken = getAccessToken();
  if (!accessToken) {
    logger.error('[ClinicalSession] No access token');
    return [];
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const response = await fetch(
      `${supabaseUrl}/rest/v1/clinical_evaluation_sessions?doctor_id=eq.${doctorId}&status=in.(draft,in_progress)&order=last_activity_at.desc&select=*`,
      {
        headers: {
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      logger.error('[ClinicalSession] Failed to fetch incomplete sessions:', response.status);
      return [];
    }

    const result = await response.json();
    return result.map(mapDbToSession);
  } catch (error) {
    logger.error('[ClinicalSession] Error fetching incomplete sessions:', error);
    return [];
  }
}

// ============================================================================
// Step Transition Helpers
// ============================================================================

/**
 * Start session: Move from draft to in_progress when patient is selected
 */
export async function startSession(
  sessionId: string,
  patientId: string
): Promise<ClinicalSession | null> {
  return updateClinicalSession(sessionId, {
    patientId,
    status: 'in_progress',
    medicalStatus: 'in_progress',
    currentStep: 2,
  });
}

/**
 * Move to next step
 */
export async function advanceStep(
  sessionId: string,
  nextStep: number,
  additionalData?: UpdateSessionInput
): Promise<ClinicalSession | null> {
  return updateClinicalSession(sessionId, {
    currentStep: nextStep,
    ...additionalData,
  });
}

/**
 * Complete medical phase (after summary step)
 */
export async function completeMedicalPhase(
  sessionId: string,
  skinConcerns: string[],
  treatments: unknown[]
): Promise<ClinicalSession | null> {
  return updateClinicalSession(sessionId, {
    medicalStatus: 'completed',
    medicalCompletedAt: new Date().toISOString(),
    selectedSkinConcerns: skinConcerns,
    selectedTreatments: treatments,
    hasConcerns: skinConcerns.length > 0,
  });
}

/**
 * Skip photos (mark analysis as skipped)
 */
export async function skipPhotos(sessionId: string): Promise<ClinicalSession | null> {
  return updateClinicalSession(sessionId, {
    hasPhotos: false,
    analysisStatus: 'skipped',
    currentStep: 4,
  });
}

/**
 * Save photos (link photo session)
 */
export async function savePhotosToSession(
  sessionId: string,
  photoSessionId: string
): Promise<ClinicalSession | null> {
  return updateClinicalSession(sessionId, {
    photoSessionId,
    hasPhotos: true,
    currentStep: 4,
  });
}

/**
 * Start analysis phase (entering Skin Wellness Mode)
 */
export async function startAnalysisPhase(sessionId: string): Promise<ClinicalSession | null> {
  return updateClinicalSession(sessionId, {
    analysisStatus: 'in_progress',
  });
}

/**
 * Complete analysis phase
 */
export async function completeAnalysisPhase(sessionId: string): Promise<ClinicalSession | null> {
  return updateClinicalSession(sessionId, {
    analysisStatus: 'completed',
    analysisCompletedAt: new Date().toISOString(),
  });
}

/**
 * Start skincare phase
 */
export async function startSkincarePhase(sessionId: string): Promise<ClinicalSession | null> {
  return updateClinicalSession(sessionId, {
    skincareStatus: 'in_progress',
  });
}

/**
 * Complete skincare phase (marks entire session as completed)
 */
export async function completeSkincarePhase(sessionId: string): Promise<ClinicalSession | null> {
  return updateClinicalSession(sessionId, {
    skincareStatus: 'completed',
    skincareCompletedAt: new Date().toISOString(),
    status: 'completed',
  });
}
