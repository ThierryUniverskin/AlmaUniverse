'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button, LoadingSpinner, useToast, Tabs, ConfirmModal } from '@/components/ui';
import { ProfileSidebar, PersonalInfoForm, SecurityForm } from '@/components/account';
import { DoctorProfileFormData, PasswordChangeFormData } from '@/types';
import { validateDoctorProfile, ValidationError } from '@/lib/validation';

const TABS = [
  { id: 'personal', label: 'Personal Information' },
  { id: 'security', label: 'Security Settings' },
];

export default function AccountPage() {
  const router = useRouter();
  const { state, updateDoctor, changePassword } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('personal');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);

  // Form state initialized from current doctor
  const [formData, setFormData] = useState<DoctorProfileFormData | null>(null);

  // Initialize form data from doctor
  useEffect(() => {
    if (state.doctor) {
      setFormData({
        title: state.doctor.title,
        firstName: state.doctor.firstName,
        lastName: state.doctor.lastName,
        clinicName: state.doctor.clinicName,
        displayPreference: state.doctor.displayPreference || 'professional',
        dateOfBirth: state.doctor.dateOfBirth,
        gender: state.doctor.gender,
        country: state.doctor.country,
        language: state.doctor.language,
        personalMobile: state.doctor.personalMobile,
        officePhone: state.doctor.officePhone,
        personalWebsite: state.doctor.personalWebsite,
        questionnaireUrl: state.doctor.questionnaireUrl,
        medicalLicenseNumber: state.doctor.medicalLicenseNumber,
        specialization: state.doctor.specialization,
        bio: state.doctor.bio,
        education: state.doctor.education,
        officeAddress: state.doctor.officeAddress,
      });
    }
  }, [state.doctor]);

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

      if (link && link.href && !link.href.includes('/account')) {
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

  const handleFormChange = useCallback((data: DoctorProfileFormData) => {
    setFormData(data);
    setHasUnsavedChanges(true);
    // Clear errors when user makes changes
    setErrors([]);
  }, []);

  const handleSaveChanges = async () => {
    if (!formData) return;

    const validation = validateDoctorProfile(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      showToast('Please fix the errors before saving', 'error');
      return;
    }

    setIsSubmitting(true);
    const result = await updateDoctor(formData);
    setIsSubmitting(false);

    if (result.success) {
      showToast('Profile updated successfully', 'success');
      setHasUnsavedChanges(false);
      setErrors([]);
    } else {
      showToast(result.error || 'Failed to update profile', 'error');
    }
  };

  const handleDiscard = () => {
    if (state.doctor) {
      setFormData({
        title: state.doctor.title,
        firstName: state.doctor.firstName,
        lastName: state.doctor.lastName,
        clinicName: state.doctor.clinicName,
        displayPreference: state.doctor.displayPreference || 'professional',
        dateOfBirth: state.doctor.dateOfBirth,
        gender: state.doctor.gender,
        country: state.doctor.country,
        language: state.doctor.language,
        personalMobile: state.doctor.personalMobile,
        officePhone: state.doctor.officePhone,
        personalWebsite: state.doctor.personalWebsite,
        questionnaireUrl: state.doctor.questionnaireUrl,
        medicalLicenseNumber: state.doctor.medicalLicenseNumber,
        specialization: state.doctor.specialization,
        bio: state.doctor.bio,
        education: state.doctor.education,
        officeAddress: state.doctor.officeAddress,
      });
      setHasUnsavedChanges(false);
      setErrors([]);
      showToast('Changes discarded', 'success');
    }
  };

  const handlePasswordChange = async (data: PasswordChangeFormData) => {
    setIsSubmitting(true);
    const result = await changePassword(data);
    setIsSubmitting(false);

    if (result.success) {
      showToast('Password changed successfully', 'success');
    } else {
      showToast(result.error || 'Failed to change password', 'error');
    }
  };

  if (state.isLoading || !state.doctor || !formData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" message="Loading account..." />
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-stone-100 px-6 lg:px-10 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          {/* User icon */}
          <div className="h-12 w-12 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0">
            <svg className="h-6 w-6 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl lg:text-2xl font-semibold text-stone-900">My Account</h1>
            <p className="text-sm text-stone-500">Manage your account preferences and configure various options.</p>
          </div>
        </div>

          {/* Action buttons (only show on personal tab) */}
          {activeTab === 'personal' && (
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={handleDiscard}
                disabled={!hasUnsavedChanges || isSubmitting}
              >
                Discard
              </Button>
              <Button onClick={handleSaveChanges} isLoading={isSubmitting}>
                Save Changes
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Two-column layout */}
      <div className="p-6 lg:p-10">
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-8">
          {/* Left: Profile Sidebar - shows live preview of form changes */}
          <div className="lg:sticky lg:top-28 lg:self-start">
            <ProfileSidebar doctor={{ ...state.doctor, ...formData }} />
          </div>

          {/* Right: Tabs + Content */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 lg:p-8">
            <Tabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />

            <div className="mt-8">
              {activeTab === 'personal' ? (
                <PersonalInfoForm
                  formData={formData}
                  onChange={handleFormChange}
                  errors={errors}
                  email={state.doctor.email}
                />
              ) : (
                <SecurityForm onSubmit={handlePasswordChange} isSubmitting={isSubmitting} />
              )}
            </div>
          </div>
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
