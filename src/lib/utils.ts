import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Validates a person's name entered on account creation / profile update.
 * Returns an i18n message key when invalid, or null when valid.
 * Rules: non-empty, contains at least one letter, and contains no digits.
 */
export function validatePersonName(
  value: string,
): "nameRequired" | "nameNoNumbers" | null {
  const trimmed = value.trim();
  if (!/\p{L}/u.test(trimmed)) return "nameRequired";
  if (/\d/u.test(trimmed)) return "nameNoNumbers";
  return null;
}
