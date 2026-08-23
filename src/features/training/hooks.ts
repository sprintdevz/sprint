import { useCallback, useState } from 'react';
import { generateSession } from '@/features/training/generator';
import { createSession, startSession } from '@/features/training/api';
import type { SessionPlan, TrainingInput } from '@/features/training/types';
import { useAthleteStore } from '@/store/athleteStore';
import { useSessionStore } from '@/store/sessionStore';

/**
 * Training hooks — generate + start a session for the current athlete,
 * keeping the plan in the session store so the runner renders instantly.
 */
export function useGenerateSession() {
  const athlete = useAthleteStore((s) => s.athlete);
  const skills = useAthleteStore((s) => s.skills);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const buildInput = useCallback(
    (minutes?: number): TrainingInput | null => {
      if (!athlete) return null;
      const ratings: Record<string, number> = {};
      for (const s of skills) ratings[s.skillCode] = s.rating;
      return {
        sport: athlete.sport,
        position: athlete.position,
        goal: athlete.goal,
        skillRatings: ratings,
        recentSessions: [],
        equipment: [],
        location: null,
        availableMinutes: minutes ?? 25,
        weeklyFrequency: athlete.trainingFrequency ?? 3,
        injuries: [],
        difficulty: 'intermediate',
        sessionsThisWeek: 0,
      };
    },
    [athlete, skills],
  );

  const plan = useCallback(
    async (minutes?: number): Promise<SessionPlan | null> => {
      setGenerating(true);
      setError(null);
      try {
        const input = buildInput(minutes);
        if (!input) return null;
        return generateSession(input);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to generate session');
        return null;
      } finally {
        setGenerating(false);
      }
    },
    [buildInput],
  );

  const hydrateRunner = useCallback((generated: SessionPlan, sessionId: string | null) => {
    useSessionStore.getState().hydrate({
      sessionId,
      athleteId: useAthleteStore.getState().athlete?.id ?? null,
      sport: useAthleteStore.getState().athlete?.sport ?? 'basketball',
      focusSkillCode: generated.focusSkillCode,
      focusReason: generated.focusReason,
      durationMinutes: generated.totalMinutes,
      challenges: generated.blocks.map((b, i) => ({
        challengeId: b.id,
        label: b.title,
        skillCode: b.skillCode,
        attempts: b.attempts,
        achieved: 0,
        target: b.target,
        status: i === 0 ? ('active' as const) : ('pending' as const),
        xp: b.xp,
      })),
    });
  }, []);

  const planAndStart = useCallback(
    async (minutes?: number): Promise<{ sessionId: string | null; plan: SessionPlan | null }> => {
      const generated = await plan(minutes);
      if (!generated) return { sessionId: null, plan: null };

      const athleteId = useAthleteStore.getState().athlete?.id;
      let serverId: string | null = null;
      if (athleteId) {
        const { sessionId, error: createError } = await createSession(athleteId, generated);
        if (!createError && sessionId) {
          serverId = sessionId;
          await startSession(serverId);
        }
      }
      // Offline or not, the runner always works from local state.
      hydrateRunner(generated, serverId);
      return { sessionId: serverId, plan: generated };
    },
    [plan, hydrateRunner],
  );

  return { plan, planAndStart, generating, error };
}