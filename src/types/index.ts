// Patient types
export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string; // ISO date string (YYYY-MM-DD)
  sex?: 'female' | 'male' | 'other' | 'prefer-not-to-say';
  phone?: string;
  email?: string;
  notes?: string;
  createdAt: string; // ISO datetime
  updatedAt: string; // ISO datetime
}

export interface PatientFormData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  sex?: Patient['sex'];
  phone?: string;
  email?: string;
  notes?: string;
}

// Doctor/Auth types
export interface Doctor {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  doctor: Doctor | null;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

// Utility types
export type SortDirection = 'asc' | 'desc';

export interface PatientFilters {
  search: string;
  sortBy: 'createdAt' | 'lastName' | 'firstName';
  sortDirection: SortDirection;
}

export interface PatientStats {
  total: number;
  recentCount: number;
}
