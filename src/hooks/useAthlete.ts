import { useCallback, useEffect } from 'react';
import { fetchAthleteOverview, loadCachedAthlete } from '@/features/athlete/api';
import { useAthleteStore } from '@/store/athleteStore';
import { useUserStore } from '@/store/userStore';
import type { AthleteOverview } from '@/features/athlete/types';

/**
 * Loads the athlete snapshot (cache-first, network-refresh) and hydrates
 * the athlete store. All screens read from the store.
 */
export function useAthlete(loadOnMount = true): {
  loading: boolean;
  error: string | null;
  refresh: () => Promise<AthleteOverview | null>;
} {
  const user = useUserStore((s) => s.user);
  const loading = useAthleteStore((s) => s.loading);
  const error = useAthleteStore((s) => s.error);
  const setLoading = useAthleteStore((s) => s.setLoading);
  const setError = useAthleteStore((s) => s.setError);
  const setAthlete = useAthleteStore((s) => s.setAthlete);
  const setRatings = useAthleteStore((s) => s.setRatings);
  const setSkills = useAthleteStore((s) => s.setSkills);

  const refresh = useCallback(async () => {
    if (!user) return null;
    setLoading(true);
    setError(null);
    try {
      // Fast path: show cached snapshot while network refreshes.
      const cached = await loadCachedAthlete();
      if (cached) hydrateStore(cached);
      const fresh = await fetchAthleteOverview(user.id);
      if (fresh) hydrateStore(fresh);
      return fresh;
    } catch (e) {
      const cached = await loadCachedAthlete();
      if (cached) hydrateStore(cached);
      setError(e instanceof Error ? e.message : 'Failed to load athlete');
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, setLoading, setError, setAthlete, setRatings, setSkills]);

  const hydrateStore = useCallback(
    (overview: AthleteOverview) => {
      setAthlete({
        id: overview.athlete.id,
        userId: user?.id ?? '',
        sport: overview.athlete.sport,
        position: overview.athlete.position,
        heightCm: null,
        weightKg: null,
        experienceYears: 0,
        experienceLevel: overview.athlete.experienceLevel,
        goal: overview.athlete.goal,
        trainingFrequency: overview.athlete.trainingFrequency,
        createdAt: '',
        updatedAt: '',
      });
      setRatings(overview.overall, overview.sportRating);
      setSkills(
        overview.skills.map((s) => ({
          skillCode: s.skillCode,
          rating: s.rating,
          deviation: s.deviation,
          mastery: s.mastery,
          trend: s.trend,
          attempts: s.attempts,
          personalBest: s.personalBest,
          lastPlayedAt: null,
        })),
      );
    },
    [user, setAthlete, setRatings, setSkills],
  );

  useEffect(() => {
    if (loadOnMount && user) void refresh();
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  return { loading, error, refresh };
}