import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import {
  SpaceGrotesk_500Medium,
  SpaceGrotesk_600SemiBold,
  SpaceGrotesk_700Bold,
  useFonts,
} from '@expo-google-fonts/space-grotesk';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useAuthSubscription } from '@/features/auth/hooks';
import { useTheme } from '@/hooks/useTheme';
import { SafeAreaProvider } from 'react-native-safe-area-context';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 60_000,
    },
  },
});

/** Root layout — fonts, providers, gesture handling, session restore. */
export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    SpaceGrotesk_700Bold,
    SpaceGrotesk_600SemiBold,
    SpaceGrotesk_500Medium,
  });
  const { isDark } = useTheme();

  useAuthSubscription();

  useEffect(() => {
    if (fontsLoaded) void SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <StatusBar style={isDark ? 'light' : 'dark'} />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: 'transparent' },
              animation: 'fade_from_bottom',
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(onboarding)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="session/[sessionId]" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="session/challenge" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="session/rest" options={{ presentation: 'transparentModal' }} />
            <Stack.Screen name="session/results" options={{ animation: 'fade' }} />
            <Stack.Screen name="session/rating-change" options={{ animation: 'fade' }} />
            <Stack.Screen name="assessment/[assessmentId]" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="assessment/challenge" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="assessment/results" options={{ animation: 'fade' }} />
            <Stack.Screen name="assessment/rating" options={{ animation: 'fade' }} />
            <Stack.Screen name="skill/[skillId]" />
            <Stack.Screen name="skill/drills" />
            <Stack.Screen name="skill/history" />
            <Stack.Screen name="compete/leaderboard" />
            <Stack.Screen name="compete/seasons" />
            <Stack.Screen name="compete/season" />
            <Stack.Screen name="compete/friends" />
            <Stack.Screen name="compete/challenges" />
            <Stack.Screen name="profile/edit" />
            <Stack.Screen name="profile/statistics" />
            <Stack.Screen name="profile/achievements" />
            <Stack.Screen name="profile/settings" />
            <Stack.Screen name="settings/index" />
            <Stack.Screen name="settings/notifications" />
            <Stack.Screen name="settings/privacy" />
            <Stack.Screen name="settings/subscription" />
            <Stack.Screen name="settings/account" />
          </Stack>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}