/**
 * Sanitize utility functions for data validation and cleaning
 */

export const sanitizeString = (input: unknown): string | null => {
  if (typeof input !== "string") return null;
  return input.trim() || null;
};

export const sanitizeEmail = (input: unknown): string | null => {
  const sanitized = sanitizeString(input);
  if (!sanitized) return null;
  return sanitized.toLowerCase();
};

export const sanitizePhoneNumber = (input: unknown): string | null => {
  const sanitized = sanitizeString(input);
  if (!sanitized) return null;
  return sanitized.replace(/\D/g, "");
};

export const sanitizeObject = <T extends Record<string, unknown>>(
  obj: T,
): Partial<T> => {
  const sanitized: Partial<T> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== null && value !== undefined) {
      sanitized[key as keyof T] = value as T[keyof T];
    }
  }
  return sanitized;
};
