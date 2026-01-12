import { ClinicalEvaluationSession, ClinicalEvaluationSessionFormData, ClinicalEvaluationStatus, SelectedTreatment } from '@/types';
import { DbClinicalEvaluationSession } from '@/types/database';
import { logger } from '@/lib/logger';

// Convert database row to app type
function dbToClinicalEvaluation(row: DbClinicalEvaluationSession): ClinicalEvaluationSession {
  return {
    id: row.id,
    patientId: row.patient_id,
    doctorId: row.doctor_id,
    photoSessionId: row.photo_session_id,
    selectedSkinConcerns: row.selected_skin_concerns || [],
    selectedTreatments: (row.selected_treatments || []) as SelectedTreatment[],
    notes: row.notes,
    status: row.status as ClinicalEvaluationStatus,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// Get access token from localStorage
function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const storageKey = `sb-${new URL(supabaseUrl).hostname.split('.')[0]}-auth-token`;
  const storedSession = localStorage.getItem(storageKey);
  const sessionData = storedSession ? JSON.parse(storedSession) : null;
  return sessionData?.access_token || null;
}

// Create a new clinical evaluation session
export async function createClinicalEvaluation(
  patientId: string,
  doctorId: string,
  data: ClinicalEvaluationSessionFormData
): Promise<ClinicalEvaluationSession | null> {
  const accessToken = getAccessToken();
  if (!accessToken) {
    logger.error('[ClinicalEvaluation] No access token');
    return null;
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const response = await fetch(
      `${supabaseUrl}/rest/v1/clinical_evaluation_sessions`,
      {
        method: 'POST',
        headers: {
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation',
        },
        body: JSON.stringify({
          patient_id: patientId,
          doctor_id: doctorId,
          photo_session_id: data.photoSessionId || null,
          selected_skin_concerns: data.selectedSkinConcerns || [],
          selected_treatments: data.selectedTreatments || [],
          notes: data.notes || null,
          status: 'completed',
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      logger.error('[ClinicalEvaluation] Failed to create session:', response.status, errorText);
      return null;
    }

    const result = await response.json();
    return result[0] ? dbToClinicalEvaluation(result[0]) : null;
  } catch (error) {
    logger.error('[ClinicalEvaluation] Error creating session:', error);
    return null;
  }
}

// Get all clinical evaluations for a patient
export async function getClinicalEvaluations(patientId: string): Promise<ClinicalEvaluationSession[]> {
  const accessToken = getAccessToken();
  if (!accessToken) {
    logger.error('[ClinicalEvaluation] No access token');
    return [];
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const response = await fetch(
      `${supabaseUrl}/rest/v1/clinical_evaluation_sessions?patient_id=eq.${patientId}&select=*&order=created_at.desc`,
      {
        headers: {
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      logger.error('[ClinicalEvaluation] Failed to fetch sessions:', response.status);
      return [];
    }

    const data = await response.json();
    return data.map(dbToClinicalEvaluation);
  } catch (error) {
    logger.error('[ClinicalEvaluation] Error fetching sessions:', error);
    return [];
  }
}

// Get a single clinical evaluation by ID
export async function getClinicalEvaluation(sessionId: string): Promise<ClinicalEvaluationSession | null> {
  const accessToken = getAccessToken();
  if (!accessToken) {
    logger.error('[ClinicalEvaluation] No access token');
    return null;
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const response = await fetch(
      `${supabaseUrl}/rest/v1/clinical_evaluation_sessions?id=eq.${sessionId}&select=*`,
      {
        headers: {
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      logger.error('[ClinicalEvaluation] Failed to fetch session:', response.status);
      return null;
    }

    const data = await response.json();
    return data[0] ? dbToClinicalEvaluation(data[0]) : null;
  } catch (error) {
    logger.error('[ClinicalEvaluation] Error fetching session:', error);
    return null;
  }
}

// Update a clinical evaluation session
export async function updateClinicalEvaluation(
  sessionId: string,
  data: Partial<ClinicalEvaluationSessionFormData>
): Promise<ClinicalEvaluationSession | null> {
  const accessToken = getAccessToken();
  if (!accessToken) {
    logger.error('[ClinicalEvaluation] No access token');
    return null;
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;

    // Build update payload
    const updatePayload: Record<string, unknown> = {};
    if (data.photoSessionId !== undefined) {
      updatePayload.photo_session_id = data.photoSessionId;
    }
    if (data.selectedSkinConcerns !== undefined) {
      updatePayload.selected_skin_concerns = data.selectedSkinConcerns;
    }
    if (data.selectedTreatments !== undefined) {
      updatePayload.selected_treatments = data.selectedTreatments;
    }
    if (data.notes !== undefined) {
      updatePayload.notes = data.notes;
    }

    const response = await fetch(
      `${supabaseUrl}/rest/v1/clinical_evaluation_sessions?id=eq.${sessionId}`,
      {
        method: 'PATCH',
        headers: {
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation',
        },
        body: JSON.stringify(updatePayload),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      logger.error('[ClinicalEvaluation] Failed to update session:', response.status, errorText);
      return null;
    }

    const result = await response.json();
    return result[0] ? dbToClinicalEvaluation(result[0]) : null;
  } catch (error) {
    logger.error('[ClinicalEvaluation] Error updating session:', error);
    return null;
  }
}

// Delete a clinical evaluation session
export async function deleteClinicalEvaluation(sessionId: string): Promise<boolean> {
  const accessToken = getAccessToken();
  if (!accessToken) {
    logger.error('[ClinicalEvaluation] No access token');
    return false;
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const response = await fetch(
      `${supabaseUrl}/rest/v1/clinical_evaluation_sessions?id=eq.${sessionId}`,
      {
        method: 'DELETE',
        headers: {
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      logger.error('[ClinicalEvaluation] Failed to delete session:', response.status);
      return false;
    }

    return true;
  } catch (error) {
    logger.error('[ClinicalEvaluation] Error deleting session:', error);
    return false;
  }
}
