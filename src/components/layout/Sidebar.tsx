'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

const legalLinks = [
  { label: 'Privacy Notice Doctors', href: '#' },
  { label: 'Privacy Notice Patients', href: '#' },
  { label: 'Legal', href: '#' },
  { label: 'Terms of use', href: '#' },
];

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const mainNavItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    label: 'Patient Management',
    href: '/patients',
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    label: 'Learning Center',
    href: '#',
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    label: 'Documents',
    href: '#',
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
        <polyline points="14 2 14 8 20 8" />
      </svg>
    ),
  },
];

const bottomNavItems: NavItem[] = [
  {
    label: 'Settings',
    href: '#',
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
  {
    label: 'Support',
    href: '#',
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

// Helper to get display name based on preference
function getDisplayName(doctor: {
  title?: string;
  firstName: string;
  lastName: string;
  clinicName?: string;
  displayPreference?: 'professional' | 'clinic' | 'both';
}) {
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
}

function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { state, logout } = useAuth();
  const [legalOpen, setLegalOpen] = useState(false);

  return (
    <aside
      className={cn(
        'bg-white border-r border-stone-200 flex flex-col transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo & Toggle */}
      <div className="p-4 border-b border-stone-100">
        <div
          className="relative group cursor-pointer"
          onClick={onToggle}
        >
          {collapsed ? (
            <>
              {/* AU Logo - visible by default */}
              <div className="group-hover:opacity-0 transition-opacity">
                <Image
                  src="/images/Alma Universe Icon copy@4x.png"
                  alt="Alma Universe"
                  width={32}
                  height={32}
                  className="h-8 w-8 object-contain"
                />
              </div>
              {/* Toggle icon - visible on hover */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <svg className="h-5 w-5 text-stone-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <polyline points="13 17 18 12 13 7" />
                  <polyline points="6 17 11 12 6 7" />
                </svg>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-between">
              <Image
                src="/images/Alma Universe logo copy@4x.png"
                alt="Alma Universe"
                width={120}
                height={36}
                className="h-9 w-auto"
              />
              {/* Toggle icon - visible on hover */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <svg className="h-5 w-5 text-stone-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <polyline points="11 17 6 12 11 7" />
                  <polyline points="18 17 13 12 18 7" />
                </svg>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-4">
        {!collapsed && (
          <div className="mb-2 px-3">
            <span className="text-xs font-medium text-stone-400 uppercase tracking-wider">
              Main
            </span>
          </div>
        )}
        <ul className="space-y-1">
          {mainNavItems.map(item => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                    collapsed && 'justify-center px-2',
                    isActive
                      ? 'bg-purple-50 text-purple-700'
                      : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <span className={cn(isActive ? 'text-purple-600' : 'text-stone-400')}>
                    {item.icon}
                  </span>
                  {!collapsed && item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom Navigation */}
      <div className="px-3 py-2 border-t border-stone-100">
        <ul className="space-y-1">
          {bottomNavItems.map(item => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                    collapsed && 'justify-center px-2',
                    isActive
                      ? 'bg-purple-50 text-purple-700'
                      : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <span className={cn(isActive ? 'text-purple-600' : 'text-stone-400')}>
                    {item.icon}
                  </span>
                  {!collapsed && item.label}
                </Link>
              </li>
            );
          })}
          {/* Legal */}
          <li>
            <button
              onClick={() => setLegalOpen(!legalOpen)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                collapsed && 'justify-center px-2',
                legalOpen
                  ? 'bg-purple-50 text-purple-700'
                  : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
              )}
              title={collapsed ? 'Legal' : undefined}
            >
              <span className={cn(legalOpen ? 'text-purple-600' : 'text-stone-400')}>
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
              </span>
              {!collapsed && (
                <>
                  <span className="flex-1 text-left">Legal</span>
                  <svg
                    className={cn('h-4 w-4 transition-transform', legalOpen && 'rotate-180')}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </>
              )}
            </button>
            {/* Legal Submenu */}
            {legalOpen && !collapsed && (
              <ul className="mt-1 ml-8 space-y-1">
                {legalLinks.map(link => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="block px-3 py-2 text-sm text-stone-500 hover:text-stone-900 hover:bg-stone-50 rounded-lg transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </li>
          {/* Logout */}
          <li>
            <button
              onClick={logout}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                collapsed && 'justify-center px-2',
                'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
              )}
              title={collapsed ? 'Logout' : undefined}
            >
              <span className="text-stone-400">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </span>
              {!collapsed && 'Logout'}
            </button>
          </li>
        </ul>
      </div>

      {/* User Profile */}
      {state.doctor && (
        <div className="p-3 border-t border-stone-100">
          <Link
            href="/account"
            className={cn(
              'flex items-center gap-3 p-2 rounded-lg hover:bg-stone-50 transition-colors',
              collapsed && 'justify-center'
            )}
            title={collapsed ? 'My Account' : undefined}
          >
            {/* Avatar */}
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
              <span className="text-sm font-semibold text-purple-700">
                {state.doctor.firstName[0]}{state.doctor.lastName[0]}
              </span>
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-medium text-stone-800 truncate">
                    {getDisplayName(state.doctor)}
                  </p>
                  <svg className="h-4 w-4 text-purple-500 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-xs text-stone-500 truncate">{state.doctor.email}</p>
              </div>
            )}
            {!collapsed && (
              <svg className="h-4 w-4 text-stone-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            )}
          </Link>
        </div>
      )}
    </aside>
  );
}

export { Sidebar };
