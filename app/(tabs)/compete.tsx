import { useMemo } from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useLeaderboard } from '@/features/competition/hooks';
import { PlayerRow } from '@/components/competition/PlayerRow';
import { useAthleteStore } from '@/store/athleteStore';
import { useElo } from '@/hooks/useElo';
import { ordinal } from '@/utils/formatting';
import { type } from '@/constants/typography';

/** COMPETE — leaderboard tabs, friends, challenges, seasons. */
export default function CompeteScreen() {
  const { colors, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const athlete = useAthleteStore((s) => s.athlete);
  const sport = athlete?.sport ?? 'basketball';
  const { rating, league } = useElo();
  const { data: leaderboard, isLoading, error } = useLeaderboard('global', { sport });

  const topPlayers = useMemo(() => leaderboard?.players.slice(0, 5) ?? [], [leaderboard]);

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 32, paddingHorizontal: 24, gap: 20 }}
    >
      <View style={styles.headerRow}>
        <View>
          <Text style={[type.displayTitle, { color: colors.text }]}>Compete.</Text>
          <Text style={[type.body, { color: colors.textSecondary }]}>You vs the floor.</Text>
        </View>
        <Badge label={`${league.label} · ${ordinal(leaderboard?.userRank ?? 0)}`} tone="accent" />
      </View>

      {/* Quick cards */}
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <QuickCard title="GLOBAL" onPress={() => router.push('/compete/leaderboard?scope=global')} />
        <QuickCard title="FRIENDS" onPress={() => router.push('/compete/friends')} />
        <QuickCard title="SEASONS" onPress={() => router.push('/compete/seasons')} />
        <QuickCard title="CHALLENGES" onPress={() => router.push('/compete/challenges')} />
      </View>

      <View style={{ gap: spacing.sm }}>
        <Text style={[type.sectionTitle, { color: colors.text }]}>GLOBAL TOP 5</Text>
        {error ? (
          <Card>
            <Text style={[type.bodySmall, { color: colors.danger }]}>Couldn't load the board.</Text>
          </Card>
        ) : isLoading || !leaderboard ? (
          <Card>
            <Text style={[type.bodySmall, { color: colors.textSecondary }]}>Loading…</Text>
          </Card>
        ) : topPlayers.length === 0 ? (
          <Card>
            <Text style={[type.bodySmall, { color: colors.textSecondary }]}>The board is warming up — be the first name on it.</Text>
          </Card>
        ) : (
          <View style={{ gap: 8 }}>
            {topPlayers.map((p) => (
              <PlayerRow key={p.athleteId} player={p} />
            ))}
          </View>
        )}
        <Text style={[type.bodySmall, { color: colors.primary, fontWeight: '700' }]} onPress={() => router.push('/compete/leaderboard?scope=global')}>
          Full leaderboard →
        </Text>
      </View>
    </ScrollView>
  );
}

function QuickCard({ title, onPress }: { title: string; onPress: () => void }) {
  const { colors, radius } = useTheme();
  return (
    <View style={{ flex: 1 }}>
      <Card style={{ alignItems: 'center', paddingVertical: 14 }} onPress={onPress}>
        <Text style={[type.label, { color: colors.primary, fontSize: 11 }]}>{title}</Text>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
});