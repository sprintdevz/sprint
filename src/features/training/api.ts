import { sb } from '@/services/supabase';
import type { SessionPlan, SessionSubmission } from '@/features/training/types';

/**
 * Training persistence.
 * Sessions are created server-side (planned), started, then completed once
 * with an anti-duplicate plan_token. The client sends results; the server
 * applies ELO via the calculate-elo function.
 */

export async function createSession(athleteId: string, plan: SessionPlan): Promise<{
  sessionId: string | null;
  error: string | null;
}> {
  try {
    const { data, error } = await sb()
      .from('sessions')
      .insert({
        athlete_id: athleteId,
        sport: 'basketball', // resolved from athlete later via join; keep in sync
        focus_skill_code: plan.focusSkillCode,
        focus_reason: plan.focusReason,
        status: 'planned',
        difficulty: plan.difficulty,
        minutes: plan.totalMinutes,
        plan,
        plan_token: plan.planToken,
      })
      .select('id, plan_token')
      .single();
    if (error) return { sessionId: null, error: error.message };
    return { sessionId: data?.id ?? null, error: null };
  } catch (e) {
    return { sessionId: null, error: e instanceof Error ? e.message : 'Failed to create session' };
  }
}

/**
 * Submit completed session results. `token` makes the call idempotent:
 * a second submission with the same token is ignored server-side.
 */
export async function submitSession(submission: SessionSubmission): Promise<{
  ok: boolean;
  error: string | null;
}> {
  try {
    const { data, error } = await sb()
      .from('sessions')
      .update({
        status: 'completed',
        completed_at: submission.completedAt,
        xp: submission.xp,
        plan: { token: submission.token, results: submission.results },
      })
      .eq('id', submission.sessionId)
      .eq('plan_token', submission.token)
      .select('id');
    if (error) return { ok: false, error: error.message };
    return { ok: (data?.length ?? 0) > 0, error: null };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Failed to submit session' };
  }
}

export async function startSession(sessionId: string): Promise<void> {
  await sb().from('sessions').update({ status: 'active', started_at: new Date().toISOString() })
    .eq('id', sessionId)
    .select();
}

/** Sessions completed this week (for the weekly limit + streak math). */
export async function countWeeklySessions(athleteId: string): Promise<number> {
  const weekAgo = new Date(Date.now() - 7 * 86_400_000).toISOString();
  const { count } = await sb()
    .from('sessions')
    .select('id', { count: 'exact', head: true })
    .eq('athlete_id', athleteId)
    .eq('status', 'completed')
    .gte('completed_at', weekAgo);
  return count ?? 0;
}