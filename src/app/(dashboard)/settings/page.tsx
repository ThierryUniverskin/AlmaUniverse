'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { LoadingSpinner, useToast } from '@/components/ui';
import { SettingsSidebar, ClinicDevicesSection, CustomProceduresSection } from '@/components/settings';
import { EBDDevice, DoctorDeviceWithPrice } from '@/types';
import { fetchDevicesByCountry, fetchDoctorDeviceIds, saveDoctorDevices, fetchDoctorDevicesWithPrices, updateDoctorDevicePrice } from '@/lib/doctorDevices';
import { fetchAllDeviceCountryPrices } from '@/lib/ebdDevices';
import { logger } from '@/lib/logger';

export default function SettingsPage() {
  const { state } = useAuth();
  const { showToast } = useToast();

  const [activeSection, setActiveSection] = useState('clinic-devices');
  const [isLoading, setIsLoading] = useState(true);
  const [togglingDeviceId, setTogglingDeviceId] = useState<string | null>(null);
  const [savingPriceDeviceId, setSavingPriceDeviceId] = useState<string | null>(null);

  // Device state
  const [availableDevices, setAvailableDevices] = useState<EBDDevice[]>([]);
  const [selectedDeviceIds, setSelectedDeviceIds] = useState<string[]>([]);
  const [devicePrices, setDevicePrices] = useState<Record<string, DoctorDeviceWithPrice>>({});
  const [countryDefaultPrices, setCountryDefaultPrices] = useState<Map<string, number>>(new Map());

  // Ref to track if data has been loaded
  const dataLoadedRef = useRef(false);

  // Load devices on mount
  useEffect(() => {
    const loadDevices = async () => {
      if (!state.doctor || !state.accessToken || dataLoadedRef.current) return;

      setIsLoading(true);
      try {
        const doctorCountry = state.doctor.country || '';

        // Fetch devices available in doctor's country, doctor's current selections, prices, and country default prices in parallel
        const [countryDevices, doctorDeviceIds, pricesData, countryPricesMap] = await Promise.all([
          fetchDevicesByCountry(doctorCountry, state.accessToken),
          fetchDoctorDeviceIds(state.doctor.id, state.accessToken),
          fetchDoctorDevicesWithPrices(state.doctor.id, state.accessToken),
          fetchAllDeviceCountryPrices(doctorCountry, state.accessToken),
        ]);

        setAvailableDevices(countryDevices);
        setCountryDefaultPrices(countryPricesMap);

        // Build prices map indexed by deviceId
        const pricesMap: Record<string, DoctorDeviceWithPrice> = {};
        for (const p of pricesData) {
          pricesMap[p.deviceId] = p;
        }
        setDevicePrices(pricesMap);

        // If doctor hasn't configured devices yet, default to all country devices active
        const effectiveSelection = doctorDeviceIds.length > 0
          ? doctorDeviceIds
          : countryDevices.map(d => d.id);

        setSelectedDeviceIds(effectiveSelection);
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

  // Auto-save device toggle
  const handleDeviceToggle = useCallback(async (deviceId: string) => {
    if (!state.doctor || !state.accessToken) return;

    // Optimistically update UI
    const newSelection = selectedDeviceIds.includes(deviceId)
      ? selectedDeviceIds.filter(id => id !== deviceId)
      : [...selectedDeviceIds, deviceId];

    setSelectedDeviceIds(newSelection);
    setTogglingDeviceId(deviceId);

    // Save to database
    const result = await saveDoctorDevices(
      state.doctor.id,
      newSelection,
      state.accessToken
    );

    setTogglingDeviceId(null);

    if (!result.success) {
      // Revert on failure
      setSelectedDeviceIds(selectedDeviceIds);
      showToast('Failed to update device', 'error');
    }
  }, [state.doctor, state.accessToken, selectedDeviceIds, showToast]);

  // Handle device price change
  const handlePriceChange = useCallback(async (deviceId: string, newPriceCents: number | null) => {
    if (!state.doctor || !state.accessToken) return;

    setSavingPriceDeviceId(deviceId);

    // Optimistically update UI
    setDevicePrices(prev => ({
      ...prev,
      [deviceId]: {
        ...prev[deviceId],
        deviceId,
        priceCents: newPriceCents,
        isActive: prev[deviceId]?.isActive ?? true,
      },
    }));

    const result = await updateDoctorDevicePrice(
      state.doctor.id,
      deviceId,
      newPriceCents,
      state.accessToken
    );

    setSavingPriceDeviceId(null);

    if (result.success) {
      showToast('Price updated', 'success');
    } else {
      // Revert on failure - we'd need to refetch or track previous value
      showToast('Failed to update price', 'error');
    }
  }, [state.doctor, state.accessToken, showToast]);

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
                togglingDeviceId={togglingDeviceId}
                devicePrices={devicePrices}
                onPriceChange={handlePriceChange}
                savingPriceDeviceId={savingPriceDeviceId}
                countryDefaultPrices={countryDefaultPrices}
              />
            )}
            {activeSection === 'custom-procedures' && state.accessToken && (
              <CustomProceduresSection
                doctorId={state.doctor.id}
                accessToken={state.accessToken}
                countryCode={state.doctor.country}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
