'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Patient, PatientFormData, PatientFilters, PatientStats } from '@/types';
import { DbPatient } from '@/types/database';
import { getSupabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';
import { logger } from '@/lib/logger';

interface PatientContextValue {
  patients: Patient[];
  isLoading: boolean;
  filters: PatientFilters;
  setFilters: (filters: Partial<PatientFilters>) => void;
  filteredPatients: Patient[];
  stats: PatientStats;
  recentPatients: Patient[];
  addPatient: (data: PatientFormData) => Promise<Patient | null>;
  updatePatient: (id: string, data: Partial<PatientFormData>) => Promise<Patient | null>;
  deletePatient: (id: string) => Promise<boolean>;
  getPatient: (id: string) => Patient | undefined;
  refreshPatients: () => Promise<void>;
}

const PatientContext = createContext<PatientContextValue | null>(null);

const defaultFilters: PatientFilters = {
  search: '',
  sortBy: 'createdAt',
  sortDirection: 'desc',
};

// Convert database row to app Patient type
function dbToPatient(row: DbPatient): Patient {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    dateOfBirth: row.date_of_birth,
    sex: row.sex ?? undefined,
    phone: row.phone ?? undefined,
    email: row.email ?? undefined,
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function PatientProvider({ children }: { children: React.ReactNode }) {
  const { state: authState } = useAuth();
  const [patients, setPatientsState] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFiltersState] = useState<PatientFilters>(defaultFilters);

  // Load patients from Supabase when doctor is authenticated
  const refreshPatients = useCallback(async () => {
    if (!authState.doctor) {
      setPatientsState([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    logger.debug('[Patients] Fetching patients for doctor:', authState.doctor.id);

    try {
      // Use direct fetch to avoid Supabase client hanging issues
      const storageKey = `sb-${new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).hostname.split('.')[0]}-auth-token`;
      const storedSession = localStorage.getItem(storageKey);
      const sessionData = storedSession ? JSON.parse(storedSession) : null;
      const accessToken = sessionData?.access_token;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/patients?doctor_id=eq.${authState.doctor.id}&select=*&order=created_at.desc`,
        {
          headers: {
            'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        logger.error('Failed to load patients:', response.status);
        setPatientsState([]);
      } else {
        const data = await response.json();
        logger.debug('[Patients] Loaded', data.length, 'patients');
        setPatientsState(data.map(dbToPatient));
      }
    } catch (error) {
      logger.error('Error fetching patients:', error);
      setPatientsState([]);
    } finally {
      setIsLoading(false);
    }
  }, [authState.doctor]);

  // Load patients when auth state changes
  useEffect(() => {
    if (authState.isLoading) return;
    refreshPatients();
  }, [authState.isLoading, authState.doctor?.id, refreshPatients]);

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

  // Add a new patient - use direct fetch to avoid Supabase client issues
  const addPatient = useCallback(
    async (data: PatientFormData): Promise<Patient | null> => {
      if (!authState.doctor) {
        logger.error('No doctor authenticated');
        return null;
      }

      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const storageKey = `sb-${new URL(supabaseUrl).hostname.split('.')[0]}-auth-token`;
        const storedSession = localStorage.getItem(storageKey);
        const sessionData = storedSession ? JSON.parse(storedSession) : null;
        const accessToken = sessionData?.access_token;

        const response = await fetch(
          `${supabaseUrl}/rest/v1/patients`,
          {
            method: 'POST',
            headers: {
              'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=representation',
            },
            body: JSON.stringify({
              doctor_id: authState.doctor.id,
              first_name: data.firstName.trim(),
              last_name: data.lastName.trim(),
              date_of_birth: data.dateOfBirth || null,
              sex: data.sex ?? null,
              phone: data.phone?.trim() ?? null,
              email: data.email?.trim() ?? null,
              notes: data.notes?.trim() ?? null,
            }),
          }
        );

        if (!response.ok) {
          const errorData = await response.text();
          logger.error('Failed to add patient:', response.status, errorData);
          return null;
        }

        const result = await response.json();
        const newPatient = result?.[0];

        if (!newPatient) {
          logger.error('No patient returned');
          return null;
        }

        const patient = dbToPatient(newPatient);
        setPatientsState(prev => [patient, ...prev]);
        return patient;
      } catch (error) {
        logger.error('Error adding patient:', error);
        return null;
      }
    },
    [authState.doctor]
  );

  // Update an existing patient - use direct fetch to avoid Supabase client issues
  const updatePatient = useCallback(
    async (id: string, data: Partial<PatientFormData>): Promise<Patient | null> => {
      if (!authState.doctor) return null;

      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const storageKey = `sb-${new URL(supabaseUrl).hostname.split('.')[0]}-auth-token`;
        const storedSession = localStorage.getItem(storageKey);
        const sessionData = storedSession ? JSON.parse(storedSession) : null;
        const accessToken = sessionData?.access_token;

        const updates: Record<string, unknown> = {};
        if (data.firstName !== undefined) updates.first_name = data.firstName.trim();
        if (data.lastName !== undefined) updates.last_name = data.lastName.trim();
        if (data.dateOfBirth !== undefined) updates.date_of_birth = data.dateOfBirth;
        if (data.sex !== undefined) updates.sex = data.sex ?? null;
        if (data.phone !== undefined) updates.phone = data.phone?.trim() ?? null;
        if (data.email !== undefined) updates.email = data.email?.trim() ?? null;
        if (data.notes !== undefined) updates.notes = data.notes?.trim() ?? null;

        const response = await fetch(
          `${supabaseUrl}/rest/v1/patients?id=eq.${id}&doctor_id=eq.${authState.doctor.id}`,
          {
            method: 'PATCH',
            headers: {
              'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=representation',
            },
            body: JSON.stringify(updates),
          }
        );

        if (!response.ok) {
          logger.error('Failed to update patient:', response.status);
          return null;
        }

        const result = await response.json();
        const updatedPatient = result?.[0];

        if (!updatedPatient) {
          logger.error('No patient returned');
          return null;
        }

        const patient = dbToPatient(updatedPatient);
        setPatientsState(prev => prev.map(p => p.id === id ? patient : p));
        return patient;
      } catch (error) {
        logger.error('Error updating patient:', error);
        return null;
      }
    },
    [authState.doctor]
  );

  // Delete a patient - use direct fetch to avoid Supabase client issues
  const deletePatient = useCallback(
    async (id: string): Promise<boolean> => {
      if (!authState.doctor) return false;

      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const storageKey = `sb-${new URL(supabaseUrl).hostname.split('.')[0]}-auth-token`;
        const storedSession = localStorage.getItem(storageKey);
        const sessionData = storedSession ? JSON.parse(storedSession) : null;
        const accessToken = sessionData?.access_token;

        const response = await fetch(
          `${supabaseUrl}/rest/v1/patients?id=eq.${id}&doctor_id=eq.${authState.doctor.id}`,
          {
            method: 'DELETE',
            headers: {
              'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          logger.error('Failed to delete patient:', response.status);
          return false;
        }

        setPatientsState(prev => prev.filter(p => p.id !== id));
        return true;
      } catch (error) {
        logger.error('Error deleting patient:', error);
        return false;
      }
    },
    [authState.doctor]
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
        refreshPatients,
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
