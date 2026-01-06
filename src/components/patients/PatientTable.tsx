'use client';

import React from 'react';
import Link from 'next/link';
import { Patient } from '@/types';
import { Button } from '@/components/ui';
import { formatDate, formatPatientName, calculateAge, formatSex } from '@/lib/utils';

interface PatientTableProps {
  patients: Patient[];
}

function PatientTable({ patients }: PatientTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-stone-200/60">
            <th className="px-6 py-4 text-left text-2xs font-semibold text-stone-400 uppercase tracking-widest">
              Patient
            </th>
            <th className="px-6 py-4 text-left text-2xs font-semibold text-stone-400 uppercase tracking-widest">
              Date of Birth
            </th>
            <th className="px-6 py-4 text-left text-2xs font-semibold text-stone-400 uppercase tracking-widest hidden md:table-cell">
              Sex
            </th>
            <th className="px-6 py-4 text-left text-2xs font-semibold text-stone-400 uppercase tracking-widest hidden lg:table-cell">
              Contact
            </th>
            <th className="px-6 py-4 text-left text-2xs font-semibold text-stone-400 uppercase tracking-widest hidden sm:table-cell">
              Created
            </th>
            <th className="px-6 py-4 text-right text-2xs font-semibold text-stone-400 uppercase tracking-widest">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {patients.map((patient, index) => (
            <tr
              key={patient.id}
              className="group border-b border-stone-100 last:border-b-0 hover:bg-ivory-100/30 transition-colors duration-200"
              style={{ animationDelay: `${index * 0.03}s` }}
            >
              <td className="px-6 py-5">
                <div className="flex items-center gap-4">
                  <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-ivory-200 to-ivory-300 flex items-center justify-center flex-shrink-0 group-hover:from-sage-50 group-hover:to-sage-100 transition-all duration-300">
                    <span className="text-sm font-semibold text-stone-600 group-hover:text-sage-700 transition-colors">
                      {patient.firstName[0]}{patient.lastName[0]}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-stone-800">
                      {formatPatientName(patient.firstName, patient.lastName)}
                    </p>
                    <p className="text-xs text-stone-400 font-mono mt-0.5">
                      ID: {patient.id.slice(0, 8)}
                    </p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-5">
                <div>
                  <p className="text-sm text-stone-700">
                    {formatDate(patient.dateOfBirth)}
                  </p>
                  <p className="text-xs text-stone-400 mt-0.5">
                    {calculateAge(patient.dateOfBirth)} years
                  </p>
                </div>
              </td>
              <td className="px-6 py-5 hidden md:table-cell">
                <span className="text-sm text-stone-600">
                  {formatSex(patient.sex)}
                </span>
              </td>
              <td className="px-6 py-5 hidden lg:table-cell">
                {patient.email || patient.phone ? (
                  <div>
                    {patient.email && (
                      <p className="text-sm text-stone-600">{patient.email}</p>
                    )}
                    {patient.phone && (
                      <p className="text-xs text-stone-400 mt-0.5">{patient.phone}</p>
                    )}
                  </div>
                ) : (
                  <span className="text-sm text-stone-300">-</span>
                )}
              </td>
              <td className="px-6 py-5 hidden sm:table-cell">
                <p className="text-sm text-stone-500">
                  {formatDate(patient.createdAt)}
                </p>
              </td>
              <td className="px-6 py-5 text-right">
                <Link href={`/patients/${patient.id}`}>
                  <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>Open</span>
                    <svg
                      className="h-4 w-4 ml-1"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </Button>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export { PatientTable };
