import { clamp } from '@/utils/numbers';
import type { ChallengeResult } from '@/features/assessment/types';

/** Average of challenge performances, weighted per-skill when one skill appears twice. */
export function scorePerSkill(
  results: ChallengeResult[],
): Record<string, number> {
  const perSkill: Record<string, number[]> = {};
  for (const r of results) {
    (perSkill[r.skillCode] ??= []).push(r.performance);
  }
  const out: Record<string, number> = {};
  for (const [code, values] of Object.entries(perSkill)) {
    out[code] = values.reduce((a, b) => a + b, 0) / values.length;
  }
  return out;
}

/** Weighted overall (weights from the sport config). */
export function weightedOverall(
  skillScores: Record<string, number>,
  weights: Record<string, number>,
): number {
  let sum = 0;
  let total = 0;
  for (const [code, score] of Object.entries(skillScores)) {
    const w = weights[code] ?? 0.1;
    sum += clamp(score, 0, 1) * w;
    total += w;
  }
  return total > 0 ? clamp(sum / total, 0, 1) : 0.5;
}

/** Normalized performance from raw attempt values. */
export function performanceFromRaw(
  values: number[],
  metric: 'reps' | 'seconds' | 'distance',
  target?: number,
): number {
  if (values.length === 0) return 0;
  if (metric === 'reps') {
    return clamp(values[0]! / (target ?? 10), 0, 1);
  }
  if (metric === 'distance') {
    const best = Math.max(...values);
    return clamp(best / (target ?? 2), 0, 1);
  }
  // seconds — lower is better
  const best = Math.min(...values);
  return clamp((target ?? 10) / best, 0, 1);
}