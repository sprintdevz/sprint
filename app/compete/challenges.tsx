import { View, Text, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { ChallengeCard } from '@/components/competition/ChallengeCard';
import { useActiveChallenges } from '@/features/competition/hooks';
import { useAthleteStore } from '@/store/athleteStore';
import { type } from '@/constants/typography';

/** Weekly challenges from the current season. */
export default function ChallengesScreen() {
  const { colors, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const sport = useAthleteStore((s) => s.athlete?.sport) ?? 'basketball';
  const { data: challenges, isLoading } = useActiveChallenges(sport);

  return (
    <FlatList
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 32, paddingHorizontal: 24, gap: 12 }}
      data={challenges ?? []}
      keyExtractor={(c) => c.id}
      ListHeaderComponent={
        <View style={{ marginBottom: 4 }}>
          <Text style={[type.displayTitle, { color: colors.text }]}>Challenges</Text>
          <Text style={[type.bodySmall, { color: colors.textSecondary }]}>
            Weekly objectives from the active season. Log sessions to complete them.
          </Text>
        </View>
      }
      ListEmptyComponent={
        isLoading ? (
          <View style={{ alignItems: 'center', marginTop: 40, gap: 8 }}>
            <ActivityIndicator color={colors.primary} />
            <Text style={[type.bodySmall, { color: colors.textSecondary }]}>Loading challenges…</Text>
          </View>
        ) : (
          <Text style={[type.body, { color: colors.textSecondary, textAlign: 'center', marginTop: 32 }]}>
            No active challenges right now — check back Sunday.
          </Text>
        )
      }
      renderItem={({ item }) => <ChallengeCard challenge={item} />}
    />
  );
}

const styles = StyleSheet.create({});