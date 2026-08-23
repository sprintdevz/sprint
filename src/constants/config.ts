/**
 * Global product configuration.
 * Keep pricing, limits and copy centralized here so nothing is hardcoded
 * across screens. `EXPO_PUBLIC_*` values are inlined by Expo at bundle time.
 */

export const APP_NAME = 'SPRINT';
export const APP_TAGLINE = 'Athletic skill progression, gamified.';

export const APP_VERSION = '1.0.0';

/** Sports registered in the sport registry (src/sports). */
export const SUPPORTED_SPORTS = ['basketball', 'soccer', 'tennis'] as const;
export type SupportedSportId = (typeof SUPPORTED_SPORTS)[number];

/** Default sport when none is selected. */
export const DEFAULT_SPORT = 'basketball';

/** Supabase connectivity. */
export const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
export const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';
export const isSupabaseConfigured =
  SUPABASE_URL.length > 0 && SUPABASE_ANON_KEY.length > 0;

/** Rating system (sensible defaults — per-sport overrides live in sport config). */
export const RATING = {
  initial: 1000,
  initialDeviation: 350,
  minDeviation: 30,
  minRating: 300,
  maxRating: 3000,
  /** Games played before a rating stops being "provisional". */
  provisionalGames: 6,
} as const;

/** XP economy. */
export const XP = {
  challengeBase: 18,
  perfectBonus: 10,
  firstPlaceBonus: 14,
  streakMultiplierCap: 2, // max ×2 from streaks
} as const;

/** Streaks. */
export const STREAK = {
  /** A day counts toward the streak when this many minutes of training complete. */
  minutesPerDay: 10,
} as const;

/** Seasons. */
export const SEASON = {
  defaultWeeks: 8,
} as const;

/** Free / Pro plan entitlements — configured here, enforced in src/features/subscription. */
export const PLANS = {
  free: {
    sports: 1,
    sessionsPerWeek: 3,
    advancedAnalytics: false,
    videoAnalysis: false,
    premiumChallenges: false,
  },
  pro: {
    sports: 3,
    sessionsPerWeek: Number.POSITIVE_INFINITY,
    advancedAnalytics: true,
    videoAnalysis: true,
    premiumChallenges: true,
  },
} as const;

export type PlanId = 'free' | 'pro';

/** Notification defaults. */
export const NOTIFICATION_DEFAULTS = {
  sessionReminders: true,
  streakAlerts: true,
  milestoneAlerts: true,
  challengeAlerts: true,
  friendActivity: true,
  marketing: false,
  quietHoursStart: 22,
  quietHoursEnd: 8,
} as const;

/** Offline cache keys (AsyncStorage). */
export const CACHE_KEYS = {
  athlete: 'sprint.cache.athlete',
  ratings: 'sprint.cache.ratings',
  skills: 'sprint.cache.skills',
  session: 'sprint.cache.session',
  completedSession: 'sprint.cache.completed-session',
  leaderboard: 'sprint.cache.leaderboard',
} as const;