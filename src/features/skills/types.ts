import type { AthleteSkillSummary } from '@/features/athlete/types';

/** Full skill detail view. */
export interface SkillDetail {
  summary: AthleteSkillSummary;
  description: string;
  category: string;
  prerequisites: string[];
  benchmark: { label: string; description: string };
  progressionStage: { label: string; color: string };
  recentHistory: Array<{ occurredAt: string; delta: number; ratingAfter: number }>;
}

export interface SkillGraphEdge {
  from: string;
  to: string;
}