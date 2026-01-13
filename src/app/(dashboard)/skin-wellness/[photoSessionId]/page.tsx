'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { parseSkinWellnessParams } from '@/lib/skinWellness';
import { getSignedUrl } from '@/lib/photoSession';
import { generateFullAnalysis } from '@/lib/mockSkinAnalysis';
import { SkinAnalysisResult, ImageQualityAssessment, PatientAttributes } from '@/lib/skinWellnessCategories';
import { SkinAnalysisLoading } from '@/components/skin-wellness/SkinAnalysisLoading';
import { SkinWellnessResults } from '@/components/skin-wellness/SkinWellnessResults';

/**
 * Skin Wellness Mode Page
 *
 * This page is separate from clinical documentation to enforce data isolation.
 * It only receives: photoSessionId and patientId
 *
 * NO medical/diagnostic data should ever be passed to or accessible from this page:
 * - No skin concerns
 * - No selected treatments
 * - No medical history
 * - No recovery preferences
 *
 * Flow:
 * 1. Load photo URL from storage
 * 2. Show 10-second analysis animation
 * 3. Generate mock analysis results
 * 4. Display flower visualization with results
 */

type ViewState = 'loading' | 'analysing' | 'results';

export default function SkinWellnessPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const photoSessionId = params.photoSessionId as string;
  const entryData = parseSkinWellnessParams(photoSessionId, searchParams);

  const [viewState, setViewState] = useState<ViewState>('loading');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoUrls, setPhotoUrls] = useState<{ frontal: string | null; left: string | null; right: string | null }>({
    frontal: null,
    left: null,
    right: null,
  });
  const [patientName, setPatientName] = useState<string | null>(null);
  const [sessionDate, setSessionDate] = useState<string | null>(null);
  const [analysisResults, setAnalysisResults] = useState<SkinAnalysisResult[] | null>(null);
  const [skinHealthOverview, setSkinHealthOverview] = useState<string | null>(null);
  const [imageQuality, setImageQuality] = useState<ImageQualityAssessment | null>(null);
  const [patientAttributes, setPatientAttributes] = useState<PatientAttributes | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load photo on mount
  useEffect(() => {
    async function loadPhoto() {
      if (!entryData) return;

      try {
        // Fetch the photo session to get the frontal photo URL
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const accessToken = getAccessToken();

        if (!accessToken) {
          setError('Authentication required');
          return;
        }

        // Get the photo session
        const response = await fetch(
          `${supabaseUrl}/rest/v1/photo_sessions?id=eq.${entryData.photoSessionId}&select=*`,
          {
            headers: {
              apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to load photo session');
        }

        const sessions = await response.json();
        if (sessions.length === 0) {
          throw new Error('Photo session not found');
        }

        const session = sessions[0];

        // Store session date
        if (session.created_at) {
          setSessionDate(session.created_at);
        }

        // Fetch patient name
        if (entryData.patientId) {
          const patientResponse = await fetch(
            `${supabaseUrl}/rest/v1/patients?id=eq.${entryData.patientId}&select=first_name,last_name`,
            {
              headers: {
                apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
              },
            }
          );
          if (patientResponse.ok) {
            const patients = await patientResponse.json();
            if (patients.length > 0) {
              setPatientName(`${patients[0].first_name} ${patients[0].last_name}`);
            }
          }
        }

        // Get signed URLs for all photos
        const urls: { frontal: string | null; left: string | null; right: string | null } = {
          frontal: null,
          left: null,
          right: null,
        };

        if (session.frontal_photo_url) {
          urls.frontal = await getSignedUrl(session.frontal_photo_url);
          setPhotoUrl(urls.frontal); // Also set the main photoUrl for the loading animation
        }
        if (session.left_profile_photo_url) {
          urls.left = await getSignedUrl(session.left_profile_photo_url);
        }
        if (session.right_profile_photo_url) {
          urls.right = await getSignedUrl(session.right_profile_photo_url);
        }

        setPhotoUrls(urls);

        // Start analysis animation
        setViewState('analysing');
      } catch (err) {
        console.error('Error loading photo:', err);
        setError('Failed to load photo');
        // Still proceed to analysis even without photo
        setViewState('analysing');
      }
    }

    if (entryData) {
      loadPhoto();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entryData?.photoSessionId]);

  // Handle analysis completion
  const handleAnalysisComplete = useCallback(() => {
    if (!entryData) return;

    // Generate full mock analysis based on photoSessionId for consistency
    const analysis = generateFullAnalysis(entryData.photoSessionId);
    setAnalysisResults(analysis.categories);
    setSkinHealthOverview(analysis.skinHealthOverview);
    setImageQuality(analysis.imageQuality);
    setPatientAttributes(analysis.patientAttributes);
    setViewState('results');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entryData?.photoSessionId]);

  // Invalid entry - missing required parameters
  if (!entryData) {
    return (
      <div className="min-h-full flex items-center justify-center p-8">
        <div className="max-w-md text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <svg
              className="h-8 w-8 text-red-600"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
              />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-stone-900 mb-2">Invalid Entry</h1>
          <p className="text-stone-500 mb-6">
            Missing required parameters. Please access Skin Wellness Mode through the
            clinical documentation flow.
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Loading state (fetching photo)
  if (viewState === 'loading') {
    return (
      <div className="min-h-full flex items-center justify-center bg-stone-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600 mx-auto mb-4" />
          <p className="text-stone-500">Preparing analysis...</p>
        </div>
      </div>
    );
  }

  // Analysis animation state
  if (viewState === 'analysing') {
    return <SkinAnalysisLoading photoUrl={photoUrl} onComplete={handleAnalysisComplete} />;
  }

  // Results state
  if (viewState === 'results' && analysisResults) {
    return (
      <SkinWellnessResults
        results={analysisResults}
        patientId={entryData.patientId}
        photoUrls={photoUrls}
        patientName={patientName}
        sessionDate={sessionDate}
        skinHealthOverview={skinHealthOverview}
        imageQuality={imageQuality}
        patientAttributes={patientAttributes}
      />
    );
  }

  // Fallback (should not reach)
  return null;
}

// Helper function to get access token from localStorage
function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const storageKey = `sb-${new URL(supabaseUrl).hostname.split('.')[0]}-auth-token`;
  const storedSession = localStorage.getItem(storageKey);
  const sessionData = storedSession ? JSON.parse(storedSession) : null;
  return sessionData?.access_token || null;
}
