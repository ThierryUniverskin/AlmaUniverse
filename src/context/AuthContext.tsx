'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AuthState, Doctor, LoginCredentials } from '@/types';
import { DEMO_CREDENTIALS, DEMO_DOCTOR, STORAGE_KEYS } from '@/lib/constants';
import { getFromStorage, setToStorage, removeFromStorage } from '@/lib/storage';

interface AuthContextValue {
  state: AuthState;
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const initialState: AuthState = {
  isAuthenticated: false,
  doctor: null,
  isLoading: true,
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>(initialState);

  // Load auth state from localStorage on mount
  useEffect(() => {
    const stored = getFromStorage<{ isAuthenticated: boolean; doctor: Doctor }>(STORAGE_KEYS.AUTH);

    if (stored && stored.isAuthenticated && stored.doctor) {
      setState({
        isAuthenticated: true,
        doctor: stored.doctor,
        isLoading: false,
      });
    } else {
      setState({
        isAuthenticated: false,
        doctor: null,
        isLoading: false,
      });
    }
  }, []);

  // Login function
  const login = useCallback(
    async (credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> => {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Check against demo credentials
      if (
        credentials.email === DEMO_CREDENTIALS.email &&
        credentials.password === DEMO_CREDENTIALS.password
      ) {
        const authData = {
          isAuthenticated: true,
          doctor: DEMO_DOCTOR,
        };

        setToStorage(STORAGE_KEYS.AUTH, authData);

        setState({
          isAuthenticated: true,
          doctor: DEMO_DOCTOR,
          isLoading: false,
        });

        return { success: true };
      }

      return { success: false, error: 'Invalid email or password' };
    },
    []
  );

  // Logout function
  const logout = useCallback(() => {
    removeFromStorage(STORAGE_KEYS.AUTH);
    setState({
      isAuthenticated: false,
      doctor: null,
      isLoading: false,
    });
  }, []);

  return (
    <AuthContext.Provider value={{ state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
