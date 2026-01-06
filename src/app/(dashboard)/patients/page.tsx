'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePatients } from '@/context/PatientContext';
import { useDebounce } from '@/hooks/useDebounce';
import { Button, Card, LoadingSpinner, EmptyState, UsersIcon } from '@/components/ui';
import { PatientSearch, PatientTable } from '@/components/patients';

export default function PatientsPage() {
  const { filteredPatients, filters, setFilters, isLoading } = usePatients();
  const [searchInput, setSearchInput] = useState(filters.search);

  // Debounce search input
  const debouncedSearch = useDebounce(searchInput, 300);

  // Update filter when debounced search changes
  React.useEffect(() => {
    setFilters({ search: debouncedSearch });
  }, [debouncedSearch, setFilters]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full py-24">
        <LoadingSpinner size="lg" message="Loading patients..." />
      </div>
    );
  }

  return (
    <div className="p-8 lg:p-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-2 w-2 rounded-full bg-sage-500" />
            <span className="text-2xs font-medium text-stone-400 uppercase tracking-widest">
              Patient Registry
            </span>
          </div>
          <h1 className="font-display text-3xl font-medium text-stone-900 tracking-tight mb-1">
            Patients
          </h1>
          <p className="text-stone-500">
            Manage and view all your patient records
          </p>
        </div>
        <Link href="/patients/new">
          <Button size="lg">
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New Patient
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="mb-8">
        <PatientSearch
          value={searchInput}
          onChange={setSearchInput}
        />
      </div>

      {/* Patient List */}
      <Card padding="none" hover={false}>
        {filteredPatients.length === 0 ? (
          <EmptyState
            icon={<UsersIcon />}
            title={filters.search ? 'No patients found' : 'No patients yet'}
            description={
              filters.search
                ? `No patients match "${filters.search}". Try a different search term.`
                : 'Get started by creating your first patient record.'
            }
            action={
              filters.search
                ? {
                    label: 'Clear search',
                    onClick: () => {
                      setSearchInput('');
                      setFilters({ search: '' });
                    },
                  }
                : {
                    label: 'Create New Patient',
                    onClick: () => {
                      window.location.href = '/patients/new';
                    },
                  }
            }
          />
        ) : (
          <PatientTable patients={filteredPatients} />
        )}
      </Card>

      {/* Results count */}
      {filteredPatients.length > 0 && (
        <p className="mt-6 text-sm text-stone-500">
          Showing <span className="font-medium text-stone-700">{filteredPatients.length}</span> patient{filteredPatients.length !== 1 ? 's' : ''}
          {filters.search && (
            <span> matching &ldquo;<span className="text-stone-700">{filters.search}</span>&rdquo;</span>
          )}
        </p>
      )}
    </div>
  );
}
