'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePatients } from '@/context/PatientContext';
import { useToast } from '@/components/ui';
import { PatientForm } from '@/components/patients';
import { PatientFormData } from '@/types';

export default function CreatePatientPage() {
  const router = useRouter();
  const { addPatient } = usePatients();
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (data: PatientFormData) => {
    setIsSubmitting(true);

    try {
      const newPatient = addPatient(data);
      showToast('Patient created successfully', 'success');
      router.push(`/patients/${newPatient.id}`);
    } catch (error) {
      showToast('Failed to create patient', 'error');
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="p-8 lg:p-10 max-w-3xl">
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
          <span className="text-stone-800 font-medium">New Patient</span>
        </nav>

        <div className="flex items-center gap-3 mb-2">
          <div className="h-2 w-2 rounded-full bg-sage-500" />
          <span className="text-2xs font-medium text-stone-400 uppercase tracking-widest">
            Patient Registration
          </span>
        </div>
        <h1 className="font-display text-3xl font-medium text-stone-900 tracking-tight mb-2">
          Create New Patient
        </h1>
        <p className="text-stone-500">
          Fill in the information below to register a new patient
        </p>
      </div>

      {/* Form */}
      <PatientForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
        submitLabel="Create Patient"
      />
    </div>
  );
}
