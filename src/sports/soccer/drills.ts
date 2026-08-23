import type { SportAssessment, SportDrill, BenchLevel } from '@/sports/types';

/** Soccer drill library — representative starter set. */
export const soccerDrills: SportDrill[] = [
  {
    id: 'sc-drill-wall-touch', code: 'wall-touch', name: 'Wall Touch Mastery',
    description: '100 one-touch passes against the wall, alternating feet.',
    category: 'touch', skillCode: 'touch', intensity: 'medium', durationSec: 60, sets: 3, reps: 100,
    equipment: ['ball', 'wall'], difficultyRating: 950,
  },
  {
    id: 'sc-drill-cone-dribble', code: 'cone-dribble', name: 'Cone Dribble Slalom',
    description: 'Slalom through 8 cones either foot, no touches over 60cm.',
    category: 'dribbling', skillCode: 'dribbling', intensity: 'high', durationSec: 30, sets: 5, reps: 1,
    equipment: ['ball', 'cones'], difficultyRating: 1100,
  },
  {
    id: 'sc-drill-rondo', code: 'rondo-touch', name: 'Rondo Touch',
    description: '3v1 rondo — two-touch maximum, protect the ball.',
    category: 'passing', skillCode: 'passing', intensity: 'high', durationSec: 90, sets: 3, reps: 1,
    equipment: ['ball', 'cones'], difficultyRating: 1250,
  },
  {
    id: 'sc-drill-finish-box', code: 'box-finishing', name: 'Box Finishing',
    description: '10 cutbacks and one-touch finishes inside the box.',
    category: 'finishing', skillCode: 'finishing', intensity: 'high', durationSec: 30, sets: 3, reps: 10,
    equipment: ['ball', 'goal'], difficultyRating: 1200,
  },
  {
    id: 'sc-drill-chase-back', code: 'chase-back', name: 'Chase-Back Sprint',
    description: 'Recovery sprint 25m with a 90° turn — repeat 4x.',
    category: 'sprint', skillCode: 'sprint', intensity: 'high', durationSec: 20, sets: 4, reps: 1,
    equipment: ['cones'], difficultyRating: 1000,
  },
];

export const soccerAssessments: SportAssessment[] = [
  {
    id: 'soccer-initial',
    code: 'initial',
    title: 'Initial Assessment',
    description: 'Seven challenges across the core of the game.',
    difficulty: 'beginner',
    minutes: 12,
    isInitial: true,
    premium: false,
    challenges: [
      { skillCode: 'touch', title: 'Chest & Trap', description: '10 traps clean from a lofted feed.', metric: 'reps', attempts: 10, performanceOf: (a) => a[0]! / 10, difficultyRating: 1000, benchmarkLabel: 'Clean traps' },
      { skillCode: 'dribbling', title: 'Slalom', description: 'Cone slalom in under 12s.', metric: 'seconds', attempts: 2, performanceOf: (a) => Math.max(0, Math.min(1, (12 - Math.min(...a)) / 4)), difficultyRating: 1000, benchmarkLabel: 'Best time' },
      { skillCode: 'passing', title: 'Pass Accuracy', description: '10 passes into a 1m target at 12m.', metric: 'reps', attempts: 10, performanceOf: (a) => a[0]! / 10, difficultyRating: 1000, benchmarkLabel: 'Hits out of 10' },
      { skillCode: 'finishing', title: 'One-Touch Finishing', description: 'Convert 5 of 8 one-time chances.', metric: 'reps', attempts: 8, performanceOf: (a) => a[0]! / 8, difficultyRating: 1000, benchmarkLabel: 'Goals out of 8' },
      { skillCode: 'shooting', title: 'Power Shot', description: '3 shots — fastest ball speed recorded.', metric: 'seconds', attempts: 3, performanceOf: () => 0.7, difficultyRating: 1000, benchmarkLabel: 'Rating' },
      { skillCode: 'tackling', title: 'Defensive Recovery', description: '4 recovery tackles executed cleanly.', metric: 'reps', attempts: 4, performanceOf: (a) => a[0]! / 4, difficultyRating: 1000, benchmarkLabel: 'Clean tackles' },
      { skillCode: 'sprint', title: 'Sprint 30m', description: 'One 30m sprint — 5s is elite.', metric: 'seconds', attempts: 2, performanceOf: (a) => Math.max(0, Math.min(1, (5 - Math.min(...a)) / 2 + 0.5)), difficultyRating: 1000, benchmarkLabel: 'Best time' },
    ],
  },
];

const SOCCER_BANDS = [
  { code: 'beginner', label: 'Rookie', minRating: 0, description: 'Building the base motion.' },
  { code: 'developing', label: 'Developing', minRating: 800, description: 'Consistent in practice.' },
  { code: 'competent', label: 'Competent', minRating: 1000, description: 'Reliable at game pace.' },
  { code: 'proficient', label: 'Proficient', minRating: 1200, description: 'Holds up in live play.' },
  { code: 'advanced', label: 'Advanced', minRating: 1400, description: 'A weapon in most matchups.' },
  { code: 'elite', label: 'Elite', minRating: 1700, description: 'A game-changer.' },
];

const SOCCER_SKILLS = ['touch', 'dribbling', 'passing', 'finishing', 'shooting', 'aerials', 'tackling', 'sprint', 'endurance', 'vision'];

/** Linear mastery curve — conservative until more data exists. */
const soccerMasteryCurve = (rating: number): number =>
  Math.max(0, Math.min(1, (rating - 600) / 1200));

export const soccerBenchmarks: BenchLevel[] = SOCCER_SKILLS.map((skillCode) => ({
  skillCode,
  levels: SOCCER_BANDS.map((b) => ({ ...b })),
  masteryCurve: soccerMasteryCurve,
}));