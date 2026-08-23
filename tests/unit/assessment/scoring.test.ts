import { runAssessment } from '@/features/assessment/engine';
import { scorePerSkill, weightedOverall, performanceFromRaw } from '@/features/assessment/scoring';
import { getSport } from '@/sports';
import type { ChallengeResult } from '@/features/assessment/types';

const basketball = getSport('basketball');
const initial = basketball.assessments.find((a) => a.isInitial)!;

function resultsFor(scores: Record<string, number>): ChallengeResult[] {
  return initial.challenges.map((c, i) => ({
    challengeIndex: i,
    skillCode: c.skillCode,
    performance: scores[c.skillCode] ?? 0,
    benchmarkText: c.benchmarkLabel,
    raw: 0,
  }));
}

describe('Assessment scoring', () => {
  test('median performance lands near the initial rating', () => {
    const scores: Record<string, number> = {};
    for (const c of initial.challenges) scores[c.skillCode] = 0.5;
    const result = runAssessment(initial, resultsFor(scores), 'basketball');
    expect(Math.abs(result.overallRating - 1000)).toBeLessThanOrEqual(2);
  });

  test('elite performance lands well above initial', () => {
    const scores: Record<string, number> = {};
    for (const c of initial.challenges) scores[c.skillCode] = 0.95;
    const result = runAssessment(initial, resultsFor(scores), 'basketball');
    expect(result.overallRating).toBeGreaterThan(1350);
  });

  test('weak performance stays low but bounded', () => {
    const scores: Record<string, number> = {};
    for (const c of initial.challenges) scores[c.skillCode] = 0.08;
    const result = runAssessment(initial, resultsFor(scores), 'basketball');
    expect(result.overallRating).toBeGreaterThanOrEqual(300);
    expect(result.overallRating).toBeLessThan(700);
  });

  test('strongest and weakest are identified', () => {
    const scores: Record<string, number> = {};
    initial.challenges.forEach((c, i) => {
      scores[c.skillCode] = i === 0 ? 0.95 : 0.2;
    });
    const result = runAssessment(initial, resultsFor(scores), 'basketball');
    expect(result.strongestSkill).toBe(initial.challenges[0]!.skillCode);
  });

  test('partial scores weight correctly', () => {
    const perSkill = scorePerSkill([
      { challengeIndex: 0, skillCode: 'shooting', performance: 0.8, benchmarkText: 'x', raw: 8 },
      { challengeIndex: 1, skillCode: 'shooting', performance: 0.6, benchmarkText: 'x', raw: 1 },
    ]);
    expect(perSkill.shooting).toBeCloseTo(0.7);
  });

  test('weighted overall respects skill weights', () => {
    const flat = weightedOverall({ shooting: 1, handling: 1, finishing: 0 }, { shooting: 0.5, handling: 0.5, finishing: 0.0 });
    expect(flat).toBe(1);
  });

  test('performanceFromRaw converts metric types', () => {
    expect(performanceFromRaw([8], 'reps', 10)).toBe(0.8);
    expect(performanceFromRaw([2], 'seconds', 4)).toBe(1); // 2s is better than the 4s target → capped at 1
    expect(performanceFromRaw([1.5, 2.4], 'distance', 2.4)).toBe(1);
  });
});