'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { usePatients } from '@/context/PatientContext';
import { Button, LoadingSpinner, EmptyState } from '@/components/ui';
import { PatientCard } from '@/components/patients';

export default function PatientDetailPage() {
  const params = useParams();
  const patientId = params.id as string;
  const { getPatient, isLoading } = usePatients();

  const patient = getPatient(patientId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full py-24">
        <LoadingSpinner size="lg" message="Loading patient record..." />
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="p-8 lg:p-10">
        <EmptyState
          icon={
            <svg
              className="h-14 w-14"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          }
          title="Patient Not Found"
          description="The patient you're looking for doesn't exist or may have been removed from the system."
          action={{
            label: 'Back to Patient List',
            onClick: () => {
              window.location.href = '/patients';
            },
          }}
        />
      </div>
    );
  }

  return (
    <div className="p-8 lg:p-10 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-stone-500 mb-5">
          <Link href="/patients" className="hover:text-stone-700 transition-colors">
            Patients
          </Link>
          <svg
            className="h-4 w-4 text-stone-300"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
          <span className="text-stone-800 font-medium">Patient Record</span>
        </nav>

        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-2 w-2 rounded-full bg-sage-500" />
              <span className="text-2xs font-medium text-stone-400 uppercase tracking-widest">
                Patient Record
              </span>
            </div>
            <h1 className="font-display text-3xl font-medium text-stone-900 tracking-tight">
              Patient Details
            </h1>
          </div>
          <Link href="/patients">
            <Button variant="outline">
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              Back to List
            </Button>
          </Link>
        </div>
      </div>

      {/* Patient Card */}
      <PatientCard patient={patient} />
    </div>
  );
}
