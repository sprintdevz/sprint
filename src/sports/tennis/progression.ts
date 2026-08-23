/** Tennis progression — mastery stage bands per skill. */

const STAGES = [
  { label: 'Foundation', minRating: 0, color: '#8B99B8' },
  { label: 'Developing', minRating: 800, color: '#4FB8B0' },
  { label: 'Solid', minRating: 1000, color: '#2E6BFF' },
  { label: 'Sharp', minRating: 1200, color: '#B06BFF' },
  { label: 'Elite', minRating: 1500, color: '#FF7A1A' },
];

const SKILLS = [
  'serve', 'forehand', 'backhand', 'volleys', 'footwork',
  'movement', 'return', 'mental',
] as const;

export const tennisProgression: Record<string, { stages: typeof STAGES }> =
  Object.fromEntries(SKILLS.map((code) => [code, { stages: STAGES }]));