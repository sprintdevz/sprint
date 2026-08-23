import { generateSession } from '@/features/training/generator';
import { selectFocus } from '@/features/training/optimizer';
import { sessionXp, planSuccessRate, estimateEloDelta } from '@/features/training/calculations';
import type { TrainingInput } from '@/features/training/types';

function input(overrides: Partial<TrainingInput> = {}): TrainingInput {
  return {
    sport: 'basketball',
    position: 'Point Guard',
    goal: 'all-around',
    skillRatings: {
      shooting: 1412,
      handling: 1331,
      finishing: 1205,
      passing: 1180,
      defense: 1172,
      speed: 1300,
      agility: 1250,
      explosiveness: 1290,
      reaction: 1200,
      decision: 1104,
    },
    recentSessions: [],
    equipment: ['basketball', 'hoop'],
    location: 'Indoor court',
    availableMinutes: 25,
    weeklyFrequency: 3,
    injuries: [],
    difficulty: 'intermediate',
    sessionsThisWeek: 0,
    seed: 42,
    ...overrides,
  };
}

describe('Training optimizer', () => {
  test('picks the biggest weighted gap (decision making per brief)', () => {
    const focus = selectFocus(input());
    expect(focus.skillCode).toBe('decision');
  });

  test('avoids repeating a skill trained recently', () => {
    const focus = selectFocus(
      input({ recentSessions: [{ skillCode: 'decision', playedAt: new Date().toISOString() }] }),
    );
    expect(focus.skillCode).not.toBe('decision');
  });

  test('respects skill weights when gaps are equal', () => {
    const focus = selectFocus(input({ skillRatings: { shooting: 1000, handling: 1000, finishing: 1000 } }));
    expect(['shooting', 'handling', 'finishing']).toContain(focus.skillCode);
  });
});

describe('Training generator', () => {
  test('generates a deterministic session for a given seed', () => {
    const a = generateSession(input());
    const b = generateSession(input());
    expect(a.blocks.length).toBe(b.blocks.length);
    expect(a.focusSkillCode).toBe(b.focusSkillCode);
  });

  test('all blocks belong to the focus skill', () => {
    const plan = generateSession(input());
    for (const block of plan.blocks) {
      expect(block.skillCode).toBe(plan.focusSkillCode);
    }
  });

  test('session minutes are clamped to the sport range', () => {
    const plan = generateSession(input({ availableMinutes: 2 }));
    expect(plan.totalMinutes).toBeGreaterThanOrEqual(15);
    const max = generateSession(input({ availableMinutes: 9999 }));
    expect(max.totalMinutes).toBeLessThanOrEqual(60);
  });

  test('targets scale with rating (elite sees harder bars)', () => {
    const rookie = generateSession(input({ skillRatings: { decision: 850 } }));
    const elite = generateSession(input({ skillRatings: { decision: 1800 } }));
    const rTarget = getFirstTarget(rookie);
    const eTarget = getFirstTarget(elite);
    expect(eTarget).toBeGreaterThanOrEqual(rTarget);
  });
});

function getFirstTarget(plan: ReturnType<typeof generateSession>): number {
  const block = plan.blocks.find((b) => b.kind === 'challenge');
  return block?.target ?? 0;
}

describe('Training calculations', () => {
  test('XP reflects passing vs partial', () => {
    const plan = generateSession(input());
    const results: Record<string, number> = {};
    for (const b of plan.blocks) results[b.id] = b.target; // all passed
    const full = sessionXp(plan, results);
    const partial: Record<string, number> = {};
    for (const b of plan.blocks) partial[b.id] = Math.floor(b.target / 2);
    expect(sessionXp(plan, partial)).toBeLessThan(full);
  });

  test('perfect session adds bonus XP', () => {
    const plan = generateSession(input());
    const results: Record<string, number> = {};
    for (const b of plan.blocks) results[b.id] = b.target;
    const xp = sessionXp(plan, results);
    expect(xp).toBeGreaterThan(plan.blocks.reduce((a, b) => a + b.xp, 0));
  });

  test('elo preview moves in the right direction', () => {
    const plan = generateSession(input({ skillRatings: { decision: 1200 } }));
    const strong = estimateEloDelta(1200, plan, 0.9);
    const weak = estimateEloDelta(1200, plan, 0.2);
    expect(strong.delta).toBeGreaterThan(weak.delta);
  });
});