import { useUserStore } from '@/store/userStore';
import { useAuthReady } from '@/features/auth/hooks';

/** Convenience selector for the current user + boot readiness. */
export function useAuth() {
  const user = useUserStore((s) => s.user);
  const profile = useUserStore((s) => s.profile);
  const ready = useAuthReady();
  return { user, profile, ready, signedIn: !!user };
}