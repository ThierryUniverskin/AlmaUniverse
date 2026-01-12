'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { SelectedTreatment, TreatmentCategory, EBDDevice, DoctorProcedure, DoctorProcedureFormData, DoctorDeviceWithPrice } from '@/types';
import { EBD_DEVICES, getFitzpatrickColor, getDowntimeColor, fetchEBDDevices, fetchAllDeviceCountryPrices } from '@/lib/ebdDevices';
import { fetchDoctorActiveDevices, fetchDoctorDevicesWithPrices } from '@/lib/doctorDevices';
import { fetchDoctorProceduresByCategory, createDoctorProcedure } from '@/lib/doctorProcedures';
import { getCategoryLabel, getCategorySingularLabel, getSubcategoryLabel, isCustomProcedureCategory } from '@/lib/treatmentCategories';
import { getConcernById } from '@/lib/skinConcerns';
import { CreateProcedureForm } from './CreateProcedureForm';
import { formatPrice } from '@/lib/pricing';

// Helper to get effective device price (custom price or default)
function getEffectiveDevicePrice(customPriceCents: number | null | undefined, defaultPriceCents: number | undefined): number | undefined {
  if (customPriceCents != null) return customPriceCents;
  return defaultPriceCents;
}

export interface TreatmentSelectionModalProps {
  isOpen: boolean;
  category: TreatmentCategory | null;
  onClose: () => void;
  onSelect: (treatment: SelectedTreatment) => void;
  onProcedureCreated?: (procedure: DoctorProcedure) => void;
  selectedIds: string[];
  selectedConcerns?: string[];
  doctorId?: string;
  accessToken?: string;
  countryCode?: string | null;
}

export function TreatmentSelectionModal({
  isOpen,
  category,
  onClose,
  onSelect,
  onProcedureCreated,
  selectedIds,
  selectedConcerns = [],
  doctorId,
  accessToken,
  countryCode,
}: TreatmentSelectionModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [mounted, setMounted] = useState(false);
  const [devices, setDevices] = useState<EBDDevice[]>([]);
  const [procedures, setProcedures] = useState<DoctorProcedure[]>([]);
  const [devicePrices, setDevicePrices] = useState<Record<string, DoctorDeviceWithPrice>>({});
  const [countryDefaultPrices, setCountryDefaultPrices] = useState<Map<string, number>>(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch data when modal opens
  useEffect(() => {
    if (isOpen && mounted && category) {
      setIsLoading(true);
      setShowCreateForm(false);
      setSearchQuery('');

      const loadData = async () => {
        if (category === 'ebd') {
          // Fetch EBD devices, doctor prices, and country default prices
          if (doctorId && accessToken) {
            const [doctorDevices, pricesData, countryPricesMap] = await Promise.all([
              fetchDoctorActiveDevices(doctorId, accessToken),
              fetchDoctorDevicesWithPrices(doctorId, accessToken),
              countryCode ? fetchAllDeviceCountryPrices(countryCode, accessToken) : Promise.resolve(new Map<string, number>()),
            ]);

            // Build prices map
            const pricesMap: Record<string, DoctorDeviceWithPrice> = {};
            for (const p of pricesData) {
              pricesMap[p.deviceId] = p;
            }
            setDevicePrices(pricesMap);
            setCountryDefaultPrices(countryPricesMap);

            if (doctorDevices.length > 0) {
              setDevices(doctorDevices);
              setProcedures([]);
              setIsLoading(false);
              return;
            }
          }
          // Fallback to all devices
          const allDevices = await fetchEBDDevices();
          setDevices(allDevices);
          setProcedures([]);
        } else if (accessToken && doctorId) {
          // Fetch custom procedures for the category
          const categoryProcedures = await fetchDoctorProceduresByCategory(
            doctorId,
            category,
            accessToken
          );
          setProcedures(categoryProcedures);
          setDevices([]);
        }

        setIsLoading(false);
      };

      loadData();
    }
  }, [isOpen, mounted, category, doctorId, accessToken, countryCode]);

  // Focus search input when modal opens
  useEffect(() => {
    if (isOpen && searchInputRef.current && !showCreateForm) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isOpen, showCreateForm]);

  // Filter devices/procedures by search query
  const filteredDevices = useMemo(() => {
    if (!searchQuery.trim()) return devices;
    const query = searchQuery.toLowerCase();
    return devices.filter(device =>
      device.name.toLowerCase().includes(query) ||
      device.description.toLowerCase().includes(query) ||
      device.treats.some(treat => treat.toLowerCase().includes(query)) ||
      device.tags.some(tag => tag.toLowerCase().includes(query))
    );
  }, [searchQuery, devices]);

  const filteredProcedures = useMemo(() => {
    if (!searchQuery.trim()) return procedures;
    const query = searchQuery.toLowerCase();
    return procedures.filter(procedure =>
      procedure.name.toLowerCase().includes(query) ||
      (procedure.brand?.toLowerCase().includes(query)) ||
      (procedure.description?.toLowerCase().includes(query)) ||
      (procedure.subcategory && getSubcategoryLabel(procedure.subcategory).toLowerCase().includes(query))
    );
  }, [searchQuery, procedures]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        if (showCreateForm) {
          setShowCreateForm(false);
        } else {
          onClose();
        }
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, showCreateForm, onClose]);

  // Prevent body scroll
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

  if (!mounted || !isOpen || !category) return null;

  const handleSelectDevice = (device: EBDDevice) => {
    // Get price: doctor's custom price if set, otherwise country-specific default, otherwise device global default
    const priceInfo = devicePrices[device.id];
    const countryDefault = countryDefaultPrices.get(device.id);
    const effectiveDefault = countryDefault ?? device.defaultPriceCents;
    const pricePerSessionCents = getEffectiveDevicePrice(priceInfo?.priceCents, effectiveDefault);

    const treatment: SelectedTreatment = {
      type: 'ebd',
      deviceId: device.id,
      sessionCount: 1,
      notes: '',
      pricePerSessionCents,
    };
    onSelect(treatment);
    onClose();
  };

  const handleSelectProcedure = (procedure: DoctorProcedure) => {
    const treatment: SelectedTreatment = {
      type: procedure.category,
      procedureId: procedure.id,
      sessionCount: 1,
      notes: '',
      pricePerSessionCents: procedure.priceCents,
    };
    onSelect(treatment);
    onClose();
  };

  const handleCreateProcedure = async (data: DoctorProcedureFormData) => {
    if (!doctorId || !accessToken) return;

    setIsCreating(true);
    const created = await createDoctorProcedure(doctorId, data, accessToken);
    setIsCreating(false);

    if (created) {
      // Add to local list
      setProcedures(prev => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
      // Notify parent
      onProcedureCreated?.(created);
      // Close modal
      onClose();
    }
  };

  const singularLabel = getCategorySingularLabel(category);
  const categoryLabel = getCategoryLabel(category);
  const isCustomCategory = isCustomProcedureCategory(category);

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
        onClick={() => showCreateForm ? setShowCreateForm(false) : onClose()}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-2xl max-h-[85vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200">
          <h2 id="modal-title" className="text-lg font-semibold text-stone-900">
            {showCreateForm ? `Create New ${singularLabel}` : `Select ${singularLabel}`}
          </h2>
          <button
            type="button"
            onClick={() => showCreateForm ? setShowCreateForm(false) : onClose()}
            className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
            aria-label="Close"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {showCreateForm ? (
          /* Create Form View */
          <CreateProcedureForm
            category={category as Exclude<TreatmentCategory, 'ebd'>}
            onSubmit={handleCreateProcedure}
            onCancel={() => setShowCreateForm(false)}
            isSubmitting={isCreating}
            countryCode={countryCode ?? undefined}
          />
        ) : (
          <>
            {/* Selected Skin Concerns (EBD only) */}
            {category === 'ebd' && selectedConcerns.length > 0 && (
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
                  placeholder={`Search ${category === 'ebd' ? 'devices' : 'procedures'}...`}
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-stone-200 rounded-lg
                           focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
                           placeholder:text-stone-400"
                />
              </div>
            </div>

            {/* Content List */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {isLoading ? (
                <div className="text-center py-8 text-sm text-stone-500">
                  Loading...
                </div>
              ) : (
                <>
                  {/* EBD Devices */}
                  {category === 'ebd' && (
                    filteredDevices.length === 0 ? (
                      <div className="text-center py-8 text-sm text-stone-500">
                        {searchQuery ? `No devices found matching "${searchQuery}"` : 'No devices available'}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {filteredDevices.map((device) => {
                          const isAlreadySelected = selectedIds.includes(device.id);
                          const fitzColors = getFitzpatrickColor(device.fitzpatrick);
                          const downtimeColors = getDowntimeColor(device.downtime);
                          const priceInfo = devicePrices[device.id];
                          const countryDefault = countryDefaultPrices.get(device.id);
                          const effectiveDefault = countryDefault ?? device.defaultPriceCents;
                          const devicePrice = getEffectiveDevicePrice(priceInfo?.priceCents, effectiveDefault);

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
                                <div className="flex-shrink-0">
                                  <div className="w-14 h-[93px] rounded-lg overflow-hidden bg-white border border-stone-200">
                                    <img
                                      src={device.imageUrl || '/images/ebd-placeholder.webp'}
                                      alt={device.name}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-3 mb-1">
                                    <div>
                                      <h3 className="text-sm font-semibold text-stone-900 leading-tight">
                                        {device.name}
                                      </h3>
                                      {devicePrice != null && devicePrice > 0 && (
                                        <p className="text-xs font-medium text-purple-600">
                                          {formatPrice(devicePrice, countryCode)}/session
                                        </p>
                                      )}
                                    </div>
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
                                  <p className="text-[11px] text-stone-500 mb-2">
                                    {device.description}
                                  </p>
                                  <div className="flex items-center gap-1.5 mb-2">
                                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${fitzColors.bg} ${fitzColors.text}`}>
                                      Fitz {device.fitzpatrick}
                                    </span>
                                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${downtimeColors.bg} ${downtimeColors.text}`}>
                                      {device.downtime === 'None' ? 'No' : device.downtime} Downtime
                                    </span>
                                  </div>
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
                    )
                  )}

                  {/* Custom Procedures */}
                  {isCustomCategory && (
                    <>
                      {filteredProcedures.length === 0 && !searchQuery ? (
                        <div className="text-center py-8 text-sm text-stone-500">
                          No {categoryLabel.toLowerCase()} created yet.
                          <br />
                          <span className="text-xs text-stone-400">Click &quot;Create New&quot; below to add your first {singularLabel.toLowerCase()}.</span>
                        </div>
                      ) : filteredProcedures.length === 0 ? (
                        <div className="text-center py-8 text-sm text-stone-500">
                          No {categoryLabel.toLowerCase()} found matching &quot;{searchQuery}&quot;
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {filteredProcedures.map((procedure) => {
                            const isAlreadySelected = selectedIds.includes(procedure.id);

                            return (
                              <div
                                key={procedure.id}
                                className={`
                                  border rounded-xl p-4 transition-colors
                                  ${isAlreadySelected
                                    ? 'border-stone-200 bg-stone-100 opacity-60'
                                    : 'border-stone-200 bg-stone-50 hover:border-purple-300 hover:bg-purple-50'
                                  }
                                `}
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex-1 min-w-0">
                                    <h3 className="text-sm font-semibold text-stone-900 leading-tight">
                                      {procedure.name}
                                    </h3>
                                    {procedure.brand && (
                                      <span className="text-xs text-stone-500">{procedure.brand}</span>
                                    )}
                                    {procedure.priceCents > 0 && (
                                      <p className="text-xs font-medium text-purple-600 mt-0.5">
                                        {formatPrice(procedure.priceCents, countryCode)}/session
                                      </p>
                                    )}
                                    {procedure.description && (
                                      <p className="text-[11px] text-stone-500 mt-1">
                                        {procedure.description}
                                      </p>
                                    )}
                                    {procedure.subcategory && (
                                      <div className="mt-2">
                                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-violet-50 text-violet-700">
                                          {getSubcategoryLabel(procedure.subcategory)}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleSelectProcedure(procedure)}
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
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Create New button - placed after the list */}
                      <button
                        type="button"
                        onClick={() => setShowCreateForm(true)}
                        className="w-full mt-4 flex items-center justify-center gap-2 py-3 px-4
                                 bg-purple-50 hover:bg-purple-100 border border-purple-200 border-dashed rounded-xl
                                 text-purple-700 font-medium text-sm transition-colors"
                      >
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Create New {singularLabel}
                      </button>
                    </>
                  )}
                </>
              )}
            </div>

            {/* Footer info */}
            <div className="px-6 py-3 border-t border-stone-100 bg-stone-50">
              <p className="text-xs text-stone-500 text-center">
                {category === 'ebd' ? (
                  <>
                    {filteredDevices.length} device{filteredDevices.length !== 1 ? 's' : ''} available
                    {' · '}
                    <span className="text-stone-400">Manage in Settings</span>
                  </>
                ) : (
                  <>
                    {filteredProcedures.length} {categoryLabel.toLowerCase()}{filteredProcedures.length !== 1 ? '' : ''} available
                    {' · '}
                    <span className="text-stone-400">Manage in Settings</span>
                  </>
                )}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
