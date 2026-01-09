'use client';

import React, { useState, useEffect, useRef } from 'react';
import { SelectedTreatment, EBDDevice, DoctorProcedure, TreatmentCategory } from '@/types';
import { fetchEBDDeviceById, getFitzpatrickColor, getDowntimeColor } from '@/lib/ebdDevices';
import { getDoctorProcedureById } from '@/lib/doctorProcedures';
import { getSubcategoryLabel, getCategorySingularLabel } from '@/lib/treatmentCategories';

export interface SelectedTreatmentCardProps {
  treatment: SelectedTreatment;
  onUpdate: (treatment: SelectedTreatment) => void;
  onRemove: () => void;
  disabled?: boolean;
  doctorId?: string;
  accessToken?: string;
}

// Category icon component
function CategoryIcon({ category, className = '' }: { category: TreatmentCategory; className?: string }) {
  const iconClass = `${className}`;

  switch (category) {
    case 'ebd':
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M10 14h4v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
          <rect x="9" y="11" width="6" height="3" rx="0.5" />
          <path d="M10.5 11l-1.5-5h6l-1.5 5" strokeLinejoin="round" />
        </svg>
      );
    case 'toxin':
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M19.5 4.5l-1 1m0 0l-4-1-9 9 5 5 9-9-1-4z" strokeLinejoin="round" />
          <path d="M5.5 18.5l-1 1" strokeLinecap="round" />
        </svg>
      );
    case 'injectable':
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="8" y="4" width="8" height="16" rx="2" />
          <path d="M8 8h8" strokeLinecap="round" />
        </svg>
      );
    case 'other':
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 3v2m0 14v2M3 12h2m14 0h2" strokeLinecap="round" />
        </svg>
      );
  }
}

export function SelectedTreatmentCard({
  treatment,
  onUpdate,
  onRemove,
  disabled = false,
  doctorId,
  accessToken,
}: SelectedTreatmentCardProps) {
  const [device, setDevice] = useState<EBDDevice | null>(null);
  const [procedure, setProcedure] = useState<DoctorProcedure | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(true);
  const notesRef = useRef<HTMLTextAreaElement>(null);

  // Fetch details based on treatment type
  useEffect(() => {
    const fetchDetails = async () => {
      setIsLoadingDetails(true);

      if (treatment.type === 'ebd' && treatment.deviceId) {
        // Fetch from database to get imageUrl
        const deviceData = await fetchEBDDeviceById(treatment.deviceId, accessToken || undefined);
        setDevice(deviceData);
        setProcedure(null);
      } else if (treatment.procedureId && accessToken) {
        const procedureData = await getDoctorProcedureById(treatment.procedureId, accessToken);
        setProcedure(procedureData);
        setDevice(null);
      }

      setIsLoadingDetails(false);
    };

    fetchDetails();
  }, [treatment.type, treatment.deviceId, treatment.procedureId, accessToken]);

  // Auto-resize notes textarea helper
  const resizeTextarea = () => {
    if (notesRef.current) {
      notesRef.current.style.height = 'auto';
      notesRef.current.style.height = `${notesRef.current.scrollHeight}px`;
    }
  };

  // Resize when notes change
  useEffect(() => {
    resizeTextarea();
  }, [treatment.notes]);

  // Resize after loading completes (component fully rendered)
  useEffect(() => {
    if (!isLoadingDetails) {
      // Multiple attempts to handle accordion animation
      resizeTextarea();
      const timer1 = setTimeout(resizeTextarea, 50);
      const timer2 = setTimeout(resizeTextarea, 150);
      const timer3 = setTimeout(resizeTextarea, 300);
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    }
  }, [isLoadingDetails]);

  const handleSessionCountChange = (delta: number) => {
    const newCount = Math.max(1, (treatment.sessionCount || 1) + delta);
    onUpdate({ ...treatment, sessionCount: newCount });
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdate({ ...treatment, notes: e.target.value });
  };

  // Get display values
  const displayName = treatment.type === 'ebd' ? device?.name : procedure?.name;
  const displayDescription = treatment.type === 'ebd'
    ? device?.description
    : procedure?.description || (procedure?.subcategory ? getSubcategoryLabel(procedure.subcategory) : '');
  const displayBrand = treatment.type !== 'ebd' ? procedure?.brand : undefined;

  if (isLoadingDetails) {
    return (
      <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 animate-pulse">
        <div className="h-4 bg-stone-200 rounded w-1/3 mb-2" />
        <div className="h-3 bg-stone-100 rounded w-2/3" />
      </div>
    );
  }

  return (
    <div className="bg-stone-50 border border-stone-200 rounded-xl p-4">
      {/* Treatment info */}
      <div className="flex gap-4">
        {/* Image/Icon - 3:5 aspect ratio */}
        <div className="flex-shrink-0">
          {treatment.type === 'ebd' && device?.imageUrl ? (
            <div className="w-[60px] h-[100px] rounded-lg overflow-hidden bg-white border border-stone-200">
              <img
                src={device.imageUrl}
                alt={device.name}
                className="w-full h-full object-contain"
              />
            </div>
          ) : (
            <div className="w-[60px] h-[100px] rounded-lg bg-gradient-to-br from-purple-50 to-violet-100 border border-purple-100 flex items-center justify-center">
              <CategoryIcon category={treatment.type} className="h-8 w-8 text-purple-400" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header with name and remove button */}
          <div className="flex items-start justify-between gap-3 mb-1">
            <div>
              <h3 className="text-sm font-semibold text-stone-900 leading-tight">
                {displayName || 'Unknown Treatment'}
              </h3>
              {displayBrand && (
                <span className="text-xs text-stone-500">{displayBrand}</span>
              )}
            </div>
            <button
              type="button"
              onClick={onRemove}
              disabled={disabled}
              className="flex-shrink-0 p-1 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
              aria-label="Remove treatment"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Description */}
          {displayDescription && (
            <p className="text-[11px] text-stone-500 mb-2">
              {displayDescription}
            </p>
          )}

          {/* EBD-specific badges */}
          {treatment.type === 'ebd' && device && (
            <>
              <div className="flex items-center gap-1.5 mb-2">
                {device.fitzpatrick && (
                  <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${getFitzpatrickColor(device.fitzpatrick).bg} ${getFitzpatrickColor(device.fitzpatrick).text}`}>
                    Fitz {device.fitzpatrick}
                  </span>
                )}
                {device.downtime && (
                  <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${getDowntimeColor(device.downtime).bg} ${getDowntimeColor(device.downtime).text}`}>
                    {device.downtime === 'None' ? 'No' : device.downtime} Downtime
                  </span>
                )}
              </div>
              {/* Treats tags */}
              {device.treats && device.treats.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {device.treats.map((treat, idx) => (
                    <span
                      key={idx}
                      className="px-1.5 py-0.5 text-[10px] bg-purple-50 text-purple-600 rounded"
                    >
                      {treat}
                    </span>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Subcategory badge for "other" */}
          {treatment.type === 'other' && procedure?.subcategory && (
            <div className="mb-2">
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-violet-50 text-violet-700">
                {getSubcategoryLabel(procedure.subcategory)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Session count & Notes */}
      <div className="border-t border-stone-100 pt-3 mt-3">
        <div className="flex items-start gap-4">
          {/* Session count spinner */}
          <div className="flex-shrink-0">
            <label className="block text-[10px] font-medium text-stone-500 uppercase tracking-wide mb-1">
              Sessions
            </label>
            <div className="inline-flex items-center border border-stone-200 rounded-lg bg-white">
              <button
                type="button"
                onClick={() => handleSessionCountChange(-1)}
                disabled={disabled || (treatment.sessionCount || 1) <= 1}
                className="px-2 py-1.5 text-stone-500 hover:text-stone-700 hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-l-lg transition-colors"
              >
                <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14" strokeLinecap="round" />
                </svg>
              </button>
              <span className="px-3 py-1.5 text-sm font-medium text-stone-900 min-w-[2rem] text-center">
                {treatment.sessionCount || 1}
              </span>
              <button
                type="button"
                onClick={() => handleSessionCountChange(1)}
                disabled={disabled}
                className="px-2 py-1.5 text-stone-500 hover:text-stone-700 hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-r-lg transition-colors"
              >
                <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </div>

          {/* Notes */}
          <div className="flex-1 min-w-0">
            <label className="block text-[10px] font-medium text-stone-500 uppercase tracking-wide mb-1">
              Notes (optional)
            </label>
            <textarea
              ref={notesRef}
              value={treatment.notes}
              onChange={handleNotesChange}
              disabled={disabled}
              placeholder="Add notes..."
              rows={1}
              className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg resize-none
                       focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
                       placeholder:text-stone-400 disabled:bg-stone-100 disabled:cursor-not-allowed
                       overflow-hidden"
              style={{ minHeight: '38px' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
