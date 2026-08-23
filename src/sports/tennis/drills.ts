import type { BenchLevel, SportAssessment, SportDrill } from '@/sports/types';
import { tennisSkills } from '@/sports/tennis/skills';

/** Tennis drill library — representative starter set. */
export const tennisDrills: SportDrill[] = [
  {
    id: 'tn-drill-tap', code: 'racket-taps', name: 'Racket Taps',
    description: 'Keep the ball up off the strings — racket head control.',
    category: 'forehand', skillCode: 'forehand', intensity: 'easy', durationSec: 45, sets: 3, reps: 50,
    equipment: ['racket', 'ball'], difficultyRating: 850,
  },
  {
    id: 'tn-drill-serve-steps', code: 'serve-steps', name: 'Serve Motion',
    description: 'Toss, trophy, explode — 20 shadow serves focusing on rhythm.',
    category: 'serve', skillCode: 'serve', intensity: 'medium', durationSec: 30, sets: 4, reps: 20,
    equipment: ['racket'], difficultyRating: 950,
  },
  {
    id: 'tn-drill-basket', code: 'basket-drill', name: 'Basket Drill',
    description: 'Forehand + backhand off a feed — 30 balls into the corners.',
    category: 'forehand', skillCode: 'forehand', intensity: 'high', durationSec: 45, sets: 4, reps: 30,
    equipment: ['racket', 'ball', 'court'], difficultyRating: 1150,
  },
  {
    id: 'tn-drill-split', code: 'split-step', name: 'Split-Step Rally',
    description: 'Split step on every feed, recover to the T after each ball.',
    category: 'footwork', skillCode: 'footwork', intensity: 'high', durationSec: 60, sets: 3, reps: 1,
    equipment: ['court'], difficultyRating: 1050,
  },
  {
    id: 'tn-drill-return', code: 'return-drill', name: 'Return Drill',
    description: '10 returns — deep middle vs the body, mix it up.',
    category: 'return', skillCode: 'return', intensity: 'high', durationSec: 40, sets: 3, reps: 10,
    equipment: ['racket', 'ball', 'court'], difficultyRating: 1200,
  },
];

export const tennisAssessments: SportAssessment[] = [
  {
    id: 'tennis-initial',
    code: 'initial',
    title: 'Initial Assessment',
    description: 'Seven challenges across the core of the game.',
    difficulty: 'beginner',
    minutes: 12,
    isInitial: true,
    premium: false,
    challenges: [
      { skillCode: 'serve', title: 'Serve Accuracy', description: 'Land 5 of 10 first serves in the box.', metric: 'reps', attempts: 10, performanceOf: (a) => a[0]! / 10, difficultyRating: 1000, benchmarkLabel: 'In out of 10' },
      { skillCode: 'forehand', title: 'Forehand Depth', description: '10 forehands — 50% past the service line.', metric: 'reps', attempts: 10, performanceOf: (a) => a[0]! / 10, difficultyRating: 1000, benchmarkLabel: 'Deep out of 10' },
      { skillCode: 'backhand', title: 'Backhand Control', description: '10 cross-court backhands into the side half.', metric: 'reps', attempts: 10, performanceOf: (a) => a[0]! / 10, difficultyRating: 1000, benchmarkLabel: 'In out of 10' },
      { skillCode: 'volleys', title: 'Volley Touch', description: '5 poach volleys — clean winners only.', metric: 'reps', attempts: 5, performanceOf: (a) => a[0]! / 5, difficultyRating: 1000, benchmarkLabel: 'Winners out of 5' },
      { skillCode: 'footwork', title: 'Sprint & Split', description: 'Cover corner to corner in under 6s, clean split on arrival.', metric: 'seconds', attempts: 2, performanceOf: (a) => Math.max(0, Math.min(1, (6 - Math.min(...a)) / 2 + 0.5)), difficultyRating: 1000, benchmarkLabel: 'Best time' },
      { skillCode: 'movement', title: 'Baseline Sprint', description: 'One 40m baseline sprint — 7s is elite.', metric: 'seconds', attempts: 2, performanceOf: (a) => Math.max(0, Math.min(1, (7 - Math.min(...a)) / 2 + 0.5)), difficultyRating: 1000, benchmarkLabel: 'Best time' },
      { skillCode: 'mental', title: 'Pressure Points', description: '4 deuce-point scenarios — execute the pattern.', metric: 'reps', attempts: 4, performanceOf: (a) => a[0]! / 4, difficultyRating: 1000, benchmarkLabel: 'Won out of 4' },
    ],
  },
];

const TENNIS_BANDS = [
  { code: 'beginner', label: 'Rookie', minRating: 0, description: 'Building the base motion.' },
  { code: 'developing', label: 'Developing', minRating: 800, description: 'Consistent in practice.' },
  { code: 'competent', label: 'Competent', minRating: 1000, description: 'Reliable at match pace.' },
  { code: 'proficient', label: 'Proficient', minRating: 1200, description: 'Holds up in live play.' },
  { code: 'advanced', label: 'Advanced', minRating: 1400, description: 'A weapon in most matchups.' },
  { code: 'elite', label: 'Elite', minRating: 1700, description: 'A game-changer.' },
];

const tennisMastery = (r: number): number =>
  Math.max(0, Math.min(1, (r - 600) / 1200));

export const tennisBenchmarks: BenchLevel[] = tennisSkills.map((s) => ({
  skillCode: s.code,
  levels: TENNIS_BANDS.map((b) => ({ ...b })),
  masteryCurve: tennisMastery,
}));