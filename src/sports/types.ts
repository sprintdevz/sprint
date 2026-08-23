import type { Difficulty, IconName, Intensity } from '@/types/common';
import type { EloEngineConfig } from '@/features/elo/types';

/**
 * The generic sport contract.
 *
 * Every sport ships: metadata, skills (with weights + prerequisites),
 * assessments, drills, benchmarks, progression rules, rating configuration
 * and training rules. Features consume THIS interface — never sport-specific
 * data structures — so soccer/tennis can be added without touching the app.
 *
 * Implementations live in src/sports/<sport>/ and are registered in index.ts.
 */

export type SportId = 'basketball' | 'soccer' | 'tennis';

export interface SportMeta {
  id: SportId;
  name: string;
  /** Short code used in the db (skill_code, focus fields). */
  code: string;
  icon: IconName;
  tagline: string;
  description: string;
  /** Brand colors used on sport-select and hero surfaces. */
  primaryColor: string;
  secondaryColor: string;
  /** Offered trainer positions (e.g. "Point Guard"). */
  positions: string[];
  /** Training locations meaningful for this sport. */
  locations: string[];
}

export interface SportSkill {
  id: string;
  code: string;
  name: string;
  category: 'shooting' | 'ball-handling' | 'finishing' | 'passing' | 'defense' | 'athleticism' | 'mentality';
  description: string;
  /** Importance weight for overall rating 0..1. */
  weight: number;
  /** Skill codes that must be trained first. */
  prerequisites: string[];
  /** Icon used across UI. */
  icon: IconName;
}

export interface AssessmentChallenge {
  skillCode: string;
  title: string;
  description: string;
  /** Attempts available in this challenge. */
  attempts: number;
  /** How each attempt is scored 0..1 (normalized) — raw score → percent. */
  scoreOf: (raw: number) => number;
  /** Rating the "benchmark opponent" for this challenge represents. */
  difficultyRating: number;
  /** Human benchmark text for the result row. */
  benchmarkLabel: string;
}

export interface SportAssessment {
  id: string;
  code: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  minutes: number;
  challenges: SportChallenge[];
  isInitial: boolean;
  premium: boolean;
}

export interface SportChallenge {
  skillCode: string;
  title: string;
  description: string;
  /** How the challenge is counted (reps, seconds, distance). */
  metric: 'reps' | 'seconds' | 'distance';
  /** Attempt count for the challenge. */
  attempts: number;
  /** Score 0..1 scaled by performance across the attempts. */
  performanceOf: (attempts: number[], target?: number) => number;
  /** Benchmark (difficulty rating) for this challenge. */
  difficultyRating: number;
  /** Target achievement text used in results. */
  benchmarkLabel: string;
}

export interface SportDrill {
  id: string;
  code: string;
  name: string;
  description: string;
  category: string;
  skillCode: string;
  intensity: Intensity;
  /** Seconds per set. */
  durationSec: number;
  /** Recommended sets/reps. */
  sets: number;
  reps: number;
  /** Equipment slugs needed. */
  equipment: string[];
  /** Difficulty rating this drill represents (benchmark). */
  difficultyRating: number;
  premium?: boolean;
}

export interface BenchLevel {
  /** Skill code. */
  skillCode: string;
  /** Rating bands keyed by level code. */
  levels: Array<{ code: string; label: string; minRating: number; description: string }>;
  /** Rating → mastery 0..1 mapping for the skill (0..0.2 linear, 0.2..1 log-ish). */
  masteryCurve: (rating: number) => number;
}

export interface SportConfig {
  meta: SportMeta;
  skills: SportSkill[];
  /** Global skill weight = importance across the sport (sums to 1 for balanced sports). */
  skillWeights: Record<string, number>;
  assessments: SportAssessment[];
  drills: SportDrill[];
  benchmarks: BenchLevel[];
  /** Per-skill progression rules: rating floors per mastery stage. */
  progression: Record<string, { stages: Array<{ label: string; minRating: number; color: string }> }>;
  /** Rating engine configuration. */
  rating: Partial<EloEngineConfig>;
  /** Training rules — priorities, rest, session shape. */
  training: {
    minSessionMinutes: number;
    maxSessionMinutes: number;
    defaultSessionMinutes: number;
    challengeCount: number;
    warmupDurationSec: number;
    restBetweenDrillsSec: number;
    /** Skills that are "core" (always available to train). */
    coreSkills: string[];
  };
}