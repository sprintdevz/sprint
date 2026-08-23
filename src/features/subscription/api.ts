import { sb } from '@/services/supabase';
import type { PlanName, SubscriptionState } from '@/features/subscription/types';

export async function fetchSubscription(userId: string): Promise<SubscriptionState | null> {
  const { data } = await sb()
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!data) return null;
  return {
    plan: data.plan as PlanName,
    status: data.status,
    renewsAt: data.renews_at,
    startedAt: data.started_at,
  };
}

/**
 * Placeholder for StoreKit / Play Billing integration.
 * In production this endpoint is replaced by the store purchase flow +
 * a server-side webhook; the client only reflects the stored state.
 */
export async function startFreeTrial(userId: string): Promise<{ ok: boolean; error: string | null }> {
  try {
    const { error } = await sb().from('subscriptions').upsert({
      user_id: userId,
      plan: 'pro',
      status: 'active',
      provider: 'trial',
      started_at: new Date().toISOString(),
      renews_at: new Date(Date.now() + 7 * 86_400_000).toISOString(),
    });
    return { ok: !error, error: error?.message ?? null };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Trial failed' };
  }
}

export async function cancelSubscription(userId: string): Promise<{ ok: boolean; error: string | null }> {
  try {
    const { error } = await sb()
      .from('subscriptions')
      .update({ status: 'canceled', canceled_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('plan', 'pro');
    return { ok: !error, error: error?.message ?? null };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Cancel failed' };
  }
}