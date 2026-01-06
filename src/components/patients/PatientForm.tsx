'use client';

import React, { useState } from 'react';
import { PatientFormData } from '@/types';
import { Button, Input, Select, Textarea, Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { SEX_OPTIONS } from '@/lib/constants';
import { validatePatientForm, getFieldError, ValidationError } from '@/lib/validation';

interface PatientFormProps {
  initialData?: Partial<PatientFormData>;
  onSubmit: (data: PatientFormData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  submitLabel?: string;
}

const emptyFormData: PatientFormData = {
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  sex: undefined,
  phone: '',
  email: '',
  notes: '',
};

function PatientForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
  submitLabel = 'Create Patient',
}: PatientFormProps) {
  const [formData, setFormData] = useState<PatientFormData>({
    ...emptyFormData,
    ...initialData,
  });
  const [errors, setErrors] = useState<ValidationError[]>([]);

  const handleChange = (field: keyof PatientFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors.some(e => e.field === field)) {
      setErrors(prev => prev.filter(e => e.field !== field));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validatePatientForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Personal Information */}
      <Card hover={false}>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-sage-50 flex items-center justify-center">
              <svg
                className="h-4.5 w-4.5 text-sage-600"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <div>
              <CardTitle>Personal Information</CardTitle>
              <p className="text-sm text-stone-500 mt-0.5">Basic patient details</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input
              label="First Name"
              name="firstName"
              value={formData.firstName}
              onChange={e => handleChange('firstName', e.target.value)}
              error={getFieldError(errors, 'firstName')}
              required
              placeholder="Enter first name"
            />
            <Input
              label="Last Name"
              name="lastName"
              value={formData.lastName}
              onChange={e => handleChange('lastName', e.target.value)}
              error={getFieldError(errors, 'lastName')}
              required
              placeholder="Enter last name"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input
              label="Date of Birth"
              name="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={e => handleChange('dateOfBirth', e.target.value)}
              error={getFieldError(errors, 'dateOfBirth')}
              required
              max={new Date().toISOString().split('T')[0]}
            />
            <Select
              label="Sex"
              name="sex"
              value={formData.sex || ''}
              onChange={e => handleChange('sex', e.target.value)}
              options={SEX_OPTIONS}
            />
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card hover={false}>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-ivory-200 flex items-center justify-center">
              <svg
                className="h-4.5 w-4.5 text-stone-500"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
            </div>
            <div>
              <CardTitle>Contact Information</CardTitle>
              <p className="text-sm text-stone-500 mt-0.5">Optional contact details</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input
              label="Phone"
              name="phone"
              type="tel"
              value={formData.phone || ''}
              onChange={e => handleChange('phone', e.target.value)}
              error={getFieldError(errors, 'phone')}
              placeholder="(555) 123-4567"
            />
            <Input
              label="Email"
              name="email"
              type="email"
              value={formData.email || ''}
              onChange={e => handleChange('email', e.target.value)}
              error={getFieldError(errors, 'email')}
              placeholder="patient@email.com"
            />
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      <Card hover={false}>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-ivory-200 flex items-center justify-center">
              <svg
                className="h-4.5 w-4.5 text-stone-500"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <line x1="10" y1="9" x2="8" y2="9" />
              </svg>
            </div>
            <div>
              <CardTitle>Clinical Notes</CardTitle>
              <p className="text-sm text-stone-500 mt-0.5">Additional patient information</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Textarea
            label="Notes"
            name="notes"
            value={formData.notes || ''}
            onChange={e => handleChange('notes', e.target.value)}
            placeholder="Any additional notes about this patient..."
            hint="Optional. Add any relevant notes about appointments, preferences, or medical history."
          />
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-4 pt-4">
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          size="lg"
          isLoading={isSubmitting}
        >
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}

export { PatientForm };
