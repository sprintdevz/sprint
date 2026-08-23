import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { Card } from '@/components/ui/Card';
import { CircularProgress } from '@/components/ui/CircularProgress';
import { useAthleteStore } from '@/store/athleteStore';
import { useElo } from '@/hooks/useElo';
import { formatRating } from '@/utils/formatting';
import { type } from '@/constants/typography';

/** Statistics — aggregates of rating, XP, streaks and consistency. */
export default function StatisticsScreen() {
  const { colors, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const skills = useAthleteStore((s) => s.skills);
  const { rating, league } = useElo();

  const avg = skills.length ? Math.round(skills.reduce((a, s) => a + s.rating, 0) / skills.length) : 0;
  const best = Math.max(0, ...skills.map((s) => s.rating));
  const weakest = skills.length ? Math.min(...skills.map((s) => s.rating)) : 0;

  return (
    <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 32, paddingHorizontal: 24, gap: 16 }}>
      <Text style={[type.displayTitle, { color: colors.text }]}>Statistics</Text>

      <View style={[styles.hero, { backgroundColor: colors.navySurface, borderRadius: 20, padding: spacing['2xl'], alignItems: 'center' }]}>
        <CircularProgress progress={0.72} size={110} label={formatRating(rating)} sublabel={league.label} />
        <Text style={[type.caption, { color: colors.onNavyMuted, marginTop: 8 }]}>ALL-TIME ELO</Text>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        <Stat label="BEST SKILL" value={formatRating(best)} />
        <Stat label="AVERAGE" value={formatRating(avg)} />
        <Stat label="WEAKEST" value={formatRating(weakest)} />
        <Stat label="SESSIONS" value="24" />
        <Stat label="STREAK (BEST)" value="12" />
        <Stat label="PERFECT DAYS" value="4" />
      </View>

      <Card>
        <Text style={[type.bodySmall, { color: colors.textSecondary, textAlign: 'center' }]}>
          Your rating reflects demonstrated ability. XP tracks participation. Both matter — differently.
        </Text>
      </Card>
    </ScrollView>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  const { colors, radius, type, spacing } = useTheme();
  return (
    <View style={{ width: '31%', backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, alignItems: 'center' }}>
      <Text style={[type.statSmall, { color: colors.text, fontSize: 20 }]}>{value}</Text>
      <Text style={[type.caption, { color: colors.textMuted, fontSize: 9, marginTop: 2 }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {},
});