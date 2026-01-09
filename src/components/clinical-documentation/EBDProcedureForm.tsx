'use client';

import React, { useState } from 'react';
import { EBDProcedureFormData, SelectedEBDDevice, EBDDevice } from '@/types';
import { EBDDeviceModal } from './EBDDeviceModal';
import { SelectedDeviceCard } from './SelectedDeviceCard';

export interface EBDProcedureFormProps {
  formData: EBDProcedureFormData;
  onChange: (data: EBDProcedureFormData) => void;
  disabled?: boolean;
  patientName: string;
  selectedConcerns?: string[];
}

export function EBDProcedureForm({
  formData,
  onChange,
  disabled = false,
  patientName,
  selectedConcerns = [],
}: EBDProcedureFormProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddDevice = (device: EBDDevice) => {
    // Don't add if already selected
    if (formData.selectedDevices.some(d => d.deviceId === device.id)) {
      return;
    }

    const newDevice: SelectedEBDDevice = {
      deviceId: device.id,
      sessionCount: 1, // Default to 1 session
      notes: '',
    };

    onChange({
      ...formData,
      selectedDevices: [...formData.selectedDevices, newDevice],
    });
  };

  const handleUpdateDevice = (index: number, updatedDevice: SelectedEBDDevice) => {
    const newDevices = [...formData.selectedDevices];
    newDevices[index] = updatedDevice;
    onChange({
      ...formData,
      selectedDevices: newDevices,
    });
  };

  const handleRemoveDevice = (index: number) => {
    onChange({
      ...formData,
      selectedDevices: formData.selectedDevices.filter((_, i) => i !== index),
    });
  };

  const selectedDeviceIds = formData.selectedDevices.map(d => d.deviceId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center mb-4">
          {/* Premium EBD Icon - Handheld laser device with energy beam */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-300 to-violet-400 rounded-full blur-lg opacity-20 scale-105" />
            <svg className="relative h-14 w-14" viewBox="0 0 56 56" fill="none">
              <defs>
                <linearGradient id="iconGradient5" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#9ca3af" />
                  <stop offset="100%" stopColor="#7c3aed" />
                </linearGradient>
                <linearGradient id="beamGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
                </linearGradient>
                <filter id="iconShadow5" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#7c3aed" floodOpacity="0.15"/>
                </filter>
              </defs>
              <circle cx="28" cy="28" r="27" fill="white" filter="url(#iconShadow5)" />
              <circle cx="28" cy="28" r="25" fill="url(#iconGradient5)" opacity="0.05" />
              {/* Handheld device body */}
              <path d="M24 32h8v10a2 2 0 01-2 2h-4a2 2 0 01-2-2v-10z" stroke="url(#iconGradient5)" strokeWidth="1.5" fill="none" />
              {/* Device head */}
              <rect x="22" y="26" width="12" height="6" rx="1" stroke="url(#iconGradient5)" strokeWidth="1.5" fill="none" />
              {/* Energy beam cone */}
              <path d="M25 26l-3-10h12l-3 10" stroke="url(#iconGradient5)" strokeWidth="1.5" fill="url(#beamGradient)" strokeLinejoin="round" />
              {/* Light rays */}
              <path d="M28 14v-2" stroke="url(#iconGradient5)" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M23 15l-1-1.5" stroke="url(#iconGradient5)" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M33 15l1-1.5" stroke="url(#iconGradient5)" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>
        <h1 className="text-2xl font-semibold text-stone-900 mb-1">
          EBD Procedure Selection
        </h1>
        <p className="text-stone-500 text-sm">
          for {patientName}
        </p>
      </div>

      {/* Disclaimer */}
      <div className="bg-stone-50 border border-stone-200 rounded-xl p-4">
        <div className="flex gap-3">
          <div className="flex-shrink-0 mt-0.5">
            <svg className="h-5 w-5 text-stone-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4m0-4h.01" />
            </svg>
          </div>
          <div>
            <p className="text-sm text-stone-600 font-medium mb-1">
              Documentation Only
            </p>
            <p className="text-sm text-stone-500">
              Select Energy-Based Device procedures for this clinical session.
              All selections are entered by the physician for documentation purposes.
              The system does not provide treatment recommendations.
            </p>
          </div>
        </div>
      </div>

      {/* Selected Devices */}
      <div className="bg-white rounded-xl border border-stone-200 p-6">
        <h2 className="text-base font-semibold text-stone-900 mb-4">
          Selected Devices
        </h2>

        {formData.selectedDevices.length === 0 ? (
          <div className="text-center py-8 bg-stone-50 rounded-lg border border-dashed border-stone-200">
            <svg className="h-10 w-10 mx-auto text-stone-300 mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              {/* Handheld laser device */}
              <path d="M10 14h4v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
              <rect x="9" y="11" width="6" height="3" rx="0.5" />
              {/* Energy beam */}
              <path d="M10.5 11l-1.5-5h6l-1.5 5" strokeLinejoin="round" />
              {/* Light rays */}
              <path d="M12 5V3" strokeLinecap="round" />
              <path d="M9 6L8 4.5" strokeLinecap="round" />
              <path d="M15 6l1-1.5" strokeLinecap="round" />
            </svg>
            <p className="text-sm text-stone-500">
              No EBD devices selected yet.
            </p>
            <p className="text-xs text-stone-400 mt-1">
              Click the button below to add devices.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {formData.selectedDevices.map((device, index) => (
              <SelectedDeviceCard
                key={device.deviceId}
                device={device}
                onUpdate={(updated) => handleUpdateDevice(index, updated)}
                onRemove={() => handleRemoveDevice(index)}
                disabled={disabled}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add Device Button */}
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        disabled={disabled}
        className={`
          w-full flex items-center justify-center gap-2 py-4
          bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl
          text-purple-700 font-medium text-sm
          transition-colors
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Add EBD Device
      </button>

      {/* Footer Note */}
      <p className="text-xs text-stone-400 text-center">
        All selections on this screen are entered by the physician for documentation purposes only.
      </p>

      {/* Device Selection Modal */}
      <EBDDeviceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={handleAddDevice}
        selectedDeviceIds={selectedDeviceIds}
        selectedConcerns={selectedConcerns}
      />
    </div>
  );
}

// Helper function to create empty form data
export function getEmptyEBDProcedureForm(): EBDProcedureFormData {
  return {
    selectedDevices: [],
  };
}
