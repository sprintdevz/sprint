import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_KEY = 'sprint.onboarding.completed';

/** Persist that onboarding finished (athlete + first session created). */
export async function markOnboardingComplete(): Promise<void> {
  try {
    await AsyncStorage.setItem(ONBOARDING_KEY, '1');
  } catch {
    // non-fatal
  }
}

export async function hasCompletedOnboarding(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(ONBOARDING_KEY)) === '1';
  } catch {
    return false;
  }
}