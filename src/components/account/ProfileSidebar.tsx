'use client';

import React, { useState } from 'react';
import { Doctor } from '@/types';
import { COUNTRY_OPTIONS, LANGUAGE_OPTIONS } from '@/lib/constants';

interface ProfileSidebarProps {
  doctor: Doctor;
}

function ProfileSidebar({ doctor }: ProfileSidebarProps) {
  const [copied, setCopied] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const countryLabel = COUNTRY_OPTIONS.find((c) => c.value === doctor.country)?.label;
  const languageLabel = LANGUAGE_OPTIONS.find((l) => l.value === doctor.language)?.label;

  // Format phone for display
  const formatPhone = (phone?: { countryCode: string; number: string }) => {
    if (!phone?.number) return null;
    return `${phone.countryCode} ${phone.number}`;
  };

  const questionnaireFullUrl = doctor.questionnaireUrl
    ? `https://skinxs.com/diag/${doctor.questionnaireUrl}`
    : null;

  const handleCopyUrl = async () => {
    if (questionnaireFullUrl) {
      await navigator.clipboard.writeText(questionnaireFullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Get initials
  const initials = `${doctor.firstName?.[0] || ''}${doctor.lastName?.[0] || ''}`.toUpperCase();

  // Get display name based on preference
  const getDisplayName = () => {
    const professionalName = `${doctor.title || ''} ${doctor.firstName} ${doctor.lastName}`.trim();
    const clinicName = doctor.clinicName;

    switch (doctor.displayPreference) {
      case 'clinic':
        return clinicName || professionalName;
      case 'both':
        return clinicName ? `${professionalName} - ${clinicName}` : professionalName;
      case 'professional':
      default:
        return professionalName;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-6">
      {/* Avatar and Name */}
      <div className="flex flex-col items-center text-center mb-6">
        <div className="h-24 w-24 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white text-2xl font-semibold mb-4">
          {initials}
        </div>
        <h2 className="text-lg font-semibold text-stone-900 text-center px-2">
          {getDisplayName()}
        </h2>
      </div>

      {/* Wellness Assessment Link */}
      {questionnaireFullUrl && (
        <div className="mb-6">
          <div className="flex items-center justify-center gap-1.5 mb-2">
            <p className="text-xs text-stone-400">
              Wellness Assessment Link
            </p>
            <div className="relative">
              <button
                type="button"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                onClick={() => setShowTooltip(!showTooltip)}
                className="text-stone-400 hover:text-stone-600 transition-colors"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
                </svg>
              </button>
              {showTooltip && (
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-56 p-3 bg-stone-800 text-white text-xs rounded-lg shadow-lg z-10">
                  <p>Share this link with your patients. They can complete an AI-powered wellness assessment before their visit.</p>
                  <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-stone-800" />
                </div>
              )}
            </div>
          </div>
          <button
            onClick={handleCopyUrl}
            className="w-full flex items-center justify-between gap-2 px-4 py-2.5 bg-stone-50 rounded-xl border border-stone-200 hover:bg-stone-100 transition-colors"
          >
            <span className="text-sm text-stone-600 truncate">
              {questionnaireFullUrl.replace('https://', '')}
            </span>
            {copied ? (
              <svg className="w-5 h-5 text-success-500 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-stone-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path d="M7 3.5A1.5 1.5 0 018.5 2h3.879a1.5 1.5 0 011.06.44l3.122 3.12A1.5 1.5 0 0117 6.622V12.5a1.5 1.5 0 01-1.5 1.5h-1v-3.379a3 3 0 00-.879-2.121L10.5 5.379A3 3 0 008.379 4.5H7v-1z" />
                <path d="M4.5 6A1.5 1.5 0 003 7.5v9A1.5 1.5 0 004.5 18h7a1.5 1.5 0 001.5-1.5v-5.879a1.5 1.5 0 00-.44-1.06L9.44 6.439A1.5 1.5 0 008.378 6H4.5z" />
              </svg>
            )}
          </button>
        </div>
      )}

      {/* Info Grid */}
      <div className="border-t border-stone-100 pt-6 space-y-4">
        {countryLabel && (
          <InfoRow icon={<LocationIcon />} label="From" value={countryLabel} />
        )}
        {languageLabel && (
          <InfoRow icon={<LanguageIcon />} label="Language" value={languageLabel} />
        )}
        {formatPhone(doctor.personalMobile) && (
          <InfoRow icon={<PhoneIcon />} label="Mobile" value={formatPhone(doctor.personalMobile)!} />
        )}
        <InfoRow icon={<EmailIcon />} label="Email" value={doctor.email} />
        {doctor.personalWebsite && (
          <InfoRow
            icon={<WebsiteIcon />}
            label="Website"
            value={doctor.personalWebsite}
            isLink
          />
        )}
      </div>
    </div>
  );
}

interface InfoRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  isLink?: boolean;
}

function InfoRow({ icon, label, value, isLink }: InfoRowProps) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-stone-400 mt-0.5">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-stone-400">{label}</p>
        {isLink ? (
          <a
            href={`https://${value}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-purple-600 hover:text-purple-700 truncate block"
          >
            {value}
          </a>
        ) : (
          <p className="text-sm text-stone-700 truncate">{value}</p>
        )}
      </div>
    </div>
  );
}

// Icons
function LocationIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.976.544l.062.029.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" clipRule="evenodd" />
    </svg>
  );
}

function LanguageIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
      <path d="M7.75 2.75a.75.75 0 00-1.5 0v1.258a32.987 32.987 0 00-3.599.278.75.75 0 10.198 1.487A31.545 31.545 0 018.7 5.545 19.381 19.381 0 017 9.56a19.418 19.418 0 01-1.002-2.05.75.75 0 00-1.384.577 20.935 20.935 0 001.492 2.91 19.613 19.613 0 01-3.828 4.154.75.75 0 10.945 1.164A21.116 21.116 0 007 12.331c.095.132.192.262.29.391a.75.75 0 001.194-.91c-.204-.266-.4-.538-.59-.815a20.888 20.888 0 002.333-5.332c.31.031.618.068.924.108a.75.75 0 00.198-1.487 32.832 32.832 0 00-3.599-.278V2.75z" />
      <path fillRule="evenodd" d="M13 8a.75.75 0 01.671.415l4.25 8.5a.75.75 0 11-1.342.67L15.787 16h-5.573l-.793 1.585a.75.75 0 11-1.342-.67l4.25-8.5A.75.75 0 0113 8zm2.037 6.5L13 10.427 10.964 14.5h4.073z" clipRule="evenodd" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M2 3.5A1.5 1.5 0 013.5 2h1.148a1.5 1.5 0 011.465 1.175l.716 3.223a1.5 1.5 0 01-1.052 1.767l-.933.267c-.41.117-.643.555-.48.95a11.542 11.542 0 006.254 6.254c.395.163.833-.07.95-.48l.267-.933a1.5 1.5 0 011.767-1.052l3.223.716A1.5 1.5 0 0118 15.352V16.5a1.5 1.5 0 01-1.5 1.5H15c-1.149 0-2.263-.15-3.326-.43A13.022 13.022 0 012.43 8.326 13.019 13.019 0 012 5V3.5z" clipRule="evenodd" />
    </svg>
  );
}

function EmailIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
      <path d="M3 4a2 2 0 00-2 2v1.161l8.441 4.221a1.25 1.25 0 001.118 0L19 7.162V6a2 2 0 00-2-2H3z" />
      <path d="M19 8.839l-7.77 3.885a2.75 2.75 0 01-2.46 0L1 8.839V14a2 2 0 002 2h14a2 2 0 002-2V8.839z" />
    </svg>
  );
}

function WebsiteIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
      <path d="M10 1a9 9 0 100 18 9 9 0 000-18zM4.804 6.102a7.5 7.5 0 0110.392 0A5.989 5.989 0 0010 4c-1.827 0-3.474.82-4.572 2.102l-.624-.001zM2.63 9.25a7.458 7.458 0 00-.13 1.25H4c0-1.358.147-2.683.428-3.951a7.498 7.498 0 00-1.797 2.701zM10 16a5.989 5.989 0 005.196-3.002 7.5 7.5 0 01-10.392 0A5.989 5.989 0 0010 16zm5.572-4.898A5.965 5.965 0 0016 9.25h1.5c0-.431-.044-.852-.13-1.25a7.498 7.498 0 00-1.797-2.701c.28 1.268.427 2.593.427 3.951H16a5.987 5.987 0 01-.428 1.852zM10 18.5c-.431 0-.852-.044-1.25-.13a7.5 7.5 0 002.5 0 5.972 5.972 0 01-1.25.13z" />
    </svg>
  );
}

export { ProfileSidebar };
export type { ProfileSidebarProps };
