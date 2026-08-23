import { create } from 'zustand';
import type { RatingState } from '@/features/elo/types';

/**
 * Athlete store — the "Where am I?" source of truth on device.
 * Mirrors the server athlete record + ratings so screens render instantly
 * from cache while TanStack Query refreshes in the background.
 */

export interface AthleteProfile {
  id: string;
  userId: string;
  sport: string;
  position: string | null;
  heightCm: number | null;
  weightKg: number | null;
  experienceYears: number;
  experienceLevel: string | null;
  goal: string | null;
  trainingFrequency: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface AthleteSkillState {
  skillCode: string;
  rating: number;
  deviation: number;
  mastery: number;
  trend: number;
  attempts: number;
  personalBest: number;
  lastPlayedAt: string | null;
}

export interface StreakState {
  current: number;
  longest: number;
  lastActive: string | null;
}

interface AthleteState {
  athlete: AthleteProfile | null;
  overallRating: RatingState | null;
  sportRating: RatingState | null;
  skills: AthleteSkillState[];
  streak: StreakState | null;
  loading: boolean;
  error: string | null;
  setAthlete: (athlete: AthleteProfile) => void;
  setRatings: (overall: RatingState | null, sport: RatingState | null) => void;
  setSkills: (skills: AthleteSkillState[]) => void;
  setStreak: (streak: StreakState | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useAthleteStore = create<AthleteState>()((set) => ({
  athlete: null,
  overallRating: null,
  sportRating: null,
  skills: [],
  streak: null,
  loading: false,
  error: null,
  setAthlete: (athlete) => set({ athlete }),
  setRatings: (overall, sport) => set({ overallRating: overall, sportRating: sport }),
  setSkills: (skills) => set({ skills }),
  setStreak: (streak) => set({ streak }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  reset: () =>
    set({ athlete: null, overallRating: null, sportRating: null, skills: [], streak: null, loading: false, error: null }),
}));