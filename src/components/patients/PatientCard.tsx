'use client';

import React from 'react';
import { Patient } from '@/types';
import { Card, CardHeader, CardTitle, CardContent, Button } from '@/components/ui';
import { formatDate, formatPatientName, calculateAge, formatSex } from '@/lib/utils';

interface PatientCardProps {
  patient: Patient;
}

function PatientCard({ patient }: PatientCardProps) {
  const fullName = formatPatientName(patient.firstName, patient.lastName);
  const age = calculateAge(patient.dateOfBirth);

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card hover={false} className="overflow-hidden">
        <div className="bg-gradient-to-r from-sage-50 to-ivory-100 -m-6 mb-0 p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-5">
              <div className="h-18 w-18 rounded-2xl bg-gradient-to-br from-sage-100 to-sage-200 flex items-center justify-center shadow-sm">
                <span className="text-2xl font-display font-medium text-sage-700">
                  {patient.firstName[0]}{patient.lastName[0]}
                </span>
              </div>
              <div>
                <h2 className="font-display text-2xl font-medium text-stone-900 tracking-tight mb-1">
                  {fullName}
                </h2>
                <p className="text-stone-600">
                  {age} years old
                  <span className="text-stone-300 mx-2">|</span>
                  <span className="text-stone-500">{formatDate(patient.dateOfBirth)}</span>
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-white/70 text-2xs font-medium text-stone-500 tracking-wide">
                    Patient since {formatDate(patient.createdAt)}
                  </span>
                </div>
              </div>
            </div>
            <Button variant="outline" disabled title="Coming soon" className="hidden sm:flex">
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              Edit
            </Button>
          </div>
        </div>
      </Card>

      {/* Patient Information */}
      <Card hover={false}>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-sage-50 flex items-center justify-center">
              <svg
                className="h-4.5 w-4.5 text-sage-600"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <div>
              <CardTitle>Personal Information</CardTitle>
              <p className="text-sm text-stone-500 mt-0.5">Patient demographics</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <dt className="text-2xs font-semibold text-stone-400 uppercase tracking-widest">Full Name</dt>
              <dd className="text-sm font-medium text-stone-800">{fullName}</dd>
            </div>
            <div className="space-y-1">
              <dt className="text-2xs font-semibold text-stone-400 uppercase tracking-widest">Date of Birth</dt>
              <dd className="text-sm font-medium text-stone-800">
                {formatDate(patient.dateOfBirth)}
                <span className="text-stone-400 ml-2">({age} years)</span>
              </dd>
            </div>
            <div className="space-y-1">
              <dt className="text-2xs font-semibold text-stone-400 uppercase tracking-widest">Sex</dt>
              <dd className="text-sm font-medium text-stone-800">{formatSex(patient.sex)}</dd>
            </div>
            <div className="space-y-1">
              <dt className="text-2xs font-semibold text-stone-400 uppercase tracking-widest">Patient ID</dt>
              <dd className="text-sm font-mono text-stone-600">{patient.id}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card hover={false}>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-ivory-200 flex items-center justify-center">
              <svg
                className="h-4.5 w-4.5 text-stone-500"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
            </div>
            <div>
              <CardTitle>Contact Information</CardTitle>
              <p className="text-sm text-stone-500 mt-0.5">How to reach this patient</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <dt className="text-2xs font-semibold text-stone-400 uppercase tracking-widest">Email</dt>
              <dd className="text-sm font-medium">
                {patient.email ? (
                  <a
                    href={`mailto:${patient.email}`}
                    className="text-sage-600 hover:text-sage-700 transition-colors"
                  >
                    {patient.email}
                  </a>
                ) : (
                  <span className="text-stone-400 italic">Not provided</span>
                )}
              </dd>
            </div>
            <div className="space-y-1">
              <dt className="text-2xs font-semibold text-stone-400 uppercase tracking-widest">Phone</dt>
              <dd className="text-sm font-medium">
                {patient.phone ? (
                  <a
                    href={`tel:${patient.phone}`}
                    className="text-sage-600 hover:text-sage-700 transition-colors"
                  >
                    {patient.phone}
                  </a>
                ) : (
                  <span className="text-stone-400 italic">Not provided</span>
                )}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* Notes */}
      <Card hover={false}>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-ivory-200 flex items-center justify-center">
              <svg
                className="h-4.5 w-4.5 text-stone-500"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <line x1="10" y1="9" x2="8" y2="9" />
              </svg>
            </div>
            <div>
              <CardTitle>Clinical Notes</CardTitle>
              <p className="text-sm text-stone-500 mt-0.5">Additional patient information</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {patient.notes ? (
            <p className="text-sm text-stone-700 whitespace-pre-wrap leading-relaxed">{patient.notes}</p>
          ) : (
            <p className="text-sm text-stone-400 italic">No notes added for this patient</p>
          )}
        </CardContent>
      </Card>

      {/* Record Details */}
      <Card hover={false} className="bg-ivory-100/50">
        <CardHeader className="border-b-0 pb-0 mb-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-white flex items-center justify-center">
              <svg
                className="h-4.5 w-4.5 text-stone-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <div>
              <CardTitle>Record Details</CardTitle>
              <p className="text-sm text-stone-500 mt-0.5">System information</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <dt className="text-2xs font-semibold text-stone-400 uppercase tracking-widest">Created</dt>
              <dd className="text-sm text-stone-600">{formatDate(patient.createdAt)}</dd>
            </div>
            <div className="space-y-1">
              <dt className="text-2xs font-semibold text-stone-400 uppercase tracking-widest">Last Updated</dt>
              <dd className="text-sm text-stone-600">{formatDate(patient.updatedAt)}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}

export { PatientCard };
