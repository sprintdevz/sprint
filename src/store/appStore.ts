import { create } from 'zustand';

interface AppState {
  /** Supabase bootstrap finished (session restored, fonts loaded). */
  ready: boolean;
  /** Connection observed recently. */
  online: boolean;
  /** Whether the app is inside the session runner view (hides tab bar). */
  sessionActive: boolean;
  /** Last known error banner (transient UI state). */
  banner: string | null;
}

interface AppActions {
  setReady: (value: boolean) => void;
  setOnline: (value: boolean) => void;
  setSessionActive: (value: boolean) => void;
  showBanner: (message: string) => void;
  clearBanner: () => void;
}

const initialState: AppState = {
  ready: false,
  online: true,
  sessionActive: false,
  banner: null,
};

export const useAppStore = create<AppState & AppActions>()((set) => ({
  ...initialState,
  setReady: (ready) => set({ ready }),
  setOnline: (online) => set({ online }),
  setSessionActive: (sessionActive) => set({ sessionActive }),
  showBanner: (banner) => set({ banner }),
  clearBanner: () => set({ banner: null }),
}));