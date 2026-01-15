'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { parseSkinWellnessParams } from '@/lib/skinWellness';
import { getSignedUrl } from '@/lib/photoSession';
import { generateFullAnalysis } from '@/lib/mockSkinAnalysis';
import { SkinAnalysisResult, ImageQualityAssessment, PatientAttributes } from '@/lib/skinWellnessCategories';
import { SkinAnalysisLoading } from '@/components/skin-wellness/SkinAnalysisLoading';
import { SkinWellnessResults } from '@/components/skin-wellness/SkinWellnessResults';
import { getAnalysisResult, type AnalysisStatus } from '@/lib/skinAnalysis';
import { mapCategoryScores, getAllCategoryDetails, type ParsedAnalysisResult } from '@/lib/skinAnalysisMapping';
import { SkinWellnessDetail } from '@/lib/skinWellnessDetails';
import { startAnalysisPhase, completeAnalysisPhase, updateClinicalSession } from '@/lib/clinicalSession';
import { getValidatedDiagnostic } from '@/lib/skinWellnessValidation';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { useAuth } from '@/context/AuthContext';

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
  const { logout } = useAuth();

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
  const [categoryDetails, setCategoryDetails] = useState<Record<string, SkinWellnessDetail[]> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [analysisStatus, setAnalysisStatus] = useState<'checking' | 'pending' | 'completed' | 'failed' | 'mock'>('checking');
  const [isUsingRealData, setIsUsingRealData] = useState(false);
  const [apiResult, setApiResult] = useState<ParsedAnalysisResult | null>(null); // Store API result when ready
  const [skinAnalysisId, setSkinAnalysisId] = useState<string | null>(null); // Database record ID for validation

  // Validated diagnostic state (restored from database when coming back from skincare)
  const [validatedFaceConcerns, setValidatedFaceConcerns] = useState<string[] | null>(null);
  const [validatedAdditionalConcerns, setValidatedAdditionalConcerns] = useState<string[] | null>(null);
  const [validatedConcernsManuallyEdited, setValidatedConcernsManuallyEdited] = useState(false);
  const [validatedOverviewText, setValidatedOverviewText] = useState<string | null>(null);

  // Navigation warning state
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);

  // Track which step we entered from (3 = photos, 6 = summary)
  const [entryStep, setEntryStep] = useState<3 | 6>(6);

  // Load entry step from sessionStorage on mount
  useEffect(() => {
    const savedStep = sessionStorage.getItem('clinicalDocStep');
    if (savedStep === '3') {
      setEntryStep(3);
    } else {
      setEntryStep(6);
    }
  }, []);

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

        // Check if there's an existing validation (coming back from skincare page)
        const existingValidation = await getValidatedDiagnostic(entryData.photoSessionId);

        if (existingValidation) {
          console.log('[SkinWellness] Found existing validation, restoring state');

          // Set the skin analysis ID
          setSkinAnalysisId(existingValidation.skinAnalysisId);

          // Restore validated scores
          setAnalysisResults(existingValidation.validatedScores);

          // Restore validated details
          if (existingValidation.validatedDetails) {
            setCategoryDetails(existingValidation.validatedDetails);
          }

          // Restore validated attributes
          if (existingValidation.validatedAttributes) {
            setPatientAttributes(existingValidation.validatedAttributes);
          }

          // Restore validated overview text
          if (existingValidation.validatedOverviewText) {
            setSkinHealthOverview(existingValidation.validatedOverviewText);
            setValidatedOverviewText(existingValidation.validatedOverviewText);
          }

          // Restore concern selections
          setValidatedFaceConcerns(existingValidation.priorityFaceConcerns);
          setValidatedAdditionalConcerns(existingValidation.priorityAdditionalConcerns);
          setValidatedConcernsManuallyEdited(existingValidation.concernsManuallyEdited);

          // Also fetch the original API result to get image quality data
          const apiStatus = await checkAnalysisResult();
          if (apiStatus?.status === 'completed' && apiStatus.result) {
            setImageQuality(apiStatus.result.imageQuality);
            setIsUsingRealData(true);
          }

          // Skip animation and go directly to results
          setViewState('results');
          return;
        }

        // No existing validation - run normal flow
        // Mark analysis phase as in progress
        if (entryData.clinicalSessionId) {
          startAnalysisPhase(entryData.clinicalSessionId).catch((err) => {
            console.error('Failed to start analysis phase:', err);
          });
        }

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

  // Navigation warning: beforeunload
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Always warn when on analysis or results page
      if (viewState === 'analysing' || viewState === 'results') {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [viewState]);

  // Navigation warning: intercept link clicks and logout button
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      // Always intercept when on analysis or results page
      if (viewState !== 'analysing' && viewState !== 'results') return;

      const target = e.target as HTMLElement;

      // Check for logout button click
      const button = target.closest('button');
      if (button && button.textContent?.trim().toLowerCase() === 'logout') {
        e.preventDefault();
        e.stopPropagation();
        setPendingNavigation('/login'); // Logout redirects to login
        setShowLeaveModal(true);
        return;
      }

      // Check for link clicks
      const link = target.closest('a');
      if (link && link.href) {
        const url = new URL(link.href);
        // Only intercept internal links (not current page)
        if (url.origin === window.location.origin && !url.pathname.includes('/skin-wellness/')) {
          e.preventDefault();
          e.stopPropagation();
          setPendingNavigation(url.pathname);
          setShowLeaveModal(true);
        }
      }
    };

    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, [viewState]);

  // Handle confirmed navigation (abandon session)
  const handleConfirmLeave = async () => {
    setShowLeaveModal(false);

    // Mark session as abandoned if we have a clinical session ID
    if (entryData?.clinicalSessionId) {
      try {
        await updateClinicalSession(entryData.clinicalSessionId, {
          status: 'abandoned',
        });
      } catch (err) {
        console.error('Failed to mark session as abandoned:', err);
      }
    }

    // Clear clinical documentation sessionStorage to prevent restoring abandoned session
    sessionStorage.removeItem('clinicalDocStep');
    sessionStorage.removeItem('clinicalDocPatientId');
    sessionStorage.removeItem('clinicalDocSessionId');
    sessionStorage.removeItem('clinicalDocPhotoSessionId');
    sessionStorage.removeItem('clinicalDocSkinConcerns');
    sessionStorage.removeItem('clinicalDocTreatments');
    sessionStorage.removeItem('clinicalDocPhotoForm');
    sessionStorage.removeItem('clinicalDocMedicalHistory');

    // Handle logout specially - call logout() instead of router.push
    if (pendingNavigation === '/login') {
      logout();
    } else if (pendingNavigation) {
      router.push(pendingNavigation);
    }
    setPendingNavigation(null);
  };

  const handleCancelLeave = () => {
    setShowLeaveModal(false);
    setPendingNavigation(null);
  };

  // Handle back to clinical documentation
  const handleBackToDocumentation = () => {
    // Navigate back to clinical documentation - sessionStorage already has the state
    router.push('/clinical-documentation/new');
  };

  // Check for real API analysis result
  const checkAnalysisResult = useCallback(async (): Promise<AnalysisStatus | null> => {
    if (!entryData) return null;
    try {
      const response = await fetch(`/api/skin-analysis?photoSessionId=${entryData.photoSessionId}`);
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error('Failed to fetch analysis');
      }
      return await response.json();
    } catch (error) {
      console.error('Error checking analysis:', error);
      return null;
    }
  }, [entryData]);

  // Poll for API result immediately when animation starts (not after it ends)
  useEffect(() => {
    if (viewState !== 'analysing' || !entryData) return;

    let isMounted = true;
    let pollInterval: NodeJS.Timeout | null = null;

    async function pollForResult() {
      const status = await checkAnalysisResult();
      if (!isMounted) return;

      if (status?.status === 'completed' && status.result) {
        setApiResult(status.result);
        setSkinAnalysisId(status.skinAnalysisId || null);
        setAnalysisStatus('completed');
        return true; // Done polling
      }

      if (status?.status === 'failed') {
        setAnalysisStatus('failed');
        return true; // Done polling
      }

      if (status?.status === 'pending') {
        setAnalysisStatus('pending');
      }

      return false; // Keep polling
    }

    // Start polling immediately
    pollForResult().then((done) => {
      if (!done && isMounted) {
        // Continue polling every 3 seconds
        pollInterval = setInterval(async () => {
          const done = await pollForResult();
          if (done && pollInterval) {
            clearInterval(pollInterval);
          }
        }, 3000);
      }
    });

    return () => {
      isMounted = false;
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [viewState, entryData, checkAnalysisResult]);

  // Apply API result to state (used when showing results)
  const applyApiResult = useCallback((result: ParsedAnalysisResult) => {
    const categoryScores = mapCategoryScores({
      yellow: result.scoreRadiance,
      pink: result.scoreSmoothness,
      red: result.scoreRedness,
      blue: result.scoreHydration,
      orange: result.scoreShine,
      grey: result.scoreTexture,
      green: result.scoreBlemishes,
      brown: result.scoreTone,
      eye: result.scoreEyeContour,
      neck: result.scoreNeckDecollete,
    });

    const categories: SkinAnalysisResult[] = Object.entries(categoryScores).map(([categoryId, score]) => ({
      categoryId,
      visibilityLevel: score as 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10,
    }));

    setAnalysisResults(categories);
    setSkinHealthOverview(result.skinHealthOverview);
    setImageQuality(result.imageQuality);
    setPatientAttributes(result.patientAttributes);
    setCategoryDetails(result.categoryDetails);
    setIsUsingRealData(true);

    // Mark analysis phase as completed
    if (entryData?.clinicalSessionId) {
      completeAnalysisPhase(entryData.clinicalSessionId).catch((err) => {
        console.error('Failed to complete analysis phase:', err);
      });
    }
  }, [entryData]);

  // Handle analysis animation completion
  const handleAnalysisComplete = useCallback(() => {
    if (!entryData) return;

    // Use real API result if available
    if (apiResult) {
      applyApiResult(apiResult);
      setViewState('results');
      return;
    }

    // Fall back to mock data if API failed or no result
    console.warn('No API result available, using mock data');
    const analysis = generateFullAnalysis(entryData.photoSessionId);
    setAnalysisResults(analysis.categories);
    setSkinHealthOverview(analysis.skinHealthOverview);
    setImageQuality(analysis.imageQuality);
    setPatientAttributes(analysis.patientAttributes);
    setIsUsingRealData(false);
    setAnalysisStatus('mock');
    setViewState('results');
  }, [entryData, apiResult, applyApiResult]);

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
          <p className="text-stone-500">Loading...</p>
        </div>
      </div>
    );
  }

  // Navigation warning modal (rendered in all states)
  const leaveModal = (
    <ConfirmModal
      isOpen={showLeaveModal}
      title="Leave Skin Wellness?"
      message="Are you sure you want to leave? The skin analysis session will be abandoned."
      confirmLabel="Leave"
      cancelLabel="Stay"
      variant="info"
      onConfirm={handleConfirmLeave}
      onCancel={handleCancelLeave}
    />
  );

  // Analysis animation state
  if (viewState === 'analysing') {
    // Animation completes when API result is ready (completed or failed)
    const isAnalysisReady = analysisStatus === 'completed' || analysisStatus === 'failed';
    return (
      <>
        <SkinAnalysisLoading
          photoUrl={photoUrl}
          onComplete={handleAnalysisComplete}
          isAnalysisReady={isAnalysisReady}
        />
        {leaveModal}
      </>
    );
  }

  // Results state
  if (viewState === 'results' && analysisResults) {
    return (
      <>
        <SkinWellnessResults
          results={analysisResults}
          patientId={entryData.patientId}
          photoSessionId={photoSessionId}
          skinAnalysisId={skinAnalysisId}
          photoUrls={photoUrls}
          patientName={patientName}
          sessionDate={sessionDate}
          skinHealthOverview={validatedOverviewText || skinHealthOverview}
          imageQuality={imageQuality}
          patientAttributes={patientAttributes}
          initialCategoryDetails={categoryDetails}
          isUsingRealData={isUsingRealData}
          onBack={handleBackToDocumentation}
          entryStep={entryStep}
          initialFaceConcerns={validatedFaceConcerns}
          initialAdditionalConcerns={validatedAdditionalConcerns}
          initialConcernsManuallyEdited={validatedConcernsManuallyEdited}
        />
        {leaveModal}
      </>
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
