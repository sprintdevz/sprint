import { z } from 'zod';

/** Server-bounded score submission. */
export const assessmentSubmissionSchema = z.object({
  assessmentId: z.string().min(1),
  scores: z.record(z.string(), z.number().min(0).max(1)),
  startedAt: z.string().datetime().optional(),
});

/** Sanity check on raw attempts before they enter scoring. */
export function validateAttempts(
  values: number[],
  allowed: number,
): { ok: boolean; error?: string } {
  if (values.length === 0) return { ok: false, error: 'No attempts recorded' };
  if (values.some((v) => !Number.isFinite(v) || v < 0)) {
    return { ok: false, error: 'Invalid attempt values' };
  }
  if (values.length > allowed) return { ok: false, error: 'Too many attempts' };
  return { ok: true };
}