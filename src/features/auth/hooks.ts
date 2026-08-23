import { useEffect, useState } from 'react';
import { sb } from '@/services/supabase';
import { identifyUser } from '@/services/analytics';
import { requestPasswordReset, resendVerification, signIn, signOut, signUp, updatePassword } from '@/features/auth/api';
import type { AuthResult, SignInInput, SignUpInput } from '@/features/auth/types';
import { useUserStore } from '@/store/userStore';

/**
 * Auth hooks — the single integration between Supabase auth and the app.
 * The root layout subscribes once via useAuthSubscription; every screen
 * reads the user from useUserStore.
 */

export function useAuthSubscription(): void {
  const setUser = useUserStore((s) => s.setUser);

  useEffect(() => {
    const { data: listener } = sb().auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      identifyUser(session?.user?.id ?? null);
    });

    // Restore the persisted session on launch.
    void sb()
      .auth.getSession()
      .then(({ data }) => {
        setUser(data.session?.user ?? null);
        identifyUser(data.session?.user?.id ?? null);
      })
      .catch(() => setUser(null));

    return () => listener.subscription.unsubscribe();
  }, [setUser]);
}

/** True once the initial session restore has settled (guards splash → app). */
export function useAuthReady(): boolean {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    void sb()
      .auth.getSession()
      .finally(() => setReady(true));
  }, []);
  return ready;
}

export function useAuthActions(): {
  signIn: (input: SignInInput) => Promise<AuthResult>;
  signUp: (input: SignUpInput) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<AuthResult>;
  updatePassword: (password: string) => Promise<AuthResult>;
  resendVerification: (email: string) => Promise<AuthResult>;
} {
  return {
    signIn,
    signUp,
    signOut,
    resetPassword: requestPasswordReset,
    updatePassword,
    resendVerification,
  };
}