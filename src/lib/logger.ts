/**
 * Environment-aware logging utility
 * Only logs to console in development mode
 */

const isDev = import.meta.env.DEV;

export const logger = {
  error: (message: string, error?: unknown) => {
    if (isDev) {
      console.error(message, error);
    }
    // In production, errors could be sent to an error tracking service
    // e.g., Sentry, LogRocket, etc.
  },
  
  warn: (message: string, data?: unknown) => {
    if (isDev) {
      console.warn(message, data);
    }
  },
  
  info: (message: string, data?: unknown) => {
    if (isDev) {
      console.info(message, data);
    }
  },
  
  log: (message: string, data?: unknown) => {
    if (isDev) {
      console.log(message, data);
    }
  },
};

/**
 * Get a safe error message suitable for user display
 * Strips potentially sensitive details
 */
export const getSafeErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    // Only return the first part of the message, avoid stack traces
    const message = error.message.split('\n')[0];
    // Remove any potential database/schema info
    if (message.includes('relation') || message.includes('column') || message.includes('schema')) {
      return 'A database error occurred';
    }
    return message;
  }
  return 'An error occurred';
};
