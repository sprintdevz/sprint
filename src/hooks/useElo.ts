import { useMemo } from 'react';
import { useAthleteStore } from '@/store/athleteStore';
import { createEloSystem } from '@/features/elo/engine';
import { leagueInfo, nextMilestone, leagueProgress, ratingTrend } from '@/features/elo/calculations';

/** Rating convenience: league info, milestone progress, engine instance. */
export function useElo() {
  const overall = useAthleteStore((s) => s.overallRating);
  const skills = useAthleteStore((s) => s.skills);

  return useMemo(() => {
    const rating = overall?.rating ?? 1000;
    const league = leagueInfo(rating);
    const next = nextMilestone(rating);
    const engine = createEloSystem();
    return {
      rating,
      league,
      nextMilestone: next,
      leagueProgress: leagueProgress(rating, next),
      trend: ratingTrend(skills.map((s) => s.rating)),
      isProvisional: overall ? engine.isProvisional(overall) : true,
      engine,
    };
  }, [overall, skills]);
}