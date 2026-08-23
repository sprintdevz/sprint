import type { LeaderboardPlayer, LeaderboardScope } from '@/features/competition/types';

/** Sort + rank players by rating (desc), breaking ties by improvement. */
export function rankPlayers(
  players: Array<Omit<LeaderboardPlayer, 'rank'>>,
): LeaderboardPlayer[] {
  const sorted = [...players].sort((a, b) => b.rating - a.rating || b.improvement - a.improvement);
  return sorted.map((p, i) => ({ ...p, rank: i + 1 }));
}

/** Percentile (0..1) of the user's rank among players. */
export function percentileOfRank(rank: number, total: number): number {
  if (total <= 1) return 1;
  return Math.max(0, Math.min(1, 1 - (rank - 1) / (total - 1)));
}

export function scopeLabel(scope: LeaderboardScope): string {
  switch (scope) {
    case 'global': return 'Global';
    case 'local': return 'Your Area';
    case 'age': return 'Your Age Group';
    case 'skill': return 'Skill';
    case 'friends': return 'Friends';
    case 'season': return 'Season';
  }
}

/** Peer-group selector — beginners compare with beginners. */
export function peerGroupFor(rating: number): string {
  if (rating < 800) return 'rookie';
  if (rating < 1100) return 'bronze';
  if (rating < 1400) return 'gold';
  if (rating < 1700) return 'platinum';
  if (rating < 2000) return 'diamond';
  return 'master';
}