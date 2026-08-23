import { getSport } from '@/sports';
import type { WeaknessAnalysis } from '@/features/athlete/types';

/** Minimal shape consumed by the weakness analysis (store + API compatible). */
interface WeakSkillInput {
  skillCode: string;
  rating: number;
  name?: string;
}

/**
 * Weighted overall rating from per-skill ratings.
 * Weights come from the sport config so the math is sport-agnostic.
 */
export function overallRatingFromSkills(
  sportId: string,
  skills: Array<{ skillCode: string; rating: number }>,
): number {
  const sport = getSport(sportId);
  let sum = 0;
  let weight = 0;
  for (const s of skills) {
    const w = sport.skillWeights[s.skillCode] ?? 0.1;
    sum += s.rating * w;
    weight += w;
  }
  return weight > 0 ? Math.round(sum / weight) : 1000;
}

/**
 * Weakness analysis — answers the product question
 * "What is holding me back?"
 *
 * We score each skill by `(overall − skillRating) × (1 + skillWeight)`:
 * the biggest gap is always the biggest opportunity — weight decides the
 * tie-break and amplifies skills that move the overall rating more.
 */
export function analyzeWeakness(
  sportId: string,
  skills: WeakSkillInput[],
): WeaknessAnalysis {
  if (skills.length === 0) {
    return {
      biggestGapSkill: null,
      biggestGap: null,
      weightedWeakest: null,
      opportunities: [],
      insight: 'Complete your assessment to find your biggest opportunity.',
    };
  }

  const overall = computeAggregate(skills);
  const sport = getSport(sportId);

  const scored = skills.map((s) => {
    const gap = overall - s.rating;
    const weight = sport.skillWeights[s.skillCode] ?? 0.1;
    return { skillCode: s.skillCode, name: s.name ?? s.skillCode, gap, score: gap * (1 + weight) };
  });

  const positive = scored.filter((s) => s.gap > 0);
  const byScore = [...positive].sort((a, b) => b.score - a.score);
  const byRating = [...skills].sort((a, b) => a.rating - b.rating);

  const biggestGapSkill = byScore[0]?.skillCode ?? null;
  const biggestGap = byScore[0] ? Math.round(byScore[0].gap) : null;
  const weightedWeakest = byRating[0]?.skillCode ?? null;

  const opportunities = [...scored]
    .filter((s) => s.gap > 20)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((s) => ({ skillCode: s.skillCode, name: s.name, gap: Math.round(s.gap) }));

  const head = byScore[0];
  const insight = head
    ? `${head.name} is your biggest opportunity right now. Each session there pays off more than anywhere else.`
    : 'You are ahead of your average everywhere — sharpen your edge.';

  return { biggestGapSkill, biggestGap, weightedWeakest, opportunities, insight };
}

function computeAggregate(skills: WeakSkillInput[]): number {
  return Math.round(skills.reduce((acc, s) => acc + s.rating, 0) / skills.length);
}