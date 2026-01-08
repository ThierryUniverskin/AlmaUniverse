'use client';

import React, { useState, useEffect, useRef } from 'react';
import { PatientFormDataExtended } from '@/types';
import { Textarea, StyledSelect } from '@/components/ui';
import { SEX_OPTIONS } from '@/lib/constants';
import { validatePatientFormWithConsent, getFieldError, ValidationError } from '@/lib/validation';

// Country data with dial codes and flags
const COUNTRIES = [
  { code: 'US', name: 'United States', dialCode: '+1', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', dialCode: '+44', flag: '🇬🇧' },
  { code: 'CA', name: 'Canada', dialCode: '+1', flag: '🇨🇦' },
  { code: 'AU', name: 'Australia', dialCode: '+61', flag: '🇦🇺' },
  { code: 'DE', name: 'Germany', dialCode: '+49', flag: '🇩🇪' },
  { code: 'FR', name: 'France', dialCode: '+33', flag: '🇫🇷' },
  { code: 'ES', name: 'Spain', dialCode: '+34', flag: '🇪🇸' },
  { code: 'IT', name: 'Italy', dialCode: '+39', flag: '🇮🇹' },
  { code: 'NL', name: 'Netherlands', dialCode: '+31', flag: '🇳🇱' },
  { code: 'BE', name: 'Belgium', dialCode: '+32', flag: '🇧🇪' },
  { code: 'CH', name: 'Switzerland', dialCode: '+41', flag: '🇨🇭' },
  { code: 'AT', name: 'Austria', dialCode: '+43', flag: '🇦🇹' },
  { code: 'SE', name: 'Sweden', dialCode: '+46', flag: '🇸🇪' },
  { code: 'NO', name: 'Norway', dialCode: '+47', flag: '🇳🇴' },
  { code: 'DK', name: 'Denmark', dialCode: '+45', flag: '🇩🇰' },
  { code: 'FI', name: 'Finland', dialCode: '+358', flag: '🇫🇮' },
  { code: 'IE', name: 'Ireland', dialCode: '+353', flag: '🇮🇪' },
  { code: 'PT', name: 'Portugal', dialCode: '+351', flag: '🇵🇹' },
  { code: 'PL', name: 'Poland', dialCode: '+48', flag: '🇵🇱' },
  { code: 'CZ', name: 'Czech Republic', dialCode: '+420', flag: '🇨🇿' },
  { code: 'GR', name: 'Greece', dialCode: '+30', flag: '🇬🇷' },
  { code: 'IL', name: 'Israel', dialCode: '+972', flag: '🇮🇱' },
  { code: 'JP', name: 'Japan', dialCode: '+81', flag: '🇯🇵' },
  { code: 'KR', name: 'South Korea', dialCode: '+82', flag: '🇰🇷' },
  { code: 'CN', name: 'China', dialCode: '+86', flag: '🇨🇳' },
  { code: 'IN', name: 'India', dialCode: '+91', flag: '🇮🇳' },
  { code: 'SG', name: 'Singapore', dialCode: '+65', flag: '🇸🇬' },
  { code: 'HK', name: 'Hong Kong', dialCode: '+852', flag: '🇭🇰' },
  { code: 'NZ', name: 'New Zealand', dialCode: '+64', flag: '🇳🇿' },
  { code: 'MX', name: 'Mexico', dialCode: '+52', flag: '🇲🇽' },
  { code: 'BR', name: 'Brazil', dialCode: '+55', flag: '🇧🇷' },
  { code: 'AR', name: 'Argentina', dialCode: '+54', flag: '🇦🇷' },
  { code: 'CL', name: 'Chile', dialCode: '+56', flag: '🇨🇱' },
  { code: 'CO', name: 'Colombia', dialCode: '+57', flag: '🇨🇴' },
  { code: 'AE', name: 'UAE', dialCode: '+971', flag: '🇦🇪' },
  { code: 'SA', name: 'Saudi Arabia', dialCode: '+966', flag: '🇸🇦' },
  { code: 'ZA', name: 'South Africa', dialCode: '+27', flag: '🇿🇦' },
  { code: 'RU', name: 'Russia', dialCode: '+7', flag: '🇷🇺' },
  { code: 'TR', name: 'Turkey', dialCode: '+90', flag: '🇹🇷' },
];

// Month names for date picker (short form for better display)
const MONTH_OPTIONS = [
  { value: '01', label: 'Jan' },
  { value: '02', label: 'Feb' },
  { value: '03', label: 'Mar' },
  { value: '04', label: 'Apr' },
  { value: '05', label: 'May' },
  { value: '06', label: 'Jun' },
  { value: '07', label: 'Jul' },
  { value: '08', label: 'Aug' },
  { value: '09', label: 'Sep' },
  { value: '10', label: 'Oct' },
  { value: '11', label: 'Nov' },
  { value: '12', label: 'Dec' },
];

// Generate years (from current year back to 120 years ago)
const currentYear = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 120 }, (_, i) => ({
  value: String(currentYear - i),
  label: String(currentYear - i),
}));

// Generate days 1-31
const DAY_OPTIONS = Array.from({ length: 31 }, (_, i) => ({
  value: String(i + 1).padStart(2, '0'),
  label: String(i + 1),
}));

// Countries that use Month/Day/Year format
const MDY_COUNTRIES = ['US'];

interface InlinePatientFormProps {
  onFormChange: (data: PatientFormDataExtended, isValid: boolean) => void;
  onClose: () => void;
  disabled?: boolean;
  defaultCountry?: string;
}

function InlinePatientForm({
  onFormChange,
  onClose,
  disabled = false,
  defaultCountry = 'US',
}: InlinePatientFormProps) {
  // Find default country or fallback to US
  const initialCountry = COUNTRIES.find(c => c.code === defaultCountry) || COUNTRIES[0];

  const [formData, setFormData] = useState<PatientFormDataExtended>({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    sex: undefined,
    phone: '',
    email: '',
    notes: '',
    consentSms: false,
    consentTerms: false,
  });
  const [selectedCountry, setSelectedCountry] = useState(initialCountry);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  // Date picker state
  const [dobMonth, setDobMonth] = useState('');
  const [dobDay, setDobDay] = useState('');
  const [dobYear, setDobYear] = useState('');

  const countryDropdownRef = useRef<HTMLDivElement>(null);

  // Close country dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(event.target as Node)) {
        setIsCountryDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update form data with full phone number when country or number changes
  useEffect(() => {
    const fullPhone = phoneNumber ? `${selectedCountry.dialCode} ${phoneNumber}` : '';
    setFormData(prev => ({ ...prev, phone: fullPhone }));
  }, [selectedCountry, phoneNumber]);

  // Update form data with date of birth when date parts change
  useEffect(() => {
    if (dobYear && dobMonth && dobDay) {
      const dateOfBirth = `${dobYear}-${dobMonth}-${dobDay}`;
      setFormData(prev => ({ ...prev, dateOfBirth }));
    } else {
      setFormData(prev => ({ ...prev, dateOfBirth: '' }));
    }
  }, [dobYear, dobMonth, dobDay]);

  // Validate and notify parent on form change
  useEffect(() => {
    const validation = validatePatientFormWithConsent(formData);
    // Only show errors if user has tried to proceed
    if (hasAttemptedSubmit) {
      setErrors(validation.errors);
    }
    onFormChange(formData, validation.isValid);
  }, [formData, hasAttemptedSubmit, onFormChange]);

  const handleChange = (field: keyof PatientFormDataExtended, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors.some(e => e.field === field)) {
      setErrors(prev => prev.filter(e => e.field !== field));
    }
  };

  const handleCountrySelect = (country: typeof COUNTRIES[0]) => {
    setSelectedCountry(country);
    setIsCountryDropdownOpen(false);
  };

  return (
    <div className="relative">
      {/* Close Button */}
      <button
        type="button"
        onClick={onClose}
        disabled={disabled}
        className="absolute top-0 right-0 p-1.5 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors disabled:opacity-50"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>

      {/* Header */}
      <div className="mb-6 pr-8">
        <h3 className="text-base font-semibold text-stone-900">Create New Patient Record</h3>
        <p className="text-sm text-stone-500 mt-1">Select this option to create a new patient record for clinical documentation.</p>
      </div>

      {/* Helper text above form */}
      <div className="mb-5 pb-4 border-b border-stone-100">
        <p className="text-sm font-medium text-stone-700">Patient identification details</p>
        <p className="text-xs text-stone-400">(for record creation purposes only)</p>
      </div>

      {/* Form Fields */}
      <div className="space-y-5">
        {/* Row 1: First Name, Last Name */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">
              First Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.firstName}
              onChange={e => handleChange('firstName', e.target.value)}
              placeholder="Enter first name"
              disabled={disabled}
              className="w-full px-4 py-2.5 bg-white border border-stone-200 rounded-full text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-stone-50 h-11"
            />
            {getFieldError(errors, 'firstName') && (
              <p className="mt-1 text-sm text-red-600">{getFieldError(errors, 'firstName')}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">
              Last Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.lastName}
              onChange={e => handleChange('lastName', e.target.value)}
              placeholder="Enter last name"
              disabled={disabled}
              className="w-full px-4 py-2.5 bg-white border border-stone-200 rounded-full text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-stone-50 h-11"
            />
            {getFieldError(errors, 'lastName') && (
              <p className="mt-1 text-sm text-red-600">{getFieldError(errors, 'lastName')}</p>
            )}
          </div>
        </div>

        {/* Row 2: Date of Birth (dropdowns), Sex */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Date of Birth with dropdowns - order based on locale */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">
              Date of Birth
            </label>
            {MDY_COUNTRIES.includes(defaultCountry) ? (
              /* US format: Month / Day / Year */
              <div className="grid grid-cols-3 gap-2">
                <StyledSelect
                  options={MONTH_OPTIONS}
                  value={dobMonth}
                  onChange={setDobMonth}
                  placeholder="Month"
                  disabled={disabled}
                  compact
                />
                <StyledSelect
                  options={DAY_OPTIONS}
                  value={dobDay}
                  onChange={setDobDay}
                  placeholder="Day"
                  disabled={disabled}
                  compact
                />
                <StyledSelect
                  options={YEAR_OPTIONS}
                  value={dobYear}
                  onChange={setDobYear}
                  placeholder="Year"
                  disabled={disabled}
                  compact
                />
              </div>
            ) : (
              /* International format: Day / Month / Year */
              <div className="grid grid-cols-3 gap-2">
                <StyledSelect
                  options={DAY_OPTIONS}
                  value={dobDay}
                  onChange={setDobDay}
                  placeholder="Day"
                  disabled={disabled}
                  compact
                />
                <StyledSelect
                  options={MONTH_OPTIONS}
                  value={dobMonth}
                  onChange={setDobMonth}
                  placeholder="Month"
                  disabled={disabled}
                  compact
                />
                <StyledSelect
                  options={YEAR_OPTIONS}
                  value={dobYear}
                  onChange={setDobYear}
                  placeholder="Year"
                  disabled={disabled}
                  compact
                />
              </div>
            )}
            {getFieldError(errors, 'dateOfBirth') && (
              <p className="mt-1 text-sm text-red-600">{getFieldError(errors, 'dateOfBirth')}</p>
            )}
          </div>

          {/* Sex - styled dropdown */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">
              Sex
            </label>
            <StyledSelect
              options={SEX_OPTIONS}
              value={formData.sex || ''}
              onChange={(value) => handleChange('sex', value)}
              placeholder="Select..."
              disabled={disabled}
            />
          </div>
        </div>

        {/* Row 3: Phone with country selector, Email */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Phone with Country Selector */}
          <div ref={countryDropdownRef}>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">
              Phone
            </label>
            <div className="relative">
              <div className="flex rounded-full border border-stone-200 bg-white focus-within:ring-2 focus-within:ring-purple-500 focus-within:border-transparent h-11">
                {/* Country Selector */}
                <button
                  type="button"
                  onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                  disabled={disabled}
                  className="flex items-center gap-1.5 px-3 h-full bg-transparent text-sm hover:bg-stone-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed rounded-l-full"
                >
                  <span className="text-sm font-medium text-stone-700">{selectedCountry.code}</span>
                  <svg className="h-4 w-4 text-stone-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>

                {/* Divider */}
                <div className="w-px bg-stone-200 my-2" />

                {/* Phone Input */}
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={e => setPhoneNumber(e.target.value)}
                  placeholder={`${selectedCountry.dialCode} (555) 123-4567`}
                  disabled={disabled}
                  className="flex-1 min-w-0 px-3 bg-transparent text-sm text-stone-900 placeholder-stone-400 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed rounded-r-full"
                />
              </div>

              {/* Country Dropdown - positioned outside the input container */}
              {isCountryDropdownOpen && (
                <div className="absolute z-50 mt-1 w-56 bg-white border border-stone-200 rounded-xl shadow-lg max-h-60 overflow-y-auto left-0">
                  {COUNTRIES.map(country => (
                    <button
                      key={country.code}
                      type="button"
                      onClick={() => handleCountrySelect(country)}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-stone-50 transition-colors ${
                        selectedCountry.code === country.code ? 'bg-purple-50 text-purple-700' : 'text-stone-700'
                      }`}
                    >
                      <span className="text-lg leading-none">{country.flag}</span>
                      <span className="flex-1 truncate">{country.name}</span>
                      <span className="text-stone-400 text-xs">{country.dialCode}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {getFieldError(errors, 'phone') && (
              <p className="mt-1 text-sm text-red-600">{getFieldError(errors, 'phone')}</p>
            )}
          </div>

          {/* Email - custom styled to match */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={formData.email || ''}
              onChange={e => handleChange('email', e.target.value)}
              placeholder="patient@email.com"
              disabled={disabled}
              className="w-full px-4 py-2.5 bg-white border border-stone-200 rounded-full text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-stone-50 h-11"
            />
            {getFieldError(errors, 'email') && (
              <p className="mt-1 text-sm text-red-600">{getFieldError(errors, 'email')}</p>
            )}
          </div>
        </div>

        {/* Row 4: Notes */}
        <Textarea
          label="Notes"
          name="notes"
          value={formData.notes || ''}
          onChange={e => handleChange('notes', e.target.value)}
          placeholder="Any additional notes about this patient..."
          hint="Optional. Add any relevant notes about appointments, preferences, or medical history."
          disabled={disabled}
        />

        {/* Terms & Conditions Consent */}
        <div className="pt-2 border-t border-stone-100">
          <label className={`flex items-start gap-3 cursor-pointer ${getFieldError(errors, 'consentTerms') ? 'text-red-600' : ''}`}>
            <input
              type="checkbox"
              checked={formData.consentTerms || false}
              onChange={e => handleChange('consentTerms', e.target.checked)}
              disabled={disabled}
              className={`mt-0.5 h-4 w-4 rounded border-stone-300 accent-purple-600 focus:ring-purple-500 disabled:opacity-50 ${
                getFieldError(errors, 'consentTerms') ? 'border-red-500' : ''
              }`}
            />
            <span className={`text-sm ${getFieldError(errors, 'consentTerms') ? 'text-red-600' : 'text-stone-600'}`}>
              Patient agrees on{' '}
              <a href="#" className="text-purple-600 underline hover:text-purple-700">
                Terms & Conditions
              </a>{' '}
              and{' '}
              <a href="#" className="text-purple-600 underline hover:text-purple-700">
                Privacy Policy
              </a>
              <span className="text-red-500 ml-0.5">*</span>
            </span>
          </label>
          {getFieldError(errors, 'consentTerms') && (
            <p className="text-sm text-red-600 ml-7">
              {getFieldError(errors, 'consentTerms')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export { InlinePatientForm };
