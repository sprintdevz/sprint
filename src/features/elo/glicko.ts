import { clamp } from '@/utils/numbers';

/**
 * Glicko-1 implementation (pure functions, zero I/O).
 *
 * SPRINT uses Glicko-1 rather than plain ELO because it models *uncertainty*
 * (rating deviation, RD):
 *  - New athletes have RD = 350 → results move the rating a lot.
 *  - Tested athletes have RD → 30 → only strong performances move the needle.
 *  - The same result against an opponent with high RD tells us less.
 *
 * The engine treats every training performance as a match against a
 * "benchmark opponent" whose rating is the difficulty of the drill.
 */

const Q = Math.LN10 / 400;
const PI_SQ = Math.PI * Math.PI;

/** g(RD): how much an opponent's uncertainty dampens expectation. */
export function gReduction(rd: number): number {
  return 1 / Math.sqrt(1 + (3 * Q * Q * rd * rd) / PI_SQ);
}

/** Expected score (0..1) of `rating` against one opponent. */
export function expectedScore(
  rating: number,
  opponentRating: number,
  opponentDeviation: number,
): number {
  const g = gReduction(opponentDeviation);
  const exponent = (-g * (rating - opponentRating)) / 400;
  return 1 / (1 + Math.pow(10, exponent));
}

export interface GlickoResult {
  /** Opponent (benchmark / peer) rating. */
  opponentRating: number;
  /** Opponent rating deviation. */
  opponentDeviation: number;
  /** Actual score 0..1 — wins, losses, draws and continuous performance. */
  score: number;
}

export interface GlickoUpdate {
  rating: number;
  deviation: number;
  delta: number;
}

export interface GlickoConfig {
  /** Floor for rating deviation. */
  minDeviation: number;
  /** Upper bound for rating deviation (usually the initial deviation). */
  maxDeviation: number;
}

const DEFAULT_CONFIG: GlickoConfig = { minDeviation: 30, maxDeviation: 350 };

/**
 * Apply a batch of results (1..n opponents) to a rating state and return the
 * updated rating + deviation. Mirrors the canonical Glicko-1 algorithm.
 */
export function updateGlicko(
  rating: number,
  deviation: number,
  results: GlickoResult[],
  config: GlickoConfig = DEFAULT_CONFIG,
): GlickoUpdate {
  const count = results.length;
  if (count === 0) {
    return { rating, deviation, delta: 0 };
  }

  const gs = results.map((r) => gReduction(r.opponentDeviation));
  const expectations = results.map((r, i) =>
    expectedScore(rating, r.opponentRating, r.opponentDeviation),
  );

  // d² — the "certainty" provided by this round of games.
  let dSqSum = 0;
  for (let i = 0; i < count; i++) {
    const e = expectations[i]!;
    dSqSum += gs[i]! * gs[i]! * e * (1 - e);
  }
  const dSq = 1 / (Q * Q * (dSqSum || Number.EPSILON));

  // Rating update:  R' = R + (q / (1/RD² + 1/d²)) · Σ g(RDj)(S − E)
  let diffSum = 0;
  for (let i = 0; i < count; i++) {
    diffSum += gs[i]! * (results[i]!.score - expectations[i]!);
  }
  const ratingDelta = (Q / (1 / (deviation * deviation) + 1 / dSq)) * diffSum;

  // Deviation update: RD' = sqrt(1 / (1/RD² + 1/d²))
  const newDeviation = Math.sqrt(1 / (1 / (deviation * deviation) + 1 / dSq));

  return {
    rating: rating + ratingDelta,
    deviation: clampGlicko(newDeviation, config),
    delta: ratingDelta,
  };
}

function clampGlicko(deviation: number, config: GlickoConfig): number {
  return Math.min(config.maxDeviation, Math.max(config.minDeviation, deviation));
}