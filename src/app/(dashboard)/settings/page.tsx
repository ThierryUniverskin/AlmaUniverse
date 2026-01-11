'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button, LoadingSpinner, useToast, ConfirmModal } from '@/components/ui';
import { SettingsSidebar, ClinicDevicesSection, CustomProceduresSection } from '@/components/settings';
import { EBDDevice } from '@/types';
import { fetchDevicesByCountry, fetchDoctorDeviceIds, saveDoctorDevices } from '@/lib/doctorDevices';
import { logger } from '@/lib/logger';

export default function SettingsPage() {
  const router = useRouter();
  const { state } = useAuth();
  const { showToast } = useToast();

  const [activeSection, setActiveSection] = useState('clinic-devices');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);

  // Device state
  const [availableDevices, setAvailableDevices] = useState<EBDDevice[]>([]);
  const [selectedDeviceIds, setSelectedDeviceIds] = useState<string[]>([]);
  const [initialSelectedIds, setInitialSelectedIds] = useState<string[]>([]);

  // Ref to track if data has been loaded
  const dataLoadedRef = useRef(false);

  // Load devices on mount
  useEffect(() => {
    const loadDevices = async () => {
      if (!state.doctor || !state.accessToken || dataLoadedRef.current) return;

      setIsLoading(true);
      try {
        // Fetch devices available in doctor's country and doctor's current selections in parallel
        const [countryDevices, doctorDeviceIds] = await Promise.all([
          fetchDevicesByCountry(state.doctor.country || '', state.accessToken),
          fetchDoctorDeviceIds(state.doctor.id, state.accessToken),
        ]);

        setAvailableDevices(countryDevices);

        // If doctor hasn't configured devices yet, default to all country devices active
        const effectiveSelection = doctorDeviceIds.length > 0
          ? doctorDeviceIds
          : countryDevices.map(d => d.id);

        setSelectedDeviceIds(effectiveSelection);
        setInitialSelectedIds(effectiveSelection);
        dataLoadedRef.current = true;
      } catch (error) {
        logger.error('Error loading devices:', error);
        showToast('Failed to load devices', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    loadDevices();
  }, [state.doctor, state.accessToken, showToast]);

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

      if (link && link.href && !link.href.includes('/settings')) {
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

  const handleDeviceToggle = useCallback((deviceId: string) => {
    setSelectedDeviceIds(prev => {
      const newSelection = prev.includes(deviceId)
        ? prev.filter(id => id !== deviceId)
        : [...prev, deviceId];
      return newSelection;
    });
    setHasUnsavedChanges(true);
  }, []);

  const handleSaveChanges = async () => {
    if (!state.doctor || !state.accessToken) return;

    setIsSaving(true);
    const result = await saveDoctorDevices(
      state.doctor.id,
      selectedDeviceIds,
      state.accessToken
    );
    setIsSaving(false);

    if (result.success) {
      showToast('Device settings saved successfully', 'success');
      setInitialSelectedIds(selectedDeviceIds);
      setHasUnsavedChanges(false);
    } else {
      showToast(result.error || 'Failed to save device settings', 'error');
    }
  };

  const handleDiscard = () => {
    setSelectedDeviceIds(initialSelectedIds);
    setHasUnsavedChanges(false);
    showToast('Changes discarded', 'success');
  };

  if (state.isLoading || !state.doctor) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" message="Loading settings..." />
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
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-stone-200 px-6 lg:px-10 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Settings Icon with gradient and glow */}
            <div className="relative flex-shrink-0">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-300 to-violet-400 rounded-full blur-lg opacity-20 scale-105" />
              <svg className="relative h-12 w-12" viewBox="0 0 48 48" fill="none">
                <defs>
                  <linearGradient id="settingsIconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#9ca3af" />
                    <stop offset="100%" stopColor="#7c3aed" />
                  </linearGradient>
                  <filter id="settingsIconShadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#7c3aed" floodOpacity="0.15"/>
                  </filter>
                </defs>
                <circle cx="24" cy="24" r="23" fill="white" filter="url(#settingsIconShadow)" />
                <circle cx="24" cy="24" r="21" fill="url(#settingsIconGradient)" opacity="0.05" />
                {/* Gear icon */}
                <circle cx="24" cy="24" r="4" stroke="url(#settingsIconGradient)" strokeWidth="1.5" fill="none" />
                <path
                  d="M24 14v-2m0 24v-2m10-10h2m-24 0h2m17.07-7.07l1.41-1.41m-19.9 19.9l1.41-1.41m0-17.07l-1.41-1.41m19.9 19.9l-1.41-1.41"
                  stroke="url(#settingsIconGradient)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-xl lg:text-2xl font-semibold text-stone-900">Settings</h1>
              <p className="text-sm text-stone-500">Configure your clinic preferences and device availability.</p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handleDiscard}
              disabled={!hasUnsavedChanges || isSaving}
            >
              Discard
            </Button>
            <Button
              onClick={handleSaveChanges}
              isLoading={isSaving}
              disabled={!hasUnsavedChanges || isSaving}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="relative p-6 lg:p-10">
        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8">
          {/* Left: Settings Sidebar */}
          <div className="lg:sticky lg:top-28 lg:self-start">
            <SettingsSidebar
              activeSection={activeSection}
              onSectionChange={setActiveSection}
            />
          </div>

          {/* Right: Content */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 lg:p-8">
            {activeSection === 'clinic-devices' && (
              <ClinicDevicesSection
                availableDevices={availableDevices}
                selectedDeviceIds={selectedDeviceIds}
                onDeviceToggle={handleDeviceToggle}
                isLoading={isLoading}
                doctorCountry={state.doctor.country}
              />
            )}
            {activeSection === 'custom-procedures' && state.accessToken && (
              <CustomProceduresSection
                doctorId={state.doctor.id}
                accessToken={state.accessToken}
              />
            )}
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
