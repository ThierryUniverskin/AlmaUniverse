'use client';

import React from 'react';
import { DoctorProcedure } from '@/types';
import { getSubcategoryLabel } from '@/lib/treatmentCategories';

export interface ProcedureManagementCardProps {
  procedure: DoctorProcedure;
  onEdit: () => void;
  onDelete: () => void;
  onToggleActive: () => void;
  isDeleting?: boolean;
  isToggling?: boolean;
}

export function ProcedureManagementCard({
  procedure,
  onEdit,
  onDelete,
  onToggleActive,
  isDeleting = false,
  isToggling = false,
}: ProcedureManagementCardProps) {
  const isDisabled = isDeleting || isToggling;

  return (
    <div className={`bg-white border rounded-xl p-4 transition-colors ${
      procedure.isActive
        ? 'border-stone-200 hover:border-stone-300'
        : 'border-stone-200 bg-stone-50 opacity-75'
    }`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className={`text-sm font-semibold ${procedure.isActive ? 'text-stone-900' : 'text-stone-500'}`}>
              {procedure.name}
            </h3>
            {!procedure.isActive && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-stone-200 text-stone-600">
                Inactive
              </span>
            )}
          </div>
          {procedure.brand && (
            <p className="text-xs text-stone-500 mt-0.5">{procedure.brand}</p>
          )}
          {procedure.description && (
            <p className="text-xs text-stone-400 mt-1 line-clamp-2">
              {procedure.description}
            </p>
          )}
          {procedure.subcategory && (
            <div className="mt-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-violet-50 text-violet-700">
                {getSubcategoryLabel(procedure.subcategory)}
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {/* Toggle Active/Inactive */}
          <button
            type="button"
            onClick={onToggleActive}
            disabled={isDisabled}
            className={`p-1.5 rounded-lg transition-colors disabled:opacity-50 ${
              procedure.isActive
                ? 'text-stone-400 hover:text-amber-600 hover:bg-amber-50'
                : 'text-stone-400 hover:text-green-600 hover:bg-green-50'
            }`}
            title={procedure.isActive ? 'Deactivate' : 'Activate'}
          >
            {isToggling ? (
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : procedure.isActive ? (
              // Eye-off icon for deactivate
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            ) : (
              // Eye icon for activate
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
          <button
            type="button"
            onClick={onEdit}
            disabled={isDisabled}
            className="p-1.5 text-stone-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors disabled:opacity-50"
            title="Edit"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
          <button
            type="button"
            onClick={onDelete}
            disabled={isDisabled}
            className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
            title="Delete"
          >
            {isDeleting ? (
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
