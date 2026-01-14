'use client';

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

// Sidebar widths in pixels (must match Tailwind classes in Sidebar.tsx)
const SIDEBAR_WIDTH_EXPANDED = 256; // w-64
const SIDEBAR_WIDTH_COLLAPSED = 64;  // w-16

interface LayoutContextType {
  sidebarCollapsed: boolean;
  sidebarWidth: number;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const sidebarWidth = sidebarCollapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED;

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed((prev) => !prev);
  }, []);

  const value = useMemo(
    () => ({
      sidebarCollapsed,
      sidebarWidth,
      toggleSidebar,
      setSidebarCollapsed,
    }),
    [sidebarCollapsed, sidebarWidth, toggleSidebar]
  );

  return <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>;
}

export function useLayout() {
  const context = useContext(LayoutContext);
  if (context === undefined) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
}

// Hook for modals to get the sidebar offset for centering
export function useSidebarOffset() {
  const context = useContext(LayoutContext);
  // Return 0 if not within provider (e.g., modals outside dashboard)
  return context?.sidebarWidth ?? 0;
}
