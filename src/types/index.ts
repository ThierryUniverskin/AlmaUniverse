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
export interface PhoneNumber {
  countryCode: string; // e.g., "+1", "+44"
  number: string; // e.g., "5551234567"
}

export interface Address {
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export interface Doctor {
  id: string;
  email: string; // Read-only, set at registration
  title?: string; // Professional title (Dr., Prof., Mr., Ms., etc.)
  firstName: string;
  lastName: string;
  clinicName?: string; // Clinic / Practice name
  displayPreference?: 'professional' | 'clinic' | 'both'; // How to display on platform

  // Personal Information
  dateOfBirth?: string; // ISO date string (YYYY-MM-DD)
  gender?: 'female' | 'male' | 'other' | 'prefer-not-to-say';
  country?: string; // "From" field
  language?: string; // e.g., "en", "es"

  // Contact
  personalMobile?: PhoneNumber;
  officePhone?: PhoneNumber;
  personalWebsite?: string; // Full URL without https:// prefix

  // Professional
  questionnaireUrl?: string; // Wellness assessment URL slug
  medicalLicenseNumber?: string;
  specialization?: string;

  // Extended
  bio?: string;
  education?: string; // Credentials/education text
  officeAddress?: Address;

  // Metadata
  updatedAt?: string; // ISO datetime
}

// Form data type for editing doctor profile (omits read-only fields)
export interface DoctorProfileFormData {
  title?: string;
  firstName: string;
  lastName: string;
  clinicName?: string;
  displayPreference?: Doctor['displayPreference'];
  dateOfBirth?: string;
  gender?: Doctor['gender'];
  country?: string;
  language?: string;
  personalMobile?: PhoneNumber;
  officePhone?: PhoneNumber;
  personalWebsite?: string;
  questionnaireUrl?: string;
  medicalLicenseNumber?: string;
  specialization?: string;
  bio?: string;
  education?: string;
  officeAddress?: Address;
}

// Password change form data
export interface PasswordChangeFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
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
