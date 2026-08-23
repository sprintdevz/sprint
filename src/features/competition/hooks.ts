import { useQuery } from '@tanstack/react-query';
import {
  fetchActiveChallenges,
  fetchLeaderboard,
  fetchSeasons,
  listFriends,
} from '@/features/competition/api';
import type { LeaderboardScope } from '@/features/competition/types';

export function useLeaderboard(
  scope: LeaderboardScope,
  opts: { sport?: string; focus?: string | null; seasonId?: string; enabled?: boolean } = {},
) {
  return useQuery({
    queryKey: ['leaderboard', scope, opts.sport, opts.focus, opts.seasonId],
    queryFn: () => fetchLeaderboard(scope, opts),
    enabled: opts.enabled ?? true,
    staleTime: 2 * 60_000,
  });
}

export function useSeasons(sport: string) {
  return useQuery({
    queryKey: ['seasons', sport],
    queryFn: () => fetchSeasons(sport),
    staleTime: 15 * 60_000,
  });
}

export function useActiveChallenges(sport: string) {
  return useQuery({
    queryKey: ['challenges', sport],
    queryFn: () => fetchActiveChallenges(sport),
    staleTime: 2 * 60_000,
  });
}

export function useFriends(userId: string | null) {
  return useQuery({
    queryKey: ['friends', userId],
    queryFn: () => listFriends(userId ?? ''),
    enabled: !!userId,
    staleTime: 60_000,
  });
}