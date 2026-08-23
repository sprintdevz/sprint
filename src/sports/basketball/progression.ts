/** Basketball skill progression — mastery stage bands per skill. */

const STAGE_BANDS = [
  { label: 'Foundation', minRating: 0, color: '#8B99B8' },
  { label: 'Developing', minRating: 800, color: '#4FB8B0' },
  { label: 'Solid', minRating: 1000, color: '#2E6BFF' },
  { label: 'Sharp', minRating: 1200, color: '#B06BFF' },
  { label: 'Elite', minRating: 1500, color: '#FF7A1A' },
];

const SKILL_CODES = [
  'shooting',
  'handling',
  'finishing',
  'passing',
  'defense',
  'speed',
  'agility',
  'explosiveness',
  'reaction',
  'decision',
] as const;

export const basketballProgression: Record<string, { stages: typeof STAGE_BANDS }> =
  Object.fromEntries(SKILL_CODES.map((code) => [code, { stages: STAGE_BANDS }]));

export function progressionStageFor(skillCode: string, rating: number): {
  label: string;
  color: string;
} {
  const stages = basketballProgression[skillCode]?.stages ?? STAGE_BANDS;
  const stage = [...stages].reverse().find((s) => rating >= s.minRating) ?? stages[0]!;
  return { label: stage.label, color: stage.color };
}