'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { DoctorProcedure, DoctorProcedureFormData, TreatmentCategory } from '@/types';
import { fetchAllDoctorProcedures, createDoctorProcedure, updateDoctorProcedure, deleteDoctorProcedure, toggleProcedureActive } from '@/lib/doctorProcedures';
import { getCategorySingularLabel } from '@/lib/treatmentCategories';
import { useToast } from '@/components/ui';
import { ProcedureManagementCard } from './ProcedureManagementCard';
import { ProcedureFormModal } from './ProcedureFormModal';

type ProcedureTab = 'toxin' | 'injectable' | 'other';

export interface CustomProceduresSectionProps {
  doctorId: string;
  accessToken: string;
  onProceduresChange?: () => void;
  countryCode?: string | null;
}

export function CustomProceduresSection({
  doctorId,
  accessToken,
  onProceduresChange,
  countryCode,
}: CustomProceduresSectionProps) {
  const { showToast } = useToast();

  const [procedures, setProcedures] = useState<DoctorProcedure[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ProcedureTab>('toxin');
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingProcedure, setEditingProcedure] = useState<DoctorProcedure | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Load procedures (including inactive for settings page)
  useEffect(() => {
    const loadProcedures = async () => {
      setIsLoading(true);
      const data = await fetchAllDoctorProcedures(doctorId, accessToken, true);
      setProcedures(data);
      setIsLoading(false);
    };

    loadProcedures();
  }, [doctorId, accessToken]);

  // Filter procedures by active tab
  const filteredProcedures = procedures.filter(p => p.category === activeTab);

  // Get counts by category
  const counts = {
    toxin: procedures.filter(p => p.category === 'toxin').length,
    injectable: procedures.filter(p => p.category === 'injectable').length,
    other: procedures.filter(p => p.category === 'other').length,
  };

  const handleCreateNew = () => {
    setEditingProcedure(null);
    setShowFormModal(true);
  };

  const handleEdit = (procedure: DoctorProcedure) => {
    setEditingProcedure(procedure);
    setShowFormModal(true);
  };

  const handleCloseModal = () => {
    setShowFormModal(false);
    setEditingProcedure(null);
  };

  const handleSave = useCallback(async (data: DoctorProcedureFormData) => {
    setIsSubmitting(true);

    if (editingProcedure) {
      // Update existing
      const updated = await updateDoctorProcedure(editingProcedure.id, data, accessToken);
      if (updated) {
        setProcedures(prev => prev.map(p => p.id === updated.id ? updated : p));
        showToast('Procedure updated successfully', 'success');
        handleCloseModal();
        onProceduresChange?.();
      } else {
        showToast('Failed to update procedure', 'error');
      }
    } else {
      // Create new
      const created = await createDoctorProcedure(doctorId, { ...data, category: activeTab }, accessToken);
      if (created) {
        setProcedures(prev => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
        showToast('Procedure created successfully', 'success');
        handleCloseModal();
        onProceduresChange?.();
      } else {
        showToast('Failed to create procedure', 'error');
      }
    }

    setIsSubmitting(false);
  }, [editingProcedure, doctorId, accessToken, activeTab, showToast, onProceduresChange]);

  const handleDelete = useCallback(async (procedureId: string) => {
    setDeletingId(procedureId);
    const success = await deleteDoctorProcedure(procedureId, accessToken);
    setDeletingId(null);

    if (success) {
      setProcedures(prev => prev.filter(p => p.id !== procedureId));
      showToast('Procedure deleted successfully', 'success');
      onProceduresChange?.();
    } else {
      showToast('Failed to delete procedure', 'error');
    }
  }, [accessToken, showToast, onProceduresChange]);

  const handleToggleActive = useCallback(async (procedure: DoctorProcedure) => {
    setTogglingId(procedure.id);
    const updated = await toggleProcedureActive(procedure.id, !procedure.isActive, accessToken);
    setTogglingId(null);

    if (updated) {
      setProcedures(prev => prev.map(p => p.id === updated.id ? updated : p));
      showToast(
        updated.isActive ? 'Procedure activated' : 'Procedure deactivated',
        'success'
      );
      onProceduresChange?.();
    } else {
      showToast('Failed to update procedure status', 'error');
    }
  }, [accessToken, showToast, onProceduresChange]);

  const singularLabel = getCategorySingularLabel(activeTab);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-stone-900">Custom Procedures</h2>
        <p className="text-sm text-stone-500 mt-1">
          Manage your custom Toxins, Injectables, and Other aesthetic procedures.
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex border-b border-stone-200">
        {(['toxin', 'injectable', 'other'] as ProcedureTab[]).map((tab) => {
          const isActive = activeTab === tab;
          const label = tab === 'toxin' ? 'Toxins' : tab === 'injectable' ? 'Injectables' : 'Other';
          const count = counts[tab];

          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                relative px-4 py-3 text-sm font-medium transition-colors
                ${isActive
                  ? 'text-purple-700'
                  : 'text-stone-500 hover:text-stone-700'
                }
              `}
            >
              <span className="flex items-center gap-2">
                {label}
                {count > 0 && (
                  <span className={`
                    inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-medium
                    ${isActive ? 'bg-purple-100 text-purple-700' : 'bg-stone-100 text-stone-600'}
                  `}>
                    {count}
                  </span>
                )}
              </span>
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600" />
              )}
            </button>
          );
        })}
      </div>

      {/* Add New Button */}
      <button
        onClick={handleCreateNew}
        className="w-full flex items-center justify-center gap-2 py-3 px-4
                 bg-purple-50 hover:bg-purple-100 border border-purple-200 border-dashed rounded-xl
                 text-purple-700 font-medium text-sm transition-colors"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Add New {singularLabel}
      </button>

      {/* Procedures List */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-flex items-center gap-2 text-stone-500">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Loading procedures...
          </div>
        </div>
      ) : filteredProcedures.length === 0 ? (
        <div className="text-center py-12 bg-stone-50 rounded-xl border border-dashed border-stone-200">
          <svg className="h-12 w-12 mx-auto text-stone-300 mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M19.5 4.5l-1 1m0 0l-4-1-9 9 5 5 9-9-1-4z" strokeLinejoin="round" />
            <path d="M5.5 18.5l-1 1" strokeLinecap="round" />
          </svg>
          <p className="text-sm text-stone-600 font-medium">No {activeTab === 'toxin' ? 'toxins' : activeTab === 'injectable' ? 'injectables' : 'other procedures'} yet</p>
          <p className="text-xs text-stone-400 mt-1">Click &quot;Add New&quot; to create your first {singularLabel.toLowerCase()}.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredProcedures.map((procedure) => (
            <ProcedureManagementCard
              key={procedure.id}
              procedure={procedure}
              onEdit={() => handleEdit(procedure)}
              onDelete={() => handleDelete(procedure.id)}
              onToggleActive={() => handleToggleActive(procedure)}
              isDeleting={deletingId === procedure.id}
              isToggling={togglingId === procedure.id}
              countryCode={countryCode ?? undefined}
            />
          ))}
        </div>
      )}

      {/* Form Modal */}
      <ProcedureFormModal
        isOpen={showFormModal}
        onClose={handleCloseModal}
        onSave={handleSave}
        procedure={editingProcedure}
        category={activeTab}
        isSubmitting={isSubmitting}
        countryCode={countryCode ?? undefined}
      />
    </div>
  );
}
