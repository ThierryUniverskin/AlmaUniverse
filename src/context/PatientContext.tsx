'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Patient, PatientFormData, PatientFilters, PatientStats } from '@/types';
import { generateId } from '@/lib/utils';
import { getPatients, setPatients, initializePatients } from '@/lib/storage';

interface PatientContextValue {
  patients: Patient[];
  isLoading: boolean;
  filters: PatientFilters;
  setFilters: (filters: Partial<PatientFilters>) => void;
  filteredPatients: Patient[];
  stats: PatientStats;
  recentPatients: Patient[];
  addPatient: (data: PatientFormData) => Patient;
  updatePatient: (id: string, data: Partial<PatientFormData>) => Patient | null;
  deletePatient: (id: string) => boolean;
  getPatient: (id: string) => Patient | undefined;
}

const PatientContext = createContext<PatientContextValue | null>(null);

const defaultFilters: PatientFilters = {
  search: '',
  sortBy: 'createdAt',
  sortDirection: 'desc',
};

export function PatientProvider({ children }: { children: React.ReactNode }) {
  const [patients, setPatientsState] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFiltersState] = useState<PatientFilters>(defaultFilters);

  // Load patients from localStorage on mount
  useEffect(() => {
    const loadedPatients = initializePatients();
    setPatientsState(loadedPatients);
    setIsLoading(false);
  }, []);

  // Persist patients to localStorage whenever they change
  const updatePatients = useCallback((newPatients: Patient[]) => {
    setPatientsState(newPatients);
    setPatients(newPatients);
  }, []);

  // Update filters
  const setFilters = useCallback((newFilters: Partial<PatientFilters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Filter and sort patients
  const filteredPatients = useMemo(() => {
    let result = [...patients];

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        p =>
          p.firstName.toLowerCase().includes(searchLower) ||
          p.lastName.toLowerCase().includes(searchLower)
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;

      switch (filters.sortBy) {
        case 'firstName':
          comparison = a.firstName.localeCompare(b.firstName);
          break;
        case 'lastName':
          comparison = a.lastName.localeCompare(b.lastName);
          break;
        case 'createdAt':
        default:
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }

      return filters.sortDirection === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [patients, filters]);

  // Get recent patients (last 5, sorted by newest first)
  const recentPatients = useMemo(() => {
    return [...patients]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }, [patients]);

  // Calculate stats
  const stats = useMemo<PatientStats>(() => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    return {
      total: patients.length,
      recentCount: patients.filter(p => new Date(p.createdAt) > weekAgo).length,
    };
  }, [patients]);

  // Add a new patient
  const addPatient = useCallback(
    (data: PatientFormData): Patient => {
      const now = new Date().toISOString();
      const newPatient: Patient = {
        id: generateId('pat'),
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        dateOfBirth: data.dateOfBirth,
        sex: data.sex,
        phone: data.phone?.trim(),
        email: data.email?.trim(),
        notes: data.notes?.trim(),
        createdAt: now,
        updatedAt: now,
      };

      updatePatients([...patients, newPatient]);
      return newPatient;
    },
    [patients, updatePatients]
  );

  // Update an existing patient
  const updatePatient = useCallback(
    (id: string, data: Partial<PatientFormData>): Patient | null => {
      const index = patients.findIndex(p => p.id === id);
      if (index === -1) return null;

      const updatedPatient: Patient = {
        ...patients[index],
        ...data,
        updatedAt: new Date().toISOString(),
      };

      const newPatients = [...patients];
      newPatients[index] = updatedPatient;
      updatePatients(newPatients);

      return updatedPatient;
    },
    [patients, updatePatients]
  );

  // Delete a patient
  const deletePatient = useCallback(
    (id: string): boolean => {
      const index = patients.findIndex(p => p.id === id);
      if (index === -1) return false;

      const newPatients = patients.filter(p => p.id !== id);
      updatePatients(newPatients);

      return true;
    },
    [patients, updatePatients]
  );

  // Get a single patient by ID
  const getPatient = useCallback(
    (id: string): Patient | undefined => {
      return patients.find(p => p.id === id);
    },
    [patients]
  );

  return (
    <PatientContext.Provider
      value={{
        patients,
        isLoading,
        filters,
        setFilters,
        filteredPatients,
        stats,
        recentPatients,
        addPatient,
        updatePatient,
        deletePatient,
        getPatient,
      }}
    >
      {children}
    </PatientContext.Provider>
  );
}

export function usePatients(): PatientContextValue {
  const context = useContext(PatientContext);
  if (!context) {
    throw new Error('usePatients must be used within a PatientProvider');
  }
  return context;
}
