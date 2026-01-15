/**
 * Skin Analysis Service
 *
 * Handles interactions with the SkinXS diagnostic API and database operations.
 */

import { getSignedUrl } from './photoSession';
import { parseApiResponse, type SkinXSApiResponse, type ParsedAnalysisResult } from './skinAnalysisMapping';

const SKINXS_API_URL = 'https://website-skinxs-api-lzetymrodq-uc.a.run.app/analyze_images/';
const RATE_LIMIT_PER_MONTH = 1000;

// Helper functions to get Supabase config
function getSupabaseUrl(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_URL || '';
}

function getSupabaseKey(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
}

// Service role key for server-side operations (bypasses RLS)
function getSupabaseServiceKey(): string {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || '';
}

// ============================================================================
// Types
// ============================================================================

export interface AnalysisStatus {
  status: 'pending' | 'completed' | 'failed';
  errorMessage?: string;
  result?: ParsedAnalysisResult;
  skinAnalysisId?: string; // Database record ID for validated diagnostics
}

export interface PhotoUrls {
  frontal: string;
  leftProfile?: string;
  rightProfile?: string;
}

// ============================================================================
// Rate Limiting
// ============================================================================

/**
 * Check if doctor is within rate limit
 */
export async function checkRateLimit(doctorId: string): Promise<{
  withinLimit: boolean;
  currentCount: number;
  limit: number;
}> {
  const supabaseUrl = getSupabaseUrl();
  const serviceKey = getSupabaseServiceKey();
  const monthYear = new Date().toISOString().slice(0, 7); // YYYY-MM

  const response = await fetch(
    `${supabaseUrl}/rest/v1/api_usage_logs?doctor_id=eq.${doctorId}&api_name=eq.skinxs_analysis&month_year=eq.${monthYear}&select=request_count`,
    {
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
      },
    }
  );

  if (!response.ok) {
    console.error('Failed to check rate limit:', response.statusText);
    return { withinLimit: true, currentCount: 0, limit: RATE_LIMIT_PER_MONTH };
  }

  const data = await response.json();
  const currentCount = data[0]?.request_count || 0;

  return {
    withinLimit: currentCount < RATE_LIMIT_PER_MONTH,
    currentCount,
    limit: RATE_LIMIT_PER_MONTH,
  };
}

/**
 * Increment API usage counter
 */
export async function incrementUsage(doctorId: string): Promise<number> {
  const supabaseUrl = getSupabaseUrl();
  const serviceKey = getSupabaseServiceKey();
  const monthYear = new Date().toISOString().slice(0, 7);

  // Try to upsert using RPC function
  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/increment_api_usage`, {
    method: 'POST',
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      p_doctor_id: doctorId,
      p_api_name: 'skinxs_analysis',
      p_month_year: monthYear,
    }),
  });

  if (!response.ok) {
    console.error('Failed to increment usage:', response.statusText);
    return 0;
  }

  const count = await response.json();
  return count;
}

// ============================================================================
// Photo Fetching
// ============================================================================

/**
 * Get photo session data
 */
export async function getPhotoSession(photoSessionId: string): Promise<{
  id: string;
  patientId: string;
  frontalPhotoUrl: string | null;
  leftProfilePhotoUrl: string | null;
  rightProfilePhotoUrl: string | null;
} | null> {
  const supabaseUrl = getSupabaseUrl();
  const serviceKey = getSupabaseServiceKey();

  const response = await fetch(
    `${supabaseUrl}/rest/v1/photo_sessions?id=eq.${photoSessionId}&select=id,patient_id,frontal_photo_url,left_profile_photo_url,right_profile_photo_url`,
    {
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
      },
    }
  );

  if (!response.ok) {
    console.error('Failed to fetch photo session:', response.statusText);
    return null;
  }

  const data = await response.json();
  if (data.length === 0) return null;

  const session = data[0];
  return {
    id: session.id,
    patientId: session.patient_id,
    frontalPhotoUrl: session.frontal_photo_url,
    leftProfilePhotoUrl: session.left_profile_photo_url,
    rightProfilePhotoUrl: session.right_profile_photo_url,
  };
}

/**
 * Download photo from signed URL as buffer
 */
export async function downloadPhoto(signedUrl: string): Promise<ArrayBuffer | null> {
  try {
    const response = await fetch(signedUrl);
    if (!response.ok) {
      console.error('Failed to download photo:', response.statusText);
      return null;
    }
    return await response.arrayBuffer();
  } catch (error) {
    console.error('Error downloading photo:', error);
    return null;
  }
}

/**
 * Get signed URL for a photo (server-side version using service role key)
 */
export async function getSignedUrlServerSide(pathOrUrl: string): Promise<string | null> {
  const supabaseUrl = getSupabaseUrl();
  const serviceKey = getSupabaseServiceKey();

  // Extract storage path if a full URL was passed
  let path = pathOrUrl;
  if (pathOrUrl.startsWith('http')) {
    try {
      const url = new URL(pathOrUrl);
      const match = url.pathname.match(/\/storage\/v1\/object\/(?:sign|public)\/patient-photos\/(.+)/);
      if (match) {
        path = match[1];
      }
    } catch {
      // Keep original path
    }
  }

  try {
    const response = await fetch(
      `${supabaseUrl}/storage/v1/object/sign/patient-photos/${path}`,
      {
        method: 'POST',
        headers: {
          'apikey': serviceKey,
          'Authorization': `Bearer ${serviceKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ expiresIn: 3600 }), // 1 hour expiry
      }
    );

    if (!response.ok) {
      console.error('Failed to get signed URL:', response.status, await response.text());
      return null;
    }

    const data = await response.json();
    return data.signedURL ? `${supabaseUrl}/storage/v1${data.signedURL}` : null;
  } catch (error) {
    console.error('Error getting signed URL:', error);
    return null;
  }
}

// ============================================================================
// Analysis Result Storage
// ============================================================================

/**
 * Save analysis result to database (upsert - replaces existing)
 */
export async function saveAnalysisResult(
  photoSessionId: string,
  patientId: string,
  doctorId: string,
  result: ParsedAnalysisResult,
  clinicalSessionId?: string
): Promise<boolean> {
  const supabaseUrl = getSupabaseUrl();
  const serviceKey = getSupabaseServiceKey();

  const payload: Record<string, unknown> = {
    photo_session_id: photoSessionId,
    patient_id: patientId,
    doctor_id: doctorId,
    diagnostic_id: result.diagnosticId,
    api_language: result.apiLanguage,
    raw_response: result.rawResponse,
    raw_response_translated: result.rawResponseTranslated,
    gender: result.gender,
    age_group: result.ageGroup,
    estimated_age: result.estimatedAge,
    ethnicity: result.ethnicity,
    eye_color: result.eyeColor,
    hair_color: result.hairColor,
    phototype: result.phototype,
    skin_thickness: result.skinThickness,
    skin_type: result.skinType,
    skin_age: result.skinAge,
    skin_health_overview: result.skinHealthOverview,
    priority_concerns: result.priorityConcerns,
    score_radiance: result.scoreRadiance,
    score_smoothness: result.scoreSmoothness,
    score_redness: result.scoreRedness,
    score_hydration: result.scoreHydration,
    score_shine: result.scoreShine,
    score_texture: result.scoreTexture,
    score_blemishes: result.scoreBlemishes,
    score_tone: result.scoreTone,
    score_eye_contour: result.scoreEyeContour,
    score_neck_decollete: result.scoreNeckDecollete,
    parameter_scores: result.parameterScores,
    image_quality_score: result.imageQualityScore,
    image_quality_summary: result.imageQualitySummary,
    status: 'completed',
    completed_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // Add clinical_session_id if provided
  if (clinicalSessionId) {
    payload.clinical_session_id = clinicalSessionId;
  }

  // Delete existing record for this photo session (if any)
  await fetch(
    `${supabaseUrl}/rest/v1/skin_analysis_results?photo_session_id=eq.${photoSessionId}`,
    {
      method: 'DELETE',
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
      },
    }
  );

  // Insert new record
  const response = await fetch(`${supabaseUrl}/rest/v1/skin_analysis_results`, {
    method: 'POST',
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    console.error('Failed to save analysis result:', response.statusText);
    return false;
  }

  return true;
}

/**
 * Save pending analysis status
 */
export async function savePendingAnalysis(
  photoSessionId: string,
  patientId: string,
  doctorId: string,
  clinicalSessionId?: string
): Promise<boolean> {
  const supabaseUrl = getSupabaseUrl();
  const serviceKey = getSupabaseServiceKey();

  // Delete existing record for this photo session (if any)
  await fetch(
    `${supabaseUrl}/rest/v1/skin_analysis_results?photo_session_id=eq.${photoSessionId}`,
    {
      method: 'DELETE',
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
      },
    }
  );

  const payload: Record<string, unknown> = {
    photo_session_id: photoSessionId,
    patient_id: patientId,
    doctor_id: doctorId,
    raw_response: {}, // Empty placeholder
    status: 'pending',
  };

  // Add clinical_session_id if provided
  if (clinicalSessionId) {
    payload.clinical_session_id = clinicalSessionId;
  }

  const response = await fetch(`${supabaseUrl}/rest/v1/skin_analysis_results`, {
    method: 'POST',
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    console.error('Failed to save pending analysis:', response.statusText);
    return false;
  }

  return true;
}

/**
 * Save failed analysis status
 */
export async function saveFailedAnalysis(
  photoSessionId: string,
  errorMessage: string
): Promise<boolean> {
  const supabaseUrl = getSupabaseUrl();
  const serviceKey = getSupabaseServiceKey();

  const response = await fetch(
    `${supabaseUrl}/rest/v1/skin_analysis_results?photo_session_id=eq.${photoSessionId}`,
    {
      method: 'PATCH',
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({
        status: 'failed',
        error_message: errorMessage,
        updated_at: new Date().toISOString(),
      }),
    }
  );

  if (!response.ok) {
    console.error('Failed to save failed analysis:', response.statusText);
    return false;
  }

  return true;
}

/**
 * Get analysis result from database
 */
export async function getAnalysisResult(photoSessionId: string): Promise<AnalysisStatus | null> {
  const supabaseUrl = getSupabaseUrl();
  const serviceKey = getSupabaseServiceKey();

  const response = await fetch(
    `${supabaseUrl}/rest/v1/skin_analysis_results?photo_session_id=eq.${photoSessionId}&select=*`,
    {
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
      },
    }
  );

  if (!response.ok) {
    console.error('Failed to get analysis result:', response.statusText);
    return null;
  }

  const data = await response.json();
  if (data.length === 0) return null;

  const record = data[0];

  if (record.status === 'pending') {
    return { status: 'pending' };
  }

  if (record.status === 'failed') {
    return { status: 'failed', errorMessage: record.error_message };
  }

  // Parse the stored data back into our format
  const result: ParsedAnalysisResult = {
    diagnosticId: record.diagnostic_id,
    apiLanguage: record.api_language,
    rawResponse: record.raw_response,
    rawResponseTranslated: record.raw_response_translated,
    gender: record.gender,
    ageGroup: record.age_group,
    estimatedAge: record.estimated_age,
    ethnicity: record.ethnicity,
    eyeColor: record.eye_color,
    hairColor: record.hair_color,
    phototype: record.phototype,
    skinThickness: record.skin_thickness,
    skinType: record.skin_type,
    skinAge: record.skin_age,
    skinHealthOverview: record.skin_health_overview,
    priorityConcerns: record.priority_concerns,
    scoreRadiance: record.score_radiance,
    scoreSmoothness: record.score_smoothness,
    scoreRedness: record.score_redness,
    scoreHydration: record.score_hydration,
    scoreShine: record.score_shine,
    scoreTexture: record.score_texture,
    scoreBlemishes: record.score_blemishes,
    scoreTone: record.score_tone,
    scoreEyeContour: record.score_eye_contour,
    scoreNeckDecollete: record.score_neck_decollete,
    parameterScores: record.parameter_scores,
    imageQualityScore: record.image_quality_score,
    imageQualitySummary: record.image_quality_summary,
    // These need to be reconstructed from raw_response
    patientAttributes: {
      gender: record.gender === 'male' ? 'male' : record.gender === 'female' ? 'female' : 'other',
      eyeColor: record.eye_color?.toLowerCase() || 'brown',
      fitzpatrickType: ['I', 'II', 'III', 'IV', 'V', 'VI'][record.phototype - 1] || 'II',
      skinThickness: record.skin_thickness?.toLowerCase() === 'thick' ? 'thick' : 'thin',
      skinType: record.skin_type?.toLowerCase() || 'normal',
    } as ParsedAnalysisResult['patientAttributes'],
    categoryDetails: {}, // Will be reconstructed from raw_response
    imageQuality: {
      qualityScore: record.image_quality_score,
      clearImage: record.raw_response?.image_quality?.clear_image || '',
      lighting: record.raw_response?.image_quality?.lighting || '',
      focus: record.raw_response?.image_quality?.focus || '',
      trueColors: record.raw_response?.image_quality?.true_colors || '',
      background: record.raw_response?.image_quality?.background || '',
      preparation: record.raw_response?.image_quality?.preparation || '',
      resultsSummary: record.image_quality_summary || '',
      tipsToImprove: record.raw_response?.image_quality?.tips_to_improve_quality || '',
    },
  };

  // Reconstruct category details from raw_response
  if (record.raw_response) {
    const { getAllCategoryDetails } = await import('./skinAnalysisMapping');
    result.categoryDetails = getAllCategoryDetails(record.raw_response);
  }

  return { status: 'completed', result, skinAnalysisId: record.id };
}

// ============================================================================
// API Call
// ============================================================================

/**
 * Call the SkinXS API with photos
 */
export async function callSkinXSApi(
  photos: PhotoUrls,
  apiKey: string,
  language: string = 'en'
): Promise<SkinXSApiResponse> {
  // Download photos
  const frontalBuffer = await downloadPhoto(photos.frontal);
  if (!frontalBuffer) {
    throw new Error('Failed to download frontal photo');
  }

  // Create FormData
  const formData = new FormData();
  formData.append('frontal_image', new Blob([frontalBuffer]), 'frontal.jpg');

  if (photos.leftProfile) {
    const leftBuffer = await downloadPhoto(photos.leftProfile);
    if (leftBuffer) {
      formData.append('left_side_image', new Blob([leftBuffer]), 'left_side.jpg');
    }
  }

  if (photos.rightProfile) {
    const rightBuffer = await downloadPhoto(photos.rightProfile);
    if (rightBuffer) {
      formData.append('right_side_image', new Blob([rightBuffer]), 'right_side.jpg');
    }
  }

  formData.append('language', language);
  formData.append('main_skin_concern', ''); // Empty as per requirements

  // Call API
  const response = await fetch(SKINXS_API_URL, {
    method: 'POST',
    headers: {
      Authorization: apiKey,
      Accept: 'application/json',
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`SkinXS API error: ${response.status} - ${errorText}`);
  }

  const result = await response.json();
  return result as SkinXSApiResponse;
}

// ============================================================================
// Main Analysis Function (for client-side trigger)
// ============================================================================

/**
 * Trigger skin analysis (client-side)
 * This function is called from the clinical documentation flow
 */
export async function triggerAnalysis(
  photoSessionId: string,
  doctorId: string,
  clinicalSessionId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('/api/skin-analysis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ photoSessionId, doctorId, clinicalSessionId }),
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message || 'Analysis failed' };
    }

    return { success: true };
  } catch (error) {
    console.error('Error triggering analysis:', error);
    return { success: false, error: 'Network error' };
  }
}
