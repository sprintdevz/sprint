/** Date utilities — all date math is done in local time unless an ISO string is given. */

export const DAY_MS = 86_400_000;
export const HOUR_MS = 3_600_000;
export const MINUTE_MS = 60_000;

export function startOfDay(date: Date = new Date()): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function endOfDay(date: Date = new Date()): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

/** ISO date (yyyy-mm-dd) for today or an offset in days. */
export function dateKey(offsetDays = 0, base: Date = new Date()): string {
  const d = new Date(base);
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * MINUTE_MS);
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function daysBetween(a: Date, b: Date): number {
  return Math.round((startOfDay(b).getTime() - startOfDay(a).getTime()) / DAY_MS);
}

export function daysAgo(date: Date): number {
  return daysBetween(date, new Date());
}

/** True when no calendar day was skipped (consecutive-day streak logic). */
export function isConsecutiveDay(lastActive: string, now: Date = new Date()): boolean {
  const last = new Date(`${lastActive}T00:00:00Z`);
  const diff = daysBetween(last, now);
  return diff <= 1;
}

export function formatRelativeDay(date: Date | string, now: Date = new Date()): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const diff = daysBetween(d, now);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  if (diff < 7) return `${diff} days ago`;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function remainingDays(date: Date): number {
  return Math.max(0, Math.ceil((date.getTime() - Date.now()) / DAY_MS));
}