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
  accessToken: string | null;
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

// Cosmetic ingredient sensitivities (used for Skin Wellness Mode ingredient exclusion)
// Note: Medical allergies (penicillin, NSAIDs, sulfa, lidocaine) removed - these are not cosmetic ingredients
export type CosmeticSensitivityType =
  | 'retinoids'
  | 'ahas'
  | 'salicylic-acid'
  | 'fragrances'
  | 'parabens'
  | 'soy'       // NEW: For soy/isoflavone sensitivities in skincare
  | 'latex';

// Legacy alias for backward compatibility
export type KnownAllergyType = CosmeticSensitivityType;

export type CancerType =
  | 'breast'
  | 'skin'
  | 'gynecological'
  | 'prostate'
  | 'gastrointestinal'
  | 'hematologic'
  | 'other';

export interface PatientMedicalHistory {
  id: string;
  patientId: string;

  // ============================================
  // SECTION 1: CLINICAL MEDICAL HISTORY
  // For physician documentation only - NEVER used by AI
  // ============================================

  // Cancer History
  hasCancerHistory: boolean;
  cancerTypes: CancerType[];
  cancerDetails?: string;

  // Medications
  currentMedications?: string;

  // Additional Medical Information
  relevantMedicalConditions?: string;

  // ============================================
  // SECTION 2: COSMETIC SAFETY PROFILE
  // Used for cosmetic ingredient exclusion in Skin Wellness Mode
  // ============================================

  // Reproductive / Hormonal (affects ingredient recommendations)
  isPregnantOrBreastfeeding: boolean;
  menopausalStatus?: MenopausalStatus;

  // Exfoliant sensitivity
  hasExfoliantSensitivity: boolean;

  // Cosmetic ingredient sensitivities
  cosmeticSensitivities: CosmeticSensitivityType[];
  otherSensitivities?: string;

  // Metadata
  createdAt: string;
  updatedAt: string;
}

export interface PatientMedicalHistoryFormData {
  // ============================================
  // SECTION 1: CLINICAL MEDICAL HISTORY
  // For physician documentation only - NEVER used by AI
  // ============================================

  // Cancer History
  hasCancerHistory: boolean;
  cancerTypes: CancerType[];
  cancerDetails?: string;

  // Medications
  currentMedications?: string;

  // Additional Medical Information
  relevantMedicalConditions?: string;

  // ============================================
  // SECTION 2: COSMETIC SAFETY PROFILE
  // Used for cosmetic ingredient exclusion in Skin Wellness Mode
  // ============================================

  // Reproductive / Hormonal (affects ingredient recommendations)
  isPregnantOrBreastfeeding: boolean;
  menopausalStatus?: MenopausalStatus;

  // Exfoliant sensitivity
  hasExfoliantSensitivity: boolean;

  // Cosmetic ingredient sensitivities
  cosmeticSensitivities: CosmeticSensitivityType[];
  otherSensitivities?: string;
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
  selectedTreatments: SelectedTreatment[]; // Array of all treatments (multi-category)
  notes: string | null;
  status: ClinicalEvaluationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ClinicalEvaluationSessionFormData {
  photoSessionId?: string | null;
  selectedSkinConcerns: string[];
  selectedTreatments?: SelectedTreatment[];
  notes?: string;
}

// EBD Device types for clinical documentation
export interface EBDDevice {
  id: string;
  name: string;
  description: string;
  treats: string[]; // Array of treatment concerns
  fitzpatrick: string; // Fitzpatrick skin type range (e.g., "I-VI")
  downtime: 'None' | 'Minimal' | 'Some';
  tags: string[];
  imageUrl?: string; // URL to device image
  defaultPriceCents?: number; // Default price per session in cents
}

// Selected device with session details
export interface SelectedEBDDevice {
  deviceId: string;
  sessionCount: number | null;
  notes: string;
}

// Doctor's device pricing information
export interface DoctorDeviceWithPrice {
  deviceId: string;
  priceCents: number | null; // null means use default
  isActive: boolean;
}

// Country-specific default price for EBD device
export interface EBDDeviceCountryPrice {
  id: string;
  deviceId: string;
  countryCode: string;
  defaultPriceCents: number;
}

// Form data for Step 5 (legacy - kept for backward compatibility)
export interface EBDProcedureFormData {
  selectedDevices: SelectedEBDDevice[];
}

// ===========================================
// Treatment Selection Types (Multi-Category)
// ===========================================

// Treatment category types
export type TreatmentCategory = 'ebd' | 'toxin' | 'injectable' | 'other';

// Subcategories for "Other Aesthetic Procedures"
export type OtherProcedureSubcategory =
  | 'biostimulators'
  | 'skin_boosters'
  | 'prp'
  | 'mesotherapy'
  | 'rf_microneedling'
  | 'ultrasound_tightening'
  | 'microneedling'
  | 'chemical_peels'
  | 'dermabrasion'
  | 'microdermabrasion'
  | 'prp_hair'
  | 'hair_mesotherapy'
  | 'other';

// Metadata for subcategory display
export interface OtherSubcategoryMeta {
  id: OtherProcedureSubcategory;
  label: string;
}

// Custom procedure created by doctor (Toxins, Injectables, Other)
export interface DoctorProcedure {
  id: string;
  doctorId: string;
  category: Exclude<TreatmentCategory, 'ebd'>; // 'toxin' | 'injectable' | 'other'
  subcategory?: OtherProcedureSubcategory;
  name: string;
  brand?: string;
  description?: string;
  priceCents: number; // Price per session in cents
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Form data for creating/editing custom procedures
export interface DoctorProcedureFormData {
  category: Exclude<TreatmentCategory, 'ebd'>;
  subcategory?: OtherProcedureSubcategory;
  name: string;
  brand?: string;
  description?: string;
  priceCents: number; // Price per session in cents (required)
}

// Selected treatment (unified type for all categories)
export interface SelectedTreatment {
  type: TreatmentCategory;
  deviceId?: string;      // For EBD devices (ebd_devices.id)
  procedureId?: string;   // For custom procedures (doctor_procedures.id)
  sessionCount: number | null;
  notes: string;
  pricePerSessionCents?: number; // Price at time of selection (for display and historical accuracy)
}

// Form data for Treatment Selection (Step 5 - new version)
export interface TreatmentSelectionFormData {
  selectedTreatments: SelectedTreatment[];
  generalNotes: string; // General notes for the entire session
}

// ===========================================
// Skin Wellness Mode Types
// ===========================================

// Skin Wellness entry data - ONLY allowed fields for data isolation (SaMD compliance)
// This enforces that no clinical/diagnostic data is passed to Skin Wellness Mode
export interface SkinWellnessEntryData {
  photoSessionId: string;
  patientId: string;
  consentConfirmed: boolean;
}
