import type { RatingState } from '@/features/elo/types';

export type LeaderboardScope = 'global' | 'local' | 'age' | 'skill' | 'friends' | 'season';

export interface LeaderboardPlayer {
  rank: number;
  athleteId: string;
  displayName: string;
  sport: string;
  rating: number;
  improvement: number;
  streak: number;
  isPeerOfUser: boolean;
}

export interface Leaderboard {
  scope: LeaderboardScope;
  period: string;
  players: LeaderboardPlayer[];
  userRank: number | null;
  totalPlayers: number;
  focus?: string | null;
}

export interface Season {
  id: string;
  sport: string;
  name: string;
  code: string;
  startsAt: string;
  endsAt: string;
  status: 'upcoming' | 'active' | 'completed';
  minRating: number;
  rewards: Record<string, unknown>;
  playerCount?: number;
}

export interface SeasonPlayer {
  seasonId: string;
  startRating: number;
  peakRating: number;
  endRating: number | null;
  improvement: number;
  games: number;
  rank: number | null;
  percentile: number | null;
}

export interface CompetitiveChallenge {
  id: string;
  sport: string;
  title: string;
  description: string | null;
  metric: string;
  target: Record<string, unknown>;
  rewardXp: number;
  premium: boolean;
  startsAt: string;
  endsAt: string;
  status: 'upcoming' | 'active' | 'completed';
  /** Player progress when applicable. */
  progress?: number;
  completed?: boolean;
}

export interface Friend {
  id: string;
  userId: string;
  username: string;
  fullName: string | null;
  rating: number;
  streak: number;
  sport: string;
}