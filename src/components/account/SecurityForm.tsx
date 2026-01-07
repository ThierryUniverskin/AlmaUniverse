'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui';
import { PasswordStrength } from './PasswordStrength';
import { PasswordChangeFormData } from '@/types';
import { validatePasswordChange, getFieldError, ValidationError } from '@/lib/validation';

interface SecurityFormProps {
  onSubmit: (data: PasswordChangeFormData) => Promise<void>;
  isSubmitting: boolean;
}

function SecurityForm({ onSubmit, isSubmitting }: SecurityFormProps) {
  const [formData, setFormData] = useState<PasswordChangeFormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const handleChange = (field: keyof PasswordChangeFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field when typing
    setErrors((prev) => prev.filter((e) => e.field !== field));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validatePasswordChange(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    await onSubmit(formData);
    // Reset form on success
    setFormData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setErrors([]);
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-stone-900 mb-1">Security Settings</h3>
        <p className="text-sm text-stone-500 mb-6">Update password for enhanced account security.</p>
      </div>

      {/* Current Password */}
      <div className="w-full">
        <label
          htmlFor="currentPassword"
          className="block text-sm font-medium text-stone-700 mb-2 tracking-snug"
        >
          Current Password <span className="text-error-500">*</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-stone-400">
            <LockIcon />
          </div>
          <input
            id="currentPassword"
            type={showPasswords.current ? 'text' : 'password'}
            value={formData.currentPassword}
            onChange={(e) => handleChange('currentPassword', e.target.value)}
            className={cn(
              'input-base pl-11 pr-11',
              getFieldError(errors, 'currentPassword') && 'input-error'
            )}
            placeholder="Enter current password"
          />
          <button
            type="button"
            onClick={() => togglePasswordVisibility('current')}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-stone-400 hover:text-stone-600"
          >
            {showPasswords.current ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        </div>
        {getFieldError(errors, 'currentPassword') && (
          <p className="mt-2 text-sm text-error-600 flex items-center gap-1.5">
            <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
            {getFieldError(errors, 'currentPassword')}
          </p>
        )}
      </div>

      {/* New Password */}
      <div className="w-full">
        <label
          htmlFor="newPassword"
          className="block text-sm font-medium text-stone-700 mb-2 tracking-snug"
        >
          New Password <span className="text-error-500">*</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-stone-400">
            <LockIcon />
          </div>
          <input
            id="newPassword"
            type={showPasswords.new ? 'text' : 'password'}
            value={formData.newPassword}
            onChange={(e) => handleChange('newPassword', e.target.value)}
            className={cn(
              'input-base pl-11 pr-11',
              getFieldError(errors, 'newPassword') && 'input-error'
            )}
            placeholder="Enter new password"
          />
          <button
            type="button"
            onClick={() => togglePasswordVisibility('new')}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-stone-400 hover:text-stone-600"
          >
            {showPasswords.new ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        </div>
        {getFieldError(errors, 'newPassword') && (
          <p className="mt-2 text-sm text-error-600 flex items-center gap-1.5">
            <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
            {getFieldError(errors, 'newPassword')}
          </p>
        )}
      </div>

      {/* Confirm New Password */}
      <div className="w-full">
        <label
          htmlFor="confirmPassword"
          className="block text-sm font-medium text-stone-700 mb-2 tracking-snug"
        >
          Confirm New Password <span className="text-error-500">*</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-stone-400">
            <LockIcon />
          </div>
          <input
            id="confirmPassword"
            type={showPasswords.confirm ? 'text' : 'password'}
            value={formData.confirmPassword}
            onChange={(e) => handleChange('confirmPassword', e.target.value)}
            className={cn(
              'input-base pl-11 pr-11',
              getFieldError(errors, 'confirmPassword') && 'input-error'
            )}
            placeholder="Confirm new password"
          />
          <button
            type="button"
            onClick={() => togglePasswordVisibility('confirm')}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-stone-400 hover:text-stone-600"
          >
            {showPasswords.confirm ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        </div>
        {getFieldError(errors, 'confirmPassword') && (
          <p className="mt-2 text-sm text-error-600 flex items-center gap-1.5">
            <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
            {getFieldError(errors, 'confirmPassword')}
          </p>
        )}
      </div>

      {/* Password Strength */}
      {formData.newPassword && (
        <PasswordStrength password={formData.newPassword} />
      )}

      {/* Submit Button */}
      <div className="pt-4">
        <Button type="submit" isLoading={isSubmitting}>
          Update Password
        </Button>
      </div>
    </form>
  );
}

// Icons
function LockIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
      <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
      <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M3.28 2.22a.75.75 0 00-1.06 1.06l14.5 14.5a.75.75 0 101.06-1.06l-1.745-1.745a10.029 10.029 0 003.3-4.38 1.651 1.651 0 000-1.185A10.004 10.004 0 009.999 3a9.956 9.956 0 00-4.744 1.194L3.28 2.22zM7.752 6.69l1.092 1.092a2.5 2.5 0 013.374 3.373l1.091 1.092a4 4 0 00-5.557-5.557z" clipRule="evenodd" />
      <path d="M10.748 13.93l2.523 2.523a9.987 9.987 0 01-3.27.547c-4.258 0-7.894-2.66-9.337-6.41a1.651 1.651 0 010-1.186A10.007 10.007 0 012.839 6.02L6.07 9.252a4 4 0 004.678 4.678z" />
    </svg>
  );
}

export { SecurityForm };
export type { SecurityFormProps };
