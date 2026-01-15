'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { SkinWellnessStepProgress } from '@/components/skin-wellness/SkinWellnessStepProgress';

/**
 * Skincare Selection Page (Placeholder)
 *
 * This page will show personalized skincare recommendations based on
 * the doctor-validated skin analysis.
 *
 * For now, this is a placeholder that:
 * - Shows the SkinXS branding
 * - Displays a "Coming Soon" message
 * - Has a back button to return to the results page
 */

export default function SkincareSelectionPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { state: authState } = useAuth();

  const photoSessionId = params.photoSessionId as string;

  // Get patientId from URL params or sessionStorage
  const [patientId, setPatientId] = useState<string | null>(null);
  const [clinicalSessionId, setClinicalSessionId] = useState<string | null>(null);

  useEffect(() => {
    // Try URL params first, then sessionStorage
    const urlPatientId = searchParams.get('patientId');
    const urlSessionId = searchParams.get('clinicalSessionId');

    if (urlPatientId) {
      setPatientId(urlPatientId);
    } else {
      const storedPatientId = sessionStorage.getItem('clinicalDocPatientId');
      if (storedPatientId) {
        setPatientId(storedPatientId);
      }
    }

    if (urlSessionId) {
      setClinicalSessionId(urlSessionId);
    } else {
      const storedSessionId = sessionStorage.getItem('clinicalDocSessionId');
      if (storedSessionId) {
        setClinicalSessionId(storedSessionId);
      }
    }
  }, [searchParams]);

  const handleBack = () => {
    // Navigate back to results page with required params
    let url = `/skin-wellness/${photoSessionId}`;
    const params = new URLSearchParams();
    if (patientId) params.set('patientId', patientId);
    if (clinicalSessionId) params.set('clinicalSessionId', clinicalSessionId);
    if (params.toString()) url += `?${params.toString()}`;
    router.push(url);
  };

  const handleFinish = () => {
    // Clear session storage and return to dashboard
    sessionStorage.removeItem('clinicalDocStep');
    sessionStorage.removeItem('clinicalDocPatientId');
    sessionStorage.removeItem('clinicalDocSessionId');
    sessionStorage.removeItem('clinicalDocPhotoSessionId');
    sessionStorage.removeItem('clinicalDocSkinConcerns');
    sessionStorage.removeItem('clinicalDocTreatments');
    sessionStorage.removeItem('clinicalDocPhotoForm');
    sessionStorage.removeItem('clinicalDocMedicalHistory');

    router.push('/dashboard');
  };

  return (
    <div className="min-h-full relative bg-gradient-to-b from-sky-100 via-sky-50 to-sky-50/50">
      {/* Top bar with doctor name (left) and step progress (right) */}
      <div className="absolute top-6 left-6 right-6 lg:top-8 lg:left-10 lg:right-10 z-10 flex items-center justify-between">
        {/* Doctor name with avatar */}
        <div className="flex items-center gap-2.5">
          {authState.doctor && (
            <>
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-sky-100 to-sky-200 flex items-center justify-center shadow-sm">
                <span className="text-xs font-semibold text-sky-700">
                  {authState.doctor.firstName[0]}{authState.doctor.lastName[0]}
                </span>
              </div>
              <span className="text-sm font-medium text-stone-600">
                {authState.doctor.title ? `${authState.doctor.title} ` : ''}{authState.doctor.firstName} {authState.doctor.lastName}
              </span>
            </>
          )}
        </div>

        {/* Step Progress with frosted glass */}
        <div className="bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-sm border border-sky-100">
          <SkinWellnessStepProgress currentStep={3} />
        </div>
      </div>

      {/* Content */}
      <div className="relative max-w-3xl mx-auto px-6 pt-16 pb-8">
        {/* Header */}
        <div className="mb-8">
          {/* Centered logo */}
          <div className="flex items-center justify-center mb-3">
            <img
              src="/images/skinxs-logo.svg"
              alt="SkinXS"
              className="h-12 w-auto"
            />
          </div>
          {/* Title */}
          <div className="text-center">
            <h1 className="text-xl font-semibold text-stone-800 mb-1">
              Personalized Skincare
            </h1>
            <p className="text-sm text-stone-400">
              Custom formulations based on your skin analysis
            </p>
          </div>
        </div>

        {/* Coming Soon Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-sky-100 shadow-sm p-8 mb-6 animate-fade-in text-center">
          {/* Icon */}
          <div className="mx-auto w-20 h-20 bg-sky-50 rounded-full flex items-center justify-center mb-6">
            <svg
              className="w-10 h-10 text-sky-500"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611l-4.396.732a2.25 2.25 0 01-1.478-.4L12 19.5l-2.261 1.145a2.25 2.25 0 01-1.478.4l-4.396-.732c-1.717-.293-2.3-2.379-1.067-3.611L5 14.5"
              />
            </svg>
          </div>

          <h2 className="text-2xl font-semibold text-stone-800 mb-3">
            Coming Soon
          </h2>
          <p className="text-stone-500 mb-2 max-w-md mx-auto">
            Personalized skincare recommendations based on your doctor-validated skin analysis will be available here.
          </p>
          <p className="text-sm text-stone-400">
            Your skin diagnostic has been saved and will be used to generate custom formulations.
          </p>
        </div>

        {/* Info Card */}
        <div className="bg-sky-50/50 backdrop-blur-sm rounded-xl border border-sky-100 p-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-sky-100 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-sky-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-sky-700 mb-1">Diagnostic Saved</p>
              <p className="text-sm text-sky-600">
                Your validated skin analysis has been saved successfully. You can return to the results page to make additional adjustments if needed.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button
            variant="outline"
            size="lg"
            className="flex-1"
            onClick={handleBack}
          >
            Back to Results
          </Button>
          <Button
            size="lg"
            className="flex-1 bg-sky-600 hover:bg-sky-700 active:bg-sky-800 focus:ring-sky-500/30"
            onClick={handleFinish}
          >
            Finish
          </Button>
        </div>

        {/* Disclaimer */}
        <div className="mt-6 pt-5 border-t border-stone-100">
          <p className="text-xs text-stone-400 text-center leading-relaxed">
            Skincare recommendations are based on cosmetic appearance analysis only.
            They do not diagnose, treat, prevent, or assess medical conditions.
          </p>
        </div>
      </div>
    </div>
  );
}
