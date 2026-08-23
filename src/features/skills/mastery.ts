import { getSport } from '@/sports';
import { clamp } from '@/utils/numbers';

/** Mastery 0..1 from the sport's mastery curve. */
export function masteryFor(sportId: string, skillCode: string, rating: number): number {
  const sport = getSport(sportId);
  const bench = sport.benchmarks.find((b) => b.skillCode === skillCode);
  const curve = bench?.masteryCurve;
  return clamp(curve ? curve(rating) : rating / 2000, 0, 1);
}

export function masteryStage(sportId: string, skillCode: string, rating: number): {
  label: string;
  color: string;
} {
  const sport = getSport(sportId);
  const stages = sport.progression[skillCode]?.stages ?? [];
  const stage = [...stages].reverse().find((s) => rating >= s.minRating);
  return stage ?? { label: 'Foundation', color: '#8B99B8' };
}

/** Short human label: "74% mastered". */
export function masteryLabel(mastery: number): string {
  return `${Math.round(clamp(mastery, 0, 1) * 100)}%`;
}