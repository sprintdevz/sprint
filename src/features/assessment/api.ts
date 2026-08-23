import { sb } from '@/services/supabase';
import type { AssessmentResult } from '@/features/assessment/types';

/** Open (or resume) an assessment attempt row. */
export async function startAssessment(
  athleteId: string,
  assessmentId: string,
): Promise<{ attemptId: string | null; error: string | null }> {
  try {
    const { data, error } = await sb()
      .from('assessment_attempts')
      .insert({
        athlete_id: athleteId,
        assessment_id: assessmentId,
        status: 'in_progress',
        started_at: new Date().toISOString(),
      })
      .select('id')
      .single();
    return { attemptId: data?.id ?? null, error: error?.message ?? null };
  } catch (e) {
    return { attemptId: null, error: e instanceof Error ? e.message : 'Failed to start assessment' };
  }
}

/** Persist the completed assessment results server-side. */
export async function completeAssessment(
  attemptId: string,
  result: AssessmentResult,
): Promise<{ ok: boolean; error: string | null }> {
  try {
    const { error } = await sb()
      .from('assessment_attempts')
      .update({
        status: 'completed',
        completed_at: result.completedAt,
        score: result.overallScore,
        skill_results: result.skillScores,
        rating_deltas: result.skillRatings,
      })
      .eq('id', attemptId)
      .eq('status', 'in_progress'); // idempotency guard
    if (error) return { ok: false, error: error.message };

    // Per-skill result rows (for history views).
    const rows = result.results.map((r) => ({
      attempt_id: attemptId,
      skill_code: r.skillCode,
      score: r.performance,
      benchmark_text: r.benchmarkText,
      rating_delta: result.skillRatings[r.skillCode] ?? 0,
    }));
    if (rows.length) {
      await sb().from('assessment_results').insert(rows);
    }
    return { ok: true, error: null };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Failed to save assessment' };
  }
}

/** Idempotent calibration payload for the process-assessment edge function. */
export function edgeCalibrationPayload(athleteId: string, result: AssessmentResult) {
  return {
    athleteId,
    assessmentId: result.assessment.id,
    scores: result.skillScores,
    startedAt: result.completedAt,
  };
}