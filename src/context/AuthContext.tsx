'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AuthState, Doctor, LoginCredentials, DoctorProfileFormData, PasswordChangeFormData } from '@/types';
import { DbDoctor } from '@/types/database';
import { getSupabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';

interface AuthContextValue {
  state: AuthState;
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateDoctor: (updates: Partial<DoctorProfileFormData>) => Promise<{ success: boolean; error?: string }>;
  changePassword: (data: PasswordChangeFormData) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const initialState: AuthState = {
  isAuthenticated: false,
  doctor: null,
  isLoading: true,
  accessToken: null,
};

// Convert database row to app Doctor type
function dbToDoctor(row: DbDoctor): Doctor {
  return {
    id: row.id,
    email: row.email,
    title: row.title ?? undefined,
    firstName: row.first_name,
    lastName: row.last_name,
    clinicName: row.clinic_name ?? undefined,
    displayPreference: row.display_preference ?? undefined,
    country: row.country ?? undefined,
    language: row.language ?? undefined,
    personalMobile: row.personal_mobile ?? undefined,
    officePhone: row.office_phone ?? undefined,
    personalWebsite: row.personal_website ?? undefined,
    questionnaireUrl: row.questionnaire_url ?? undefined,
    medicalLicenseNumber: row.medical_license_number ?? undefined,
    specialization: row.specialization ?? undefined,
    bio: row.bio ?? undefined,
    education: row.education ?? undefined,
    officeAddress: row.office_address ?? undefined,
    updatedAt: row.updated_at,
  };
}

// Convert app DoctorProfileFormData to database update format
function doctorToDbUpdate(data: Partial<DoctorProfileFormData>): Record<string, unknown> {
  const updates: Record<string, unknown> = {};

  if (data.title !== undefined) updates.title = data.title || null;
  if (data.firstName !== undefined) updates.first_name = data.firstName;
  if (data.lastName !== undefined) updates.last_name = data.lastName;
  if (data.clinicName !== undefined) updates.clinic_name = data.clinicName || null;
  if (data.displayPreference !== undefined) updates.display_preference = data.displayPreference || null;
  if (data.country !== undefined) updates.country = data.country || null;
  if (data.language !== undefined) updates.language = data.language || null;
  if (data.personalMobile !== undefined) updates.personal_mobile = data.personalMobile || null;
  if (data.officePhone !== undefined) updates.office_phone = data.officePhone || null;
  if (data.personalWebsite !== undefined) updates.personal_website = data.personalWebsite || null;
  if (data.questionnaireUrl !== undefined) updates.questionnaire_url = data.questionnaireUrl || null;
  if (data.medicalLicenseNumber !== undefined) updates.medical_license_number = data.medicalLicenseNumber || null;
  if (data.specialization !== undefined) updates.specialization = data.specialization || null;
  if (data.bio !== undefined) updates.bio = data.bio || null;
  if (data.education !== undefined) updates.education = data.education || null;
  if (data.officeAddress !== undefined) updates.office_address = data.officeAddress || null;

  return updates;
}

// Module-level guard for auth initialization
let authInitPromise: Promise<void> | null = null;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>(initialState);

  // Load auth state from Supabase session on mount
  useEffect(() => {
    const supabase = getSupabase();
    let isMounted = true;

    // Get initial session - read from localStorage directly to avoid getSession() hanging
    const initAuth = async () => {
      logger.debug('[Auth] Starting init...');

      try {
        // Check localStorage for existing session
        const storageKey = `sb-${new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).hostname.split('.')[0]}-auth-token`;
        const storedSession = localStorage.getItem(storageKey);
        logger.debug('[Auth] Stored session:', storedSession ? 'found' : 'none');

        if (!storedSession) {
          logger.debug('[Auth] No stored session, setting unauthenticated');
          setState({
            isAuthenticated: false,
            doctor: null,
            isLoading: false,
            accessToken: null,
          });
          return;
        }

        // Parse the stored session
        let sessionData;
        try {
          sessionData = JSON.parse(storedSession);
        } catch {
          logger.debug('[Auth] Invalid session data, clearing');
          localStorage.removeItem(storageKey);
          setState({
            isAuthenticated: false,
            doctor: null,
            isLoading: false,
            accessToken: null,
          });
          return;
        }

        const userId = sessionData?.user?.id;
        if (!userId) {
          logger.debug('[Auth] No user ID in session');
          setState({
            isAuthenticated: false,
            doctor: null,
            isLoading: false,
            accessToken: null,
          });
          return;
        }

        if (!isMounted) return;

        // Fetch doctor profile using direct fetch (bypass Supabase client which hangs)
        logger.debug('[Auth] Fetching doctor profile for user:', userId);
        const accessToken = sessionData?.access_token;
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;

        const response = await fetch(
          `${supabaseUrl}/rest/v1/doctors?id=eq.${userId}&select=*`,
          {
            headers: {
              'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          }
        );

        const doctors = await response.json();
        const doctor = doctors?.[0] || null;
        const error = response.ok ? null : { message: 'Failed to fetch doctor' };
        logger.debug('[Auth] Doctor profile result:', doctor ? 'found' : 'not found', error);

        if (!isMounted) return;

        if (doctor && !error) {
          logger.debug('[Auth] Setting authenticated state');
          setState({
            isAuthenticated: true,
            doctor: dbToDoctor(doctor),
            isLoading: false,
            accessToken: accessToken || null,
          });
        } else {
          logger.debug('[Auth] No doctor profile or error, setting unauthenticated');
          // Clear invalid session
          localStorage.removeItem(storageKey);
          setState({
            isAuthenticated: false,
            doctor: null,
            isLoading: false,
            accessToken: null,
          });
        }
      } catch (error) {
        logger.error('[Auth] Init error:', error);
        if (isMounted) {
          setState({
            isAuthenticated: false,
            doctor: null,
            isLoading: false,
            accessToken: null,
          });
        }
      }
    };

    // Use promise deduplication - if init is already running, wait for it
    if (!authInitPromise) {
      authInitPromise = initAuth();
    }
    authInitPromise.then(() => {
      // Reset for next mount cycle (e.g., after logout and re-login)
      authInitPromise = null;
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        // Fetch doctor profile on sign in
        const { data: doctor } = await supabase
          .from('doctors')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (doctor) {
          setState({
            isAuthenticated: true,
            doctor: dbToDoctor(doctor),
            isLoading: false,
            accessToken: session.access_token || null,
          });
        }
      } else if (event === 'SIGNED_OUT') {
        setState({
          isAuthenticated: false,
          doctor: null,
          isLoading: false,
          accessToken: null,
        });
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Login function - use direct API call to avoid Supabase client hanging
  const login = useCallback(
    async (credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> => {
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

        // Call Supabase auth API directly
        const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
          method: 'POST',
          headers: {
            'apikey': supabaseKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: credentials.email,
            password: credentials.password,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          return { success: false, error: data.error_description || data.msg || 'Login failed' };
        }

        // Store the session in localStorage
        const storageKey = `sb-${new URL(supabaseUrl).hostname.split('.')[0]}-auth-token`;
        localStorage.setItem(storageKey, JSON.stringify(data));

        // Fetch doctor profile
        const userId = data.user?.id;
        if (userId) {
          const profileResponse = await fetch(
            `${supabaseUrl}/rest/v1/doctors?id=eq.${userId}&select=*`,
            {
              headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${data.access_token}`,
                'Content-Type': 'application/json',
              },
            }
          );

          const doctors = await profileResponse.json();
          const doctor = doctors?.[0];

          if (doctor) {
            setState({
              isAuthenticated: true,
              doctor: dbToDoctor(doctor),
              isLoading: false,
              accessToken: data.access_token || null,
            });
          }
        }

        return { success: true };
      } catch (err) {
        logger.error('Login error:', err);
        return { success: false, error: 'Login failed' };
      }
    },
    []
  );

  // Logout function - clear localStorage directly to avoid Supabase client hanging
  const logout = useCallback(() => {
    try {
      const storageKey = `sb-${new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).hostname.split('.')[0]}-auth-token`;
      localStorage.removeItem(storageKey);
    } catch (error) {
      logger.error('Logout error:', error);
    }
    setState({
      isAuthenticated: false,
      doctor: null,
      isLoading: false,
      accessToken: null,
    });
  }, []);

  // Update doctor profile - use direct fetch to avoid Supabase client issues
  const updateDoctor = useCallback(
    async (updates: Partial<DoctorProfileFormData>): Promise<{ success: boolean; error?: string }> => {
      if (!state.doctor) {
        return { success: false, error: 'Not authenticated' };
      }

      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const storageKey = `sb-${new URL(supabaseUrl).hostname.split('.')[0]}-auth-token`;
        const storedSession = localStorage.getItem(storageKey);
        const sessionData = storedSession ? JSON.parse(storedSession) : null;
        const accessToken = sessionData?.access_token;

        if (!accessToken) {
          return { success: false, error: 'Not authenticated' };
        }

        const dbUpdates = doctorToDbUpdate(updates);

        const response = await fetch(
          `${supabaseUrl}/rest/v1/doctors?id=eq.${state.doctor.id}`,
          {
            method: 'PATCH',
            headers: {
              'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=representation',
            },
            body: JSON.stringify(dbUpdates),
          }
        );

        if (!response.ok) {
          const error = await response.json();
          return { success: false, error: error.message || 'Failed to update profile' };
        }

        const data = await response.json();
        if (data?.[0]) {
          setState(prev => ({
            ...prev,
            doctor: dbToDoctor(data[0]),
          }));
        }

        return { success: true };
      } catch (err) {
        logger.error('Update doctor error:', err);
        return { success: false, error: 'Failed to update profile' };
      }
    },
    [state.doctor]
  );

  // Change password - use direct API calls to avoid Supabase client issues
  const changePassword = useCallback(
    async (formData: PasswordChangeFormData): Promise<{ success: boolean; error?: string }> => {
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
        const storageKey = `sb-${new URL(supabaseUrl).hostname.split('.')[0]}-auth-token`;
        const storedSession = localStorage.getItem(storageKey);
        const sessionData = storedSession ? JSON.parse(storedSession) : null;

        if (!sessionData?.user?.email || !sessionData?.access_token) {
          return { success: false, error: 'Not authenticated' };
        }

        // Verify current password by attempting to sign in
        const verifyResponse = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
          method: 'POST',
          headers: {
            'apikey': supabaseKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: sessionData.user.email,
            password: formData.currentPassword,
          }),
        });

        if (!verifyResponse.ok) {
          return { success: false, error: 'Current password is incorrect' };
        }

        // Update password
        const updateResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
          method: 'PUT',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${sessionData.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            password: formData.newPassword,
          }),
        });

        if (!updateResponse.ok) {
          const error = await updateResponse.json();
          return { success: false, error: error.message || 'Failed to update password' };
        }

        return { success: true };
      } catch (err) {
        logger.error('Change password error:', err);
        return { success: false, error: 'Failed to change password' };
      }
    },
    []
  );

  return (
    <AuthContext.Provider value={{ state, login, logout, updateDoctor, changePassword }}>
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
