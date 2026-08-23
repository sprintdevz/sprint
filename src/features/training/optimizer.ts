import { getSport } from '@/sports';
import type { TrainingInput } from '@/features/training/types';

/**
 * The optimizer — chooses where to spend the session.
 *
 * Goal: highest expected improvement per minute.
 * Signals per skill:
 *   - gap below the weighted average (the biggest hole)
 *   - skill weight (improving a heavy skill moves the overall rating more)
 *   - freshness (not already hammered this week)
 *   - equipment fit (can we actually train it here?)
 *   - prerequisites met
 */
export interface FocusCandidate {
  skillCode: string;
  name: string;
  score: number;
  gap: number;
  reasons: string[];
}

export function selectFocus(input: TrainingInput): FocusCandidate {
  const sport = getSport(input.sport);
  const ratings = input.skillRatings;
  const entries = Object.entries(ratings);

  if (entries.length === 0) {
    const fallback = sport.skills[0]!;
    return {
      skillCode: fallback.code,
      name: fallback.name,
      score: 1,
      gap: 0,
      reasons: ['Start with the foundation.'],
    };
  }

  const avg = entries.reduce((acc, [, r]) => acc + r, 0) / entries.length;

  // Count recent sessions per skill (last 7 days).
  const now = Date.now();
  const recentCount: Record<string, number> = {};
  for (const s of input.recentSessions) {
    if (now - new Date(s.playedAt).getTime() < 7 * 86400_000) {
      recentCount[s.skillCode] = (recentCount[s.skillCode] ?? 0) + 1;
    }
  }

  const candidates: FocusCandidate[] = sport.skills.map((skill) => {
    const rating = ratings[skill.code] ?? 1000;
    const gap = avg - rating;
    const weight = sport.skillWeights[skill.code] ?? 0.1;

    // Score = gap × (1 + weight) — a big gap is the main signal,
    // the skill weight tips ties and adds emphasis. Dampened by
    // recency, gated by equipment.
    let score = gap * (1 + weight) * 2.5;
    const reasons: string[] = [];

    if (gap > 40) reasons.push(`Biggest gap (−${Math.round(gap)} vs your average)`);
    if (weight > 0.12) reasons.push('High-impact skill for your rating');
    const recent = recentCount[skill.code] ?? 0;
    if (recent === 0) reasons.push('Fresh this week');
    else score *= 1 / (1 + 1.5 * recent);

    for (const prereq of skill.prerequisites) {
      if ((ratings[prereq] ?? 0) < 950) {
        score *= 0.6;
        reasons.push(`Needs ${sport.skills.find((s) => s.code === prereq)?.name ?? prereq} first`);
      }
    }

    const available = new Set(input.equipment);
    const needsGear = sport.drills.some(
      (d) => d.skillCode === skill.code && d.equipment.some((e) => !available.has(e)),
    );
    if (needsGear && input.equipment.length > 0) score *= 0.85;
    if (needsGear && input.equipment.length === 0) score *= 1;

    return { skillCode: skill.code, name: skill.name, score, gap: gap, reasons };
  });

  candidates.sort((a, b) => b.score - a.score);
  return candidates[0]!;
}