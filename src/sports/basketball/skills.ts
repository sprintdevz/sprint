import type { SportSkill } from '@/sports/types';

/**
 * Basketball skill graph.
 * Weights sum to 1 and represent each skill's contribution to the overall
 * sport rating. Prerequisites model the progression graph (e.g. you need
 * ball handling before weak-hand finishing becomes trainable).
 */
export const basketballSkills: SportSkill[] = [
  {
    id: 'bb-shooting',
    code: 'shooting',
    name: 'Shooting',
    category: 'shooting',
    description: 'Catch-and-shoot, off-the-dribble and free-throw accuracy.',
    weight: 0.16,
    prerequisites: [],
    icon: 'basketball',
  },
  {
    id: 'bb-handling',
    code: 'handling',
    name: 'Ball Handling',
    category: 'ball-handling',
    description: 'Crossover, between-the-legs, and control under pressure.',
    weight: 0.14,
    prerequisites: [],
    icon: 'hand-left',
  },
  {
    id: 'bb-finishing',
    code: 'finishing',
    name: 'Finishing',
    category: 'finishing',
    description: 'Layups, weak-hand finishes, and contact finishes at the rim.',
    weight: 0.13,
    prerequisites: [],
    icon: 'arrow-up-circle',
  },
  {
    id: 'bb-passing',
    code: 'passing',
    name: 'Passing',
    category: 'passing',
    description: 'Catch-and-deliver accuracy, reads and decision speed.',
    weight: 0.1,
    prerequisites: [],
    icon: 'git-commit',
  },
  {
    id: 'bb-defense',
    code: 'defense',
    name: 'Defense',
    category: 'defense',
    description: 'Stance, footwork, hands and on-ball containment.',
    weight: 0.12,
    prerequisites: [],
    icon: 'shield',
  },
  {
    id: 'bb-speed',
    code: 'speed',
    name: 'Speed',
    category: 'athleticism',
    description: 'Sprint speed and change-of-pace over short distances.',
    weight: 0.1,
    prerequisites: [],
    icon: 'speedometer',
  },
  {
    id: 'bb-agility',
    code: 'agility',
    name: 'Agility',
    category: 'athleticism',
    description: 'Lateral quickness, change of direction and foot speed.',
    weight: 0.09,
    prerequisites: [],
    icon: 'swap-horizontal',
  },
  {
    id: 'bb-explosiveness',
    code: 'explosiveness',
    name: 'Explosiveness',
    category: 'athleticism',
    description: 'First-step burst and jump power.',
    weight: 0.09,
    prerequisites: [],
    icon: 'rocket',
  },
  {
    id: 'bb-reaction',
    code: 'reaction',
    name: 'Reaction',
    category: 'athleticism',
    description: 'Anticipation and response time to visual cues.',
    weight: 0.04,
    prerequisites: [],
    icon: 'flash',
  },
  {
    id: 'bb-decision',
    code: 'decision',
    name: 'Decision Making',
    category: 'mentality',
    description: 'Choosing the right play, quickly, under pressure.',
    weight: 0.03,
    prerequisites: ['handling', 'passing'],
    icon: 'analytics',
  },
];

/** Record for O(1) lookups. */
export const basketballSkillMap: Record<string, SportSkill> = Object.fromEntries(
  basketballSkills.map((s) => [s.code, s]),
);

/** Skill categories with their skill codes — used for grouping UIs. */
export const basketballSkillGroups: Record<string, string[]> = {
  shooting: ['shooting'],
  'ball-handling': ['handling'],
  finishing: ['finishing'],
  passing: ['passing'],
  defense: ['defense'],
  athleticism: ['speed', 'agility', 'explosiveness', 'reaction'],
  mentality: ['decision'],
};