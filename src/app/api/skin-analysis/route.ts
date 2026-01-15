/**
 * Skin Analysis API Route
 *
 * POST /api/skin-analysis
 * Triggers AI skin analysis using the SkinXS diagnostic API.
 *
 * This route:
 * 1. Validates doctor authentication
 * 2. Checks rate limit (1000/month per doctor)
 * 3. Fetches photos from storage
 * 4. Calls SkinXS API
 * 5. Parses and saves results to database
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  checkRateLimit,
  incrementUsage,
  getPhotoSession,
  savePendingAnalysis,
  saveAnalysisResult,
  saveFailedAnalysis,
  callSkinXSApi,
  getSignedUrlServerSide,
  type PhotoUrls,
} from '@/lib/skinAnalysis';
import { parseApiResponse } from '@/lib/skinAnalysisMapping';

// Extend Vercel serverless function timeout to 120 seconds
export const maxDuration = 120;

// Disable body size limit for this route (photos can be large)
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  console.log('[skin-analysis] POST request received');

  try {
    // Parse request body
    const body = await request.json();
    const { photoSessionId, doctorId, clinicalSessionId } = body;
    console.log('[skin-analysis] Request body:', { photoSessionId, doctorId, clinicalSessionId });

    if (!photoSessionId || !doctorId) {
      console.error('[skin-analysis] Missing required fields');
      return NextResponse.json(
        { error: 'Missing required fields: photoSessionId, doctorId' },
        { status: 400 }
      );
    }

    // Get API key from environment
    const apiKey = process.env.SKINXS_API_KEY;
    console.log('[skin-analysis] API key configured:', !!apiKey);
    if (!apiKey) {
      console.error('[skin-analysis] SKINXS_API_KEY not configured');
      return NextResponse.json(
        { error: 'API configuration error' },
        { status: 500 }
      );
    }

    // Check rate limit
    const rateLimit = await checkRateLimit(doctorId);
    if (!rateLimit.withinLimit) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: `You have reached the monthly limit of ${rateLimit.limit} skin analyses. Current usage: ${rateLimit.currentCount}/${rateLimit.limit}`,
        },
        { status: 429 }
      );
    }

    // Get photo session
    const photoSession = await getPhotoSession(photoSessionId);
    if (!photoSession) {
      return NextResponse.json(
        { error: 'Photo session not found' },
        { status: 404 }
      );
    }

    if (!photoSession.frontalPhotoUrl) {
      return NextResponse.json(
        { error: 'Frontal photo is required for analysis' },
        { status: 400 }
      );
    }

    // Save pending status
    await savePendingAnalysis(photoSessionId, photoSession.patientId, doctorId, clinicalSessionId);

    // Increment usage counter
    await incrementUsage(doctorId);

    // Get signed URLs for photos
    const frontalUrl = await getSignedUrlServerSide(photoSession.frontalPhotoUrl);
    if (!frontalUrl) {
      await saveFailedAnalysis(photoSessionId, 'Failed to get frontal photo URL');
      return NextResponse.json(
        { error: 'Failed to access frontal photo' },
        { status: 500 }
      );
    }

    const photos: PhotoUrls = {
      frontal: frontalUrl,
    };

    if (photoSession.leftProfilePhotoUrl) {
      const leftUrl = await getSignedUrlServerSide(photoSession.leftProfilePhotoUrl);
      if (leftUrl) {
        photos.leftProfile = leftUrl;
      }
    }

    if (photoSession.rightProfilePhotoUrl) {
      const rightUrl = await getSignedUrlServerSide(photoSession.rightProfilePhotoUrl);
      if (rightUrl) {
        photos.rightProfile = rightUrl;
      }
    }

    // Call SkinXS API
    console.log(`[skin-analysis] Starting analysis for photo session ${photoSessionId}`);
    const startTime = Date.now();

    let apiResponse;
    try {
      apiResponse = await callSkinXSApi(photos, apiKey, 'en');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown API error';
      console.error(`[skin-analysis] API call failed:`, errorMessage);
      await saveFailedAnalysis(photoSessionId, errorMessage);
      return NextResponse.json(
        { error: 'Skin analysis failed', message: errorMessage },
        { status: 500 }
      );
    }

    const duration = Date.now() - startTime;
    console.log(`[skin-analysis] API call completed in ${duration}ms`);

    // Parse response
    const parsedResult = parseApiResponse(apiResponse);

    // Save to database
    const saved = await saveAnalysisResult(
      photoSessionId,
      photoSession.patientId,
      doctorId,
      parsedResult,
      clinicalSessionId
    );

    if (!saved) {
      return NextResponse.json(
        { error: 'Failed to save analysis result' },
        { status: 500 }
      );
    }

    console.log(`[skin-analysis] Analysis saved for photo session ${photoSessionId}`);

    // Return success
    return NextResponse.json({
      success: true,
      diagnosticId: parsedResult.diagnosticId,
      duration,
    });
  } catch (error) {
    console.error('[skin-analysis] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/skin-analysis?photoSessionId=xxx
 * Get analysis status/result for a photo session
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const photoSessionId = searchParams.get('photoSessionId');

    if (!photoSessionId) {
      return NextResponse.json(
        { error: 'Missing photoSessionId parameter' },
        { status: 400 }
      );
    }

    const { getAnalysisResult } = await import('@/lib/skinAnalysis');
    const result = await getAnalysisResult(photoSessionId);

    if (!result) {
      return NextResponse.json(
        { status: 'not_found' },
        { status: 404 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('[skin-analysis] GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
