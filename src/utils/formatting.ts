import { clamp } from '@/utils/numbers';

/** 1358 → "1,358" */
export function formatRating(rating: number): string {
  return Math.round(rating).toLocaleString('en-US');
}

/** +24 / -13 / 0 */
export function formatDelta(delta: number): string {
  if (delta === 0) return '±0';
  return delta > 0 ? `+${Math.round(delta)}` : `${Math.round(delta)}`;
}

/** 25 → "25 MIN" */
export function formatMinutes(minutes: number): string {
  return `${Math.round(minutes)} MIN`;
}

/** 84 → "+84 XP" */
export function formatXp(xp: number): string {
  return `${xp > 0 ? '+' : ''}${Math.round(xp)} XP`;
}

/** 0.74 → "74%" */
export function formatPercent(value: number): string {
  return `${Math.round(clamp(value, 0, 1) * 100)}%`;
}

/** 0..99+ → roman-numeral tier label ("II", "V"). */
export function romanNumerals(num: number): string {
  const values: Array<[number, string]> = [
    [10, 'X'],
    [9, 'IX'],
    [5, 'V'],
    [4, 'IV'],
    [1, 'I'],
  ];
  let n = clamp(num, 1, 10);
  let out = '';
  for (const [value, glyph] of values) {
    while (n >= value) {
      out += glyph;
      n -= value;
    }
  }
  return out;
}

export function pluralize(count: number, singular: string, plural?: string): string {
  return count === 1 ? singular : (plural ?? `${singular}s`);
}

/** "7 day streak" */
export function streakLabel(days: number): string {
  return `${days} DAY ${days === 1 ? 'STREAK' : 'STREAK'}`;
}

export function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] ?? s[v] ?? s[0]!);
}

/** ISO datetime → "Aug 12, 2026" */
export function formatDate(input: string | Date): string {
  const d = typeof input === 'string' ? new Date(input) : input;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/** Seconds → "m:ss" */
export function formatClock(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(s / 60);
  const rest = s % 60;
  return `${m}:${rest.toString().padStart(2, '0')}`;
}