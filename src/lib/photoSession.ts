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

// Custom error class for photo upload failures
export class PhotoUploadError extends Error {
  constructor(message: string, public details?: string) {
    super(message);
    this.name = 'PhotoUploadError';
  }
}

// Upload a photo to Supabase Storage
export async function uploadPhoto(
  patientId: string,
  sessionId: string,
  photoType: 'frontal' | 'left-profile' | 'right-profile',
  file: File
): Promise<string> {
  const accessToken = getAccessToken();
  if (!accessToken) {
    logger.error('[PhotoSession] No access token');
    throw new PhotoUploadError('Authentication required', 'No access token found');
  }

  // Validate file before upload
  if (!file || file.size === 0) {
    throw new PhotoUploadError('Invalid photo file', 'File is empty or missing');
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const ext = file.name.split('.').pop() || 'jpg';
    const path = `${patientId}/${sessionId}/${photoType}.${ext}`;

    // Use a fallback content type if file.type is empty (common on iOS)
    const contentType = file.type || 'image/jpeg';

    console.log('[PhotoSession] Uploading photo:', { photoType, size: file.size, type: contentType, path });

    const response = await fetch(
      `${supabaseUrl}/storage/v1/object/patient-photos/${path}`,
      {
        method: 'POST',
        headers: {
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': contentType,
          'x-upsert': 'true', // Allow overwriting
        },
        body: file,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      logger.error('[PhotoSession] Failed to upload photo:', response.status, errorText);
      throw new PhotoUploadError(
        `Upload failed (${response.status})`,
        errorText.substring(0, 200)
      );
    }

    console.log('[PhotoSession] Photo uploaded successfully:', path);
    // Return the storage path (not full URL, we'll generate signed URLs when needed)
    return path;
  } catch (error) {
    if (error instanceof PhotoUploadError) {
      throw error;
    }
    logger.error('[PhotoSession] Error uploading photo:', error);
    throw new PhotoUploadError(
      'Network error during upload',
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}

// Extract storage path from a URL (handles signed URLs and full URLs)
export function extractStoragePath(urlOrPath: string): string {
  // If it's already a simple path (no http), return as-is
  if (!urlOrPath.startsWith('http')) {
    return urlOrPath;
  }

  try {
    const url = new URL(urlOrPath);
    // Handle signed URLs: /storage/v1/object/sign/patient-photos/{path}?token=...
    // Handle public URLs: /storage/v1/object/public/patient-photos/{path}
    const match = url.pathname.match(/\/storage\/v1\/object\/(?:sign|public)\/patient-photos\/(.+)/);
    if (match) {
      return match[1];
    }
    // Fallback: return the original if we can't parse it
    logger.warn('[PhotoSession] Could not extract path from URL:', urlOrPath);
    return urlOrPath;
  } catch {
    return urlOrPath;
  }
}

// Get a signed URL for a photo
export async function getSignedUrl(pathOrUrl: string): Promise<string | null> {
  const accessToken = getAccessToken();
  if (!accessToken) {
    logger.error('[PhotoSession] No access token');
    return null;
  }

  // Extract storage path if a full URL was passed
  const path = extractStoragePath(pathOrUrl);

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
): Promise<PhotoSession> {
  // Log consent before saving photos
  if (doctorId && formData.photoConsentGiven) {
    await logPhotoConsent(patientId, doctorId, formData.photoConsentGiven);
  }

  // Validate source
  if (!formData.source) {
    throw new PhotoUploadError('Photo source is required', 'Please select how photos were captured');
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
    console.log('[PhotoSession] Uploading frontal photo file:', {
      name: formData.frontalPhoto.name,
      size: formData.frontalPhoto.size,
      type: formData.frontalPhoto.type,
    });
    const path = await uploadPhoto(patientId, sessionId, 'frontal', formData.frontalPhoto);
    photoUrls.frontalPhotoUrl = path;
  } else if (typeof formData.frontalPhoto === 'string') {
    // Extract storage path from URL if needed (handles signed URLs from previous sessions)
    photoUrls.frontalPhotoUrl = extractStoragePath(formData.frontalPhoto);
  } else {
    throw new PhotoUploadError('Frontal photo is required', 'Please capture or upload the frontal photo');
  }

  // Upload left profile photo (optional)
  if (formData.leftProfilePhoto instanceof File) {
    try {
      const path = await uploadPhoto(patientId, sessionId, 'left-profile', formData.leftProfilePhoto);
      photoUrls.leftProfilePhotoUrl = path;
    } catch (error) {
      // Log but don't fail for optional photos
      console.warn('[PhotoSession] Failed to upload left profile photo:', error);
    }
  } else if (typeof formData.leftProfilePhoto === 'string') {
    // Extract storage path from URL if needed
    photoUrls.leftProfilePhotoUrl = extractStoragePath(formData.leftProfilePhoto);
  }

  // Upload right profile photo (optional)
  if (formData.rightProfilePhoto instanceof File) {
    try {
      const path = await uploadPhoto(patientId, sessionId, 'right-profile', formData.rightProfilePhoto);
      photoUrls.rightProfilePhotoUrl = path;
    } catch (error) {
      // Log but don't fail for optional photos
      console.warn('[PhotoSession] Failed to upload right profile photo:', error);
    }
  } else if (typeof formData.rightProfilePhoto === 'string') {
    // Extract storage path from URL if needed
    photoUrls.rightProfilePhotoUrl = extractStoragePath(formData.rightProfilePhoto);
  }

  // Create the session record
  const session = await createPhotoSession(patientId, formData.source, photoUrls);
  if (!session) {
    throw new PhotoUploadError('Failed to create photo session', 'Database error');
  }

  return session;
}
