'use client';

import React from 'react';
import Link from 'next/link';
import { Patient } from '@/types';
import { formatDate, formatPatientName } from '@/lib/utils';

interface PatientTableProps {
  patients: Patient[];
}

// Helper to get relative time
function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return '1 day ago';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 14) return '1 week ago';
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 60) return '1 month ago';
  return `${Math.floor(diffDays / 30)} months ago`;
}

// Generate avatar colors based on name
function getAvatarGradient(name: string): string {
  const colors = [
    'from-purple-200 to-purple-300',
    'from-blue-200 to-blue-300',
    'from-green-200 to-green-300',
    'from-amber-200 to-amber-300',
    'from-rose-200 to-rose-300',
    'from-cyan-200 to-cyan-300',
  ];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
}

function PatientTable({ patients }: PatientTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-stone-200 bg-stone-50/50">
            <th className="w-12 px-6 py-3">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-stone-300 text-purple-600 focus:ring-purple-500"
              />
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-stone-500">
              <div className="flex items-center gap-1 cursor-pointer hover:text-stone-700">
                Patient Name
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M7 15l5 5 5-5M7 9l5-5 5 5" />
                </svg>
              </div>
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 hidden sm:table-cell">
              <div className="flex items-center gap-1 cursor-pointer hover:text-stone-700">
                Last Activity
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M7 15l5 5 5-5M7 9l5-5 5 5" />
                </svg>
              </div>
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 hidden md:table-cell">
              <div className="flex items-center gap-1 cursor-pointer hover:text-stone-700">
                Registration Date
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M7 15l5 5 5-5M7 9l5-5 5 5" />
                </svg>
              </div>
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 hidden lg:table-cell">
              <div className="flex items-center gap-1 cursor-pointer hover:text-stone-700">
                Status
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M7 15l5 5 5-5M7 9l5-5 5 5" />
                </svg>
              </div>
            </th>
            <th className="w-12 px-6 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {patients.map((patient) => (
            <tr
              key={patient.id}
              className="border-b border-stone-100 hover:bg-stone-50/50 transition-colors"
            >
              <td className="px-6 py-4">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-stone-300 text-purple-600 focus:ring-purple-500"
                />
              </td>
              <td className="px-6 py-4">
                <Link href={`/patients/${patient.id}`} className="flex items-center gap-3 group">
                  <div className={`h-10 w-10 rounded-full bg-gradient-to-br ${getAvatarGradient(patient.firstName)} flex items-center justify-center flex-shrink-0`}>
                    <span className="text-sm font-semibold text-stone-700">
                      {patient.firstName[0]}{patient.lastName[0]}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-stone-900 group-hover:text-purple-700 transition-colors">
                      {formatPatientName(patient.firstName, patient.lastName)}
                    </p>
                    <p className="text-xs text-stone-500">
                      {patient.email || 'No email'}
                    </p>
                  </div>
                </Link>
              </td>
              <td className="px-6 py-4 hidden sm:table-cell">
                <p className="text-sm text-stone-600">
                  {getRelativeTime(patient.updatedAt)}
                </p>
              </td>
              <td className="px-6 py-4 hidden md:table-cell">
                <p className="text-sm text-stone-600">
                  {formatDate(patient.createdAt)}
                </p>
              </td>
              <td className="px-6 py-4 hidden lg:table-cell">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
                  <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Active
                </span>
              </td>
              <td className="px-6 py-4">
                <button className="h-8 w-8 rounded-lg flex items-center justify-center text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="6" r="2" />
                    <circle cx="12" cy="12" r="2" />
                    <circle cx="12" cy="18" r="2" />
                  </svg>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export { PatientTable };
