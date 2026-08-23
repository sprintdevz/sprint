import { demoSignIn, resetDemoData, sb } from '@/services/supabase';
import { finalizeOnboardingWithAssessment } from '@/features/onboarding/api';
import { fetchAthleteOverview } from '@/features/athlete/api';
import { runAssessment } from '@/features/assessment/engine';
import { generateSession } from '@/features/training/generator';
import { createSession, submitSession } from '@/features/training/api';
import { fetchLeaderboard } from '@/features/competition/api';
import { getSport } from '@/sports';
import type { OnboardingData } from '@/features/onboarding/types';
import type { ChallengeResult } from '@/features/assessment/types';
import type { TrainingInput } from '@/features/training/types';
import type { SignInInput, SignUpInput } from '@/features/auth/types';
import { signIn, signOut, signUp } from '@/features/auth/api';

/**
 * Demo-mode integration — the full product loop (sign-in → onboarding →
 * assessment → ratings → session → ELO movement) against the
 * localStorage-backed demo backend, through the same APIs the screens use.
 */

const onboardingData: OnboardingData = {
  sport: 'basketball',
  position: 'Point Guard',
  fullName: 'Test Athlete',
  birthYear: 2000,
  heightCm: 185,
  weightKg: 80,
  experience: 'casual',
  goals: { primaryGoal: 'improve', secondaryGoal: null },
  training: { sessionsPerWeek: 3, minutesPerSession: 25, location: 'Indoor court' },
  equipment: ['basketball'],
  completed: true,
};

function medianAssessmentResult() {
  const sport = getSport('basketball');
  const initial = sport.assessments.find((a) => a.isInitial)!;
  const results: ChallengeResult[] = initial.challenges.map((c, i) => ({
    challengeIndex: i,
    skillCode: c.skillCode,
    performance: 0.5,
    benchmarkText: c.benchmarkLabel,
    raw: Math.round(c.attempts * 0.5),
  }));
  return runAssessment(initial, results, 'basketball');
}

const assessmentResult = medianAssessmentResult();

function eliteAssessmentResult() {
  const sport = getSport('basketball');
  const initial = sport.assessments.find((a) => a.isInitial)!;
  const results: ChallengeResult[] = initial.challenges.map((c, i) => ({
    challengeIndex: i,
    skillCode: c.skillCode,
    performance: 0.95,
    benchmarkText: c.benchmarkLabel,
    raw: Math.round(c.attempts * 0.95),
  }));
  return runAssessment(initial, results, 'basketball');
}

function trainingInput(ratings: Record<string, number>): TrainingInput {
  return {
    sport: 'basketball',
    position: 'Point Guard',
    goal: 'improve',
    skillRatings: ratings,
    recentSessions: [],
    equipment: ['basketball', 'hoop'],
    location: 'Indoor court',
    availableMinutes: 25,
    weeklyFrequency: 3,
    injuries: [],
    difficulty: 'intermediate',
    sessionsThisWeek: 0,
    seed: 42,
  };
}

async function currentUserId(): Promise<string> {
  const { data } = await sb().auth.getUser();
  return (data.user as { id: string } | null)?.id ?? '';
}

beforeEach(() => {
  resetDemoData();
});

describe('demo backend (real API surface)', () => {
  test('demo sign-in provisions a session and a hydrated athlete', async () => {
    const { ok } = await demoSignIn();
    expect(ok).toBe(true);

    const userId = await currentUserId();
    expect(userId).toBeTruthy();

    const overview = await fetchAthleteOverview(userId);
    // The seeded demo athlete is fully hydrated on first load.
    expect(overview).not.toBeNull();
    expect(overview!.overall!.rating).toBe(1247);
    expect(overview!.skills.length).toBeGreaterThanOrEqual(10);
    expect(overview!.streak!.current).toBeGreaterThanOrEqual(7);
  });

  test('auth signUp + signIn share the same local account', async () => {
    const create = await signUp({
      email: 'new@sprint.app',
      password: 'secret123',
      fullName: 'New Player',
      username: 'newplayer',
    } satisfies SignUpInput);
    expect(create.ok).toBe(true);

    await signOut();

    const back = await signIn({
      email: 'new@sprint.app',
      password: 'secret123',
    } satisfies SignInInput);
    expect(back.ok).toBe(true);
  });

  test('full onboarding loop: assessment → ratings → home snapshot', async () => {
    expect((await demoSignIn()).ok).toBe(true);
    const userId = await currentUserId();

    const { athleteId, error } = await finalizeOnboardingWithAssessment(onboardingData, assessmentResult);
    expect(error).toBeNull();
    expect(athleteId).toBeTruthy();

    const overview = await fetchAthleteOverview(userId);
    expect(overview).not.toBeNull();
    // Overall rating equals the weighted assessment rating.
    expect(overview!.overall!.rating).toBe(assessmentResult.overallRating);
    const decision = overview!.skills.find((s) => s.skillCode === 'decision');
    expect(decision).toBeDefined();
  });

  test('a perfect session raises ELO through the real engine', async () => {
    expect((await demoSignIn()).ok).toBe(true);
    const userId = await currentUserId();
    const { athleteId, error } = await finalizeOnboardingWithAssessment(onboardingData, assessmentResult);
    expect(error).toBeNull();

    const before = (await fetchAthleteOverview(userId))!;
    const plan = generateSession(trainingInput(assessmentResult.skillRatings));
    const { sessionId } = await createSession(athleteId, plan);
    expect(sessionId).toBeTruthy();

    const results: Record<string, number> = {};
    for (const b of plan.blocks) results[b.id] = b.target;
    const submission = await submitSession({
      sessionId: sessionId!,
      token: plan.planToken,
      results,
      xp: 200,
      completedAt: new Date().toISOString(),
    });
    expect(submission.ok).toBe(true);

    const after = (await fetchAthleteOverview(userId))!;
    expect(after.overall!.rating).toBeGreaterThan(before.overall!.rating);
  });

  test('leaderboard materializes the athlete after onboarding', async () => {
    expect((await demoSignIn()).ok).toBe(true);
    const { athleteId, error } = await finalizeOnboardingWithAssessment(onboardingData, eliteAssessmentResult());
    expect(error).toBeNull();

    const board = await fetchLeaderboard('global', { sport: 'basketball' });
    // An elite assessment should place the athlete inside the top-50 slice.
    expect(board.players.some((p) => p.athleteId === athleteId)).toBe(true);
    expect(board.totalPlayers).toBeGreaterThan(10);
  });

  test('session results persist and weekly count reflects them', async () => {
    expect((await demoSignIn()).ok).toBe(true);
    const userId = await currentUserId();
    const { athleteId } = await finalizeOnboardingWithAssessment(onboardingData, assessmentResult);

    const plan = generateSession(trainingInput(assessmentResult.skillRatings));
    const { sessionId } = await createSession(athleteId, plan);
    const results: Record<string, number> = {};
    for (const b of plan.blocks) results[b.id] = b.target;
    await submitSession({
      sessionId: sessionId!,
      token: plan.planToken,
      results,
      xp: 180,
      completedAt: new Date().toISOString(),
    });

    const overview = await fetchAthleteOverview(userId);
    expect(overview!.weeklySessionsCompleted).toBeGreaterThanOrEqual(1);
    expect(overview!.xpTotal).toBeGreaterThanOrEqual(180);
  });
});