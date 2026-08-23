import type { RatingState } from '@/features/elo/types';

/** Aggregated athlete view consumed by screens. */
export interface AthleteOverview {
  athlete: {
    id: string;
    sport: string;
    position: string | null;
    goal: string | null;
    experienceLevel: string | null;
    trainingFrequency: number | null;
  };
  overall: RatingState | null;
  sportRating: RatingState | null;
  skills: AthleteSkillSummary[];
  streak: { current: number; longest: number; lastActive: string | null } | null;
  weeklySessionsCompleted: number;
  xpTotal: number;
}

export interface AthleteSkillSummary {
  skillCode: string;
  name: string;
  rating: number;
  deviation: number;
  mastery: number;
  trend: number;
  attempts: number;
  personalBest: number;
}

/** Result of analyzing the athlete's state — answers "what holds me back?". */
export interface WeaknessAnalysis {
  biggestGapSkill: string | null;
  biggestGap: number | null;
  weightedWeakest: string | null;
  opportunities: Array<{ skillCode: string; name: string; gap: number }>;
  insight: string;
}