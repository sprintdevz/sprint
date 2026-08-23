import { View, Text, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { SeasonCard } from '@/components/competition/SeasonCard';
import { useSeasons } from '@/features/competition/hooks';
import { useAthleteStore } from '@/store/athleteStore';
import { type } from '@/constants/typography';

/** All seasons — historical + active. */
export default function SeasonsScreen() {
  const { colors, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const sport = useAthleteStore((s) => s.athlete?.sport) ?? 'basketball';
  const { data: seasons, isLoading } = useSeasons(sport);

  return (
    <FlatList
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 32, paddingHorizontal: 24, gap: 12 }}
      data={seasons ?? []}
      keyExtractor={(s) => s.id}
      ListHeaderComponent={
        <View style={{ marginBottom: 4 }}>
          <Text style={[type.displayTitle, { color: colors.text }]}>Seasons</Text>
          <Text style={[type.bodySmall, { color: colors.textSecondary }]}>Every 8 weeks, a new race to improve.</Text>
        </View>
      }
      ListEmptyComponent={
        isLoading ? (
          <Text style={[type.body, { color: colors.textSecondary, textAlign: 'center', marginTop: 32 }]}>Loading seasons…</Text>
        ) : (
          <Text style={[type.body, { color: colors.textSecondary, textAlign: 'center', marginTop: 32 }]}>No seasons yet.</Text>
        )
      }
      renderItem={({ item }) => (
        <SeasonCard season={item} onPress={() => router.push({ pathname: '/compete/season', params: { seasonId: item.id } })} />
      )}
    />
  );
}

const styles = StyleSheet.create({});