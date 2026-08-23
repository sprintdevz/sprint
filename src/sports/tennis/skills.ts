import type { SportSkill } from '@/sports/types';

/** Tennis skill graph — first draft. Same contract as every sport. */
export const tennisSkills: SportSkill[] = [
  { id: 'tn-serve', code: 'serve', name: 'Serve', category: 'shooting', weight: 0.2, prerequisites: [], description: 'First-serve percentage and free points.', icon: 'arrow-up-circle' },
  { id: 'tn-forehand', code: 'forehand', name: 'Forehand', category: 'shooting', weight: 0.18, prerequisites: [], description: 'Depth, pace and safety on the open side.', icon: 'hand-right' },
  { id: 'tn-backhand', code: 'backhand', name: 'Backhand', category: 'shooting', weight: 0.15, prerequisites: [], description: 'Consistency and direction under pressure.', icon: 'hand-left' },
  { id: 'tn-volleys', code: 'volleys', name: 'Volleys', category: 'defense', weight: 0.08, prerequisites: [], description: 'Punching clean volleys and overheads.', icon: 'shield' },
  { id: 'tn-footwork', code: 'footwork', name: 'Footwork', category: 'athleticism', weight: 0.13, prerequisites: [], description: 'Split step, recovery and court coverage.', icon: 'walk' },
  { id: 'tn-movement', code: 'movement', name: 'Movement Speed', category: 'athleticism', weight: 0.08, prerequisites: [], description: 'Getting to the ball early, recovering fast.', icon: 'speedometer' },
  { id: 'tn-return', code: 'return', name: 'Return of Serve', category: 'defense', weight: 0.07, prerequisites: [], description: 'Neutralizing first serves, attacking seconds.', icon: 'flash' },
  { id: 'tn-mental', code: 'mental', name: 'Mental Toughness', category: 'mentality', weight: 0.05, prerequisites: [], description: 'Breaks, deuces and deciding points.', icon: 'analytics' },
];

export const tennisSkillWeights: Record<string, number> = Object.fromEntries(
  tennisSkills.map((s) => [s.code, s.weight]),
);