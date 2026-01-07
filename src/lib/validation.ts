import { PatientFormData, DoctorProfileFormData, PasswordChangeFormData, PhoneNumber } from '@/types';

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// Validate email format
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate phone format (flexible)
function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[\d\s\-\(\)\+]{7,}$/;
  return phoneRegex.test(phone);
}

// Validate date of birth
function isValidDateOfBirth(dateString: string): boolean {
  const date = new Date(dateString);
  const now = new Date();
  const minDate = new Date('1900-01-01');

  return !isNaN(date.getTime()) && date < now && date > minDate;
}

// Validate patient form data
export function validatePatientForm(data: PatientFormData): ValidationResult {
  const errors: ValidationError[] = [];

  // Required: First name
  if (!data.firstName || data.firstName.trim().length === 0) {
    errors.push({ field: 'firstName', message: 'First name is required' });
  } else if (data.firstName.trim().length < 2) {
    errors.push({ field: 'firstName', message: 'First name must be at least 2 characters' });
  } else if (data.firstName.trim().length > 50) {
    errors.push({ field: 'firstName', message: 'First name must be 50 characters or less' });
  }

  // Required: Last name
  if (!data.lastName || data.lastName.trim().length === 0) {
    errors.push({ field: 'lastName', message: 'Last name is required' });
  } else if (data.lastName.trim().length < 2) {
    errors.push({ field: 'lastName', message: 'Last name must be at least 2 characters' });
  } else if (data.lastName.trim().length > 50) {
    errors.push({ field: 'lastName', message: 'Last name must be 50 characters or less' });
  }

  // Required: Date of birth
  if (!data.dateOfBirth) {
    errors.push({ field: 'dateOfBirth', message: 'Date of birth is required' });
  } else if (!isValidDateOfBirth(data.dateOfBirth)) {
    errors.push({ field: 'dateOfBirth', message: 'Please enter a valid date of birth' });
  }

  // Optional: Email (validate if provided)
  if (data.email && data.email.trim().length > 0 && !isValidEmail(data.email)) {
    errors.push({ field: 'email', message: 'Please enter a valid email address' });
  }

  // Optional: Phone (validate if provided)
  if (data.phone && data.phone.trim().length > 0 && !isValidPhone(data.phone)) {
    errors.push({ field: 'phone', message: 'Please enter a valid phone number' });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Get error for a specific field
export function getFieldError(errors: ValidationError[], field: string): string | undefined {
  return errors.find(e => e.field === field)?.message;
}

// Validate URL slug (for questionnaire URL)
function isValidUrlSlug(slug: string): boolean {
  return /^[a-zA-Z0-9_-]+$/.test(slug);
}

// Validate website URL (without protocol)
function isValidWebsiteUrl(url: string): boolean {
  return /^[a-zA-Z0-9][a-zA-Z0-9-_.]+\.[a-zA-Z]{2,}(\/.*)?$/.test(url);
}

// Validate phone number structure
function isValidPhoneNumber(phone: PhoneNumber | undefined): boolean {
  if (!phone || !phone.number) return true; // Optional field
  const cleaned = phone.number.replace(/\D/g, '');
  return cleaned.length >= 7 && cleaned.length <= 15;
}

// Validate doctor profile form data
export function validateDoctorProfile(data: DoctorProfileFormData): ValidationResult {
  const errors: ValidationError[] = [];

  // Required: First name
  if (!data.firstName?.trim()) {
    errors.push({ field: 'firstName', message: 'First name is required' });
  } else if (data.firstName.trim().length < 2) {
    errors.push({ field: 'firstName', message: 'First name must be at least 2 characters' });
  }

  // Required: Last name
  if (!data.lastName?.trim()) {
    errors.push({ field: 'lastName', message: 'Last name is required' });
  } else if (data.lastName.trim().length < 2) {
    errors.push({ field: 'lastName', message: 'Last name must be at least 2 characters' });
  }

  // Conditional: Clinic name required when displayPreference is 'clinic' or 'both'
  if ((data.displayPreference === 'clinic' || data.displayPreference === 'both') && !data.clinicName?.trim()) {
    errors.push({ field: 'clinicName', message: 'Clinic name is required for your selected display preference' });
  }

  // Required: Wellness Assessment URL
  if (!data.questionnaireUrl?.trim()) {
    errors.push({ field: 'questionnaireUrl', message: 'Wellness assessment link is required' });
  } else if (!isValidUrlSlug(data.questionnaireUrl)) {
    errors.push({ field: 'questionnaireUrl', message: 'URL can only contain letters, numbers, hyphens, and underscores' });
  }

  // Optional: Personal website
  if (data.personalWebsite?.trim() && !isValidWebsiteUrl(data.personalWebsite)) {
    errors.push({ field: 'personalWebsite', message: 'Please enter a valid website URL' });
  }

  // Optional: Phone numbers
  if (data.personalMobile && !isValidPhoneNumber(data.personalMobile)) {
    errors.push({ field: 'personalMobile', message: 'Please enter a valid phone number' });
  }
  if (data.officePhone && !isValidPhoneNumber(data.officePhone)) {
    errors.push({ field: 'officePhone', message: 'Please enter a valid phone number' });
  }

  // Optional: Date of birth
  if (data.dateOfBirth && !isValidDateOfBirth(data.dateOfBirth)) {
    errors.push({ field: 'dateOfBirth', message: 'Please enter a valid date of birth' });
  }

  return { isValid: errors.length === 0, errors };
}

// Validate password change form
export function validatePasswordChange(data: PasswordChangeFormData): ValidationResult {
  const errors: ValidationError[] = [];

  if (!data.currentPassword) {
    errors.push({ field: 'currentPassword', message: 'Current password is required' });
  }

  if (!data.newPassword) {
    errors.push({ field: 'newPassword', message: 'New password is required' });
  } else {
    if (data.newPassword.length < 8) {
      errors.push({ field: 'newPassword', message: 'Password must be at least 8 characters' });
    }
    if (!/[A-Z]/.test(data.newPassword)) {
      errors.push({ field: 'newPassword', message: 'Password must contain at least 1 uppercase letter' });
    }
    if (!/\d/.test(data.newPassword)) {
      errors.push({ field: 'newPassword', message: 'Password must contain at least 1 number' });
    }
  }

  if (!data.confirmPassword) {
    errors.push({ field: 'confirmPassword', message: 'Please confirm your new password' });
  } else if (data.newPassword !== data.confirmPassword) {
    errors.push({ field: 'confirmPassword', message: 'Passwords do not match' });
  }

  return { isValid: errors.length === 0, errors };
}

// Password strength calculator
export interface PasswordStrengthResult {
  score: number; // 0-3
  label: 'weak' | 'fair' | 'strong';
  requirements: { met: boolean; label: string }[];
}

export function getPasswordStrength(password: string): PasswordStrengthResult {
  const requirements = [
    { met: password.length >= 8, label: 'At least 8 characters' },
    { met: /[A-Z]/.test(password), label: 'At least 1 uppercase' },
    { met: /\d/.test(password), label: 'At least 1 number' },
  ];

  const score = requirements.filter(r => r.met).length;
  const label = score <= 1 ? 'weak' : score === 2 ? 'fair' : 'strong';

  return { score, label, requirements };
}
