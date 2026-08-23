import { clamp } from '@/utils/numbers';
import type { SessionPlan } from '@/features/training/types';
import { createEloSystem } from '@/features/elo/engine';

/**
 * Training math.
 * - XP = participation (separate from ELO = ability).
 * - ELOPreview estimates the rating change a session would earn, so the
 *   "expected +N ELO" on a session card is honest, not decorative.
 */

export function sessionXp(plan: SessionPlan, results: Record<string, number>): number {
  let xp = 0;
  for (const block of plan.blocks) {
    const achieved = results[block.id] ?? 0;
    const ratio = block.target > 0 ? achieved / block.target : 0;
    if (ratio >= 1) xp += block.xp + 8;
    else if (ratio >= 0.75) xp += block.xp;
    else if (ratio >= 0.4) xp += Math.round(block.xp * 0.6);
  }
  // Perfect-session bonus.
  const allPassed = plan.blocks.every((b) => (results[b.id] ?? 0) >= b.target);
  if (allPassed) xp += 25;
  return xp;
}

/** Weighted success rate across a plan (0..1) — feeds the ELO engine. */
export function planSuccessRate(plan: SessionPlan, results: Record<string, number>): number {
  if (plan.blocks.length === 0) return 0;
  let sum = 0;
  for (const block of plan.blocks) {
    const achieved = results[block.id] ?? 0;
    sum += clamp(block.target > 0 ? achieved / block.target : 0, 0, 1);
  }
  return sum / plan.blocks.length;
}

/** Preview rating delta for the plan given predicted/actual results. */
export function estimateEloDelta(
  currentRating: number,
  plan: SessionPlan,
  successRate: number,
  repeatCount = 0,
): { delta: number; expectation: number } {
  const elo = createEloSystem();
  const difficulty = averageDifficulty(plan);
  const applied = elo.applySession(
    { rating: currentRating, deviation: 60, games: 10, peak: currentRating, updatedAt: new Date().toISOString() },
    { difficultyRating: difficulty, successRate, repeatCount },
  );
  return { delta: applied.delta, expectation: applied.expectation };
}

export function averageDifficulty(plan: SessionPlan): number {
  if (plan.blocks.length === 0) return 1000;
  return Math.round(
    plan.blocks.reduce((acc, b) => acc + b.difficultyRating, 0) / plan.blocks.length,
  );
}

/** Estimated minutes of training logged. */
export function planMinutes(plan: SessionPlan): number {
  return plan.totalMinutes;
}