import { clamp } from '@/utils/numbers';
import { expectedScore, updateGlicko, type GlickoResult } from '@/features/elo/glicko';
import type {
  EloEngineConfig,
  MatchResult,
  RatingState,
  SessionPerformance,
} from '@/features/elo/types';

/**
 * The SPRINT rating engine.
 *
 * Design rules enforced here (see docs/elo-system.md):
 *  1. Rating only moves on *demonstrated performance*, never on completion.
 *  2. Sessions are matches vs. a benchmark opponent at the difficulty rating.
 *  3. Uncertainty (RD) drives movement: new athletes move fast, veterans don't.
 *  4. Anti-farm: repeating the same benchmark at the same difficulty is
 *     weighted down, and performing at your expected level yields ~0.
 *  5. Anti-punishment: one bad session can't destroy progress.
 */

export const DEFAULT_ENGINE_CONFIG: EloEngineConfig = {
  initial: 1000,
  initialDeviation: 350,
  minDeviation: 30,
  minRating: 300,
  maxRating: 3000,
  provisionalGames: 6,
  benchmarkDeviation: 85,
};

export interface AppliedRating {
  state: RatingState;
  /** Integer rating change after clamping. */
  delta: number;
  /** Expected score of the performance (0..1). */
  expectation: number;
}

export interface EloSystem {
  config: EloEngineConfig;
  /** Expected score of `rating` vs a benchmark "opponent". */
  expected: (rating: number, opponentRating: number, opponentDeviation?: number) => number;
  /** Apply one head-to-head result (friend challenge). */
  applyResult: (state: RatingState, result: MatchResult) => AppliedRating;
  /** Apply a training session as performance against a benchmark. */
  applySession: (state: RatingState, performance: SessionPerformance) => AppliedRating;
  /** Apply several results in one batch (multi-benchmark assessments). */
  applyBatch: (state: RatingState, results: MatchResult[]) => RatingState;
  isProvisional: (state: RatingState) => boolean;
}

export function createEloSystem(config: EloEngineConfig = DEFAULT_ENGINE_CONFIG): EloSystem {
  const glickoConfig = {
    minDeviation: config.minDeviation,
    maxDeviation: config.initialDeviation,
  };

  const finish = (
    state: RatingState,
    targetRating: number,
    targetDeviation: number,
    expectation: number,
    dampening: number,
  ): AppliedRating => {
    const delta = clamp((targetRating - state.rating) * dampening, -400, 400);
    const rating = clamp(Math.round(state.rating + delta), config.minRating, config.maxRating);
    const finalDelta = rating - state.rating;
    return {
      state: {
        rating,
        deviation: clamp(targetDeviation, config.minDeviation, config.initialDeviation),
        games: state.games + 1,
        peak: Math.max(state.peak, rating),
        updatedAt: new Date().toISOString(),
      },
      delta: finalDelta,
      expectation,
    };
  };

  const expected = (
    rating: number,
    opponentRating: number,
    opponentDeviation: number = config.benchmarkDeviation,
  ): number => expectedScore(rating, opponentRating, opponentDeviation);

  const applyResult = (state: RatingState, result: MatchResult): AppliedRating => {
    const e = expected(state.rating, result.opponentRating, result.opponentDeviation);
    const update = updateGlicko(state.rating, state.deviation, [result], glickoConfig);
    return finish(state, update.rating, update.deviation, e, 1);
  };

  const applySession = (state: RatingState, performance: SessionPerformance): AppliedRating => {
    const e = expected(state.rating, performance.difficultyRating);
    let score = clamp(performance.successRate, 0, 1);

    // Repeat dampening: facing the same benchmark again keeps the direction of
    // the result but shrinks its weight — farming identical content stalls.
    if (performance.repeatCount > 0) {
      const weight = 1 / (1 + 0.3 * performance.repeatCount);
      score = e + (score - e) * weight;
    }

    const result: GlickoResult = {
      opponentRating: performance.difficultyRating,
      opponentDeviation: config.benchmarkDeviation,
      score,
    };
    const update = updateGlicko(state.rating, state.deviation, [result], glickoConfig);

    let dampening = 1;
    if (e > 0.92 && update.rating > state.rating) {
      dampening = 0.35; // farm guard: dominating far-below-level content
    } else if (score < 0.25 && update.rating < state.rating) {
      dampening = 0.7; // anti-punishment: one bad day ≠ lost progress
    }

    return finish(state, update.rating, update.deviation, e, dampening);
  };

  const applyBatch = (state: RatingState, results: MatchResult[]): RatingState => {
    if (results.length === 0) return state;
    const update = updateGlicko(state.rating, state.deviation, results, glickoConfig);
    const rating = clamp(Math.round(update.rating), config.minRating, config.maxRating);
    return {
      rating,
      deviation: clamp(update.deviation, config.minDeviation, config.initialDeviation),
      games: state.games + results.length,
      peak: Math.max(state.peak, rating),
      updatedAt: new Date().toISOString(),
    };
  };

  const isProvisional = (state: RatingState): boolean => state.games < config.provisionalGames;

  return { config, expected, applyResult, applySession, applyBatch, isProvisional };
}