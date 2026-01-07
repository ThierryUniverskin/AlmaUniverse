'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Patient } from '@/types';

interface PatientSelectDropdownProps {
  patients: Patient[];
  selectedPatient: Patient | null;
  onSelect: (patient: Patient | null) => void;
  isLoading?: boolean;
  disabled?: boolean;
}

// Generate avatar colors based on name (from PatientTable)
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

function PatientSelectDropdown({
  patients,
  selectedPatient,
  onSelect,
  isLoading = false,
  disabled = false,
}: PatientSelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter patients by search term
  const filteredPatients = patients.filter(patient => {
    const fullName = `${patient.firstName} ${patient.lastName}`.toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    return fullName.includes(searchLower) ||
           patient.firstName.toLowerCase().includes(searchLower) ||
           patient.lastName.toLowerCase().includes(searchLower);
  });

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (patient: Patient) => {
    onSelect(patient);
    setSearchTerm('');
    setIsOpen(false);
  };

  const handleClear = () => {
    onSelect(null);
    setSearchTerm('');
    inputRef.current?.focus();
  };

  const handleInputFocus = () => {
    if (!disabled) {
      setIsOpen(true);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    if (!isOpen) setIsOpen(true);
  };

  return (
    <div ref={dropdownRef} className="relative">
      {/* Search Input / Selected Display */}
      <div className={`relative ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
        {selectedPatient ? (
          // Selected patient display
          <div className="flex items-center justify-between px-4 py-3 bg-white border border-stone-200 rounded-xl">
            <div className="flex items-center gap-3">
              <div className={`h-9 w-9 rounded-full bg-gradient-to-br ${getAvatarGradient(selectedPatient.firstName)} flex items-center justify-center flex-shrink-0`}>
                <span className="text-sm font-semibold text-stone-700">
                  {selectedPatient.firstName[0]}{selectedPatient.lastName[0]}
                </span>
              </div>
              <span className="text-sm font-medium text-stone-900">
                {selectedPatient.firstName} {selectedPatient.lastName}
              </span>
            </div>
            {!disabled && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1 rounded-full text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        ) : (
          // Search input
          <div className="relative">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-stone-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
            </div>
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              placeholder="Search patient records"
              disabled={disabled}
              className="w-full pl-12 pr-4 py-3 bg-white border border-stone-200 rounded-xl text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:cursor-not-allowed"
            />
            {isLoading && (
              <div className="absolute inset-y-0 right-4 flex items-center">
                <svg className="animate-spin h-5 w-5 text-purple-600" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Dropdown List */}
      {isOpen && !selectedPatient && !disabled && (
        <div className="absolute z-50 mt-2 w-full bg-white border border-stone-200 rounded-xl shadow-lg max-h-64 overflow-y-auto">
          {filteredPatients.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-stone-500">
              {searchTerm ? 'No patients found' : 'No patients available'}
            </div>
          ) : (
            <ul className="py-2">
              {filteredPatients.map(patient => (
                <li key={patient.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(patient)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-stone-50 transition-colors text-left"
                  >
                    <div className={`h-9 w-9 rounded-full bg-gradient-to-br ${getAvatarGradient(patient.firstName)} flex items-center justify-center flex-shrink-0`}>
                      <span className="text-sm font-semibold text-stone-700">
                        {patient.firstName[0]}{patient.lastName[0]}
                      </span>
                    </div>
                    <span className="text-sm text-stone-900">
                      {patient.firstName} {patient.lastName}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export { PatientSelectDropdown };
