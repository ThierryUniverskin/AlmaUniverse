'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { usePatients } from '@/context/PatientContext';
import { Button, Card, CardHeader, CardTitle, CardContent, LoadingSpinner } from '@/components/ui';
import { formatDate, formatPatientName, calculateAge } from '@/lib/utils';

export default function DashboardPage() {
  const { state: authState } = useAuth();
  const { stats, recentPatients, isLoading } = usePatients();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full py-24">
        <LoadingSpinner size="lg" message="Loading your dashboard..." />
      </div>
    );
  }

  return (
    <div className="p-8 lg:p-10 max-w-6xl">
      {/* Welcome Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-2 w-2 rounded-full bg-sage-500 animate-pulse-subtle" />
          <span className="text-2xs font-medium text-stone-400 uppercase tracking-widest">
            Clinical Dashboard
          </span>
        </div>
        <h1 className="font-display text-3xl font-medium text-stone-900 tracking-tight mb-2">
          Welcome back, Dr. {authState.doctor?.lastName}
        </h1>
        <p className="text-stone-500">
          Here&apos;s an overview of your practice today
        </p>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-4 mb-10">
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
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <line x1="19" y1="8" x2="19" y2="14" />
              <line x1="22" y1="11" x2="16" y2="11" />
            </svg>
            New Patient
          </Button>
        </Link>
        <Link href="/patients">
          <Button variant="outline" size="lg">
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            View All Patients
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
        {/* Total Patients */}
        <Card className="group" hover={false}>
          <CardContent>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-stone-500 mb-1">Total Patients</p>
                <p className="text-4xl font-display font-medium text-stone-900 tracking-tight">
                  {stats.total}
                </p>
                <p className="text-xs text-stone-400 mt-2">All registered patients</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-ivory-200/50 flex items-center justify-center group-hover:bg-ivory-200 transition-colors">
                <svg
                  className="h-6 w-6 text-stone-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Additions */}
        <Card className="group" hover={false}>
          <CardContent>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-stone-500 mb-1">Added This Week</p>
                <p className="text-4xl font-display font-medium text-stone-900 tracking-tight">
                  {stats.recentCount}
                </p>
                <p className="text-xs text-stone-400 mt-2">New patient records</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-sage-50 flex items-center justify-center group-hover:bg-sage-100 transition-colors">
                <svg
                  className="h-6 w-6 text-sage-500"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <line x1="19" y1="8" x2="19" y2="14" />
                  <line x1="22" y1="11" x2="16" y2="11" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Tip Card */}
        <Card className="bg-gradient-to-br from-ivory-100 to-ivory-200/50 border-ivory-300/50" hover={false}>
          <CardContent>
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-xl bg-white/60 flex items-center justify-center flex-shrink-0">
                <svg
                  className="h-5 w-5 text-stone-500"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4" />
                  <path d="M12 8h.01" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-stone-700 mb-1">Quick Tip</p>
                <p className="text-xs text-stone-500 leading-relaxed">
                  Keep patient records up to date with notes after each consultation for better continuity of care.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Patients */}
      <Card hover={false}>
        <CardHeader className="border-b-0 pb-0 mb-0">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Patients</CardTitle>
              <p className="text-sm text-stone-500 mt-1">Your latest patient records</p>
            </div>
            <Link
              href="/patients"
              className="text-sm text-sage-600 hover:text-sage-700 font-medium flex items-center gap-1.5 transition-colors"
            >
              View all
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {recentPatients.length === 0 ? (
            <div className="text-center py-12">
              <div className="h-16 w-16 rounded-2xl bg-ivory-200/50 flex items-center justify-center mx-auto mb-4">
                <svg
                  className="h-8 w-8 text-stone-300"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <p className="text-stone-600 font-medium mb-2">No patients yet</p>
              <p className="text-sm text-stone-500 mb-6">Start by creating your first patient record</p>
              <Link href="/patients/new">
                <Button>Create Your First Patient</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-1">
              {recentPatients.map((patient, index) => (
                <Link
                  key={patient.id}
                  href={`/patients/${patient.id}`}
                  className="flex items-center justify-between py-4 px-4 -mx-4 rounded-xl hover:bg-ivory-100/50 transition-all duration-250 group"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex items-center gap-4">
                    <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-ivory-200 to-ivory-300 flex items-center justify-center group-hover:from-sage-50 group-hover:to-sage-100 transition-all">
                      <span className="text-sm font-semibold text-stone-600 group-hover:text-sage-700">
                        {patient.firstName[0]}{patient.lastName[0]}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-stone-800 group-hover:text-stone-900">
                        {formatPatientName(patient.firstName, patient.lastName)}
                      </p>
                      <p className="text-xs text-stone-500">
                        {calculateAge(patient.dateOfBirth)} years old
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="text-xs text-stone-400 hidden sm:block">
                      Added {formatDate(patient.createdAt)}
                    </p>
                    <svg
                      className="h-4 w-4 text-stone-300 group-hover:text-sage-500 transition-colors"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
