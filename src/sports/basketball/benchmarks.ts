import { clamp } from '@/utils/numbers';
import type { BenchLevel } from '@/sports/types';

/**
 * Basketball benchmarks.
 * Each skill has rating bands describing what an athlete can do at that
 * level — the benchmark text shown in results comes from these bands.
 */

const SKILL_CODES = [
  'shooting',
  'handling',
  'finishing',
  'passing',
  'defense',
  'speed',
  'agility',
  'explosiveness',
  'reaction',
  'decision',
] as const;

const BANDS: Array<{ code: string; label: string; minRating: number; description: string }> = [
  { code: 'beginner', label: 'Rookie', minRating: 0, description: 'Building the base motion.' },
  { code: 'developing', label: 'Developing', minRating: 800, description: 'Consistent in practice, shaky under pressure.' },
  { code: 'competent', label: 'Competent', minRating: 1000, description: 'Reliable at practice pace; game pace next.' },
  { code: 'proficient', label: 'Proficient', minRating: 1200, description: 'Holds up in live play most nights.' },
  { code: 'advanced', label: 'Advanced', minRating: 1400, description: 'A weapon in most matchups.' },
  { code: 'elite', label: 'Elite', minRating: 1700, description: 'A game-changer when it matters.' },
];

/** S-curve mastery: 700 → ~0, 1000 → ~0.35, 1300 → ~0.7, 1700+ → ~1. */
export function basketballMasteryCurve(rating: number): number {
  return clamp((1 / (1 + Math.exp(-(rating - 1150) / 260))) * 1.06 - 0.03, 0, 1);
}

export const basketballBenchmarks: BenchLevel[] = SKILL_CODES.map((skillCode) => ({
  skillCode,
  levels: BANDS.map((b) => ({ ...b })),
  masteryCurve: basketballMasteryCurve,
}));

export function benchmarkBandFor(skillCode: string, rating: number): {
  label: string;
  description: string;
} {
  const bench = basketballBenchmarks.find((b) => b.skillCode === skillCode);
  const bands = bench?.levels ?? BANDS;
  const band = [...bands].reverse().find((b) => rating >= b.minRating) ?? bands[0]!;
  return { label: band.label, description: band.description };
}