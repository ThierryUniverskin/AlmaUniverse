'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { EBDDevice } from '@/types';
import { EBD_DEVICES, getFitzpatrickColor, getDowntimeColor, fetchEBDDevices } from '@/lib/ebdDevices';
import { fetchDoctorActiveDevices } from '@/lib/doctorDevices';
import { getConcernById } from '@/lib/skinConcerns';

export interface EBDDeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (device: EBDDevice) => void;
  selectedDeviceIds: string[];
  selectedConcerns?: string[];
  doctorId?: string;
  accessToken?: string;
}

export function EBDDeviceModal({
  isOpen,
  onClose,
  onSelect,
  selectedDeviceIds,
  selectedConcerns = [],
  doctorId,
  accessToken,
}: EBDDeviceModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [mounted, setMounted] = useState(false);
  const [devices, setDevices] = useState<EBDDevice[]>(EBD_DEVICES);
  const [isLoading, setIsLoading] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch devices when modal opens
  // If doctor has configured devices in settings, show only those
  // Otherwise fall back to showing all devices
  useEffect(() => {
    if (isOpen && mounted) {
      setIsLoading(true);

      const loadDevices = async () => {
        // Try to fetch doctor's configured devices first
        if (doctorId && accessToken) {
          const doctorDevices = await fetchDoctorActiveDevices(doctorId, accessToken);
          if (doctorDevices.length > 0) {
            setDevices(doctorDevices);
            setIsLoading(false);
            return;
          }
        }

        // Fallback: fetch all devices if doctor hasn't configured any
        const allDevices = await fetchEBDDevices();
        setDevices(allDevices);
        setIsLoading(false);
      };

      loadDevices();
    }
  }, [isOpen, mounted, doctorId, accessToken]);

  // Focus search input when modal opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Reset search when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
    }
  }, [isOpen]);

  // Filter devices by search query (alphabetical order, no relevance sorting)
  const filteredDevices = useMemo(() => {
    if (!searchQuery.trim()) {
      return devices;
    }
    const query = searchQuery.toLowerCase();
    return devices.filter(device =>
      device.name.toLowerCase().includes(query) ||
      device.description.toLowerCase().includes(query) ||
      device.treats.some(treat => treat.toLowerCase().includes(query)) ||
      device.tags.some(tag => tag.toLowerCase().includes(query))
    );
  }, [searchQuery, devices]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

  const handleSelectDevice = (device: EBDDevice) => {
    onSelect(device);
    onClose();
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-2xl max-h-[85vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200">
          <h2 id="modal-title" className="text-lg font-semibold text-stone-900">
            Select EBD Device
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
            aria-label="Close"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Selected Skin Concerns */}
        {selectedConcerns.length > 0 && (
          <div className="px-6 py-3 bg-stone-50 border-b border-stone-100">
            <p className="text-[10px] font-medium text-stone-400 uppercase tracking-wide mb-2">
              Patient&apos;s Skin Concerns
            </p>
            <div className="flex flex-wrap gap-1.5">
              {selectedConcerns.map((concernId) => {
                const concern = getConcernById(concernId);
                if (!concern) return null;
                return (
                  <span
                    key={concernId}
                    className="px-2 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-medium"
                  >
                    {concern.label}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Search */}
        <div className="px-6 py-4 border-b border-stone-100">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <path strokeLinecap="round" d="M21 21l-4.35-4.35" />
            </svg>
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search devices..."
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-stone-200 rounded-lg
                       focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
                       placeholder:text-stone-400"
            />
          </div>
        </div>

        {/* Device List */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {isLoading ? (
            <div className="text-center py-8 text-sm text-stone-500">
              Loading devices...
            </div>
          ) : filteredDevices.length === 0 ? (
            <div className="text-center py-8 text-sm text-stone-500">
              No devices found matching &ldquo;{searchQuery}&rdquo;
            </div>
          ) : (
            <div className="space-y-4">
              {filteredDevices.map((device) => {
                const isAlreadySelected = selectedDeviceIds.includes(device.id);
                const fitzColors = getFitzpatrickColor(device.fitzpatrick);
                const downtimeColors = getDowntimeColor(device.downtime);

                return (
                  <div
                    key={device.id}
                    className={`
                      border rounded-xl p-4 transition-colors
                      ${isAlreadySelected
                        ? 'border-stone-200 bg-stone-100 opacity-60'
                        : 'border-stone-200 bg-stone-50 hover:border-purple-300 hover:bg-purple-50'
                      }
                    `}
                  >
                    <div className="flex gap-4">
                      {/* Device Image */}
                      <div className="flex-shrink-0">
                        <div className="w-16 h-[107px] rounded-lg overflow-hidden bg-white border border-stone-200">
                          <img
                            src={device.imageUrl || '/images/ebd-placeholder.webp'}
                            alt={device.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        {/* Header with name and select button */}
                        <div className="flex items-start justify-between gap-3 mb-1">
                          <h3 className="text-sm font-semibold text-stone-900 leading-tight">
                            {device.name}
                          </h3>
                          <button
                            type="button"
                            onClick={() => handleSelectDevice(device)}
                            disabled={isAlreadySelected}
                            className={`
                              flex-shrink-0 px-3 py-1 text-xs font-medium rounded-full transition-colors
                              ${isAlreadySelected
                                ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                                : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                              }
                            `}
                          >
                            {isAlreadySelected ? 'Added' : 'Select'}
                          </button>
                        </div>

                        {/* Description */}
                        <p className="text-[11px] text-stone-500 mb-2">
                          {device.description}
                        </p>

                        {/* Fitzpatrick and Downtime badges */}
                        <div className="flex items-center gap-1.5 mb-2">
                          <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${fitzColors.bg} ${fitzColors.text}`}>
                            Fitz {device.fitzpatrick}
                          </span>
                          <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${downtimeColors.bg} ${downtimeColors.text}`}>
                            {device.downtime === 'None' ? 'No' : device.downtime} Downtime
                          </span>
                        </div>

                        {/* Treats - as tags */}
                        <div className="flex flex-wrap gap-1">
                          {device.treats.map((treat, idx) => (
                            <span
                              key={idx}
                              className="px-1.5 py-0.5 text-[10px] bg-purple-50 text-purple-600 rounded"
                            >
                              {treat}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 border-t border-stone-100 bg-stone-50">
          <p className="text-xs text-stone-500 text-center">
            {filteredDevices.length} device{filteredDevices.length !== 1 ? 's' : ''} available
            {' · '}
            <span className="text-stone-400">Manage in Settings</span>
          </p>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
