import type { SportAssessment } from '@/sports/types';

/** One challenge result inside an assessment. */
export interface ChallengeResult {
  challengeIndex: number;
  skillCode: string;
  /** Normalized performance 0..1. */
  performance: number;
  /** Human benchmark text (target label). */
  benchmarkText: string;
  /** Raw value captured (makes, seconds…). */
  raw: number;
}

/** Result of running a full assessment. */
export interface AssessmentResult {
  assessment: SportAssessment;
  /** skillCode → normalized score 0..1. */
  skillScores: Record<string, number>;
  /** Weighted overall 0..1. */
  overallScore: number;
  /** skillCode → provisional rating. */
  skillRatings: Record<string, number>;
  overallRating: number;
  strongestSkill: string | null;
  biggestOpportunity: string | null;
  results: ChallengeResult[];
  completedAt: string;
}

export interface AssessmentAttempt {
  id: string;
  assessmentId: string;
  status: 'in_progress' | 'completed' | 'abandoned';
  score: number;
  startedAt: string;
  completedAt: string | null;
}

export type AssessmentFlowStatus = 'idle' | 'running' | 'review' | 'done';