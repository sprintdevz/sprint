import { PLANS } from '@/constants/config';
import type { PlanName } from '@/features/subscription/types';

/**
 * Entitlements — single place that answers "can this athlete do X?".
 * Server-side enforcement lives in edge functions; this is the client mirror
 * used for gating UI. Free limits are configured in src/constants/config.
 */

export function isPro(plan: PlanName): boolean {
  return plan === 'pro';
}

export function canTrain(plan: PlanName, sessionsThisWeek: number): boolean {
  const limit = PLANS[plan].sessionsPerWeek;
  return sessionsThisWeek < limit;
}

export function canPlaySport(plan: PlanName, sportsCount: number): boolean {
  return sportsCount <= PLANS[plan].sports;
}

export function canUseAdvancedAnalytics(plan: PlanName): boolean {
  return PLANS[plan].advancedAnalytics;
}

export function canUseVideoAnalysis(plan: PlanName): boolean {
  return PLANS[plan].videoAnalysis;
}

export function canAccessPremiumChallenge(plan: PlanName): boolean {
  return PLANS[plan].premiumChallenges;
}

export function sessionsLeftThisWeek(plan: PlanName, used: number): number {
  const limit = PLANS[plan].sessionsPerWeek;
  if (!Number.isFinite(limit)) return Number.POSITIVE_INFINITY;
  return Math.max(0, limit - used);
}

export function planName(plan: PlanName): string {
  return plan === 'pro' ? 'PRO' : 'FREE';
}