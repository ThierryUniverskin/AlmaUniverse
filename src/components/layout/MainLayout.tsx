'use client';

import React from 'react';
import { Sidebar } from './Sidebar';
import { LayoutProvider, useLayout } from '@/context/LayoutContext';

interface MainLayoutProps {
  children: React.ReactNode;
}

function MainLayoutContent({ children }: MainLayoutProps) {
  const { sidebarCollapsed, toggleSidebar } = useLayout();

  return (
    <div className="h-screen bg-stone-50 flex">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={toggleSidebar}
      />
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <main
          className="flex-1 overflow-auto"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          <div className="animate-fade-in min-h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

function MainLayout({ children }: MainLayoutProps) {
  return (
    <LayoutProvider>
      <MainLayoutContent>{children}</MainLayoutContent>
    </LayoutProvider>
  );
}

export { MainLayout };
