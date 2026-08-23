import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useSeasons } from '@/features/competition/hooks';
import { useAthleteStore } from '@/store/athleteStore';
import { useElo } from '@/hooks/useElo';
import { remainingDays } from '@/utils/dates';
import { formatDate, formatRating } from '@/utils/formatting';
import { type } from '@/constants/typography';

/** Season detail — your run through the season, rewards, standings. */
export default function SeasonScreen() {
  const { colors, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ seasonId?: string }>();
  const sport = useAthleteStore((s) => s.athlete?.sport) ?? 'basketball';
  const { data: seasons } = useSeasons(sport);
  const { rating, league } = useElo();
  const season = seasons?.find((s) => s.id === params.seasonId);

  if (!season) return null;
  const active = season.status === 'active';
  const days = remainingDays(new Date(season.endsAt));

  return (
    <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 32, paddingHorizontal: 24, gap: 16 }}>
      <Text style={[type.displayTitle, { color: colors.text }]}>{season.name}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Badge label={season.status.toUpperCase()} tone={active ? 'accent' : 'neutral'} />
        <Text style={[type.bodySmall, { color: colors.textMuted }]}>
          {formatDate(season.startsAt)} → {formatDate(season.endsAt)}
        </Text>
      </View>

      <View style={{ flexDirection: 'row', gap: 10 }}>
        <StatCard label="YOUR RATING" value={formatRating(rating)} />
        <StatCard label="LEAGUE" value={league.label} />
        <StatCard label={active ? 'DAYS LEFT' : 'FINAL'} value={active ? String(days) : season.status.toUpperCase()} />
      </View>

      <Card>
        <Text style={[type.label, { color: colors.textSecondary, fontSize: 11 }]}>REWARDS</Text>
        <Text style={[type.body, { color: colors.text, marginTop: 4 }]}>
          {String(season.rewards.title ?? 'Season rewards')} · {String(season.rewards.xp ?? 0)} XP
        </Text>
      </Card>

      <Text style={[type.bodySmall, { color: colors.textSecondary, textAlign: 'center' }]}>
        Season standings, percentile and your improvement land here at the end of the season — {season.code}.
      </Text>
    </ScrollView>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  const { colors, radius, type, spacing } = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, alignItems: 'center' }}>
      <Text style={[type.caption, { color: colors.textMuted, fontSize: 9 }]}>{label}</Text>
      <Text style={[type.statSmall, { color: colors.text, fontSize: 18 }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({});