import { useUserStore } from '@/store/userStore';
import { useSubscription as useSubscriptionQuery } from '@/features/subscription/hooks';
import { isPro } from '@/features/subscription/entitlements';

/** Convenience wrapper exposing plan gating for UI. */
export function useSubscription() {
  const user = useUserStore((s) => s.user);
  const { data, isLoading, error } = useSubscriptionQuery(user?.id ?? null);
  const plan = data?.plan ?? 'free';
  return {
    plan,
    state: data,
    isLoading,
    error,
    isPro: isPro(plan),
  };
}