import { getSport, drillsForSkill, type SportDrill } from '@/sports';
import { selectFocus } from '@/features/training/optimizer';
import type { SessionPlan, TrainingChallenge, TrainingInput } from '@/features/training/types';
import { seededRandom } from '@/utils/numbers';
import { XP } from '@/constants/config';

/**
 * The session generator.
 * Given athlete context it outputs a deterministic, progression-shaped
 * session: focus challenge → reinforcing drill → harder challenge.
 * It optimizes for highest expected improvement per minute by delegating
 * the *focus* choice to the optimizer and shaping reps/targets around the
 * athlete's rating (challenges slightly above their level).
 */
export function generateSession(input: TrainingInput): SessionPlan {
  const sport = getSport(input.sport);
  const focus = selectFocus(input);
  const random = seededRandom(input.seed ?? Date.now() % 1_000_000);
  const minutes = clampMinutes(
    input.availableMinutes,
    sport.training.minSessionMinutes,
    sport.training.maxSessionMinutes,
  );

  const focusSkill = focus.skillCode;
  const rating = input.skillRatings[focusSkill] ?? 1000;
  const blocks: TrainingChallenge[] = [];

  // ── 1. Core challenge at the edge of current ability
  const challengePool = sport.assessments
    .flatMap((a) => a.challenges)
    .filter((c) => c.skillCode === focusSkill);
  const challenge = challengePool[Math.floor(random() * Math.max(1, challengePool.length))];
  const attempts = challenge?.attempts ?? 10;
  const target = defaultTarget(rating, attempts);

  blocks.push({
    id: `ch-1-${focusSkill}`,
    kind: 'challenge',
    skillCode: focusSkill,
    title: challenge?.title ?? `${focus.name} Challenge`,
    description: challenge?.description ?? `Push ${focus.name} beyond your comfort zone.`,
    metric: challenge?.metric ?? 'reps',
    attempts,
    target,
    targetUnit: 'makes',
    difficultyRating: challenge?.difficultyRating ?? rating + 80,
    intensity: challengeIntensity(rating),
    durationSec: 90,
    equipment: [],
    xp: XP.challengeBase + Math.round(random() * 6),
    reason: focus.reasons[0] ?? 'Focused work on your biggest opportunity.',
  });

  // ── 2. Reinforcing drill (equipment-aware, sport fallback)
  const owned = new Set(input.equipment);
  const pool = drillsForSkill(input.sport, focusSkill).filter(
    (d) => d.equipment.every((e) => owned.has(e)) || input.equipment.length === 0,
  );
  const drill = pool[Math.floor(random() * pool.length)] ?? drillFallback(input.sport, focusSkill);

  blocks.push({
    id: `drill-1-${drill.code}`,
    kind: 'drill',
    skillCode: drill.skillCode,
    title: drill.name,
    description: drill.description,
    metric: 'reps',
    attempts: drill.sets * drill.reps,
    target: drill.sets * drill.reps,
    targetUnit: 'reps',
    difficultyRating: drill.difficultyRating,
    intensity: drill.intensity,
    durationSec: drill.durationSec,
    equipment: drill.equipment,
    xp: XP.challengeBase,
    reason: 'Reinforce the pattern with volume.',
  });

  // ── 3. Harder read — the money block
  blocks.push({
    id: `challenge-2-${focusSkill}`,
    kind: 'challenge',
    skillCode: focusSkill,
    title: `${focus.name} — Harder Read`,
    description: 'Same movement, game speed, less margin.',
    metric: 'reps',
    attempts: 8,
    target: Math.max(3, Math.round(target * 1.1)),
    targetUnit: 'makes',
    difficultyRating: (challenge?.difficultyRating ?? rating + 80) + 60,
    intensity: 'high',
    durationSec: 90,
    equipment: [],
    xp: XP.challengeBase + 4,
    reason: 'The second read is where ratings are earned.',
  });

  return {
    focusSkillCode: focusSkill,
    focusReason: focus.reasons.join('. '),
    difficulty: input.difficulty,
    totalMinutes: minutes,
    blocks,
    planToken: generateToken(),
    generatedAt: new Date().toISOString(),
  };
}

function drillFallback(sportId: string, skillCode: string): SportDrill {
  const sport = getSport(sportId);
  // Stay on the focus skill even when no drill matches the athlete's gear.
  return sport.drills.find((d) => d.skillCode === skillCode) ?? sport.drills[0]!;
}

function clampMinutes(minutes: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, Math.round(minutes / 5) * 5));
}

function defaultTarget(rating: number, attempts: number): number {
  // Athletes around 1000 should pass ~60%; elite 90%.
  const passRate = Math.min(0.9, Math.max(0.6, (rating - 800) / 2200 + 0.55));
  return Math.max(1, Math.round(attempts * passRate));
}

function challengeIntensity(rating: number): 'easy' | 'medium' | 'high' {
  if (rating < 1000) return 'medium';
  if (rating < 1300) return 'medium';
  return 'high';
}

function generateToken(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let out = '';
  for (let i = 0; i < 28; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}