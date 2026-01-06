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
  firstName: 'Sarah',
  lastName: 'Mitchell',
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
