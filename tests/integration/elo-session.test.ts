import { generateSession } from '@/features/training/generator';
import { planSuccessRate, sessionXp } from '@/features/training/calculations';
import { createEloSystem } from '@/features/elo/engine';
import { getSport } from '@/sports';
import type { TrainingInput } from '@/features/training/types';
import type { RatingState } from '@/features/elo/types';

/** Integration: a full session lifecycle — generate → perform → rate. */

function input(overrides: Partial<TrainingInput> = {}): TrainingInput {
  return {
    sport: 'basketball',
    position: 'Point Guard',
    goal: 'all-around',
    skillRatings: {
      shooting: 1300, handling: 1250, finishing: 1150, passing: 1200,
      defense: 1100, speed: 1280, agility: 1200, explosiveness: 1250,
      reaction: 1150, decision: 1050,
    },
    recentSessions: [],
    equipment: ['basketball', 'hoop'],
    location: 'Indoor court',
    availableMinutes: 30,
    weeklyFrequency: 3,
    injuries: [],
    difficulty: 'intermediate',
    sessionsThisWeek: 0,
    seed: 12,
    ...overrides,
  };
}

describe('Session lifecycle (integration)', () => {
  test('strong session: XP earned, ELO up, ratings bounded', () => {
    const plan = generateSession(input());
    const results: Record<string, number> = {};
    for (const b of plan.blocks) results[b.id] = b.target + 1;

    const rate = planSuccessRate(plan, results);
    expect(rate).toBeGreaterThan(0.95);

    const xp = sessionXp(plan, results);
    expect(xp).toBeGreaterThan(0);

    const elo = createEloSystem();
    const state: RatingState = {
      rating: 1100, deviation: 60, games: 15, peak: 1150, updatedAt: new Date().toISOString(),
    };
    const applied = elo.applySession(state, {
      difficultyRating: averageDifficulty(plan),
      successRate: rate,
      repeatCount: 0,
    });
    expect(applied.delta).toBeGreaterThan(0);
    expect(applied.state.rating).toBeGreaterThan(1100);
  });

  test('duplicate submission guard token is unique per plan', () => {
    const a = generatePlan();
    const b = generatePlan();
    expect(a.planToken).not.toBe(b.planToken);
    const again = generatePlan();
    expect(a.planToken).not.toBe(again.planToken);
  });

  test('sport abstraction: every sport generates a valid session', () => {
    for (const sportId of ['basketball', 'soccer', 'tennis']) {
      const plan = generateSession(input({ sport: sportId, skillRatings: { default: 1000 } }));
      expect(plan.blocks.length).toBeGreaterThan(0);
      expect(plan.totalMinutes).toBeGreaterThan(0);
    }
  });

  test('assessments exist for every registered sport', () => {
    for (const sportId of ['basketball', 'soccer', 'tennis']) {
      const sport = getSport(sportId);
      expect(sport.assessments.some((a) => a.isInitial)).toBe(true);
      expect(sport.drills.length).toBeGreaterThan(0);
    }
  });
});

function averageDifficulty(plan: ReturnType<typeof generateSession>): number {
  return Math.round(plan.blocks.reduce((a, b) => a + b.difficultyRating, 0) / plan.blocks.length);
}

function generatePlan() {
  return generateSession(input());
}

