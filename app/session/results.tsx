import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { CheetahAnimation } from '@/components/mascot/CheetahAnimation';
import { useSessionStore } from '@/store/sessionStore';
import { useAthleteStore } from '@/store/athleteStore';
import { formatXp } from '@/utils/formatting';
import { type } from '@/constants/typography';

/** SESSION COMPLETE — XP earned, challenge results, then rating change. */
export default function SessionResultsScreen() {
  const { colors, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const challenges = useSessionStore((s) => s.challenges);
  const xpEarned = useSessionStore((s) => s.xpEarned);
  const rating = useAthleteStore((s) => s.overallRating?.rating ?? 0);

  const passed = challenges.filter((c) => c.achieved >= c.target).length;

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}>
      <CheetahAnimation mode="celebration" expression="celebrating" size={130} />
      <Text style={[type.displayTitle, { color: colors.text, marginTop: spacing.lg }]}>SESSION COMPLETE</Text>
      <Text style={[type.displayLarge, { color: colors.accent }]}>{formatXp(xpEarned)}</Text>

      <Card style={styles.summary}>
        <Row label="Challenges passed" value={`${passed}/${challenges.length}`} />
        <Row label="Focus" value={useSessionStore.getState().focusSkillCode ?? '—'} />
        <Row label="New personal bests" value="0" last />
      </Card>

      <View style={{ flex: 1 }} />
      <Button label="SEE RATING CHANGE" size="lg" onPress={() => router.push('/session/rating-change')} />
    </View>
  );
}

function Row({ label, value, last }: { label: string; value: string; last?: boolean }) {
  const { colors, type, spacing } = useTheme();
  return (
    <View style={[styles.row, !last && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border, marginBottom: spacing.sm }]}>
      <Text style={[type.bodySmall, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[type.bodySmall, { color: colors.text, fontWeight: '700' }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24, alignItems: 'center' },
  summary: { width: '100%', marginTop: 24 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
});