import { createEloSystem, DEFAULT_ENGINE_CONFIG } from '@/features/elo/engine';
import { updateGlicko, expectedScore } from '@/features/elo/glicko';
import { leagueInfo, nextMilestone, leagueProgress } from '@/features/elo/calculations';
import type { RatingState } from '@/features/elo/types';

function state(rating = 1000, deviation = 350, games = 0, peak?: number): RatingState {
  return {
    rating,
    deviation,
    games,
    peak: peak ?? rating,
    updatedAt: new Date().toISOString(),
  };
}

describe('Glicko core', () => {
  test('new athletes move much more than tested athletes', () => {
    const fresh = updateGlicko(1000, 350, [{ opponentRating: 1000, opponentDeviation: 85, score: 1 }]);
    const tested = updateGlicko(1000, 60, [{ opponentRating: 1000, opponentDeviation: 85, score: 1 }]);
    expect(Math.abs(fresh.rating - 1000)).toBeGreaterThan(Math.abs(tested.rating - 1000));
  });

  test('expected score is 0.5 against an equal opponent', () => {
    const e = expectedScore(1200, 1200, 85);
    expect(e).toBeCloseTo(0.5, 1);
  });

  test('expected score favors the higher-rated athlete', () => {
    const e = expectedScore(1400, 1000, 85);
    expect(e).toBeGreaterThan(0.9);
  });
});

describe('Elo system', () => {
  const elo = createEloSystem();

  test('performing at expectation yields near-zero delta (anti-farm)', () => {
    const s = state(1200, 70, 12, 1250);
    const applied = elo.applySession(s, {
      difficultyRating: 1200,
      successRate: 0.5,
      repeatCount: 0,
    });
    expect(Math.abs(applied.delta)).toBeLessThan(6);
  });

  test('performing above expectation gains rating', () => {
    const s = state(1100, 80, 8, 1200);
    const applied = elo.applySession(s, {
      difficultyRating: 1300,
      successRate: 0.85,
      repeatCount: 0,
    });
    expect(applied.delta).toBeGreaterThan(5);
  });

  test('farming content far below rating moves almost nothing', () => {
    const s = state(1800, 45, 40, 1900);
    const applied = elo.applySession(s, {
      difficultyRating: 800,
      successRate: 1,
      repeatCount: 0,
    });
    expect(applied.delta).toBeLessThan(6);
  });

  test('repeating the same benchmark shrinks the reward', () => {
    const s = state(1200, 60, 20, 1300);
    const once = elo.applySession(s, { difficultyRating: 1250, successRate: 0.9, repeatCount: 0 });
    const repeated = elo.applySession(s, { difficultyRating: 1250, successRate: 0.9, repeatCount: 5 });
    expect(Math.abs(repeated.delta)).toBeLessThan(Math.abs(once.delta));
  });

  test('one bad session cannot destroy progress', () => {
    const s = state(1400, 55, 30, 1500);
    const applied = elo.applySession(s, { difficultyRating: 1350, successRate: 0.1, repeatCount: 0 });
    expect(applied.delta).toBeGreaterThan(-30);
  });

  test('extreme performers are bounded', () => {
    const s = state(DEFAULT_ENGINE_CONFIG.maxRating - 1, 30, 100, DEFAULT_ENGINE_CONFIG.maxRating);
    const applied = elo.applySession(s, { difficultyRating: DEFAULT_ENGINE_CONFIG.maxRating, successRate: 1, repeatCount: 0 });
    expect(applied.state.rating).toBeLessThanOrEqual(DEFAULT_ENGINE_CONFIG.maxRating);
  });

  test('provisional flag flips after calibration games', () => {
    expect(elo.isProvisional(state(1000, 350, 0))).toBe(true);
    expect(elo.isProvisional(state(1000, 60, 10))).toBe(false);
  });
});

describe('Leagues', () => {
  test('initial rating lands in bronze', () => {
    const info = leagueInfo(1000);
    expect(['BRONZE', 'ROOKIE']).toContain(info.league.code.toUpperCase().replace('ROOKIE', 'ROOKIE'));
  });

  test('1358 lands in gold, division I (division floors are 50 apart)', () => {
    const info = leagueInfo(1358);
    expect(info.league.code).toBe('gold');
    expect(info.label).toBe('GOLD I');
  });

  test('next milestone is above current rating', () => {
    expect(nextMilestone(1240)).toBeGreaterThan(1240);
    expect(leagueProgress(1240, nextMilestone(1240))).toBeGreaterThanOrEqual(0);
    expect(leagueProgress(1240, nextMilestone(1240))).toBeLessThanOrEqual(1);
  });
});