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

// Medical History - Menopausal status options
export const MENOPAUSAL_STATUS_OPTIONS = [
  { value: '', label: 'Select...' },
  { value: 'pre-menopausal', label: 'Pre-menopausal' },
  { value: 'peri-menopausal', label: 'Peri-menopausal' },
  { value: 'post-menopausal', label: 'Post-menopausal' },
  { value: 'n/a', label: 'N/A' },
] as const;

// Medical History - Known allergies for multi-select
export const KNOWN_ALLERGY_OPTIONS = [
  { value: 'latex', label: 'Latex' },
  { value: 'fragrances', label: 'Fragrances' },
  { value: 'parabens', label: 'Parabens' },
  { value: 'retinoids', label: 'Retinoids' },
  { value: 'ahas', label: 'AHAs' },
  { value: 'salicylic-acid', label: 'Salicylic acid' },
  { value: 'penicillin', label: 'Penicillin' },
  { value: 'nsaids', label: 'NSAIDs' },
  { value: 'sulfa-drugs', label: 'Sulfa drugs' },
  { value: 'lidocaine', label: 'Lidocaine' },
] as const;

// Medical History - Cancer types for multi-select
export const CANCER_TYPE_OPTIONS = [
  { value: 'breast', label: 'Breast cancer' },
  { value: 'skin', label: 'Skin cancer (including melanoma / non-melanoma)' },
  { value: 'gynecological', label: 'Gynecological cancer (e.g., ovarian, uterine, cervical)' },
  { value: 'prostate', label: 'Prostate cancer' },
  { value: 'gastrointestinal', label: 'Gastrointestinal cancer' },
  { value: 'hematologic', label: 'Hematologic cancer (e.g., leukemia, lymphoma)' },
  { value: 'other', label: 'Other cancer type' },
] as const;

// Medical History - Recovery time preference options
export const RECOVERY_TIME_OPTIONS = [
  { value: 'same-day', label: 'Same day / no visible recovery' },
  { value: '1-2-days', label: '1–2 days' },
  { value: '3-5-days', label: '3–5 days' },
  { value: 'more-than-5-days', label: 'More than 5 days' },
] as const;
