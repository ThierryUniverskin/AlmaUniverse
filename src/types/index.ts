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

// Extended form data with consent fields for clinical documentation flow
export interface PatientFormDataExtended extends PatientFormData {
  consentSms?: boolean;
  consentTerms?: boolean;
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

// Medical History types for clinical documentation
export type MenopausalStatus = 'pre-menopausal' | 'peri-menopausal' | 'post-menopausal' | 'n/a';

export type KnownAllergyType =
  | 'latex'
  | 'fragrances'
  | 'parabens'
  | 'retinoids'
  | 'ahas'
  | 'salicylic-acid'
  | 'penicillin'
  | 'nsaids'
  | 'sulfa-drugs'
  | 'lidocaine';

export type CancerType =
  | 'breast'
  | 'skin'
  | 'gynecological'
  | 'prostate'
  | 'gastrointestinal'
  | 'hematologic'
  | 'other';

export type RecoveryTimePreference =
  | 'same-day'
  | '1-2-days'
  | '3-5-days'
  | 'more-than-5-days';

export interface PatientMedicalHistory {
  id: string;
  patientId: string;

  // Reproductive / Hormonal
  isPregnantOrBreastfeeding: boolean;
  usesHormonalContraception: boolean;
  receivesHrt: boolean;
  menopausalStatus?: MenopausalStatus;

  // Cancer History
  hasCancerHistory: boolean;
  cancerTypes: CancerType[];
  cancerDetails?: string;

  // Skin-Related Medical Context
  hasInflammatorySkinCondition: boolean;
  hasActiveColdSores: boolean;

  // Allergies
  knownAllergies: KnownAllergyType[];
  otherAllergies?: string;

  // Medications
  currentMedications?: string;

  // Additional Medical Information
  relevantMedicalConditions?: string;

  // Recovery Time Preference
  recoveryTimePreference?: RecoveryTimePreference;

  // Metadata
  createdAt: string;
  updatedAt: string;
}

export interface PatientMedicalHistoryFormData {
  // Reproductive / Hormonal
  isPregnantOrBreastfeeding: boolean;
  usesHormonalContraception: boolean;
  receivesHrt: boolean;
  menopausalStatus?: MenopausalStatus;

  // Cancer History
  hasCancerHistory: boolean;
  cancerTypes: CancerType[];
  cancerDetails?: string;

  // Skin-Related Medical Context
  hasInflammatorySkinCondition: boolean;
  hasActiveColdSores: boolean;

  // Allergies
  knownAllergies: KnownAllergyType[];
  otherAllergies?: string;

  // Medications
  currentMedications?: string;

  // Additional Medical Information
  relevantMedicalConditions?: string;

  // Recovery Time Preference
  recoveryTimePreference?: RecoveryTimePreference;
}

// Photo Collection types for clinical documentation
export type PhotoSource = 'app' | 'almaiq';
export type PhotoType = 'frontal' | 'left-profile' | 'right-profile';

export interface PhotoSession {
  id: string;
  patientId: string;
  source: PhotoSource;
  frontalPhotoUrl: string | null;
  leftProfilePhotoUrl: string | null;
  rightProfilePhotoUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PhotoSessionFormData {
  source: PhotoSource | null; // null = not yet selected
  frontalPhoto: File | string | null; // File for new upload, string for existing URL
  leftProfilePhoto: File | string | null;
  rightProfilePhoto: File | string | null;
  // Photo consent
  photoConsentGiven: boolean;
}

// Photo consent log entry for audit trail
export interface PhotoConsentLog {
  timestamp: string; // ISO datetime
  physicianUserId: string;
  patientRecordId: string;
  consentTextVersion: string;
  consentGiven: boolean;
}

// Current consent text version - increment when consent text changes
export const PHOTO_CONSENT_VERSION = '1.0';

// Medical Skin Concern Types for clinical documentation
export type SkinConcernCategory =
  | 'appearance-texture'
  | 'pigmentation-color'
  | 'vascular-lesional'
  | 'scar-lesion';

export interface SkinConcern {
  id: string;
  label: string;
  category: SkinConcernCategory;
}

export interface SkinConcernsFormData {
  selectedConcerns: string[]; // Array of concern IDs in priority order
}

// Clinical Evaluation Session types
export type ClinicalEvaluationStatus = 'in_progress' | 'completed';

export interface ClinicalEvaluationSession {
  id: string;
  patientId: string;
  doctorId: string;
  photoSessionId: string | null;
  selectedSkinConcerns: string[]; // Array of concern IDs in priority order
  notes: string | null;
  status: ClinicalEvaluationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ClinicalEvaluationSessionFormData {
  photoSessionId?: string | null;
  selectedSkinConcerns: string[];
  notes?: string;
}
