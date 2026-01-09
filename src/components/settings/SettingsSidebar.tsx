'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface SettingsSection {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: string;
}

const SETTINGS_SECTIONS: SettingsSection[] = [
  {
    id: 'clinic-devices',
    label: 'Clinic Devices',
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </svg>
    ),
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    ),
    badge: 'Soon',
  },
  {
    id: 'integrations',
    label: 'Integrations',
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 16v1a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2" />
        <rect x="8" y="2" width="14" height="14" rx="2" />
      </svg>
    ),
    badge: 'Soon',
  },
];

export interface SettingsSidebarProps {
  activeSection: string;
  onSectionChange: (sectionId: string) => void;
}

export function SettingsSidebar({ activeSection, onSectionChange }: SettingsSidebarProps) {
  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-4">
      <nav className="space-y-1">
        {SETTINGS_SECTIONS.map((section) => {
          const isActive = activeSection === section.id;
          const isDisabled = !!section.badge;

          return (
            <button
              key={section.id}
              onClick={() => !isDisabled && onSectionChange(section.id)}
              disabled={isDisabled}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors',
                isActive
                  ? 'bg-purple-50 text-purple-700'
                  : isDisabled
                    ? 'text-stone-400 cursor-not-allowed'
                    : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
              )}
            >
              <span className={cn(
                isActive ? 'text-purple-600' : isDisabled ? 'text-stone-300' : 'text-stone-400'
              )}>
                {section.icon}
              </span>
              <span className="flex-1 text-sm font-medium">{section.label}</span>
              {section.badge && (
                <span className="px-2 py-0.5 text-[10px] font-medium bg-stone-100 text-stone-500 rounded-full">
                  {section.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
