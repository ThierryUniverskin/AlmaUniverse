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

      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-stone-200 px-6 md:px-8 lg:px-10 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          {/* Premium Doctor Account Icon with gradient and glow */}
          <div className="relative flex-shrink-0">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-300 to-violet-400 rounded-full blur-lg opacity-20 scale-105" />
            <svg className="relative h-12 w-12" viewBox="0 0 48 48" fill="none">
              <defs>
                <linearGradient id="doctorIconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#9ca3af" />
                  <stop offset="100%" stopColor="#7c3aed" />
                </linearGradient>
                <filter id="doctorIconShadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#7c3aed" floodOpacity="0.15"/>
                </filter>
              </defs>
              <circle cx="24" cy="24" r="23" fill="white" filter="url(#doctorIconShadow)" />
              <circle cx="24" cy="24" r="21" fill="url(#doctorIconGradient)" opacity="0.05" />
              {/* Person head */}
              <circle cx="24" cy="17" r="5" stroke="url(#doctorIconGradient)" strokeWidth="1.5" fill="none" />
              {/* Person body/shoulders */}
              <path d="M14 36c0-5.5 4.5-10 10-10s10 4.5 10 10" stroke="url(#doctorIconGradient)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
              {/* Medical cross badge */}
              <circle cx="32" cy="30" r="5" fill="white" stroke="url(#doctorIconGradient)" strokeWidth="1.5" />
              <path d="M32 28v4M30 30h4" stroke="url(#doctorIconGradient)" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <div className="min-w-0">
            <h1 className="text-xl lg:text-2xl font-semibold text-stone-900">My Account</h1>
            <p className="text-xs md:text-sm text-stone-500 hidden sm:block md:hidden lg:block">Manage your account preferences and configure various options.</p>
            <p className="text-xs text-stone-500 sm:hidden md:block lg:hidden">Manage your preferences.</p>
          </div>
        </div>

          {/* Action buttons (only show on personal tab) */}
          {activeTab === 'personal' && (
            <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
              <Button
                variant="outline"
                onClick={handleDiscard}
                disabled={!hasUnsavedChanges || isSubmitting}
                className="whitespace-nowrap"
              >
                Discard
              </Button>
              <Button
                onClick={handleSaveChanges}
                isLoading={isSubmitting}
                disabled={!hasUnsavedChanges || isSubmitting}
                className="whitespace-nowrap"
              >
                Save
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Two-column layout */}
      <div className="relative p-6 md:p-8 lg:p-10">
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 lg:gap-8">
          {/* Left: Profile Sidebar - hidden on tablet portrait, shown on mobile and desktop */}
          <div className="md:hidden lg:block lg:sticky lg:top-28 lg:self-start">
            <ProfileSidebar doctor={{ ...state.doctor, ...formData }} />
          </div>

          {/* Right: Tabs + Content */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 md:p-7 lg:p-8">
            <Tabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />

            <div className="mt-8">
              {activeTab === 'personal' ? (
                <PersonalInfoForm
                  formData={formData}
                  onChange={handleFormChange}
                  errors={errors}
                  email={state.doctor.email}
                  savedCountry={state.doctor.country}
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
