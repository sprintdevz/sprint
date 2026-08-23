import { getSport } from '@/sports';
import type { SportAssessment } from '@/sports/types';
import { scorePerSkill, weightedOverall } from '@/features/assessment/scoring';
import type { AssessmentResult, ChallengeResult } from '@/features/assessment/types';
import { ratingPointsForPerformance } from '@/features/elo/calibration';
import { createEloSystem } from '@/features/elo/engine';

/**
 * Assessment engine.
 * Heeds the product rule: the ELO reveal must be earned from demonstrated
 * performance. Every challenge's performance maps to a provisional rating
 * through the calibration curve, and the overall rating is the weighted blend.
 */
export function runAssessment(
  assessment: SportAssessment,
  challengeResults: ChallengeResult[],
  sportId: string,
): AssessmentResult {
  const sport = getSport(sportId);
  const elo = createEloSystem();

  const skillScores = scorePerSkill(challengeResults);
  const overallScore = weightedOverall(skillScores, sport.skillWeights);

  const skillRatings: Record<string, number> = {};
  for (const [code, score] of Object.entries(skillScores)) {
    skillRatings[code] = ratingPointsForPerformance(score, elo.config);
  }

  const overallRating = ratingPointsForPerformance(overallScore, elo.config);

  const sorted = Object.entries(skillRatings).sort((a, b) => b[1] - a[1]);

  return {
    assessment,
    skillScores,
    overallScore,
    skillRatings,
    overallRating,
    strongestSkill: sorted[0]?.[0] ?? null,
    biggestOpportunity: sorted[sorted.length - 1]?.[0] ?? null,
    results: challengeResults,
    completedAt: new Date().toISOString(),
  };
}

type Assessment = SportAssessment;

/** Post-calibration: apply an assessment's results to current rating state per skill. */
export function applyAssessmentToRatings(
  current: Record<string, number>,
  skillRatings: Record<string, number>,
): Record<string, number> {
  const out: Record<string, number> = { ...current };
  for (const [code, target] of Object.entries(skillRatings)) {
    const baseline = out[code] ?? 1000;
    // Blend: new evidence moves the rating 40% toward the measured level.
    out[code] = Math.round(baseline + (target - baseline) * 0.4);
  }
  return out;
}