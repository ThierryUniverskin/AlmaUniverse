import { PatientFormData } from '@/types';

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
