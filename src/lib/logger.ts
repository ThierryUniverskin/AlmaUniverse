/**
 * Environment-aware logger that only outputs in development mode.
 * Prevents sensitive information from leaking in production logs.
 */

const isDev = process.env.NODE_ENV === 'development';

export const logger = {
  log: (...args: unknown[]) => {
    if (isDev) {
      console.log(...args);
    }
  },
  warn: (...args: unknown[]) => {
    if (isDev) {
      console.warn(...args);
    }
  },
  error: (...args: unknown[]) => {
    // Errors are always logged but sanitized in production
    if (isDev) {
      console.error(...args);
    } else {
      // In production, log a generic error without sensitive details
      console.error('[Error]', args[0] instanceof Error ? args[0].message : 'An error occurred');
    }
  },
  debug: (...args: unknown[]) => {
    if (isDev) {
      console.log('[DEBUG]', ...args);
    }
  },
};
