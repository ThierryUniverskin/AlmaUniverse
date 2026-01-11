import { PhotoSession, PhotoSessionFormData, PhotoSource, PhotoConsentLog, PHOTO_CONSENT_VERSION } from '@/types';
import { DbPhotoSession } from '@/types/database';
import { logger } from '@/lib/logger';

// Convert database row to app type
function dbToPhotoSession(row: DbPhotoSession): PhotoSession {
  return {
    id: row.id,
    patientId: row.patient_id,
    source: row.source as PhotoSource,
    frontalPhotoUrl: row.frontal_photo_url,
    leftProfilePhotoUrl: row.left_profile_photo_url,
    rightProfilePhotoUrl: row.right_profile_photo_url,
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

// Upload a photo to Supabase Storage
export async function uploadPhoto(
  patientId: string,
  sessionId: string,
  photoType: 'frontal' | 'left-profile' | 'right-profile',
  file: File
): Promise<string | null> {
  const accessToken = getAccessToken();
  if (!accessToken) {
    logger.error('[PhotoSession] No access token');
    return null;
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const ext = file.name.split('.').pop() || 'jpg';
    const path = `${patientId}/${sessionId}/${photoType}.${ext}`;

    const response = await fetch(
      `${supabaseUrl}/storage/v1/object/patient-photos/${path}`,
      {
        method: 'POST',
        headers: {
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': file.type,
          'x-upsert': 'true', // Allow overwriting
        },
        body: file,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      logger.error('[PhotoSession] Failed to upload photo:', response.status, errorText);
      return null;
    }

    // Return the storage path (not full URL, we'll generate signed URLs when needed)
    return path;
  } catch (error) {
    logger.error('[PhotoSession] Error uploading photo:', error);
    return null;
  }
}

// Get a signed URL for a photo
export async function getSignedUrl(path: string): Promise<string | null> {
  const accessToken = getAccessToken();
  if (!accessToken) {
    logger.error('[PhotoSession] No access token');
    return null;
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const response = await fetch(
      `${supabaseUrl}/storage/v1/object/sign/patient-photos/${path}`,
      {
        method: 'POST',
        headers: {
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ expiresIn: 3600 }), // 1 hour expiry
      }
    );

    if (!response.ok) {
      logger.error('[PhotoSession] Failed to get signed URL:', response.status);
      return null;
    }

    const data = await response.json();
    return data.signedURL ? `${supabaseUrl}/storage/v1${data.signedURL}` : null;
  } catch (error) {
    logger.error('[PhotoSession] Error getting signed URL:', error);
    return null;
  }
}

// Create a new photo session
export async function createPhotoSession(
  patientId: string,
  source: PhotoSource,
  photoUrls: {
    frontalPhotoUrl?: string | null;
    leftProfilePhotoUrl?: string | null;
    rightProfilePhotoUrl?: string | null;
  }
): Promise<PhotoSession | null> {
  const accessToken = getAccessToken();
  if (!accessToken) {
    logger.error('[PhotoSession] No access token');
    return null;
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const response = await fetch(
      `${supabaseUrl}/rest/v1/photo_sessions`,
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
          source: source,
          frontal_photo_url: photoUrls.frontalPhotoUrl || null,
          left_profile_photo_url: photoUrls.leftProfilePhotoUrl || null,
          right_profile_photo_url: photoUrls.rightProfilePhotoUrl || null,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      logger.error('[PhotoSession] Failed to create session:', response.status, errorText);
      return null;
    }

    const result = await response.json();
    return result[0] ? dbToPhotoSession(result[0]) : null;
  } catch (error) {
    logger.error('[PhotoSession] Error creating session:', error);
    return null;
  }
}

// Get photo sessions for a patient
export async function getPhotoSessions(patientId: string): Promise<PhotoSession[]> {
  const accessToken = getAccessToken();
  if (!accessToken) {
    logger.error('[PhotoSession] No access token');
    return [];
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const response = await fetch(
      `${supabaseUrl}/rest/v1/photo_sessions?patient_id=eq.${patientId}&select=*&order=created_at.desc`,
      {
        headers: {
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      logger.error('[PhotoSession] Failed to fetch sessions:', response.status);
      return [];
    }

    const data = await response.json();
    return data.map(dbToPhotoSession);
  } catch (error) {
    logger.error('[PhotoSession] Error fetching sessions:', error);
    return [];
  }
}

// Log photo consent for audit trail
async function logPhotoConsent(
  patientId: string,
  doctorId: string,
  consentGiven: boolean
): Promise<boolean> {
  const accessToken = getAccessToken();
  if (!accessToken) {
    logger.error('[PhotoSession] No access token for consent logging');
    return false;
  }

  const consentLog: PhotoConsentLog = {
    timestamp: new Date().toISOString(),
    physicianUserId: doctorId,
    patientRecordId: patientId,
    consentTextVersion: PHOTO_CONSENT_VERSION,
    consentGiven: consentGiven,
  };

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const response = await fetch(
      `${supabaseUrl}/rest/v1/photo_consent_logs`,
      {
        method: 'POST',
        headers: {
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patient_id: patientId,
          doctor_id: doctorId,
          consent_given: consentGiven,
          consent_text_version: PHOTO_CONSENT_VERSION,
        }),
      }
    );

    if (!response.ok) {
      // Log to console but don't fail the operation if table doesn't exist yet
      logger.warn('[PhotoSession] Could not log consent to database:', response.status);
      logger.debug('[PhotoSession] Consent logged locally:', consentLog);
      return true; // Continue even if DB logging fails
    }

    logger.debug('[PhotoSession] Consent logged successfully:', consentLog);
    return true;
  } catch (error) {
    logger.warn('[PhotoSession] Error logging consent:', error);
    logger.debug('[PhotoSession] Consent logged locally:', consentLog);
    return true; // Continue even if DB logging fails
  }
}

// Helper function to save photos and create session
export async function savePhotoSession(
  patientId: string,
  formData: PhotoSessionFormData,
  doctorId?: string
): Promise<PhotoSession | null> {
  // Log consent before saving photos
  if (doctorId && formData.photoConsentGiven) {
    await logPhotoConsent(patientId, doctorId, formData.photoConsentGiven);
  }

  // Generate a temporary session ID for organizing uploads
  const sessionId = crypto.randomUUID();

  // Upload photos and collect URLs
  const photoUrls: {
    frontalPhotoUrl?: string | null;
    leftProfilePhotoUrl?: string | null;
    rightProfilePhotoUrl?: string | null;
  } = {};

  // Upload frontal photo (required)
  if (formData.frontalPhoto instanceof File) {
    const path = await uploadPhoto(patientId, sessionId, 'frontal', formData.frontalPhoto);
    if (!path) {
      logger.error('[PhotoSession] Failed to upload frontal photo');
      return null;
    }
    photoUrls.frontalPhotoUrl = path;
  } else if (typeof formData.frontalPhoto === 'string') {
    photoUrls.frontalPhotoUrl = formData.frontalPhoto;
  }

  // Upload left profile photo (optional)
  if (formData.leftProfilePhoto instanceof File) {
    const path = await uploadPhoto(patientId, sessionId, 'left-profile', formData.leftProfilePhoto);
    if (path) {
      photoUrls.leftProfilePhotoUrl = path;
    }
  } else if (typeof formData.leftProfilePhoto === 'string') {
    photoUrls.leftProfilePhotoUrl = formData.leftProfilePhoto;
  }

  // Upload right profile photo (optional)
  if (formData.rightProfilePhoto instanceof File) {
    const path = await uploadPhoto(patientId, sessionId, 'right-profile', formData.rightProfilePhoto);
    if (path) {
      photoUrls.rightProfilePhotoUrl = path;
    }
  } else if (typeof formData.rightProfilePhoto === 'string') {
    photoUrls.rightProfilePhotoUrl = formData.rightProfilePhoto;
  }

  // Create the session record
  if (!formData.source) {
    logger.error('Photo source is required');
    return null;
  }
  return createPhotoSession(patientId, formData.source, photoUrls);
}
