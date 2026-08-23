import { create } from 'zustand';
import type { User } from '@supabase/supabase-js';

/** Auth session state (user identity + profile). */
interface UserState {
  user: User | null;
  profile: { id: string; fullName: string | null; username: string | null; avatarUrl: string | null } | null;
  setUser: (user: User | null) => void;
  setProfile: (profile: UserState['profile']) => void;
  updateProfile: (patch: Partial<NonNullable<UserState['profile']>>) => void;
  reset: () => void;
}

export const useUserStore = create<UserState>()((set) => ({
  user: null,
  profile: null,
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  updateProfile: (patch) =>
    set((state) => ({ profile: state.profile ? { ...state.profile, ...patch } : state.profile })),
  reset: () => set({ user: null, profile: null }),
}));