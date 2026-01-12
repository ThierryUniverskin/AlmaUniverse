'use client';

import React, { useState, useEffect } from 'react';
import { SelectedTreatment, TreatmentCategory, EBDDevice, DoctorProcedure } from '@/types';
import { getConcernById } from '@/lib/skinConcerns';
import { getCategoryLabel } from '@/lib/treatmentCategories';
import { fetchEBDDeviceById } from '@/lib/ebdDevices';
import { getDoctorProcedureById } from '@/lib/doctorProcedures';

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
}

// Resolved treatment with name and image
interface ResolvedTreatment {
  name: string;
  sessionCount: number | null;
  category: TreatmentCategory;
  imageUrl?: string | null;
  notes?: string;
}

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
}: SessionSummaryCardProps) {
  const [resolvedTreatments, setResolvedTreatments] = useState<ResolvedTreatment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
            // Doctor procedures don't have images, will show placeholder
          }
        }

        resolved.push({
          name,
          sessionCount: treatment.sessionCount,
          category: treatment.type,
          imageUrl,
          notes: treatment.notes || undefined,
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

  // Format session count display
  const formatSessionCount = (count: number | null) => {
    if (!count) return '';
    if (count === 1) return '(1 session)';
    return `(${count} sessions)`;
  };

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

        {/* Patient Photos */}
        {hasPhotos && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-stone-700 mb-3">
              Patient Photos
            </label>
            <div className="flex gap-3">
              {frontalPhoto && (
                <div className="flex-1">
                  <div className="aspect-[3/4] rounded-xl overflow-hidden bg-stone-100 border border-stone-200">
                    <img
                      src={frontalPhoto}
                      alt="Frontal view"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-xs text-stone-500 text-center mt-1.5">Frontal</p>
                </div>
              )}
              {leftProfilePhoto && (
                <div className="flex-1">
                  <div className="aspect-[3/4] rounded-xl overflow-hidden bg-stone-100 border border-stone-200">
                    <img
                      src={leftProfilePhoto}
                      alt="Left profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-xs text-stone-500 text-center mt-1.5">Left Profile</p>
                </div>
              )}
              {rightProfilePhoto && (
                <div className="flex-1">
                  <div className="aspect-[3/4] rounded-xl overflow-hidden bg-stone-100 border border-stone-200">
                    <img
                      src={rightProfilePhoto}
                      alt="Right profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-xs text-stone-500 text-center mt-1.5">Right Profile</p>
                </div>
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

        {/* Treatments */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">
            Documented Treatments
          </label>

          {isLoading ? (
            <div className="animate-pulse space-y-2">
              <div className="h-4 bg-stone-100 rounded w-3/4" />
              <div className="h-4 bg-stone-100 rounded w-1/2" />
            </div>
          ) : orderedCategories.length > 0 ? (
            <div className="space-y-4">
              {orderedCategories.map(category => (
                <div key={category}>
                  <span className="text-xs font-medium text-stone-500 uppercase tracking-wide">
                    {getCategoryLabel(category)}
                  </span>
                  <div className="mt-2 space-y-2">
                    {treatmentsByCategory[category].map((treatment, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-3 bg-stone-50 rounded-xl border border-stone-100"
                      >
                        {/* Treatment image */}
                        {treatment.imageUrl ? (
                          <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-white border border-stone-200">
                            <img
                              src={treatment.imageUrl}
                              alt={treatment.name}
                              className="w-full h-full object-contain"
                            />
                          </div>
                        ) : (
                          <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                            <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
                            </svg>
                          </div>
                        )}
                        {/* Treatment details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-stone-800">
                              {treatment.name}
                            </span>
                            {formatSessionCount(treatment.sessionCount) && (
                              <span className="text-xs text-stone-400">
                                {formatSessionCount(treatment.sessionCount)}
                              </span>
                            )}
                          </div>
                          {treatment.notes && (
                            <p className="text-xs text-stone-500 mt-1 line-clamp-2">
                              {treatment.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
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
    </div>
  );
}
