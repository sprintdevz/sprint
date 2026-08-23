import { useEffect, useState } from 'react';
import { Redirect, useRootNavigationState } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { hasCompletedOnboarding } from '@/features/onboarding/persistence';

/**
 * Root index — decides the entry point:
 *   not signed in  → welcome
 *   signed in, no onboarding → onboarding
 *   signed in, onboarding done → tabs (home)
 */
export default function Index() {
  const { user, ready } = useAuth();
  const navigationReady = useRootNavigationState();
  const [onboarded, setOnboarded] = useState<boolean | null>(null);

  useEffect(() => {
    if (!user) {
      setOnboarded(null);
      return;
    }
    let mounted = true;
    void hasCompletedOnboarding().then((done) => {
      if (mounted) setOnboarded(done);
    });
    return () => {
      mounted = false;
    };
  }, [user]);

  if (!ready || !navigationReady || (user && onboarded === null)) return null;

  if (!user) return <Redirect href="/(auth)/welcome" />;
  if (!onboarded) return <Redirect href="/(onboarding)/sport" />;
  return <Redirect href="/(tabs)" />;
}