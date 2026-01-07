'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface Tab {
  id: string;
  label: string;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
}

function Tabs({ tabs, activeTab, onChange, className }: TabsProps) {
  return (
    <div className={cn('border-b border-stone-200', className)}>
      <nav className="flex gap-8" aria-label="Tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              'py-3 px-1 text-sm font-medium border-b-2 transition-colors duration-200',
              activeTab === tab.id
                ? 'border-purple-700 text-purple-700'
                : 'border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300'
            )}
            aria-current={activeTab === tab.id ? 'page' : undefined}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
}

export { Tabs };
export type { TabsProps, Tab };
