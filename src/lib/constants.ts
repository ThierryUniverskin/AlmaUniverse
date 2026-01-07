import { Doctor, Patient } from '@/types';

// Storage keys for localStorage
export const STORAGE_KEYS = {
  AUTH: 'alma_auth',
  PATIENTS: 'alma_patients',
} as const;

// Demo doctor credentials
export const DEMO_CREDENTIALS = {
  email: 'doctor@alma.health',
  password: 'alma2024',
} as const;

// Demo doctor profile
export const DEMO_DOCTOR: Doctor = {
  id: 'dr-001',
  email: 'doctor@alma.health',
  title: 'Dr.',
  firstName: 'Sarah',
  lastName: 'Mitchell',
  clinicName: 'Alma Health Clinic',
  displayPreference: 'both',
  // Extended profile fields
  dateOfBirth: '1995-06-15',
  gender: 'female',
  country: 'CA',
  language: 'en',
  personalMobile: { countryCode: '+1', number: '5551234567' },
  officePhone: { countryCode: '+1', number: '5559876543' },
  personalWebsite: 'sarahmitchell.com',
  questionnaireUrl: 'sarah-mitchell',
  medicalLicenseNumber: 'MD-2020-CA-45678',
  specialization: 'dermatology',
  bio: 'Board-certified dermatologist with expertise in clinical and cosmetic dermatology.',
  education: 'MD, University of Toronto; Residency, McGill University',
  officeAddress: {
    street: '123 Medical Center Drive',
    city: 'Toronto',
    state: 'Ontario',
    postalCode: 'M5V 2T6',
    country: 'CA',
  },
};

// Seed patients for demo
export const SEED_PATIENTS: Patient[] = [
  {
    id: 'pat-001',
    firstName: 'Emily',
    lastName: 'Johnson',
    dateOfBirth: '1985-03-15',
    sex: 'female',
    email: 'emily.johnson@email.com',
    phone: '(555) 123-4567',
    notes: 'Regular checkup scheduled quarterly.',
    createdAt: '2025-01-02T10:00:00Z',
    updatedAt: '2025-01-02T10:00:00Z',
  },
  {
    id: 'pat-002',
    firstName: 'Michael',
    lastName: 'Chen',
    dateOfBirth: '1978-08-22',
    sex: 'male',
    email: 'michael.chen@email.com',
    phone: '(555) 234-5678',
    notes: '',
    createdAt: '2025-01-03T14:30:00Z',
    updatedAt: '2025-01-03T14:30:00Z',
  },
  {
    id: 'pat-003',
    firstName: 'Sofia',
    lastName: 'Rodriguez',
    dateOfBirth: '1992-11-08',
    sex: 'female',
    phone: '(555) 345-6789',
    createdAt: '2025-01-04T09:15:00Z',
    updatedAt: '2025-01-04T09:15:00Z',
  },
  {
    id: 'pat-004',
    firstName: 'James',
    lastName: 'Williams',
    dateOfBirth: '1965-05-30',
    sex: 'male',
    email: 'jwilliams@email.com',
    notes: 'Prefers morning appointments.',
    createdAt: '2025-01-05T11:45:00Z',
    updatedAt: '2025-01-05T11:45:00Z',
  },
  {
    id: 'pat-005',
    firstName: 'Aisha',
    lastName: 'Patel',
    dateOfBirth: '2001-02-14',
    sex: 'female',
    email: 'aisha.p@email.com',
    phone: '(555) 456-7890',
    createdAt: '2025-01-06T08:00:00Z',
    updatedAt: '2025-01-06T08:00:00Z',
  },
];

// Sex options for form select
export const SEX_OPTIONS = [
  { value: '', label: 'Select...' },
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
  { value: 'other', label: 'Other' },
  { value: 'prefer-not-to-say', label: 'Prefer not to say' },
] as const;

// Gender options (same as sex for doctor profile)
export const GENDER_OPTIONS = [
  { value: '', label: 'Select...' },
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
  { value: 'other', label: 'Other' },
  { value: 'prefer-not-to-say', label: 'Prefer not to say' },
] as const;

// Country codes for phone inputs
export const COUNTRY_CODES = [
  { code: '+1', country: 'US', flag: '\u{1F1FA}\u{1F1F8}', label: 'United States' },
  { code: '+1', country: 'CA', flag: '\u{1F1E8}\u{1F1E6}', label: 'Canada' },
  { code: '+44', country: 'GB', flag: '\u{1F1EC}\u{1F1E7}', label: 'United Kingdom' },
  { code: '+61', country: 'AU', flag: '\u{1F1E6}\u{1F1FA}', label: 'Australia' },
  { code: '+49', country: 'DE', flag: '\u{1F1E9}\u{1F1EA}', label: 'Germany' },
  { code: '+33', country: 'FR', flag: '\u{1F1EB}\u{1F1F7}', label: 'France' },
  { code: '+34', country: 'ES', flag: '\u{1F1EA}\u{1F1F8}', label: 'Spain' },
  { code: '+39', country: 'IT', flag: '\u{1F1EE}\u{1F1F9}', label: 'Italy' },
  { code: '+52', country: 'MX', flag: '\u{1F1F2}\u{1F1FD}', label: 'Mexico' },
  { code: '+55', country: 'BR', flag: '\u{1F1E7}\u{1F1F7}', label: 'Brazil' },
  { code: '+91', country: 'IN', flag: '\u{1F1EE}\u{1F1F3}', label: 'India' },
  { code: '+81', country: 'JP', flag: '\u{1F1EF}\u{1F1F5}', label: 'Japan' },
  { code: '+86', country: 'CN', flag: '\u{1F1E8}\u{1F1F3}', label: 'China' },
] as const;

// Language options
export const LANGUAGE_OPTIONS = [
  { value: '', label: 'Select language...' },
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'it', label: 'Italian' },
  { value: 'zh', label: 'Chinese' },
  { value: 'ja', label: 'Japanese' },
] as const;

// Country options for "From" field
export const COUNTRY_OPTIONS = [
  { value: '', label: 'Select country...' },
  { value: 'US', label: 'United States' },
  { value: 'CA', label: 'Canada' },
  { value: 'GB', label: 'United Kingdom' },
  { value: 'AU', label: 'Australia' },
  { value: 'DE', label: 'Germany' },
  { value: 'FR', label: 'France' },
  { value: 'ES', label: 'Spain' },
  { value: 'IT', label: 'Italy' },
  { value: 'MX', label: 'Mexico' },
  { value: 'BR', label: 'Brazil' },
  { value: 'IN', label: 'India' },
  { value: 'JP', label: 'Japan' },
  { value: 'CN', label: 'China' },
] as const;

// Specialization options
export const SPECIALIZATION_OPTIONS = [
  { value: '', label: 'Select specialization...' },
  { value: 'dermatology', label: 'Dermatology' },
  { value: 'general-practice', label: 'General Practice' },
  { value: 'internal-medicine', label: 'Internal Medicine' },
  { value: 'pediatrics', label: 'Pediatrics' },
  { value: 'cardiology', label: 'Cardiology' },
  { value: 'orthopedics', label: 'Orthopedics' },
  { value: 'neurology', label: 'Neurology' },
  { value: 'psychiatry', label: 'Psychiatry' },
  { value: 'other', label: 'Other' },
] as const;

// Professional title options
export const TITLE_OPTIONS = [
  { value: '', label: 'None' },
  { value: 'Dr.', label: 'Dr.' },
  { value: 'Prof.', label: 'Prof.' },
  { value: 'Mr.', label: 'Mr.' },
  { value: 'Ms.', label: 'Ms.' },
  { value: 'Mrs.', label: 'Mrs.' },
  { value: 'Mx.', label: 'Mx.' },
] as const;

// Display preference options (how to show on platform)
export const DISPLAY_PREFERENCE_OPTIONS = [
  { value: 'professional', label: 'Professional name only', description: 'e.g., Dr. Sarah Mitchell' },
  { value: 'clinic', label: 'Clinic name only', description: 'e.g., Alma Health Clinic' },
  { value: 'both', label: 'Both', description: 'e.g., Dr. Sarah Mitchell - Alma Health Clinic' },
] as const;
