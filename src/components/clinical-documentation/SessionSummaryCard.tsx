'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useSidebarOffset } from '@/context/LayoutContext';
import { SelectedTreatment, TreatmentCategory, EBDDevice, DoctorProcedure } from '@/types';
import { getConcernById } from '@/lib/skinConcerns';
import { getCategoryLabel } from '@/lib/treatmentCategories';
import { fetchEBDDeviceById } from '@/lib/ebdDevices';
import { getDoctorProcedureById } from '@/lib/doctorProcedures';
import { formatPrice, calculateTotalPrice } from '@/lib/pricing';

export interface SessionSummaryCardProps {
  patientName: string;
  sessionDateTime: string;
  sessionId?: string;
  skinConcerns: string[]; // Concern IDs
  treatments: SelectedTreatment[];
  frontalPhoto?: string | null;
  leftProfilePhoto?: string | null;
  rightProfilePhoto?: string | null;
  doctorId?: string;
  accessToken?: string;
  countryCode?: string | null;
}

// Resolved treatment with name and image
interface ResolvedTreatment {
  name: string;
  sessionCount: number | null;
  category: TreatmentCategory;
  imageUrl?: string | null;
  notes?: string;
  pricePerSessionCents?: number;
}

// Photo type labels
const PHOTO_LABELS = {
  frontal: 'Frontal',
  left: 'Left Profile',
  right: 'Right Profile',
};

export function SessionSummaryCard({
  patientName,
  sessionDateTime,
  sessionId,
  skinConcerns,
  treatments,
  frontalPhoto,
  leftProfilePhoto,
  rightProfilePhoto,
  accessToken,
  countryCode,
}: SessionSummaryCardProps) {
  const sidebarOffset = useSidebarOffset();
  const [resolvedTreatments, setResolvedTreatments] = useState<ResolvedTreatment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [fullscreenPhoto, setFullscreenPhoto] = useState<{ url: string; label: string } | null>(null);

  // For portal mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  // Check if we have any photos
  const hasPhotos = frontalPhoto || leftProfilePhoto || rightProfilePhoto;

  // Resolve treatment names, images, and notes
  useEffect(() => {
    const resolveTreatments = async () => {
      setIsLoading(true);
      const resolved: ResolvedTreatment[] = [];

      for (const treatment of treatments) {
        let name = 'Unknown Treatment';
        let imageUrl: string | null = null;

        if (treatment.type === 'ebd' && treatment.deviceId) {
          const device = await fetchEBDDeviceById(treatment.deviceId, accessToken || undefined);
          if (device) {
            name = device.name;
            imageUrl = device.imageUrl || null;
          }
        } else if (treatment.procedureId && accessToken) {
          const procedure = await getDoctorProcedureById(treatment.procedureId, accessToken);
          if (procedure) {
            name = procedure.brand ? `${procedure.name} (${procedure.brand})` : procedure.name;
          }
        }

        resolved.push({
          name,
          sessionCount: treatment.sessionCount,
          category: treatment.type,
          imageUrl,
          notes: treatment.notes || undefined,
          pricePerSessionCents: treatment.pricePerSessionCents,
        });
      }

      setResolvedTreatments(resolved);
      setIsLoading(false);
    };

    resolveTreatments();
  }, [treatments, accessToken]);

  // Resolve concern labels
  const concernLabels = skinConcerns
    .map(id => getConcernById(id)?.label)
    .filter((label): label is string => !!label);

  // Group treatments by category
  const treatmentsByCategory = resolvedTreatments.reduce((acc, treatment) => {
    if (!acc[treatment.category]) {
      acc[treatment.category] = [];
    }
    acc[treatment.category].push(treatment);
    return acc;
  }, {} as Record<TreatmentCategory, ResolvedTreatment[]>);

  // Order categories for display
  const categoryOrder: TreatmentCategory[] = ['ebd', 'toxin', 'injectable', 'other'];
  const orderedCategories = categoryOrder.filter(cat => treatmentsByCategory[cat]?.length > 0);

  // Calculate grand total
  const grandTotal = resolvedTreatments.reduce((sum, treatment) => {
    if (treatment.pricePerSessionCents != null && treatment.pricePerSessionCents > 0) {
      return sum + (treatment.pricePerSessionCents * (treatment.sessionCount || 1));
    }
    return sum;
  }, 0);

  return (
    <div className="bg-white border border-stone-200 rounded-2xl shadow-soft overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 bg-gradient-to-r from-stone-50 to-ivory-100 border-b border-stone-100">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-stone-900">{patientName}</h3>
            <p className="text-sm text-stone-500 mt-0.5">{sessionDateTime}</p>
          </div>
          {sessionId && (
            <span className="text-xs text-stone-400 font-mono">
              #{sessionId.slice(0, 8)}
            </span>
          )}
        </div>
      </div>

      {/* Clinical Documentation Section */}
      <div className="p-6">
        <h4 className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-4">
          Clinical Documentation (Physician-Entered)
        </h4>

        {/* Patient Photos - Thumbnails */}
        {hasPhotos && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-stone-700 mb-3">
              Patient Photos
            </label>
            <div className="flex gap-2">
              {frontalPhoto && (
                <button
                  type="button"
                  onClick={() => setFullscreenPhoto({ url: frontalPhoto, label: PHOTO_LABELS.frontal })}
                  className="group flex flex-col items-center"
                >
                  <div className="w-16 h-20 rounded-lg overflow-hidden bg-stone-100 border border-stone-200 group-hover:border-purple-400 group-hover:ring-2 group-hover:ring-purple-100 transition-all">
                    <img
                      src={frontalPhoto}
                      alt="Frontal view"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-[10px] text-stone-500 mt-1">Frontal</p>
                </button>
              )}
              {leftProfilePhoto && (
                <button
                  type="button"
                  onClick={() => setFullscreenPhoto({ url: leftProfilePhoto, label: PHOTO_LABELS.left })}
                  className="group flex flex-col items-center"
                >
                  <div className="w-16 h-20 rounded-lg overflow-hidden bg-stone-100 border border-stone-200 group-hover:border-purple-400 group-hover:ring-2 group-hover:ring-purple-100 transition-all">
                    <img
                      src={leftProfilePhoto}
                      alt="Left profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-[10px] text-stone-500 mt-1">Left</p>
                </button>
              )}
              {rightProfilePhoto && (
                <button
                  type="button"
                  onClick={() => setFullscreenPhoto({ url: rightProfilePhoto, label: PHOTO_LABELS.right })}
                  className="group flex flex-col items-center"
                >
                  <div className="w-16 h-20 rounded-lg overflow-hidden bg-stone-100 border border-stone-200 group-hover:border-purple-400 group-hover:ring-2 group-hover:ring-purple-100 transition-all">
                    <img
                      src={rightProfilePhoto}
                      alt="Right profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-[10px] text-stone-500 mt-1">Right</p>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Skin Concerns */}
        {concernLabels.length > 0 ? (
          <div className="mb-6">
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Selected Skin Concerns
            </label>
            <div className="flex flex-wrap gap-2">
              {concernLabels.map((label, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1.5 bg-purple-50 text-purple-700 text-sm font-medium rounded-full border border-purple-100"
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div className="mb-6">
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Selected Skin Concerns
            </label>
            <p className="text-sm text-stone-400 italic">No skin concerns documented</p>
          </div>
        )}

        {/* Treatments - Card-based layout focused on treatment details */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-3">
            Documented Treatments
          </label>

          {isLoading ? (
            <div className="animate-pulse space-y-3">
              <div className="h-20 bg-stone-100 rounded-xl" />
              <div className="h-20 bg-stone-100 rounded-xl" />
            </div>
          ) : orderedCategories.length > 0 ? (
            <div className="space-y-4">
              {orderedCategories.map(category => (
                <div key={category}>
                  {/* Category header */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-semibold text-stone-500 uppercase tracking-wide">
                      {getCategoryLabel(category)}
                    </span>
                    <div className="flex-1 h-px bg-stone-200" />
                  </div>

                  {/* Treatment cards */}
                  <div className="space-y-3">
                    {treatmentsByCategory[category].map((treatment, index) => {
                      const sessionCount = treatment.sessionCount || 1;
                      const hasPrice = treatment.pricePerSessionCents != null && treatment.pricePerSessionCents > 0;
                      const lineTotal = hasPrice ? calculateTotalPrice(treatment.pricePerSessionCents, sessionCount) : 0;

                      return (
                        <div
                          key={index}
                          className="bg-stone-50 border border-stone-200 rounded-xl p-4"
                        >
                          <div className="flex gap-4">
                            {/* Treatment image - larger */}
                            {treatment.imageUrl ? (
                              <div className="flex-shrink-0 w-16 h-[80px] rounded-lg overflow-hidden bg-white border border-stone-200">
                                <img
                                  src={treatment.imageUrl}
                                  alt={treatment.name}
                                  className="w-full h-full object-contain"
                                />
                              </div>
                            ) : (
                              <div className="flex-shrink-0 w-16 h-[80px] rounded-lg bg-gradient-to-br from-purple-50 to-violet-100 border border-purple-100 flex items-center justify-center">
                                <svg className="w-7 h-7 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
                                </svg>
                              </div>
                            )}

                            {/* Treatment details */}
                            <div className="flex-1 min-w-0">
                              {/* Name and sessions */}
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <h4 className="text-sm font-semibold text-stone-900">
                                  {treatment.name}
                                </h4>
                                <span className="flex-shrink-0 inline-flex items-center px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                                  {sessionCount} session{sessionCount !== 1 ? 's' : ''}
                                </span>
                              </div>

                              {/* Notes - prominently displayed */}
                              {treatment.notes && (
                                <div className="mt-2 p-2.5 bg-white border border-stone-200 rounded-lg">
                                  <p className="text-xs text-stone-600 leading-relaxed">
                                    <span className="font-medium text-stone-500">Notes: </span>
                                    {treatment.notes}
                                  </p>
                                </div>
                              )}

                              {/* Price - subtle, at the bottom */}
                              {hasPrice && (
                                <div className="mt-2 flex items-center gap-2 text-xs text-stone-500">
                                  <span>{formatPrice(treatment.pricePerSessionCents, countryCode)}/session</span>
                                  {sessionCount > 1 && (
                                    <>
                                      <span>×</span>
                                      <span>{sessionCount}</span>
                                      <span>=</span>
                                      <span className="font-medium text-stone-700">{formatPrice(lineTotal, countryCode)}</span>
                                    </>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Grand Total - subtle footer */}
              {grandTotal > 0 && (
                <div className="pt-4 mt-2 border-t border-stone-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-stone-600">Estimated Total</span>
                    <span className="text-base font-semibold text-stone-900">
                      {formatPrice(grandTotal, countryCode)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-stone-400 italic">No treatments documented</p>
          )}
        </div>
      </div>

      {/* Footer disclaimer */}
      <div className="px-6 py-3 bg-stone-50 border-t border-stone-100">
        <p className="text-xs text-stone-400 text-center">
          Entries above are recorded for documentation purposes only.
        </p>
      </div>

      {/* Fullscreen Photo Modal - rendered via portal */}
      {mounted && fullscreenPhoto && createPortal(
        <div
          className="fixed top-0 left-0 right-0 bottom-0 z-[9999] bg-black/80 flex items-center justify-center p-6 transition-[padding] duration-300"
          style={{ paddingLeft: sidebarOffset }}
          onClick={() => setFullscreenPhoto(null)}
        >
          <div
            className="relative bg-white rounded-2xl overflow-hidden shadow-2xl max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-stone-200">
              <span className="text-sm font-medium text-stone-900">
                {fullscreenPhoto.label}
              </span>
              <button
                type="button"
                onClick={() => setFullscreenPhoto(null)}
                className="h-8 w-8 rounded-full hover:bg-stone-100 flex items-center justify-center transition-colors"
              >
                <svg className="h-5 w-5 text-stone-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Image - height constrained, width follows aspect ratio */}
            <div className="bg-stone-100 flex items-center justify-center">
              <img
                src={fullscreenPhoto.url}
                alt={`${fullscreenPhoto.label} photo`}
                className="max-h-[75vh] w-auto object-contain"
              />
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
