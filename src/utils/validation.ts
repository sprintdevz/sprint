/** Generic validation helpers shared across features. */

export const USERNAME_REGEX = /^[a-zA-Z0-9_.]{3,20}$/;

export function isValidUsername(value: string): boolean {
  return USERNAME_REGEX.test(value.trim());
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

/** Password policy: min 8 chars, at least one letter and one number. */
export function passwordStrength(value: string): number {
  let score = 0;
  if (value.length >= 8) score += 1;
  if (value.length >= 12) score += 1;
  if (/[A-Z]/.test(value)) score += 1;
  if (/[0-9]/.test(value)) score += 1;
  if (/[^A-Za-z0-9]/.test(value)) score += 1;
  return score;
}

export function isStrongPassword(value: string): boolean {
  return value.length >= 8 && /[A-Za-z]/.test(value) && /[0-9]/.test(value);
}

export function parseHeightCm(value: string): number | null {
  const n = Number.parseFloat(value);
  if (!Number.isFinite(n)) return null;
  return Math.round(clampNumber(n, 100, 250));
}

export function parseWeightKg(value: string): number | null {
  const n = Number.parseFloat(value);
  if (!Number.isFinite(n)) return null;
  return Math.round(clampNumber(n, 30, 200));
}

function clampNumber(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}