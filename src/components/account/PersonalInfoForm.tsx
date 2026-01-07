'use client';

import React, { useState } from 'react';
import { Input, Select, Textarea } from '@/components/ui';
import { PhoneInput } from './PhoneInput';
import { DoctorProfileFormData, PhoneNumber, Address } from '@/types';
import { ValidationError, getFieldError } from '@/lib/validation';
import { cn } from '@/lib/utils';
import {
  LANGUAGE_OPTIONS,
  COUNTRY_OPTIONS,
  SPECIALIZATION_OPTIONS,
  TITLE_OPTIONS,
  DISPLAY_PREFERENCE_OPTIONS,
} from '@/lib/constants';

interface PersonalInfoFormProps {
  formData: DoctorProfileFormData;
  onChange: (data: DoctorProfileFormData) => void;
  errors: ValidationError[];
  email: string; // Read-only email display
}

function PersonalInfoForm({ formData, onChange, errors, email }: PersonalInfoFormProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  const handleChange = (field: keyof DoctorProfileFormData, value: unknown) => {
    onChange({ ...formData, [field]: value });
  };

  const handleAddressChange = (field: keyof Address, value: string) => {
    onChange({
      ...formData,
      officeAddress: {
        ...formData.officeAddress,
        [field]: value,
      },
    });
  };

  // Check if clinic is required based on display preference
  const isClinicRequired = formData.displayPreference === 'clinic' || formData.displayPreference === 'both';

  return (
    <div className="space-y-8">
      {/* Personal Information Section */}
      <section>
        <h3 className="text-lg font-semibold text-stone-900 mb-1">Personal Information</h3>
        <p className="text-sm text-stone-500 mb-6">Enter your personal details for communication.</p>

        {/* Title + First Name + Last Name (row 1) */}
        <div className="grid grid-cols-12 gap-4 mb-6">
          <div className="col-span-12 sm:col-span-3">
            <Select
              label="Title"
              name="title"
              value={formData.title || ''}
              onChange={(e) => handleChange('title', e.target.value || undefined)}
              options={TITLE_OPTIONS}
            />
          </div>
          <div className="col-span-12 sm:col-span-4">
            <Input
              label="First Name"
              name="firstName"
              value={formData.firstName}
              onChange={(e) => handleChange('firstName', e.target.value)}
              error={getFieldError(errors, 'firstName')}
              required
            />
          </div>
          <div className="col-span-12 sm:col-span-5">
            <Input
              label="Last Name"
              name="lastName"
              value={formData.lastName}
              onChange={(e) => handleChange('lastName', e.target.value)}
              error={getFieldError(errors, 'lastName')}
              required
            />
          </div>
        </div>

        {/* Clinic Name (row 2) */}
        <div className="mb-6">
          <Input
            label="Clinic / Practice Name"
            name="clinicName"
            value={formData.clinicName || ''}
            onChange={(e) => handleChange('clinicName', e.target.value)}
            error={getFieldError(errors, 'clinicName')}
            placeholder="e.g., Alma Health Clinic"
            required={isClinicRequired}
          />
        </div>

        {/* Display Preference (row 3) */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-stone-700 mb-3 tracking-snug">
            Display on platform as
          </label>
          <div className="space-y-3">
            {DISPLAY_PREFERENCE_OPTIONS.map((option) => (
              <label
                key={option.value}
                className={cn(
                  'flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-200',
                  formData.displayPreference === option.value
                    ? 'border-purple-300 bg-purple-50'
                    : 'border-stone-200 hover:border-stone-300 hover:bg-stone-50'
                )}
              >
                <input
                  type="radio"
                  name="displayPreference"
                  value={option.value}
                  checked={formData.displayPreference === option.value}
                  onChange={(e) => handleChange('displayPreference', e.target.value)}
                  className="mt-0.5 h-4 w-4 text-purple-600 border-stone-300 focus:ring-purple-500 accent-purple-600"
                />
                <div>
                  <span className="text-sm font-medium text-stone-800">{option.label}</span>
                  <p className="text-xs text-stone-500 mt-0.5">{option.description}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Other personal fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Select
            label="Country"
            name="country"
            value={formData.country || ''}
            onChange={(e) => handleChange('country', e.target.value || undefined)}
            options={COUNTRY_OPTIONS}
          />
          <Select
            label="Language"
            name="language"
            value={formData.language || ''}
            onChange={(e) => handleChange('language', e.target.value || undefined)}
            options={LANGUAGE_OPTIONS}
          />
        </div>
      </section>

      {/* Online Presence Section */}
      <section>
        <h3 className="text-lg font-semibold text-stone-900 mb-1">Online Presence</h3>
        <p className="text-sm text-stone-500 mb-6">Your wellness assessment link and website.</p>

        <div className="space-y-6">
          {/* Wellness Assessment Link with Tooltip */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <label className="block text-sm font-medium text-stone-700 tracking-snug">
                Your Wellness Assessment Link <span className="text-error-500">*</span>
              </label>
              <div className="relative">
                <button
                  type="button"
                  onMouseEnter={() => setShowTooltip(true)}
                  onMouseLeave={() => setShowTooltip(false)}
                  onClick={() => setShowTooltip(!showTooltip)}
                  className="text-stone-400 hover:text-stone-600 transition-colors"
                >
                  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
                  </svg>
                </button>
                {showTooltip && (
                  <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 p-3 bg-stone-800 text-white text-xs rounded-lg shadow-lg z-10">
                    <p>Share this link with your patients. They can complete an AI-powered wellness assessment before their visit.</p>
                    <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-stone-800" />
                  </div>
                )}
              </div>
            </div>
            <div className="flex">
              <span className="inline-flex items-center px-4 py-3 rounded-l-xl border border-r-0 border-stone-200 bg-stone-50 text-stone-500 text-sm whitespace-nowrap">
                skinxs.com/diag/
              </span>
              <input
                type="text"
                value={formData.questionnaireUrl || ''}
                onChange={(e) => handleChange('questionnaireUrl', e.target.value)}
                placeholder="your-unique-slug"
                className={cn(
                  'flex-1 px-4 py-3 rounded-r-xl border border-stone-200 text-stone-800 placeholder:text-stone-400 text-sm',
                  'focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all duration-200',
                  getFieldError(errors, 'questionnaireUrl') && 'border-error-500 focus:ring-error-500/20 focus:border-error-500'
                )}
              />
            </div>
            {getFieldError(errors, 'questionnaireUrl') && (
              <p className="mt-2 text-sm text-error-600 flex items-center gap-1.5">
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
                {getFieldError(errors, 'questionnaireUrl')}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2 tracking-snug">
              Your Website <span className="text-stone-400 font-normal">(Optional)</span>
            </label>
            <div className="flex">
              <span className="inline-flex items-center px-4 py-3 rounded-l-xl border border-r-0 border-stone-200 bg-stone-50 text-stone-500 text-sm">
                https://
              </span>
              <input
                type="text"
                value={formData.personalWebsite || ''}
                onChange={(e) => handleChange('personalWebsite', e.target.value)}
                placeholder="www.example.com"
                className="flex-1 px-4 py-3 rounded-r-xl border border-stone-200 text-stone-800 placeholder:text-stone-400 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all duration-200"
              />
            </div>
            {getFieldError(errors, 'personalWebsite') && (
              <p className="mt-2 text-sm text-error-600 flex items-center gap-1.5">
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
                {getFieldError(errors, 'personalWebsite')}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section>
        <h3 className="text-lg font-semibold text-stone-900 mb-1">Contact Information</h3>
        <p className="text-sm text-stone-500 mb-6">How patients and colleagues can reach you.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <PhoneInput
            label="Personal Mobile Phone Number"
            value={formData.personalMobile}
            onChange={(value: PhoneNumber) => handleChange('personalMobile', value)}
            error={getFieldError(errors, 'personalMobile')}
          />
          <PhoneInput
            label="Office Phone Number"
            value={formData.officePhone}
            onChange={(value: PhoneNumber) => handleChange('officePhone', value)}
            error={getFieldError(errors, 'officePhone')}
          />
          <div className="md:col-span-2">
            <Input
              label="Email Address"
              name="email"
              type="email"
              value={email}
              disabled
              hint="Email cannot be changed"
            />
          </div>
        </div>
      </section>

      {/* Professional Section */}
      <section>
        <h3 className="text-lg font-semibold text-stone-900 mb-1">Professional Information</h3>
        <p className="text-sm text-stone-500 mb-6">Your medical credentials and practice details.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Medical License Number"
            name="medicalLicenseNumber"
            value={formData.medicalLicenseNumber || ''}
            onChange={(e) => handleChange('medicalLicenseNumber', e.target.value)}
            placeholder="e.g., MD-2020-CA-45678"
          />
          <Select
            label="Specialization"
            name="specialization"
            value={formData.specialization || ''}
            onChange={(e) => handleChange('specialization', e.target.value || undefined)}
            options={SPECIALIZATION_OPTIONS}
          />
        </div>
      </section>

      {/* Extended Profile Section */}
      <section>
        <h3 className="text-lg font-semibold text-stone-900 mb-1">Extended Profile</h3>
        <p className="text-sm text-stone-500 mb-6">Additional information for your professional profile.</p>

        <div className="space-y-6">
          <Textarea
            label="Bio / About"
            name="bio"
            value={formData.bio || ''}
            onChange={(e) => handleChange('bio', e.target.value)}
            placeholder="Tell patients about yourself and your practice..."
            rows={4}
          />
          <Textarea
            label="Education & Credentials"
            name="education"
            value={formData.education || ''}
            onChange={(e) => handleChange('education', e.target.value)}
            placeholder="e.g., MD, University of Toronto; Residency, McGill University"
            rows={3}
          />
        </div>
      </section>

      {/* Office Address Section */}
      <section>
        <h3 className="text-lg font-semibold text-stone-900 mb-1">Office Address</h3>
        <p className="text-sm text-stone-500 mb-6">Your practice location for appointments.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <Input
              label="Street Address"
              name="street"
              value={formData.officeAddress?.street || ''}
              onChange={(e) => handleAddressChange('street', e.target.value)}
              placeholder="123 Medical Center Drive"
            />
          </div>
          <Input
            label="City"
            name="city"
            value={formData.officeAddress?.city || ''}
            onChange={(e) => handleAddressChange('city', e.target.value)}
            placeholder="Toronto"
          />
          <Input
            label="State / Province"
            name="state"
            value={formData.officeAddress?.state || ''}
            onChange={(e) => handleAddressChange('state', e.target.value)}
            placeholder="Ontario"
          />
          <Input
            label="Postal Code"
            name="postalCode"
            value={formData.officeAddress?.postalCode || ''}
            onChange={(e) => handleAddressChange('postalCode', e.target.value)}
            placeholder="M5V 2T6"
          />
          <Select
            label="Country"
            name="addressCountry"
            value={formData.officeAddress?.country || ''}
            onChange={(e) => handleAddressChange('country', e.target.value)}
            options={COUNTRY_OPTIONS}
          />
        </div>
      </section>
    </div>
  );
}

export { PersonalInfoForm };
export type { PersonalInfoFormProps };
