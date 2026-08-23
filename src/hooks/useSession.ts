import { useSessionStore } from '@/store/sessionStore';

/** Reads the active session runner state. */
export function useSession() {
  return useSessionStore();
}