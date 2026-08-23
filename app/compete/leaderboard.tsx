import { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { Leaderboard } from '@/components/competition/Leaderboard';
import { useLeaderboard } from '@/features/competition/hooks';
import { useAthleteStore } from '@/store/athleteStore';
import { scopeLabel } from '@/features/competition/leaderboard';
import type { LeaderboardScope } from '@/features/competition/types';
import { trackEvent } from '@/services/analytics';
import { type } from '@/constants/typography';

const SCOPES: LeaderboardScope[] = ['global', 'friends', 'local', 'age'];

/** Leaderboard screen with scope switcher — never blank, always contextual. */
export default function LeaderboardScreen() {
  const { colors, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ scope?: string }>();
  const [scope, setScope] = useState<LeaderboardScope>((params.scope as LeaderboardScope) ?? 'global');
  const sport = useAthleteStore((s) => s.athlete?.sport) ?? 'basketball';
  const { data, isLoading, error, refetch } = useLeaderboard(scope, { sport });

  const switchScope = (s: LeaderboardScope) => {
    setScope(s);
    trackEvent('leaderboard_viewed', { scope: s });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16 }]}>
      <View style={{ paddingHorizontal: 24 }}>
        <Text style={[type.displayTitle, { color: colors.text }]}>Leaderboard</Text>
        <View style={[styles.chips, { marginTop: spacing.md }]}>
          {SCOPES.map((s) => {
            const active = scope === s;
            return (
              <Pressable
                key={s}
                onPress={() => switchScope(s)}
                style={[styles.chip, { backgroundColor: active ? colors.primary : colors.surface, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 }]}
              >
                <Text style={[type.caption, { color: active ? '#FFFFFF' : colors.textSecondary, fontSize: 11 }]}>{scopeLabel(s)}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={{ flex: 1, marginTop: spacing.md, paddingHorizontal: 24 }}>
        <Leaderboard
          data={data ?? null}
          loading={isLoading}
          error={error?.message ?? null}
          onRetry={() => void refetch()}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {},
});