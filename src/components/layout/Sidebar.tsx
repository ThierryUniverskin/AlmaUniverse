'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: (
      <svg
        className="h-[18px] w-[18px]"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="3" width="7" height="9" rx="1.5" />
        <rect x="14" y="3" width="7" height="5" rx="1.5" />
        <rect x="14" y="12" width="7" height="9" rx="1.5" />
        <rect x="3" y="16" width="7" height="5" rx="1.5" />
      </svg>
    ),
  },
  {
    label: 'Patients',
    href: '/patients',
    icon: (
      <svg
        className="h-[18px] w-[18px]"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
];

function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white/50 border-r border-stone-200/40 flex flex-col">
      {/* Navigation */}
      <nav className="flex-1 px-4 py-6">
        <div className="mb-3 px-3">
          <span className="text-2xs font-semibold text-stone-400 uppercase tracking-widest">
            Navigation
          </span>
        </div>
        <ul className="space-y-1">
          {navItems.map(item => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium',
                    'transition-all duration-250 ease-smooth',
                    isActive
                      ? 'bg-sage-50 text-sage-700 shadow-sm'
                      : 'text-stone-600 hover:bg-stone-100/60 hover:text-stone-800'
                  )}
                >
                  <span className={cn(
                    'transition-colors duration-250',
                    isActive ? 'text-sage-600' : 'text-stone-400 group-hover:text-stone-500'
                  )}>
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-5 border-t border-stone-200/40">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-sage-50 flex items-center justify-center">
            <svg
              className="h-4 w-4 text-sage-500"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4" />
              <path d="M12 8h.01" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-medium text-stone-600">Alma Universe</p>
            <p className="text-2xs text-stone-400">Version 1.0.0</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

export { Sidebar };
