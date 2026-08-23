import type { SportConfig } from '@/sports/types';
import { tennisMeta } from '@/sports/tennis/config';
import { tennisSkills } from '@/sports/tennis/skills';
import { tennisDrills, tennisAssessments, tennisBenchmarks } from '@/sports/tennis/drills';
import { tennisProgression } from '@/sports/tennis/progression';

export const tennisConfig: SportConfig = {
  meta: tennisMeta,
  skills: tennisSkills,
  skillWeights: Object.fromEntries(tennisSkills.map((s) => [s.code, s.weight])),
  assessments: tennisAssessments,
  drills: tennisDrills,
  benchmarks: tennisBenchmarks,
  progression: tennisProgression,
  rating: {},
  training: {
    minSessionMinutes: 15,
    maxSessionMinutes: 60,
    defaultSessionMinutes: 25,
    challengeCount: 3,
    warmupDurationSec: 300,
    restBetweenDrillsSec: 30,
    coreSkills: ['serve', 'forehand', 'backhand'],
  },
};

export * from '@/sports/tennis/config';
export * from '@/sports/tennis/skills';
export * from '@/sports/tennis/drills';
export * from '@/sports/tennis/progression';