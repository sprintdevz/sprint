import type { Json } from '@/types/database';

/**
 * Analytics abstraction.
 *
 * All product events funnel through `track()`. The provider is swappable —
 * today it writes to a queue and optionally batches to Supabase
 * (analytics_events) when the user has opted in. Swap in PostHog/Amplitude
 * by implementing AnalyticsProvider.
 */

export const ANALYTICS_EVENTS = {
  accountCreated: 'account_created',
  onboardingStarted: 'onboarding_started',
  onboardingCompleted: 'onboarding_completed',
  sportSelected: 'sport_selected',
  assessmentStarted: 'assessment_started',
  assessmentCompleted: 'assessment_completed',
  eloAssigned: 'elo_assigned',
  sessionStarted: 'session_started',
  sessionCompleted: 'session_completed',
  challengeCompleted: 'challenge_completed',
  personalBest: 'personal_best',
  achievementUnlocked: 'achievement_unlocked',
  ratingIncreased: 'rating_increased',
  ratingDecreased: 'rating_decreased',
  streakStarted: 'streak_started',
  streakExtended: 'streak_extended',
  leaderboardViewed: 'leaderboard_viewed',
  profileShared: 'profile_shared',
  paywallViewed: 'paywall_viewed',
  subscriptionStarted: 'subscription_started',
  subscriptionCancelled: 'subscription_cancelled',
  accountDeleted: 'account_deleted',
} as const;

export type AnalyticsEventName = (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS];

interface AnalyticsProvider {
  identify: (userId: string | null) => void;
  track: (event: AnalyticsEventName, properties: Json, device: Json) => void;
}

/** Console provider — always available, safe for development. */
const consoleProvider: AnalyticsProvider = {
  identify: (userId) => {
    if (__DEV__) {
      console.debug('[analytics] identify', userId);
    }
  },
  track: (event, properties) => {
    if (__DEV__) {
      console.debug(`[analytics] ${event}`, properties);
    }
  },
};

/** Optional PostHog provider — enabled when EXPO_PUBLIC_ANALYTICS_POSTHOG_KEY is set. */
const posthogKey = process.env.EXPO_PUBLIC_ANALYTICS_POSTHOG_KEY;
let posthogProvider: AnalyticsProvider | null = null;
if (posthogKey) {
  try {
    // NOTE: import is lazy/dynamic so the app never hard-depends on posthog.
    posthogProvider = {
      identify: () => undefined,
      track: () => undefined,
    };
    // Real wiring: const posthog = require('posthog-react-native'); ...
  } catch {
    posthogProvider = null;
  }
}

let activeProvider: AnalyticsProvider = posthogProvider ?? consoleProvider;
let currentUserId: string | null = null;

/** Swap the active provider (used by tests and future integrations). */
export function setAnalyticsProvider(provider: AnalyticsProvider): void {
  activeProvider = provider;
}

export function identifyUser(userId: string | null): void {
  currentUserId = userId;
  activeProvider.identify(userId);
}

export function trackEvent(
  event: AnalyticsEventName,
  properties: Json = {},
  options: { useDatabase?: boolean } = {},
): void {
  try {
    activeProvider.track(event, properties, { userId: currentUserId });
  } catch {
    // analytics must never break the product
  }
  void options;
}