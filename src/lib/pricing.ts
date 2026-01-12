/**
 * Pricing utilities for treatment pricing
 * Handles currency formatting, price calculations, and conversions
 */

import { COUNTRY_CURRENCY_MAP } from './constants';

export interface CurrencyConfig {
  code: string;
  symbol: string;
  position: 'prefix' | 'suffix';
}

// Default currency config (USD)
const DEFAULT_CURRENCY: CurrencyConfig = { code: 'USD', symbol: '$', position: 'prefix' };

/**
 * Get currency configuration for a country code
 * @param countryCode - ISO country code (e.g., 'US', 'FR')
 * @returns Currency config with symbol and position
 */
export function getCurrencyConfig(countryCode: string | undefined | null): CurrencyConfig {
  if (!countryCode || !COUNTRY_CURRENCY_MAP[countryCode]) {
    return DEFAULT_CURRENCY;
  }
  return COUNTRY_CURRENCY_MAP[countryCode];
}

/**
 * Format price from cents to display string
 * @param cents - Price in cents (e.g., 35000 for $350)
 * @param countryCode - ISO country code for currency formatting
 * @returns Formatted price string (e.g., "$350" or "350€")
 */
export function formatPrice(cents: number | null | undefined, countryCode?: string | null): string {
  if (cents === null || cents === undefined) {
    return '—';
  }

  const config = getCurrencyConfig(countryCode);
  const dollars = Math.round(cents / 100);

  // Format number with thousand separators for large amounts
  const formatted = dollars.toLocaleString('en-US');

  return config.position === 'prefix'
    ? `${config.symbol}${formatted}`
    : `${formatted}${config.symbol}`;
}

/**
 * Format price with session calculation
 * @param pricePerSessionCents - Price per session in cents
 * @param sessionCount - Number of sessions (null = 1)
 * @param countryCode - ISO country code for currency formatting
 * @returns Formatted string like "$300/session" or "$300/session × 3 = $900"
 */
export function formatPriceWithSessions(
  pricePerSessionCents: number | null | undefined,
  sessionCount: number | null,
  countryCode?: string | null
): string {
  if (pricePerSessionCents === null || pricePerSessionCents === undefined) {
    return '—';
  }

  const priceStr = formatPrice(pricePerSessionCents, countryCode);
  const effectiveSessionCount = sessionCount || 1;

  if (effectiveSessionCount === 1) {
    return `${priceStr}/session`;
  }

  const totalCents = pricePerSessionCents * effectiveSessionCount;
  const totalStr = formatPrice(totalCents, countryCode);

  return `${priceStr}/session × ${effectiveSessionCount} = ${totalStr}`;
}

/**
 * Calculate total price for a treatment
 * @param pricePerSessionCents - Price per session in cents
 * @param sessionCount - Number of sessions (null = 1)
 * @returns Total price in cents
 */
export function calculateTotalPrice(
  pricePerSessionCents: number | null | undefined,
  sessionCount: number | null
): number {
  if (pricePerSessionCents === null || pricePerSessionCents === undefined) {
    return 0;
  }

  const effectiveSessionCount = sessionCount || 1;
  return pricePerSessionCents * effectiveSessionCount;
}

/**
 * Parse price input string to cents
 * Handles various formats: "350", "$350", "350€", "3,500", etc.
 * @param input - User input string
 * @returns Price in cents, or null if invalid
 */
export function parsePriceToCents(input: string): number | null {
  if (!input || typeof input !== 'string') {
    return null;
  }

  // Remove currency symbols, whitespace, and common separators
  const cleaned = input
    .replace(/[$€£¥₹R]/g, '')
    .replace(/\s/g, '')
    .trim();

  if (!cleaned) {
    return null;
  }

  // Handle European format (comma as decimal separator)
  // If there's a comma followed by exactly 2 digits at end, treat as decimal
  let normalized = cleaned;
  if (/,\d{2}$/.test(cleaned)) {
    normalized = cleaned.replace(',', '.');
  } else {
    // Otherwise, remove commas (thousand separators)
    normalized = cleaned.replace(/,/g, '');
  }

  const value = parseFloat(normalized);

  if (isNaN(value) || value < 0) {
    return null;
  }

  // Convert to cents (round to avoid floating point issues)
  return Math.round(value * 100);
}

/**
 * Format cents to editable input value (dollars/euros)
 * @param cents - Price in cents
 * @returns String value for input field (e.g., "350")
 */
export function centsToInputValue(cents: number | null | undefined): string {
  if (cents === null || cents === undefined) {
    return '';
  }

  const dollars = cents / 100;

  // If it's a whole number, show without decimals
  if (dollars === Math.floor(dollars)) {
    return dollars.toString();
  }

  // Otherwise show 2 decimal places
  return dollars.toFixed(2);
}

/**
 * Get the currency symbol for a country
 * @param countryCode - ISO country code
 * @returns Currency symbol (e.g., "$", "€")
 */
export function getCurrencySymbol(countryCode?: string | null): string {
  const config = getCurrencyConfig(countryCode);
  return config.symbol;
}

/**
 * Default price in cents for EBD devices ($350)
 */
export const DEFAULT_EBD_PRICE_CENTS = 35000;

/**
 * Default price in cents for custom procedures ($250)
 */
export const DEFAULT_PROCEDURE_PRICE_CENTS = 25000;
