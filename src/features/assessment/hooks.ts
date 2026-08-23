import { useCallback, useState } from 'react';
import { getSport } from '@/sports';
import { runAssessment } from '@/features/assessment/engine';
import { completeAssessment, startAssessment } from '@/features/assessment/api';
import type { AssessmentResult, ChallengeResult } from '@/features/assessment/types';

/**
 * Assessment runner hook — owns the flow state for challenge-by-challenge
 * evaluations and produces the final AssessmentResult.
 */
export function useAssessmentRunner(athleteId: string | null, sportId: string, assessmentId: string) {
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<ChallengeResult[]>([]);
  const [finished, setFinished] = useState<AssessmentResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const begin = useCallback(async () => {
    if (!athleteId) return null;
    const { attemptId: id, error: err } = await startAssessment(athleteId, assessmentId);
    if (err) {
      setError(err);
      return null;
    }
    setAttemptId(id);
    setResults([]);
    setFinished(null);
    setError(null);
    return id;
  }, [athleteId, assessmentId]);

  /** Record one challenge result (replaces by index). */
  const record = useCallback((result: ChallengeResult) => {
    setResults((prev) => {
      const next = [...prev];
      const idx = next.findIndex((r) => r.challengeIndex === result.challengeIndex);
      if (idx >= 0) next[idx] = result;
      else next.push(result);
      return next;
    });
  }, []);

  /** Finalize the assessment and persist it. */
  const finalize = useCallback(async (): Promise<AssessmentResult | null> => {
    setRunning(true);
    setError(null);
    try {
      const assessment = getSport(sportId).assessments.find((a) => a.id === assessmentId);
      if (!assessment) throw new Error('Assessment not found');
      const result = runAssessment(assessment, results, sportId);
      setFinished(result);
      if (attemptId) {
        const { error: saveError } = await completeAssessment(attemptId, result);
        if (saveError) setError(saveError);
      }
      return result;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Assessment failed');
      return null;
    } finally {
      setRunning(false);
    }
  }, [sportId, assessmentId, results, attemptId]);

  return { attemptId, running, results, finished, error, begin, record, finalize };
}