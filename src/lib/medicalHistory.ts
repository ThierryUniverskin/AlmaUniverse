import { PatientMedicalHistory, PatientMedicalHistoryFormData, CosmeticSensitivityType, CancerType, FitzpatrickType, RecoveryTimePreference } from '@/types';
import { DbPatientMedicalHistory } from '@/types/database';
import { logger } from '@/lib/logger';

// Convert database row to app type
function dbToMedicalHistory(row: DbPatientMedicalHistory): PatientMedicalHistory {
  return {
    id: row.id,
    patientId: row.patient_id,
    // CLINICAL MEDICAL HISTORY
    fitzpatrickSkinType: row.fitzpatrick_skin_type ?? undefined,
    recoveryTimePreferences: (row.recovery_time_preferences || []) as RecoveryTimePreference[],
    hasCancerHistory: row.has_cancer_history,
    cancerTypes: (row.cancer_types || []) as CancerType[],
    cancerDetails: row.cancer_details ?? undefined,
    currentMedications: row.current_medications ?? undefined,
    relevantMedicalConditions: row.relevant_medical_conditions ?? undefined,
    // COSMETIC SAFETY PROFILE
    isPregnantOrBreastfeeding: row.is_pregnant_or_breastfeeding,
    menopausalStatus: row.menopausal_status ?? undefined,
    hasExfoliantSensitivity: row.has_exfoliant_sensitivity,
    cosmeticSensitivities: (row.cosmetic_sensitivities || []) as CosmeticSensitivityType[],
    otherSensitivities: row.other_sensitivities ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// Convert form data to database format
function formToDbData(data: PatientMedicalHistoryFormData) {
  return {
    // CLINICAL MEDICAL HISTORY
    fitzpatrick_skin_type: data.fitzpatrickSkinType || null,
    recovery_time_preferences: data.recoveryTimePreferences,
    has_cancer_history: data.hasCancerHistory,
    cancer_types: data.cancerTypes,
    cancer_details: data.cancerDetails || null,
    current_medications: data.currentMedications || null,
    relevant_medical_conditions: data.relevantMedicalConditions || null,
    // COSMETIC SAFETY PROFILE
    is_pregnant_or_breastfeeding: data.isPregnantOrBreastfeeding,
    menopausal_status: data.menopausalStatus || null,
    has_exfoliant_sensitivity: data.hasExfoliantSensitivity,
    cosmetic_sensitivities: data.cosmeticSensitivities,
    other_sensitivities: data.otherSensitivities || null,
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

// Get medical history for a patient
export async function getMedicalHistory(patientId: string): Promise<PatientMedicalHistory | null> {
  const accessToken = getAccessToken();
  if (!accessToken) {
    logger.error('[MedicalHistory] No access token');
    return null;
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const response = await fetch(
      `${supabaseUrl}/rest/v1/patient_medical_history?patient_id=eq.${patientId}&select=*`,
      {
        headers: {
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      logger.error('[MedicalHistory] Failed to fetch:', response.status);
      return null;
    }

    const data = await response.json();
    return data[0] ? dbToMedicalHistory(data[0]) : null;
  } catch (error) {
    logger.error('[MedicalHistory] Error fetching:', error);
    return null;
  }
}

// Save new medical history for a patient
export async function saveMedicalHistory(
  patientId: string,
  data: PatientMedicalHistoryFormData
): Promise<PatientMedicalHistory | null> {
  const accessToken = getAccessToken();
  if (!accessToken) {
    logger.error('[MedicalHistory] No access token');
    return null;
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const response = await fetch(
      `${supabaseUrl}/rest/v1/patient_medical_history`,
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
          ...formToDbData(data),
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      logger.error('[MedicalHistory] Failed to save:', response.status, errorText);
      return null;
    }

    const result = await response.json();
    return result[0] ? dbToMedicalHistory(result[0]) : null;
  } catch (error) {
    logger.error('[MedicalHistory] Error saving:', error);
    return null;
  }
}

// Update existing medical history
export async function updateMedicalHistory(
  historyId: string,
  data: PatientMedicalHistoryFormData
): Promise<PatientMedicalHistory | null> {
  const accessToken = getAccessToken();
  if (!accessToken) {
    logger.error('[MedicalHistory] No access token');
    return null;
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const response = await fetch(
      `${supabaseUrl}/rest/v1/patient_medical_history?id=eq.${historyId}`,
      {
        method: 'PATCH',
        headers: {
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation',
        },
        body: JSON.stringify(formToDbData(data)),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      logger.error('[MedicalHistory] Failed to update:', response.status, errorText);
      return null;
    }

    const result = await response.json();
    return result[0] ? dbToMedicalHistory(result[0]) : null;
  } catch (error) {
    logger.error('[MedicalHistory] Error updating:', error);
    return null;
  }
}

// Convert PatientMedicalHistory to form data (for pre-filling)
export function historyToFormData(history: PatientMedicalHistory): PatientMedicalHistoryFormData {
  return {
    // CLINICAL MEDICAL HISTORY
    fitzpatrickSkinType: history.fitzpatrickSkinType,
    recoveryTimePreferences: history.recoveryTimePreferences,
    hasCancerHistory: history.hasCancerHistory,
    cancerTypes: history.cancerTypes,
    cancerDetails: history.cancerDetails,
    currentMedications: history.currentMedications,
    relevantMedicalConditions: history.relevantMedicalConditions,
    // COSMETIC SAFETY PROFILE
    isPregnantOrBreastfeeding: history.isPregnantOrBreastfeeding,
    menopausalStatus: history.menopausalStatus,
    hasExfoliantSensitivity: history.hasExfoliantSensitivity,
    cosmeticSensitivities: history.cosmeticSensitivities,
    otherSensitivities: history.otherSensitivities,
  };
}
