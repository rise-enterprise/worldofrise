/**
 * Input sanitization utilities for CSV imports and user data
 */

/** Remove control characters and CSV injection prefixes from text */
export function sanitizeTextField(
  text: string | null | undefined,
  maxLength: number = 500
): string | null {
  if (!text) return null;

  return text
    .trim()
    .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
    .replace(/^[=+\-@]/, '')          // Remove CSV injection chars at start
    .substring(0, maxLength);
}

/** Validate email format, return sanitized email or null */
export function validateEmail(
  email: string | null | undefined
): string | null {
  if (!email) return null;
  const trimmed = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(trimmed) ? trimmed : null;
}

/** Validate phone number format, return trimmed phone or null */
export function validatePhone(
  phone: string | null | undefined
): string | null {
  if (!phone) return null;
  const trimmed = phone.trim();
  // Remove common formatting characters for validation
  const cleaned = trimmed.replace(/[\s\-\(\)\.]/g, '');
  // Allow digits with optional + prefix, 5-20 chars
  return /^\+?[0-9]{5,20}$/.test(cleaned) ? trimmed : null;
}
