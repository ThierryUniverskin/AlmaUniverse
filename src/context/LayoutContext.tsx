'use client';

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect, useRef } from 'react';

// Sidebar widths in pixels (must match Tailwind classes in Sidebar.tsx)
const SIDEBAR_WIDTH_EXPANDED = 256; // w-64
const SIDEBAR_WIDTH_COLLAPSED = 64;  // w-16

// Tablet breakpoints
const TABLET_MIN_WIDTH = 768;
const TABLET_MAX_WIDTH = 1023;

interface LayoutContextType {
  sidebarCollapsed: boolean;
  sidebarWidth: number;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  isTablet: boolean;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const hasUserToggled = useRef(false);
  const initialCheckDone = useRef(false);

  // Tablet detection and auto-collapse
  useEffect(() => {
    const checkTablet = () => {
      const width = window.innerWidth;
      const tablet = width >= TABLET_MIN_WIDTH && width <= TABLET_MAX_WIDTH;
      setIsTablet(tablet);

      // Auto-collapse on tablets (only on initial load, before user interaction)
      if (!initialCheckDone.current) {
        initialCheckDone.current = true;
        if (tablet) {
          setSidebarCollapsed(true);
        }
      }
    };

    checkTablet();
    window.addEventListener('resize', checkTablet);
    return () => window.removeEventListener('resize', checkTablet);
  }, []);

  const sidebarWidth = sidebarCollapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED;

  const toggleSidebar = useCallback(() => {
    hasUserToggled.current = true;
    setSidebarCollapsed((prev) => !prev);
  }, []);

  const value = useMemo(
    () => ({
      sidebarCollapsed,
      sidebarWidth,
      toggleSidebar,
      setSidebarCollapsed,
      isTablet,
    }),
    [sidebarCollapsed, sidebarWidth, toggleSidebar, isTablet]
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
