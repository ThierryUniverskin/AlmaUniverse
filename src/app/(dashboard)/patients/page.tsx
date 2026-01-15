'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePatients } from '@/context/PatientContext';
import { useDebounce } from '@/hooks/useDebounce';
import { Button, LoadingSpinner, EmptyState } from '@/components/ui';
import { PatientTable } from '@/components/patients';

export default function PatientsPage() {
  const { filteredPatients, filters, setFilters, isLoading } = usePatients();
  const [searchInput, setSearchInput] = useState(filters.search);
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'inactive'>('all');

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
    <div className="p-6 md:p-7 lg:p-8 h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-stone-100 flex items-center justify-center">
            <svg className="h-5 w-5 text-stone-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-stone-900">Patient Management</h1>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Button variant="outline" size="sm">
            <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="M22 6l-10 7L2 6" />
            </svg>
            Invite Patient to Register Online
          </Button>
          <Button variant="outline" size="sm">
            <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="16" y1="2" x2="16" y2="6" />
            </svg>
            Import CSV
          </Button>
          <Button variant="outline" size="sm">
            <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            Export
          </Button>
          <Link href="/patients/new">
            <Button size="sm">
              <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add New Patient Record
            </Button>
          </Link>
        </div>
      </div>

      {/* Patients Section */}
      <div className="bg-white rounded-xl border border-stone-200 flex-1 flex flex-col overflow-hidden">
        {/* Title & Description */}
        <div className="px-6 pt-6 pb-4 border-b border-stone-100">
          <h2 className="text-lg font-semibold text-stone-900">Patients</h2>
          <p className="text-sm text-stone-500">Display all the patients and essential details.</p>
        </div>

        {/* Tabs & Search Row */}
        <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-100">
          {/* Tabs */}
          <div className="flex items-center gap-1 bg-stone-100 rounded-lg p-1">
            {(['all', 'active', 'inactive'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                  activeTab === tab
                    ? 'bg-white text-stone-900 shadow-sm'
                    : 'text-stone-500 hover:text-stone-700'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Search & Filter */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Search..."
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                className="pl-10 pr-4 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 w-64 md:w-72"
              />
            </div>
            <Button variant="outline" size="sm">
              <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <line x1="4" y1="6" x2="20" y2="6" />
                <line x1="6" y1="12" x2="18" y2="12" />
                <line x1="8" y1="18" x2="16" y2="18" />
              </svg>
              Filter
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          {filteredPatients.length === 0 ? (
            <EmptyState
              icon={
                <svg className="h-12 w-12 text-stone-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              }
              title={filters.search ? 'No patients found' : 'No patients yet'}
              description={
                filters.search
                  ? `No patients match "${filters.search}".`
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
        </div>
      </div>
    </div>
  );
}
