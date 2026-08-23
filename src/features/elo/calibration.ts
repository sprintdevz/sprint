import { clamp } from '@/utils/numbers';
import type { EloEngineConfig, RatingState } from '@/features/elo/types';

/**
 * Calibration — how raw athletic performance becomes a rating.
 *
 * Initial assessment scores (0..1 per skill) map onto a linear rating curve:
 *   rating = initial ± 400 · deviation from median performance
 * A median performer lands exactly on the initial rating (1000).
 */

export function initialRatingState(initial = 1000, initialDeviation = 350): RatingState {
  return {
    rating: initial,
    deviation: initialDeviation,
    games: 0,
    peak: initial,
    updatedAt: new Date().toISOString(),
  };
}

/** Map normalized performance (0..1) to a rating on [initial-400, initial+800]. */
export function ratingPointsForPerformance(performance: number, config: EloEngineConfig): number {
  const p = clamp(performance, 0, 1);
  const spread = 800;
  const points = config.initial - 400 + spread * p;
  return Math.round(clamp(points, config.minRating, config.maxRating));
}

/** Calibrated provisional rating state from a normalized performance score. */
export function provisionalRating(performance: number, config: EloEngineConfig): RatingState {
  const rating = ratingPointsForPerformance(performance, config);
  return {
    rating,
    deviation: Math.round(config.initialDeviation * 0.72),
    games: 1,
    peak: rating,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Combine per-skill calibration scores into an overall estimate.
 * `weights` should sum to 1 (skill weights from the sport config).
 */
export function overallFromSkills(
  scores: Array<{ score: number; weight: number }>,
  config: EloEngineConfig,
): RatingState {
  const totalWeight = scores.reduce((acc, s) => acc + s.weight, 0);
  if (totalWeight <= 0) {
    return initialRatingState(config.initial, config.initialDeviation);
  }
  const weighted = scores.reduce((acc, s) => acc + s.score * s.weight, 0) / totalWeight;
  return provisionalRating(weighted, config);
}