import { create } from 'zustand';

/**
 * Active training session state — powers the session runner screen.
 * Persisted pieces (plan, completed challenges) are cached to AsyncStorage
 * so an interrupted session can be resumed offline.
 */

export interface SessionChallengeState {
  challengeId: string;
  label: string;
  skillCode: string;
  attempts: number;
  achieved: number;
  target: number;
  status: 'pending' | 'active' | 'done';
  xp: number;
}

export interface SessionState {
  sessionId: string | null;
  athleteId: string | null;
  sport: string;
  focusSkillCode: string | null;
  focusReason: string | null;
  durationMinutes: number;
  challenges: SessionChallengeState[];
  currentChallengeIndex: number;
  startedAt: string | null;
  completed: boolean;
  /** Number of challenges completed (derived from challenge states). */
  xpEarned: number;
  /** Set when this session was submitted to the server (duplicate guard). */
  submittedToken: string | null;
  hydrate: (data: Partial<SessionState>) => void;
  start: (sessionId: string, athleteId: string) => void;
  setChallengeResult: (
    index: number,
    achieved: number,
    opts?: { completed?: boolean; xp?: number },
  ) => void;
  nextChallenge: () => void;
  complete: () => void;
  reset: () => void;
}

const initialState: Omit<SessionState, 'hydrate' | 'start' | 'setChallengeResult' | 'nextChallenge' | 'complete' | 'reset'> = {
  sessionId: null,
  athleteId: null,
  sport: 'basketball',
  focusSkillCode: null,
  focusReason: null,
  durationMinutes: 25,
  challenges: [],
  currentChallengeIndex: 0,
  startedAt: null,
  completed: false,
  xpEarned: 0,
  submittedToken: null,
};

export const useSessionStore = create<SessionState>()((set, get) => ({
  ...initialState,
  hydrate: (data) => set((state) => ({ ...state, ...data })),
  start: (sessionId, athleteId) =>
    set({
      sessionId,
      athleteId,
      startedAt: new Date().toISOString(),
      currentChallengeIndex: 0,
      submittedToken: null,
    }),
  setChallengeResult: (index, result, opts) =>
    set((state) => ({
      challenges: state.challenges.map((c, i) =>
        i === index
          ? { ...c, achieved: result, status: opts?.completed ? 'done' : c.status, xp: opts?.xp ?? c.xp }
          : c,
      ),
    })),
  nextChallenge: () =>
    set((state) => ({
      currentChallengeIndex: Math.min(state.currentChallengeIndex + 1, state.challenges.length - 1),
    })),
  complete: () =>
    set((state) => ({
      completed: true,
      xpEarned: state.challenges.reduce((acc, c) => acc + c.xp, 0),
    })),
  reset: () => set({ ...initialState }),
}));