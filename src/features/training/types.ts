import type { Difficulty, Intensity } from '@/types/common';

/** Inputs the trainer uses to design a session. */
export interface TrainingInput {
  sport: string;
  position: string | null;
  goal: string | null;
  /** skillCode → rating. */
  skillRatings: Record<string, number>;
  /** skillCode → recent attempts (anti-repetition). */
  recentSessions: Array<{ skillCode: string; playedAt: string }>;
  /** Equipped gear slugs. */
  equipment: string[];
  location: string | null;
  availableMinutes: number;
  weeklyFrequency: number;
  injuries: string[];
  difficulty: Difficulty;
  /** Number of sessions completed this week. */
  sessionsThisWeek: number;
  /** Session generation seed for determinism. */
  seed?: number;
}

/** One game-like block in a session. */
export interface TrainingChallenge {
  id: string;
  kind: 'challenge' | 'drill';
  skillCode: string;
  title: string;
  description: string;
  metric: 'reps' | 'seconds' | 'distance';
  attempts: number;
  /** Target achieved count (challenges) or duration (drills). */
  target: number;
  targetUnit: string;
  difficultyRating: number;
  intensity: Intensity;
  durationSec: number;
  equipment: string[];
  xp: number;
  reason: string;
}

export interface SessionPlan {
  focusSkillCode: string;
  focusReason: string;
  difficulty: Difficulty;
  totalMinutes: number;
  blocks: TrainingChallenge[];
  /** Anti-duplicate token — server validates single submission. */
  planToken: string;
  generatedAt: string;
}

export interface SessionSubmission {
  sessionId: string;
  token: string;
  /** challengeId → achieved. */
  results: Record<string, number>;
  xp: number;
  completedAt: string;
}

export interface SessionResultData {
  xp: number;
  eloBefore: number;
  eloAfter: number;
  delta: number;
  personalBests: Array<{ skillCode: string; label: string; before: number; after: number }>;
  perfect: boolean;
}