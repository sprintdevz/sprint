import type { SportConfig } from '@/sports/types';
import { soccerMeta } from '@/sports/soccer/config';
import { soccerSkills } from '@/sports/soccer/skills';
import { soccerDrills, soccerAssessments, soccerBenchmarks } from '@/sports/soccer/drills';
import { soccerProgression } from '@/sports/soccer/progression';

export const soccerConfig: SportConfig = {
  meta: soccerMeta,
  skills: soccerSkills,
  skillWeights: Object.fromEntries(soccerSkills.map((s) => [s.code, s.weight])),
  assessments: soccerAssessments,
  drills: soccerDrills,
  benchmarks: soccerBenchmarks,
  progression: soccerProgression,
  rating: {},
  training: {
    minSessionMinutes: 15,
    maxSessionMinutes: 60,
    defaultSessionMinutes: 25,
    challengeCount: 3,
    warmupDurationSec: 300,
    restBetweenDrillsSec: 30,
    coreSkills: ['touch', 'passing', 'finishing'],
  },
};

export * from '@/sports/soccer/config';
export * from '@/sports/soccer/skills';
export * from '@/sports/soccer/drills';
export * from '@/sports/soccer/progression';