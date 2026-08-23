/** Core rating types shared by the ELO engine and every feature that consumes ratings. */

export interface RatingState {
  rating: number;
  /** Glicko rating deviation — uncertainty. New athletes start high (350). */
  deviation: number;
  /** Number of rated events (games) that contributed to this rating. */
  games: number;
  /** All-time high rating for this scope. */
  peak: number;
  /** ISO timestamp of the last update. */
  updatedAt: string;
}

/** One head-to-head result (used for friend challenges). */
export interface MatchResult {
  opponentRating: number;
  opponentDeviation: number;
  /** 1 = win, 0.5 = draw, 0 = loss. */
  score: number;
}

/**
 * A training session viewed as a performance against a benchmark.
 * The rating system must NEVER reward simply completing an activity —
 * `successRate` is the demonstrated ability, `difficultyRating` the bar.
 */
export interface SessionPerformance {
  /** Rating the benchmark(s) represent. */
  difficultyRating: number;
  /** Demonstrated performance 0..1 (e.g. weighted achieved/target). */
  successRate: number;
  /** How many times this exact benchmark/difficulty pair was faced recently (anti-farm). */
  repeatCount: number;
}

export interface EloEngineConfig {
  initial: number;
  initialDeviation: number;
  minDeviation: number;
  minRating: number;
  maxRating: number;
  /** Games before a rating stops being provisional. */
  provisionalGames: number;
  /** Uncertainty of a benchmark "opponent". */
  benchmarkDeviation: number;
}

export type EloEventType = 'session' | 'assessment' | 'challenge' | 'calibration';

export interface RatingEvent {
  type: EloEventType;
  scope: 'overall' | 'sport' | 'skill';
  focus: string | null;
  ratingBefore: number;
  ratingAfter: number;
  delta: number;
  occurredAt: string;
}