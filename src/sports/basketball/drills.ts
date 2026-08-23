import type { SportDrill } from '@/sports/types';

/**
 * Basketball drill library.
 * Each drill maps to a skill and carries a difficultyRating that the ELO
 * engine uses as the benchmark "opponent" for the drill.
 */
export const basketballDrills: SportDrill[] = [
  // ── Shooting ──
  {
    id: 'bb-drill-form-shooting', code: 'form-focus', name: 'Form Shooting',
    description: 'One hand, perfect arc, set mechanic — 10 makes from the paint.',
    category: 'shooting', skillCode: 'shooting', intensity: 'easy', durationSec: 30, sets: 4, reps: 10,
    equipment: ['basketball', 'hoop'], difficultyRating: 900,
  },
  {
    id: 'bb-drill-free-throws', code: 'free-throw-ladder', name: 'Free Throw Ladder',
    description: 'Rack of 5, step off the line after every make, zero misses in a row of 10.',
    category: 'shooting', skillCode: 'shooting', intensity: 'medium', durationSec: 20, sets: 3, reps: 10,
    equipment: ['basketball', 'hoop'], difficultyRating: 1050,
  },
  {
    id: 'bb-drill-spot-up', code: 'spot-up-volume', name: 'Spot-Up Volume',
    description: 'Catch and shoot 25 threes from above the break at game speed.',
    category: 'shooting', skillCode: 'shooting', intensity: 'medium', durationSec: 25, sets: 5, reps: 5,
    equipment: ['basketball', 'hoop', 'cones'], difficultyRating: 1200,
  },
  {
    id: 'bb-drill-off-dribble', code: 'off-dribble-pullup', name: 'Off-Dribble Pull-Up',
    description: 'One or two dribbles into a pull-up from the elbow — no wasted motion.',
    category: 'shooting', skillCode: 'shooting', intensity: 'high', durationSec: 30, sets: 4, reps: 8,
    equipment: ['basketball', 'hoop'], difficultyRating: 1300,
  },
  {
    id: 'bb-drill-double-move-shooting', code: 'double-move-shooting', name: 'Double-Move Shooting',
    description: 'Hesitation, crossover, pull-up — repeat from three spots.',
    category: 'shooting', skillCode: 'shooting', intensity: 'high', durationSec: 30, sets: 4, reps: 8,
    equipment: ['basketball', 'hoop', 'cones'], difficultyRating: 1400,
  },
  {
    id: 'bb-drill-pressure-shooting', code: 'pressure-shooting', name: 'Pressure Shooting',
    description: 'Simulated game pace — 10 catch-and-shoots in 90 seconds, must hit 7.',
    category: 'shooting', skillCode: 'shooting', intensity: 'high', durationSec: 90, sets: 2, reps: 10,
    equipment: ['basketball', 'hoop'], difficultyRating: 1550,
  },

  // ── Ball handling ──
  {
    id: 'bb-drill-static-crossover', code: 'static-crossover', name: 'Static Crossover',
    description: 'Low, hard, quick crossovers in a stationary stance — eyes up.',
    category: 'ball-handling', skillCode: 'handling', intensity: 'easy', durationSec: 60, sets: 3, reps: 30,
    equipment: ['basketball'], difficultyRating: 850,
  },
  {
    id: 'bb-drill-two-ball', code: 'two-ball-dribble', name: 'Two-Ball Dribble',
    description: 'Dribble two balls simultaneously, then alternating — control over speed.',
    category: 'ball-handling', skillCode: 'handling', intensity: 'medium', durationSec: 45, sets: 4, reps: 1,
    equipment: ['basketball'], difficultyRating: 1000,
  },
  {
    id: 'bb-drill-cones-weave', code: 'cone-weave', name: 'Cone Weave',
    description: 'Weave through 5 cones at full effort, change of direction on every cone.',
    category: 'ball-handling', skillCode: 'handling', intensity: 'high', durationSec: 40, sets: 4, reps: 1,
    equipment: ['basketball', 'cones'], difficultyRating: 1150,
  },
  {
    id: 'bb-drill-dark-zone', code: 'dark-zone', name: 'Dark-Zone Handle',
    description: 'Dribble only in the paint inside a marked zone, no charging — instant response.',
    category: 'ball-handling', skillCode: 'handling', intensity: 'medium', durationSec: 35, sets: 5, reps: 1,
    equipment: ['basketball', 'cones'], difficultyRating: 1250,
  },

  // ── Finishing ──
  {
    id: 'bb-drill-weak-hand', code: 'weak-hand-layups', name: 'Weak-Hand Layups',
    description: 'Every layup with the off hand, off both feet, protected with the body.',
    category: 'finishing', skillCode: 'finishing', intensity: 'medium', durationSec: 30, sets: 4, reps: 10,
    equipment: ['basketball', 'hoop'], difficultyRating: 950,
  },
  {
    id: 'bb-drill-euro-step', code: 'euro-step', name: 'Euro-Step Series',
    description: 'Catch, rip, wide step, finish — master the two-step release.',
    category: 'finishing', skillCode: 'finishing', intensity: 'high', durationSec: 30, sets: 4, reps: 8,
    equipment: ['basketball', 'hoop'], difficultyRating: 1250,
  },
  {
    id: 'bb-drill-contact-finish', code: 'contact-finish', name: 'Contact Finish',
    description: 'Swing through a defender pad on the way to the rim — absorb and extend.',
    category: 'finishing', skillCode: 'finishing', intensity: 'high', durationSec: 30, sets: 4, reps: 6,
    equipment: ['basketball', 'hoop', 'pads'], difficultyRating: 1400,
  },

  // ── Passing ──
  {
    id: 'bb-drill-wall-passing', code: 'wall-pass-series', name: 'Wall Pass Series',
    description: 'Chest, bounce, overhead against the wall — quick release, both hands.',
    category: 'passing', skillCode: 'passing', intensity: 'easy', durationSec: 45, sets: 3, reps: 40,
    equipment: ['basketball', 'wall'], difficultyRating: 900,
  },
  {
    id: 'bb-drill-read-progressions', code: 'read-progressions', name: 'Read Progressions',
    description: 'Three cones, one pass per read — hit the open cone before the call.',
    category: 'passing', skillCode: 'passing', intensity: 'medium', durationSec: 30, sets: 4, reps: 10,
    equipment: ['basketball', 'cones'], difficultyRating: 1100,
  },
  {
    id: 'bb-drill-no-dribble', code: 'no-dribble-game', name: 'No-Dribble Game',
    description: 'Circle drill — one touch, keep the ball moving, no dribble allowed.',
    category: 'passing', skillCode: 'passing', intensity: 'high', durationSec: 60, sets: 3, reps: 1,
    equipment: ['basketball', 'wall'], difficultyRating: 1350,
  },

  // ── Defense ──
  {
    id: 'bb-drill-defensive-slides', code: 'defensive-slides', name: 'Defensive Slides',
    description: 'Stay in stance, slide the length of the court 4x without crossing feet.',
    category: 'defense', skillCode: 'defense', intensity: 'high', durationSec: 20, sets: 4, reps: 1,
    equipment: ['cones'], difficultyRating: 950,
  },
  {
    id: 'bb-drill-shell', code: 'shell-defense', name: 'Shell Defense',
    description: 'Four-man shell — help, recover, contest every catch.',
    category: 'defense', skillCode: 'defense', intensity: 'high', durationSec: 60, sets: 3, reps: 1,
    equipment: ['basketball', 'cones'], difficultyRating: 1200,
  },
  {
    id: 'bb-drill-hands-up', code: 'hand-activity', name: 'Hand Activity',
    description: 'Poke, deflect, swipe at a dribbler without losing your stance.',
    category: 'defense', skillCode: 'defense', intensity: 'medium', durationSec: 40, sets: 4, reps: 1,
    equipment: ['basketball'], difficultyRating: 1100,
  },

  // ── Speed ──
  {
    id: 'bb-drill-flying-20', code: 'flying-20m', name: 'Flying 20m Sprint',
    description: '15m build-up into a full 20m sprint — hit max velocity.',
    category: 'athleticism', skillCode: 'speed', intensity: 'high', durationSec: 15, sets: 4, reps: 1,
    equipment: ['cones'], difficultyRating: 1050,
  },
  {
    id: 'bb-drill-resisted-sprint', code: 'resisted-sprint', name: 'Resisted Sprints',
    description: 'Sled or band pulls for 15m — drive the ground, stay tall.',
    category: 'athleticism', skillCode: 'speed', intensity: 'high', durationSec: 15, sets: 5, reps: 1,
    equipment: ['cones', 'sled'], difficultyRating: 1350,
  },

  // ── Agility ──
  {
    id: 'bb-drill-5-10-5', code: '5-10-5', name: '5-10-5 Shuttle',
    description: 'Sprint 5, touch, 10, touch, 5 — beat your last time.',
    category: 'athleticism', skillCode: 'agility', intensity: 'high', durationSec: 15, sets: 4, reps: 1,
    equipment: ['cones', 'stopwatch'], difficultyRating: 1000,
  },
  {
    id: 'bb-drill-t-drill', code: 't-drill', name: 'T-Drill',
    description: 'Sprint up, shuffle side, shuffle side, sprint back — clean angles.',
    category: 'athleticism', skillCode: 'agility', intensity: 'high', durationSec: 20, sets: 3, reps: 1,
    equipment: ['cones', 'stopwatch'], difficultyRating: 1150,
  },

  // ── Explosiveness ──
  {
    id: 'bb-drill-vertical-jump', code: 'vertical-jump', name: 'Vertical Jump',
    description: 'Full approach jump, touch the highest rung possible.',
    category: 'athleticism', skillCode: 'explosiveness', intensity: 'high', durationSec: 10, sets: 5, reps: 3,
    equipment: ['wall'], difficultyRating: 1100,
  },
  {
    id: 'bb-drill-broad-jump', code: 'broad-jump', name: 'Broad Jump',
    description: 'Standing broad jump — stick the landing, measure the best of 3.',
    category: 'athleticism', skillCode: 'explosiveness', intensity: 'high', durationSec: 10, sets: 4, reps: 3,
    equipment: ['cones'], difficultyRating: 1150,
  },

  // ── Reaction ──
  {
    id: 'bb-drill-reaction-light', code: 'reaction-lights', name: 'Reaction Lights',
    description: 'Tap the lit cone — 6 taps, count the time to finish.',
    category: 'athleticism', skillCode: 'reaction', intensity: 'medium', durationSec: 25, sets: 4, reps: 1,
    equipment: ['cones'], difficultyRating: 950,
  },
  {
    id: 'bb-drill-tag-game', code: 'mirror-tag', name: 'Mirror Tag',
    description: 'Face a partner and mirror their breaks — react, don\'t predict.',
    category: 'athleticism', skillCode: 'reaction', intensity: 'easy', durationSec: 45, sets: 3, reps: 1,
    equipment: ['cones'], difficultyRating: 1050,
  },

  // ── Decision making ──
  {
    id: 'bb-drill-read-defender', code: 'read-defender', name: 'Read the Defender',
    description: 'Coach cues shade — go opposite, then switch on the counter.',
    category: 'mentality', skillCode: 'decision', intensity: 'medium', durationSec: 45, sets: 3, reps: 5,
    equipment: ['basketball', 'cones'], difficultyRating: 1150,
  },
  {
    id: 'bb-drill-2v1-5on0', code: '2v1-advantage', name: '2v1 Advantage',
    description: 'Every rep: pass or dribble? Read the space on the second defender.',
    category: 'mentality', skillCode: 'decision', intensity: 'medium', durationSec: 45, sets: 4, reps: 5,
    equipment: ['basketball', 'cones'], difficultyRating: 1300,
  },
];

export const basketballDrillMap: Record<string, SportDrill> = Object.fromEntries(
  basketballDrills.map((d) => [d.code, d]),
);