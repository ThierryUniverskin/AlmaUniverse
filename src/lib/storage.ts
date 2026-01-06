import { STORAGE_KEYS, SEED_PATIENTS } from './constants';
import { Patient, AuthState } from '@/types';

// SSR-safe check for localStorage
function isClient(): boolean {
  return typeof window !== 'undefined';
}

// Generic get from localStorage
export function getFromStorage<T>(key: string): T | null {
  if (!isClient()) return null;

  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error(`Error reading from localStorage key "${key}":`, error);
    return null;
  }
}

// Generic set to localStorage
export function setToStorage<T>(key: string, value: T): void {
  if (!isClient()) return;

  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing to localStorage key "${key}":`, error);
  }
}

// Remove from localStorage
export function removeFromStorage(key: string): void {
  if (!isClient()) return;

  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing localStorage key "${key}":`, error);
  }
}

// Auth-specific storage functions
export function getAuthState(): AuthState | null {
  return getFromStorage<AuthState>(STORAGE_KEYS.AUTH);
}

export function setAuthState(state: AuthState): void {
  setToStorage(STORAGE_KEYS.AUTH, state);
}

export function clearAuthState(): void {
  removeFromStorage(STORAGE_KEYS.AUTH);
}

// Patient-specific storage functions
export function getPatients(): Patient[] {
  const patients = getFromStorage<Patient[]>(STORAGE_KEYS.PATIENTS);
  return patients || [];
}

export function setPatients(patients: Patient[]): void {
  setToStorage(STORAGE_KEYS.PATIENTS, patients);
}

// Initialize with seed data if no patients exist
export function initializePatients(): Patient[] {
  if (!isClient()) return [];

  const existing = getPatients();
  if (existing.length === 0) {
    setPatients(SEED_PATIENTS);
    return SEED_PATIENTS;
  }
  return existing;
}
