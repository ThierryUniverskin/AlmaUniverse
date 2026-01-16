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
    <div className="min-h-screen bg-stone-50">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={toggleSidebar}
      />
      {/* Main content with margin for fixed sidebar */}
      <main
        className={`min-h-screen transition-all duration-300 ${
          sidebarCollapsed ? 'ml-16' : 'ml-64'
        }`}
      >
        {children}
      </main>
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
