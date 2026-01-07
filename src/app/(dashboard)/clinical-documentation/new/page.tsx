'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePatients } from '@/context/PatientContext';
import { useAuth } from '@/context/AuthContext';
import { useToast, Button, ConfirmModal } from '@/components/ui';
import { PatientSelectDropdown, InlinePatientForm } from '@/components/patients';
import { Patient, PatientFormDataExtended } from '@/types';
import { validatePatientFormWithConsent } from '@/lib/validation';

export default function SelectPatientRecordPage() {
  const router = useRouter();
  const { patients, isLoading: patientsLoading, addPatient } = usePatients();
  const { state: authState } = useAuth();
  const { showToast } = useToast();

  // Get doctor's country for phone prefix default
  const doctorCountry = authState.doctor?.country || 'US';

  // State
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isNewPatientFormOpen, setIsNewPatientFormOpen] = useState(false);
  const [newPatientData, setNewPatientData] = useState<PatientFormDataExtended | null>(null);
  const [isNewPatientValid, setIsNewPatientValid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Unsaved changes state
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);

  // Track unsaved changes
  useEffect(() => {
    const hasChanges = selectedPatient !== null ||
      (isNewPatientFormOpen && newPatientData && (
        newPatientData.firstName ||
        newPatientData.lastName ||
        newPatientData.email ||
        newPatientData.phone
      ));
    setHasUnsavedChanges(!!hasChanges);
  }, [selectedPatient, isNewPatientFormOpen, newPatientData]);

  // Warn user about unsaved changes when leaving page (browser refresh/close)
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
        // Only intercept internal links
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

  // Handle existing patient selection
  const handleSelectPatient = (patient: Patient | null) => {
    setSelectedPatient(patient);
    // Clear new patient form when selecting existing patient
    if (patient) {
      setIsNewPatientFormOpen(false);
      setNewPatientData(null);
      setIsNewPatientValid(false);
    }
  };

  // Handle opening new patient form
  const handleOpenNewPatientForm = () => {
    setIsNewPatientFormOpen(true);
    // Clear existing patient selection
    setSelectedPatient(null);
  };

  // Handle closing new patient form
  const handleCloseNewPatientForm = () => {
    setIsNewPatientFormOpen(false);
    setNewPatientData(null);
    setIsNewPatientValid(false);
  };

  // Handle form data change from InlinePatientForm
  const handleFormChange = useCallback((data: PatientFormDataExtended, isValid: boolean) => {
    setNewPatientData(data);
    setIsNewPatientValid(isValid);
  }, []);

  // Check if Save button should be enabled
  const canSave = selectedPatient !== null || (isNewPatientFormOpen && isNewPatientValid);

  // Handle Cancel button click
  const handleCancel = () => {
    if (hasUnsavedChanges) {
      setPendingNavigation('/dashboard');
      setShowLeaveModal(true);
    } else {
      router.push('/dashboard');
    }
  };

  // Handle Save button click
  const handleSave = async () => {
    if (isSubmitting) return;

    // If existing patient is selected, navigate to their page
    if (selectedPatient) {
      setHasUnsavedChanges(false);
      router.push(`/patients/${selectedPatient.id}`);
      return;
    }

    // If new patient form is filled, validate and create
    if (isNewPatientFormOpen && newPatientData) {
      // Final validation
      const validation = validatePatientFormWithConsent(newPatientData);
      if (!validation.isValid) {
        showToast('Please fill in all required fields', 'error');
        return;
      }

      setIsSubmitting(true);

      try {
        // Create new patient (consent fields are not persisted to DB)
        const newPatient = await addPatient({
          firstName: newPatientData.firstName,
          lastName: newPatientData.lastName,
          dateOfBirth: newPatientData.dateOfBirth,
          sex: newPatientData.sex,
          phone: newPatientData.phone,
          email: newPatientData.email,
          notes: newPatientData.notes,
        });

        if (newPatient) {
          setHasUnsavedChanges(false);
          showToast('Patient record created successfully', 'success');
          router.push(`/patients/${newPatient.id}`);
        } else {
          showToast('Failed to create patient record', 'error');
          setIsSubmitting(false);
        }
      } catch {
        showToast('Failed to create patient record', 'error');
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="min-h-full relative">
      {/* Soft gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-stone-100 to-stone-50" />

      {/* Content */}
      <div className="relative p-8 lg:p-10 max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10 pt-4">
          {/* Person Icon - Simple line art style */}
          <div className="inline-flex items-center justify-center mb-5">
            <svg className="h-12 w-12 text-stone-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1" />
            </svg>
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
            disabled={!canSave || isSubmitting}
            isLoading={isSubmitting}
            onClick={handleSave}
          >
            Save
          </Button>
        </div>
      </div>

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
