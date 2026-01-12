'use client';

import React from 'react';
import { EBDDevice, DoctorDeviceWithPrice } from '@/types';
import { DeviceToggleCard } from './DeviceToggleCard';
import { LoadingSpinner } from '@/components/ui';
import { COUNTRY_OPTIONS } from '@/lib/constants';

export interface ClinicDevicesSectionProps {
  availableDevices: EBDDevice[];
  selectedDeviceIds: string[];
  onDeviceToggle: (deviceId: string) => void;
  isLoading: boolean;
  doctorCountry?: string | null;
  togglingDeviceId?: string | null;
  // Pricing props
  devicePrices: Record<string, DoctorDeviceWithPrice>;
  onPriceChange: (deviceId: string, newPriceCents: number | null) => void;
  savingPriceDeviceId?: string | null;
  // Country-specific default prices (deviceId -> defaultPriceCents)
  countryDefaultPrices?: Map<string, number>;
}

export function ClinicDevicesSection({
  availableDevices,
  selectedDeviceIds,
  onDeviceToggle,
  isLoading,
  doctorCountry,
  togglingDeviceId,
  devicePrices,
  onPriceChange,
  savingPriceDeviceId,
  countryDefaultPrices,
}: ClinicDevicesSectionProps) {
  const countryLabel = doctorCountry
    ? COUNTRY_OPTIONS.find(c => c.value === doctorCountry)?.label || doctorCountry
    : null;

  const selectedCount = selectedDeviceIds.length;
  const totalCount = availableDevices.length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" message="Loading devices..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <h2 className="text-lg font-semibold text-stone-900">Clinic Devices</h2>
          <span className="px-2.5 py-1 text-xs font-medium bg-purple-100 text-purple-700 rounded-full">
            {selectedCount} of {totalCount} selected
          </span>
        </div>
        <p className="text-sm text-stone-500">
          Select the EBD (Energy-Based Device) procedures available at your clinic.
          Only selected devices will appear during clinical evaluations.
        </p>
      </div>

      {/* Country Info */}
      {countryLabel && (
        <div className="flex items-center gap-2 px-4 py-3 bg-stone-50 rounded-lg border border-stone-200">
          <svg className="h-5 w-5 text-stone-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10" />
            <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
          <span className="text-sm text-stone-600">
            Showing devices available in <span className="font-medium text-stone-900">{countryLabel}</span>
          </span>
        </div>
      )}

      {/* No Country Warning */}
      {!doctorCountry && (
        <div className="flex items-start gap-3 px-4 py-3 bg-amber-50 rounded-lg border border-amber-200">
          <svg className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4m0 4h.01" />
          </svg>
          <div>
            <p className="text-sm font-medium text-amber-800">Country not set</p>
            <p className="text-sm text-amber-700 mt-0.5">
              Please set your country in{' '}
              <a href="/account" className="underline hover:text-amber-900">My Account</a>
              {' '}to see devices available in your region.
            </p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {availableDevices.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <div className="h-16 w-16 mx-auto rounded-full bg-stone-100 flex items-center justify-center mb-4">
            <svg className="h-8 w-8 text-stone-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <path d="M8 21h8M12 17v4" />
            </svg>
          </div>
          <h3 className="text-base font-medium text-stone-900 mb-1">No devices available</h3>
          <p className="text-sm text-stone-500">
            No EBD devices are currently configured for your region.
          </p>
        </div>
      )}

      {/* Device Grid */}
      {availableDevices.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {availableDevices.map((device) => {
            const priceData = devicePrices[device.id];
            // Use country-specific default price if available, otherwise fall back to device's global default
            const effectiveDefaultPrice = countryDefaultPrices?.get(device.id) ?? device.defaultPriceCents ?? null;
            return (
              <DeviceToggleCard
                key={device.id}
                device={device}
                isSelected={selectedDeviceIds.includes(device.id)}
                onToggle={() => onDeviceToggle(device.id)}
                isToggling={togglingDeviceId === device.id}
                disabled={togglingDeviceId !== null && togglingDeviceId !== device.id}
                priceCents={priceData?.priceCents ?? null}
                defaultPriceCents={effectiveDefaultPrice}
                onPriceChange={(newPriceCents) => onPriceChange(device.id, newPriceCents)}
                countryCode={doctorCountry ?? undefined}
                isSavingPrice={savingPriceDeviceId === device.id}
              />
            );
          })}
        </div>
      )}

      {/* Footer Note */}
      {availableDevices.length > 0 && (
        <p className="text-xs text-stone-400 text-center pt-4">
          Changes are saved automatically. Devices not selected will not appear in clinical documentation.
        </p>
      )}
    </div>
  );
}
