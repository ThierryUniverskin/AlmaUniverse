'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePatients } from '@/context/PatientContext';
import { useAuth } from '@/context/AuthContext';
import { useToast, Button, ConfirmModal } from '@/components/ui';
import { PatientSelectDropdown, InlinePatientForm } from '@/components/patients';
import { StepProgress, MedicalHistoryForm, getEmptyMedicalHistoryForm, PhotoCaptureForm, getEmptyPhotoForm, SkinConcernsForm, getEmptySkinConcernsForm, TreatmentSelectionForm, getEmptyTreatmentSelectionForm, SessionSummaryStep, EnterSkinWellnessModal } from '@/components/clinical-documentation';
import { Patient, PatientFormDataExtended, PatientMedicalHistory, PatientMedicalHistoryFormData, PhotoSessionFormData, SkinConcernsFormData, TreatmentSelectionFormData } from '@/types';
import { logger } from '@/lib/logger';
import { validatePatientFormWithConsent } from '@/lib/validation';
import { getMedicalHistory, saveMedicalHistory, updateMedicalHistory, historyToFormData } from '@/lib/medicalHistory';
import { savePhotoSession } from '@/lib/photoSession';
import { createClinicalEvaluation } from '@/lib/clinicalEvaluation';

export default function ClinicalDocumentationPage() {
  const router = useRouter();
  const { patients, isLoading: patientsLoading, addPatient } = usePatients();
  const { state: authState } = useAuth();
  const { showToast } = useToast();

  // Get doctor's country for phone prefix default
  const doctorCountry = authState.doctor?.country || 'US';

  // Step management
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);

  // Step 6 state - Session Summary
  const [showEnterWellnessModal, setShowEnterWellnessModal] = useState(false);

  // Step 1 state - Patient Selection
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isNewPatientFormOpen, setIsNewPatientFormOpen] = useState(false);
  const [newPatientData, setNewPatientData] = useState<PatientFormDataExtended | null>(null);
  const [isNewPatientValid, setIsNewPatientValid] = useState(false);

  // Step 2 state - Medical History
  const [documentingPatient, setDocumentingPatient] = useState<Patient | null>(null);
  const [medicalHistoryData, setMedicalHistoryData] = useState<PatientMedicalHistoryFormData>(getEmptyMedicalHistoryForm());
  const [existingMedicalHistory, setExistingMedicalHistory] = useState<PatientMedicalHistory | null>(null);
  const [isMedicalHistoryLoading, setIsMedicalHistoryLoading] = useState(false);

  // Step 3 state - Photo Collection
  const [photoFormData, setPhotoFormData] = useState<PhotoSessionFormData>(getEmptyPhotoForm());

  // Step 4 state - Skin Concerns
  const [skinConcernsData, setSkinConcernsData] = useState<SkinConcernsFormData>(getEmptySkinConcernsForm());

  // Step 5 state - Treatment Selection (multi-category)
  const [treatmentData, setTreatmentData] = useState<TreatmentSelectionFormData>(getEmptyTreatmentSelectionForm());

  // Track saved photo session ID for linking to clinical evaluation
  const [savedPhotoSessionId, setSavedPhotoSessionId] = useState<string | null>(null);

  // Shared state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Unsaved changes state
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);

  // Track unsaved changes across all steps
  useEffect(() => {
    if (currentStep === 1) {
      const hasChanges = selectedPatient !== null ||
        (isNewPatientFormOpen && newPatientData && (
          newPatientData.firstName ||
          newPatientData.lastName ||
          newPatientData.email ||
          newPatientData.phone
        ));
      setHasUnsavedChanges(!!hasChanges);
    } else {
      // Steps 2, 3, 4, 5: Always warn - user is in the middle of documenting a patient
      // Even if no fields are changed, leaving would lose workflow progress
      setHasUnsavedChanges(true);
    }
  }, [currentStep, selectedPatient, isNewPatientFormOpen, newPatientData, medicalHistoryData, photoFormData, skinConcernsData, treatmentData]);

  // Scroll to top when changing steps
  useEffect(() => {
    // The scrollable container is the <main> element in MainLayout
    const mainElement = document.querySelector('main');
    if (mainElement) {
      mainElement.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentStep]);

  // Warn user about unsaved changes when leaving page
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Intercept link clicks for in-app navigation
  useEffect(() => {
    const handleLinkClick = (e: MouseEvent) => {
      if (!hasUnsavedChanges) return;

      const target = e.target as HTMLElement;
      const link = target.closest('a');

      if (link && link.href && !link.href.includes('/clinical-documentation/new')) {
        const url = new URL(link.href);
        if (url.origin === window.location.origin) {
          e.preventDefault();
          e.stopPropagation();
          setPendingNavigation(url.pathname);
          setShowLeaveModal(true);
        }
      }
    };

    document.addEventListener('click', handleLinkClick, true);
    return () => document.removeEventListener('click', handleLinkClick, true);
  }, [hasUnsavedChanges]);

  // Handle confirmed navigation
  const handleConfirmLeave = () => {
    setShowLeaveModal(false);
    setHasUnsavedChanges(false);
    if (pendingNavigation) {
      router.push(pendingNavigation);
    }
    setPendingNavigation(null);
  };

  const handleCancelLeave = () => {
    setShowLeaveModal(false);
    setPendingNavigation(null);
  };

  // Step 1 handlers
  const handleSelectPatient = (patient: Patient | null) => {
    setSelectedPatient(patient);
    if (patient) {
      setIsNewPatientFormOpen(false);
      setNewPatientData(null);
      setIsNewPatientValid(false);
    }
  };

  const handleOpenNewPatientForm = () => {
    setIsNewPatientFormOpen(true);
    setSelectedPatient(null);
  };

  const handleCloseNewPatientForm = () => {
    setIsNewPatientFormOpen(false);
    setNewPatientData(null);
    setIsNewPatientValid(false);
  };

  const handleFormChange = useCallback((data: PatientFormDataExtended, isValid: boolean) => {
    setNewPatientData(data);
    setIsNewPatientValid(isValid);
  }, []);

  // Check if Continue button should be enabled
  const canContinue = selectedPatient !== null || (isNewPatientFormOpen && isNewPatientValid);

  // Handle Cancel button
  const handleCancel = () => {
    if (hasUnsavedChanges) {
      setPendingNavigation('/dashboard');
      setShowLeaveModal(true);
    } else {
      router.push('/dashboard');
    }
  };

  // Handle Continue (Step 1 → Step 2)
  const handleContinue = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      let patient: Patient | null = selectedPatient;

      // If new patient, create it first
      if (!selectedPatient && isNewPatientFormOpen && newPatientData) {
        const validation = validatePatientFormWithConsent(newPatientData);
        if (!validation.isValid) {
          showToast('Please fill in all required fields', 'error');
          setIsSubmitting(false);
          return;
        }

        const newPatient = await addPatient({
          firstName: newPatientData.firstName,
          lastName: newPatientData.lastName,
          dateOfBirth: newPatientData.dateOfBirth,
          sex: newPatientData.sex,
          phone: newPatientData.phone,
          email: newPatientData.email,
          notes: newPatientData.notes,
        });

        if (!newPatient) {
          showToast('Failed to create patient record', 'error');
          setIsSubmitting(false);
          return;
        }

        patient = newPatient;
        showToast('Patient record created', 'success');
      }

      if (!patient) {
        showToast('Please select a patient', 'error');
        setIsSubmitting(false);
        return;
      }

      // Set documenting patient
      setDocumentingPatient(patient);

      // Load existing medical history for this patient
      setIsMedicalHistoryLoading(true);
      const existingHistory = await getMedicalHistory(patient.id);

      if (existingHistory) {
        setExistingMedicalHistory(existingHistory);
        setMedicalHistoryData(historyToFormData(existingHistory));
      } else {
        setExistingMedicalHistory(null);
        setMedicalHistoryData(getEmptyMedicalHistoryForm());
      }

      setIsMedicalHistoryLoading(false);
      setCurrentStep(2);
    } catch (error) {
      logger.error('Error in handleContinue:', error);
      showToast('An error occurred', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Back navigation
  const handleBack = () => {
    if (currentStep === 2) {
      // Step 2 → Step 1
      setCurrentStep(1);
      // Keep the documenting patient selected
      if (documentingPatient) {
        setSelectedPatient(documentingPatient);
      }
    } else if (currentStep === 3) {
      // Step 3 → Step 2
      setCurrentStep(2);
    } else if (currentStep === 4) {
      // Step 4 → Step 3
      setCurrentStep(3);
    } else if (currentStep === 5) {
      // Step 5 → Step 4
      setCurrentStep(4);
    } else if (currentStep === 6) {
      // Step 6 → Step 5
      setCurrentStep(5);
    }
  };

  // Handle Continue (Step 2 → Step 3) - Save medical history and go to photos
  const handleContinueToStep3 = async () => {
    if (isSubmitting || !documentingPatient) return;

    setIsSubmitting(true);

    try {
      let result: PatientMedicalHistory | null = null;

      if (existingMedicalHistory) {
        // Update existing medical history
        result = await updateMedicalHistory(existingMedicalHistory.id, medicalHistoryData);
      } else {
        // Create new medical history
        result = await saveMedicalHistory(documentingPatient.id, medicalHistoryData);
      }

      if (result) {
        showToast('Medical history saved', 'success');
        setCurrentStep(3);
      } else {
        showToast('Failed to save medical history', 'error');
      }
    } catch (error) {
      logger.error('Error saving medical history:', error);
      showToast('Failed to save medical history', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Skip Photo Collection (Step 3 - skip photos and go to step 4)
  const handleSkipPhotos = () => {
    if (!documentingPatient) return;
    showToast('Photo collection skipped', 'info');
    setCurrentStep(4);
  };

  // Handle Continue (Step 3 → Step 4) - Save photos and go to skin concerns
  const handleContinueToStep4 = async () => {
    if (isSubmitting || !documentingPatient) return;

    // Validate: frontal photo is required
    if (!photoFormData.frontalPhoto) {
      showToast('Please capture the frontal photo', 'error');
      return;
    }

    // Validate: consent is required
    if (!photoFormData.photoConsentGiven) {
      showToast('Please confirm patient consent before saving', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      // Pass doctor ID for consent logging
      const doctorId = authState.doctor?.id || '';
      const result = await savePhotoSession(documentingPatient.id, photoFormData, doctorId);

      if (result) {
        // Save the photo session ID for linking to clinical evaluation
        setSavedPhotoSessionId(result.id);
        showToast('Photos saved successfully', 'success');
        setCurrentStep(4);
      } else {
        showToast('Failed to save photos', 'error');
      }
    } catch (error) {
      logger.error('Error saving photos:', error);
      showToast('Failed to save photos', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Skip Skin Concerns (Step 4 - skip concerns and go to Step 5)
  const handleSkipConcerns = () => {
    if (!documentingPatient) return;
    showToast('Skin concerns skipped', 'info');
    setCurrentStep(5);
  };

  // Handle Continue (Step 4 → Step 5) - Continue to EBD device selection
  const handleContinueToStep5 = () => {
    if (!documentingPatient) return;
    setCurrentStep(5);
  };

  // Handle Continue (Step 5 → Step 6) - Go to session summary
  const handleContinueToStep6 = () => {
    if (!documentingPatient) return;
    setCurrentStep(6);
  };

  // Handle Finish Session (Step 6 - save all data and return to patient page)
  const handleFinishSession = async () => {
    if (!documentingPatient || !authState.doctor) return;

    setIsSubmitting(true);

    try {
      // Create clinical evaluation session with all data
      const session = await createClinicalEvaluation(
        documentingPatient.id,
        authState.doctor.id,
        {
          photoSessionId: savedPhotoSessionId,
          selectedSkinConcerns: skinConcernsData.selectedConcerns,
          selectedTreatments: treatmentData.selectedTreatments,
          notes: treatmentData.generalNotes || undefined,
        }
      );

      if (session) {
        setHasUnsavedChanges(false);
        const concernCount = skinConcernsData.selectedConcerns.length;
        const treatmentCount = treatmentData.selectedTreatments.length;
        let message = 'Clinical documentation completed';
        if (concernCount > 0 || treatmentCount > 0) {
          const parts = [];
          if (concernCount > 0) parts.push(`${concernCount} skin concern${concernCount > 1 ? 's' : ''}`);
          if (treatmentCount > 0) parts.push(`${treatmentCount} treatment${treatmentCount > 1 ? 's' : ''}`);
          message = `Clinical documentation completed with ${parts.join(' and ')} noted`;
        }
        showToast(message, 'success');
        router.push(`/patients/${documentingPatient.id}`);
      } else {
        showToast('Failed to save clinical evaluation', 'error');
      }
    } catch (error) {
      logger.error('Error saving clinical evaluation:', error);
      showToast('Failed to save clinical evaluation', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Continue to Skin Wellness Mode (Step 6) - opens modal
  const handleContinueToWellness = () => {
    setShowEnterWellnessModal(true);
  };

  // Handle Enter Skin Wellness Mode from modal - save session and redirect (temporary: to patient page)
  const handleEnterWellnessMode = async () => {
    if (!documentingPatient || !authState.doctor) return;

    setIsSubmitting(true);

    try {
      // Save clinical evaluation first
      const session = await createClinicalEvaluation(
        documentingPatient.id,
        authState.doctor.id,
        {
          photoSessionId: savedPhotoSessionId,
          selectedSkinConcerns: skinConcernsData.selectedConcerns,
          selectedTreatments: treatmentData.selectedTreatments,
          notes: treatmentData.generalNotes || undefined,
        }
      );

      if (session) {
        setHasUnsavedChanges(false);
        setShowEnterWellnessModal(false);
        showToast('Clinical documentation saved. Skin Wellness Mode coming soon!', 'success');
        // Temporary: redirect to patient page. Future: redirect to Skin Wellness page
        router.push(`/patients/${documentingPatient.id}`);
      } else {
        showToast('Failed to save clinical evaluation', 'error');
      }
    } catch (error) {
      logger.error('Error saving clinical evaluation:', error);
      showToast('Failed to save clinical evaluation', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render Step 1
  const renderStep1 = () => (
    <>
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center mb-4">
          {/* Premium Patient Icon with gradient and glow */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-300 to-violet-400 rounded-full blur-lg opacity-20 scale-105" />
            <svg className="relative h-14 w-14" viewBox="0 0 56 56" fill="none">
              <defs>
                <linearGradient id="iconGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#9ca3af" />
                  <stop offset="100%" stopColor="#7c3aed" />
                </linearGradient>
                <filter id="iconShadow1" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#7c3aed" floodOpacity="0.15"/>
                </filter>
              </defs>
              <circle cx="28" cy="28" r="27" fill="white" filter="url(#iconShadow1)" />
              <circle cx="28" cy="28" r="25" fill="url(#iconGradient1)" opacity="0.05" />
              <circle cx="28" cy="22" r="6" stroke="url(#iconGradient1)" strokeWidth="1.5" fill="none" />
              <path d="M16 42c0-6.6 5.4-12 12-12s12 5.4 12 12" stroke="url(#iconGradient1)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            </svg>
          </div>
        </div>
        <h1 className="text-2xl font-semibold text-stone-900 mb-2">
          Select Patient Record
        </h1>
        <p className="text-stone-500">
          Associate clinical documentation with an existing or new patient record.
        </p>
      </div>

      {/* Section A: Link to Existing Patient Record */}
      <div className="bg-white rounded-xl border border-stone-200 p-6 mb-4 shadow-sm">
        <h2 className="text-base font-semibold text-stone-900 mb-1">
          Link to Existing Patient Record
        </h2>
        <p className="text-sm text-stone-500 mb-4">
          Select this option to associate documentation with an existing patient record.
        </p>
        <div className="mb-2">
          <label className="block text-sm font-medium text-stone-700 mb-2">
            Select Patient Record
          </label>
          <PatientSelectDropdown
            patients={patients}
            selectedPatient={selectedPatient}
            onSelect={handleSelectPatient}
            isLoading={patientsLoading}
            disabled={isNewPatientFormOpen}
          />
        </div>
      </div>

      {/* Section B: Not finding your patient? */}
      <div className="bg-white rounded-xl border border-stone-200 p-6 mb-8 shadow-sm">
        {!isNewPatientFormOpen ? (
          <div className="flex items-center justify-between">
            <span className="text-sm text-stone-600">
              Not finding your patient?
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenNewPatientForm}
              disabled={isSubmitting}
            >
              Add New Patient Record
            </Button>
          </div>
        ) : (
          <InlinePatientForm
            onFormChange={handleFormChange}
            onClose={handleCloseNewPatientForm}
            disabled={isSubmitting}
            defaultCountry={doctorCountry}
          />
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button
          variant="outline"
          size="lg"
          className="flex-1"
          onClick={handleCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          size="lg"
          className="flex-1"
          disabled={!canContinue || isSubmitting}
          isLoading={isSubmitting}
          onClick={handleContinue}
        >
          Continue
        </Button>
      </div>
    </>
  );

  // Render Step 2
  const renderStep2 = () => (
    <>
      {isMedicalHistoryLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
        </div>
      ) : (
        <>
          <MedicalHistoryForm
            formData={medicalHistoryData}
            onChange={setMedicalHistoryData}
            disabled={isSubmitting}
            patientName={documentingPatient ? `${documentingPatient.firstName} ${documentingPatient.lastName}` : ''}
            patientSex={documentingPatient?.sex}
          />

          {/* Action Buttons */}
          <div className="flex gap-4 mt-8">
            <Button
              variant="outline"
              size="lg"
              className="flex-1"
              onClick={handleBack}
              disabled={isSubmitting}
            >
              Back
            </Button>
            <Button
              size="lg"
              className="flex-1"
              isLoading={isSubmitting}
              onClick={handleContinueToStep3}
            >
              Continue
            </Button>
          </div>
        </>
      )}
    </>
  );

  // Render Step 3
  const renderStep3 = () => (
    <>
      <PhotoCaptureForm
        formData={photoFormData}
        onChange={setPhotoFormData}
        disabled={isSubmitting}
        patientName={documentingPatient ? `${documentingPatient.firstName} ${documentingPatient.lastName}` : ''}
        patientId={documentingPatient?.id}
        onSkip={handleSkipPhotos}
      />

      {/* Action Buttons */}
      <div className="flex gap-4 mt-8">
        <Button
          variant="outline"
          size="lg"
          className="flex-1"
          onClick={handleBack}
          disabled={isSubmitting}
        >
          Back
        </Button>
        <Button
          size="lg"
          className="flex-1"
          isLoading={isSubmitting}
          onClick={handleContinueToStep4}
          disabled={!photoFormData.frontalPhoto || !photoFormData.photoConsentGiven || isSubmitting}
        >
          Continue
        </Button>
      </div>
    </>
  );

  // Render Step 4
  const renderStep4 = () => (
    <>
      <SkinConcernsForm
        formData={skinConcernsData}
        onChange={setSkinConcernsData}
        disabled={isSubmitting}
        patientName={documentingPatient ? `${documentingPatient.firstName} ${documentingPatient.lastName}` : ''}
        patientId={documentingPatient?.id}
        onSkip={handleSkipConcerns}
      />

      {/* Action Buttons */}
      <div className="flex gap-4 mt-8">
        <Button
          variant="outline"
          size="lg"
          className="flex-1"
          onClick={handleBack}
          disabled={isSubmitting}
        >
          Back
        </Button>
        <Button
          size="lg"
          className="flex-1"
          onClick={handleContinueToStep5}
          disabled={isSubmitting}
        >
          Continue
        </Button>
      </div>
    </>
  );

  // Render Step 5
  const renderStep5 = () => (
    <>
      <TreatmentSelectionForm
        formData={treatmentData}
        onChange={setTreatmentData}
        disabled={isSubmitting}
        patientName={documentingPatient ? `${documentingPatient.firstName} ${documentingPatient.lastName}` : ''}
        selectedConcerns={skinConcernsData.selectedConcerns}
        doctorId={authState.doctor?.id}
        accessToken={authState.accessToken || undefined}
        countryCode={authState.doctor?.country}
      />

      {/* Action Buttons */}
      <div className="flex gap-4 mt-8">
        <Button
          variant="outline"
          size="lg"
          className="flex-1"
          onClick={handleBack}
          disabled={isSubmitting}
        >
          Back
        </Button>
        <Button
          size="lg"
          className="flex-1"
          onClick={handleContinueToStep6}
          disabled={isSubmitting}
        >
          Continue
        </Button>
      </div>
    </>
  );

  // Render Step 6
  const renderStep6 = () => {
    if (!documentingPatient) return null;

    return (
      <SessionSummaryStep
        patient={documentingPatient}
        skinConcerns={skinConcernsData.selectedConcerns}
        treatments={treatmentData.selectedTreatments}
        photoSessionId={savedPhotoSessionId}
        photoConsentGiven={photoFormData.photoConsentGiven}
        photoData={photoFormData}
        generalNotes={treatmentData.generalNotes}
        onGeneralNotesChange={(notes) => setTreatmentData(prev => ({ ...prev, generalNotes: notes }))}
        onFinishSession={handleFinishSession}
        onContinueToWellness={handleContinueToWellness}
        onBack={handleBack}
        isSubmitting={isSubmitting}
        doctorId={authState.doctor?.id}
        accessToken={authState.accessToken || undefined}
        countryCode={authState.doctor?.country}
      />
    );
  };

  return (
    <div className="min-h-full relative">
      {/* Base background */}
      <div className="absolute inset-0 bg-stone-50" />
      {/* Medical doodles pattern - greyscale */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: 'url(/images/medical-doodles-bg.svg)',
          backgroundSize: '440px 440px',
          backgroundRepeat: 'repeat',
          filter: 'grayscale(100%)',
        }}
      />

      {/* Top bar with doctor name (left) and step progress (right) */}
      <div className="absolute top-6 left-6 right-6 lg:top-8 lg:left-10 lg:right-10 z-10 flex items-center justify-between">
        {/* Doctor name with avatar */}
        <div className="flex items-center gap-2.5">
          {authState.doctor && (
            <>
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center shadow-sm">
                <span className="text-xs font-semibold text-purple-700">
                  {authState.doctor.firstName[0]}{authState.doctor.lastName[0]}
                </span>
              </div>
              <span className="text-sm font-medium text-stone-600">
                {authState.doctor.title ? `${authState.doctor.title} ` : ''}{authState.doctor.firstName} {authState.doctor.lastName}
              </span>
            </>
          )}
        </div>

        {/* Step Progress */}
        <StepProgress currentStep={currentStep} />
      </div>

      {/* Content */}
      <div className="relative p-8 lg:p-10 max-w-2xl mx-auto">
        {/* Step Content */}
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}
        {currentStep === 5 && renderStep5()}
        {currentStep === 6 && renderStep6()}
      </div>

      {/* Enter Skin Wellness Mode Modal */}
      <EnterSkinWellnessModal
        isOpen={showEnterWellnessModal}
        onEnterWellness={handleEnterWellnessMode}
        onClose={() => setShowEnterWellnessModal(false)}
        photoConsentGiven={photoFormData.photoConsentGiven}
        isSubmitting={isSubmitting}
      />

      {/* Unsaved Changes Modal */}
      <ConfirmModal
        isOpen={showLeaveModal}
        title="Unsaved Changes"
        message="You have unsaved changes. Are you sure you want to leave this page? Your changes will be lost."
        confirmLabel="Leave Page"
        cancelLabel="Stay"
        variant="warning"
        onConfirm={handleConfirmLeave}
        onCancel={handleCancelLeave}
      />
    </div>
  );
}
