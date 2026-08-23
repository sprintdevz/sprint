import { useQuery, useQueryClient } from '@tanstack/react-query';
import { cancelSubscription, fetchSubscription, startFreeTrial } from '@/features/subscription/api';

export function useSubscription(userId: string | null) {
  return useQuery({
    queryKey: ['subscription', userId],
    queryFn: () => fetchSubscription(userId ?? ''),
    enabled: !!userId,
    staleTime: 60_000,
  });
}

export function useSubscriptionActions() {
  const qc = useQueryClient();
  return {
    startTrial: async (userId: string) => {
      const result = await startFreeTrial(userId);
      await qc.invalidateQueries({ queryKey: ['subscription'] });
      return result;
    },
    cancel: async (userId: string) => {
      const result = await cancelSubscription(userId);
      await qc.invalidateQueries({ queryKey: ['subscription'] });
      return result;
    },
  };
}