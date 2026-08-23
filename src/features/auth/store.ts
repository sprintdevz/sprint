import { create } from 'zustand';
import type { AuthState } from '@/features/auth/types';

interface AuthStore extends AuthState {
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthStore>()((set) => ({
  loading: false,
  error: null,
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  reset: () => set({ loading: false, error: null }),
}));