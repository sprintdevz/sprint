import type { SportSkill } from '@/sports/types';

/**
 * Soccer skill graph — first draft.
 * Weights sum to 1; every soccer feature reuses the exact same sport contract.
 */
export const soccerSkills: SportSkill[] = [
  { id: 'sc-touch', code: 'touch', name: 'First Touch', category: 'ball-handling', weight: 0.2, prerequisites: [], description: 'Receiving and settling under pressure.', icon: 'football' },
  { id: 'sc-dribbling', code: 'dribbling', name: 'Dribbling', category: 'ball-handling', weight: 0.15, prerequisites: ['touch'], description: 'Close control at speed past defenders.', icon: 'walk' },
  { id: 'sc-passing', code: 'passing', name: 'Passing', category: 'passing', weight: 0.2, prerequisites: [], description: 'Range, weight and disguise on the ball.', icon: 'git-commit' },
  { id: 'sc-finishing', code: 'finishing', name: 'Finishing', category: 'shooting', weight: 0.18, prerequisites: [], description: 'Composure in front of goal, both feet.', icon: 'flag' },
  { id: 'sc-shooting', code: 'shooting', name: 'Shooting Power', category: 'shooting', weight: 0.1, prerequisites: ['finishing'], description: 'Striking cleanly from range.', icon: 'flash' },
  { id: 'sc-aerials', code: 'aerials', name: 'Aerial Duels', category: 'defense', weight: 0.05, prerequisites: [], description: 'Timing, positioning and neck strength.', icon: 'arrow-up' },
  { id: 'sc-tackling', code: 'tackling', name: 'Tackling', category: 'defense', weight: 0.07, prerequisites: [], description: 'Clean, decisive wins of the ball.', icon: 'shield' },
  { id: 'sc-sprint', code: 'sprint', name: 'Sprint Speed', category: 'athleticism', weight: 0.05, prerequisites: [], description: 'Breakaway acceleration.', icon: 'speedometer' },
  { id: 'sc-endurance', code: 'endurance', name: 'Endurance', category: 'athleticism', weight: 0.05, prerequisites: [], description: '90-minute engine.', icon: 'heart' },
  { id: 'sc-game-vision', code: 'vision', name: 'Game Vision', category: 'mentality', weight: 0.05, prerequisites: ['passing'], description: 'Seeing the pass two moves early.', icon: 'analytics' },
];