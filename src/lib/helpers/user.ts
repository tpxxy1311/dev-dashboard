// src/lib/helpers/user.ts

/**
 * Returns the first word of a display name ("Tim Peters" → "Tim").
 * Falls back to the full (trimmed) name if there is nothing to split.
 */
export const getFirstName = (name: string): string =>
  name.trim().split(/\s+/)[0] || name.trim();
