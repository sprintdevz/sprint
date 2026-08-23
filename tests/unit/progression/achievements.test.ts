import { evaluateAchievements } from '@/features/achievements/engine';
import type { AchievementContext } from '@/features/achievements/definitions';
import { isConsecutiveDay, daysBetween, addDays } from '@/utils/dates';
import { clamp, seededRandom, movingAverage } from '@/utils/numbers';
import { analyzeWeakness } from '@/features/athlete/calculations';
import { percentileRank } from '@/utils/numbers';
import type { AthleteSkillSummary } from '@/features/athlete/types';

function ctx(overrides: Partial<AchievementContext> = {}): AchievementContext {
  return {
    sessionsCompleted: 0,
    assessmentsCompleted: 0,
    personalBests: 0,
    currentStreak: 0,
    longestStreak: 0,
    elo: 1000,
    eloDeltaAllTime: 0,
    perfectSessions: 0,
    weeklyRankTop10: false,
    weeklyRankTop1: false,
    skillWorkouts: {},
    fastestSessionSec: 0,
    ...overrides,
  };
}

describe('Achievements', () => {
  test('first assessment unlocks at one completed assessment', () => {
    const { newlyEarned } = evaluateAchievements(ctx({ assessmentsCompleted: 1 }), new Set());
    const codes = newlyEarned.map((a) => a.code);
    expect(codes).toContain('first-assessment');
  });

  test('performing below threshold keeps achievement locked', () => {
    const { newlyEarned } = evaluateAchievements(ctx({ sessionsCompleted: 0 }), new Set());
    expect(newlyEarned.map((a) => a.code)).not.toContain('sessions-10');
  });

  test('25 sessions unlock their badge without unlocking 50', () => {
    const { newlyEarned } = evaluateAchievements(ctx({ sessionsCompleted: 25 }), new Set());
    const codes = newlyEarned.map((a) => a.code);
    expect(codes).toContain('sessions-25');
    expect(codes).toContain('sessions-10');
    expect(codes).not.toContain('sessions-50');
  });

  test('top-1% is hidden until earned', () => {
    const { newlyEarned } = evaluateAchievements(ctx({ weeklyRankTop1: true }), new Set());
    expect(newlyEarned.map((a) => a.code)).toContain('top-1');
  });

  test('already-earned achievements never re-fire', () => {
    const { newlyEarned } = evaluateAchievements(ctx({ assessmentsCompleted: 1 }), new Set(['first-assessment']));
    expect(newlyEarned.map((a) => a.code)).not.toContain('first-assessment');
  });
});

describe('Streaks', () => {
  test('consecutive days count', () => {
    const today = new Date();
    expect(isConsecutiveDay('2020-01-01', new Date('2020-01-02'))).toBe(true);
    expect(isConsecutiveDay('2020-01-01', new Date('2020-01-03'))).toBe(false);
    expect(isConsecutiveDay('2020-01-01', new Date('2020-01-01'))).toBe(true);
  });

  test('daysBetween respects day boundaries', () => {
    expect(daysBetween(new Date('2026-01-01T23:00'), new Date('2026-01-02T01:00'))).toBe(1);
    expect(addDays(new Date(2026, 0, 1), 7).getDate()).toBe(8);
  });
});

describe('Numbers', () => {
  test('clamp bounds values', () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-1, 0, 10)).toBe(0);
    expect(clamp(11, 0, 10)).toBe(10);
  });

  test('percentile rank works', () => {
    expect(percentileRank(1200, [800, 900, 1000, 1100, 1200])).toBeCloseTo(0.9, 1);
  });

  test('moving average smooths', () => {
    const out = movingAverage([100, 200, 300], 2);
    expect(out[1]).toBe(150);
  });

  test('seededRandom is deterministic', () => {
    const a = seededRandom(7);
    const b = seededRandom(7);
    expect(a()).toBe(b());
    expect(seededRandom(7)()).toBe(seededRandom(7)());
  });
});

describe('Weakness analysis', () => {
  const skills: AthleteSkillSummary[] = [
    { skillCode: 'shooting', name: 'Shooting', rating: 1412, deviation: 58, mastery: 0.8, trend: 5, attempts: 12, personalBest: 1430 },
    { skillCode: 'handling', name: 'Ball Handling', rating: 1331, deviation: 61, mastery: 0.7, trend: 0, attempts: 10, personalBest: 1355 },
    { skillCode: 'finishing', name: 'Finishing', rating: 1205, deviation: 70, mastery: 0.55, trend: -4, attempts: 8, personalBest: 1220 },
    { skillCode: 'decision', name: 'Decision Making', rating: 1104, deviation: 82, mastery: 0.4, trend: 8, attempts: 6, personalBest: 1104 },
  ];

  test('identifies decision making as the biggest opportunity (per brief)', () => {
    const analysis = analyzeWeakness('basketball', skills);
    expect(analysis.biggestGapSkill).toBe('decision');
  });

  test('empty skills produce safe nulls', () => {
    const analysis = analyzeWeakness('basketball', []);
    expect(analysis.biggestGapSkill).toBeNull();
    expect(analysis.insight.length).toBeGreaterThan(0);
  });
});