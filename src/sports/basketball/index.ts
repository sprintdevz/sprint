import type { SportConfig } from '@/sports/types';
import { basketballMeta } from '@/sports/basketball/config';
import { basketballSkills } from '@/sports/basketball/skills';
import { basketballAssessments } from '@/sports/basketball/assessments';
import { basketballDrills } from '@/sports/basketball/drills';
import { basketballBenchmarks } from '@/sports/basketball/benchmarks';
import { basketballProgression } from '@/sports/basketball/progression';

export const basketballConfig: SportConfig = {
  meta: basketballMeta,
  skills: basketballSkills,
  skillWeights: Object.fromEntries(basketballSkills.map((s) => [s.code, s.weight])),
  assessments: basketballAssessments,
  drills: basketballDrills,
  benchmarks: basketballBenchmarks,
  progression: basketballProgression,
  rating: {},
  training: {
    minSessionMinutes: 15,
    maxSessionMinutes: 60,
    defaultSessionMinutes: 25,
    challengeCount: 3,
    warmupDurationSec: 300,
    restBetweenDrillsSec: 30,
    coreSkills: ['shooting', 'handling', 'finishing'],
  },
};

export * from '@/sports/basketball/config';
export * from '@/sports/basketball/skills';
export * from '@/sports/basketball/assessments';
export * from '@/sports/basketball/drills';
export * from '@/sports/basketball/benchmarks';
export * from '@/sports/basketball/progression';