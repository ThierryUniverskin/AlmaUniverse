'use client';

import React from 'react';
import { DoctorProcedure } from '@/types';
import { getSubcategoryLabel } from '@/lib/treatmentCategories';
import { cn } from '@/lib/utils';
import { formatPrice } from '@/lib/pricing';

export interface ProcedureManagementCardProps {
  procedure: DoctorProcedure;
  onEdit: () => void;
  onDelete: () => void;
  onToggleActive: () => void;
  isDeleting?: boolean;
  isToggling?: boolean;
  countryCode?: string;
}

export function ProcedureManagementCard({
  procedure,
  onEdit,
  onDelete,
  onToggleActive,
  isDeleting = false,
  isToggling = false,
  countryCode,
}: ProcedureManagementCardProps) {
  const isDisabled = isDeleting || isToggling;

  return (
    <div
      className={cn(
        'relative bg-white rounded-xl border p-4 transition-all',
        procedure.isActive
          ? 'border-purple-300 ring-1 ring-purple-200'
          : 'border-stone-200 hover:border-stone-300'
      )}
    >
      {/* Header with name and toggle */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-stone-900 leading-tight">
            {procedure.name}
          </h3>
          {procedure.brand && (
            <p className="text-xs text-stone-500 mt-0.5">{procedure.brand}</p>
          )}
        </div>

        {/* Toggle Switch */}
        <button
          type="button"
          role="switch"
          aria-checked={procedure.isActive}
          onClick={onToggleActive}
          disabled={isDisabled}
          className={cn(
            'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2',
            procedure.isActive ? 'bg-purple-600' : 'bg-stone-200',
            isDisabled && 'cursor-not-allowed opacity-50'
          )}
        >
          {isToggling ? (
            <span className="absolute inset-0 flex items-center justify-center">
              <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </span>
          ) : (
            <span
              className={cn(
                'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                procedure.isActive ? 'translate-x-5' : 'translate-x-0'
              )}
            />
          )}
        </button>
      </div>

      {/* Description */}
      {procedure.description && (
        <p className="text-[11px] text-stone-500 line-clamp-2 mb-2">
          {procedure.description}
        </p>
      )}

      {/* Subcategory badge */}
      {procedure.subcategory && (
        <div className="mb-3">
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-violet-50 text-violet-700">
            {getSubcategoryLabel(procedure.subcategory)}
          </span>
        </div>
      )}

      {/* Price Section - dedicated row when active */}
      {procedure.isActive && (
        <div className="mt-3 pt-3 border-t border-stone-100">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-500">Price per session</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-stone-900">
                {formatPrice(procedure.priceCents, countryCode)}
              </span>
              <button
                type="button"
                onClick={onEdit}
                disabled={isDisabled}
                className="p-1.5 text-stone-400 hover:text-purple-600 hover:bg-purple-50 rounded-md transition-colors disabled:opacity-50"
                title="Edit procedure"
              >
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex items-center gap-1 pt-3 mt-3 border-t border-stone-100">
        <button
          type="button"
          onClick={onEdit}
          disabled={isDisabled}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-stone-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors disabled:opacity-50"
        >
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
          Edit
        </button>
        <button
          type="button"
          onClick={onDelete}
          disabled={isDisabled}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-stone-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
        >
          {isDeleting ? (
            <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : (
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z" />
            </svg>
          )}
          Delete
        </button>
      </div>
    </div>
  );
}
