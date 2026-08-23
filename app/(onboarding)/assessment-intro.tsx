import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { MascotBubble } from '@/components/mascot/MascotBubble';
import { getSport } from '@/sports';
import { useOnboardingStore } from '@/features/onboarding/store';
import { trackEvent } from '@/services/analytics';
import { type } from '@/constants/typography';

/** Pre-assessment intro — set expectations, then dive in. */
export default function AssessmentIntroScreen() {
  const { colors, spacing, type } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const sport = useOnboardingStore((s) => s.data.sport);
  const assessment = getSport(sport).assessments.find((a) => a.isInitial);

  const start = () => {
    trackEvent('assessment_started', { sport, assessment: assessment?.code });
    router.push({ pathname: '/(onboarding)/assessment', params: { assessmentId: assessment?.id ?? '' } });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}>
      <MascotBubble text="Ten quick challenges. We find your level — then the real work starts." expression="focused" size={90} />
      <Text style={[type.displayTitle, { color: colors.text, marginTop: spacing['2xl'] }]}>Your first assessment</Text>
      <Text style={[type.body, { color: colors.textSecondary, marginTop: spacing.sm }]}>
        {assessment?.description ?? 'Test every core skill once. This sets your starting SPRINT rating.'}
      </Text>

      <View style={{ marginTop: spacing['2xl'], gap: spacing.md }}>
        <Card>
          <Row label="Challenges" value={`${assessment?.challenges.length ?? 10}`} />
          <Row label="Estimated time" value={`${assessment?.minutes ?? 12} min`} />
          <Row label="What you get" value="Starting skill ratings + ELO" last />
        </Card>
      </View>

      <Text style={[type.bodySmall, { color: colors.textMuted, textAlign: 'center', marginTop: spacing.lg }]}>
        No gear? Do your best with what's around — honesty keeps your rating real.
      </Text>
      <Button label="START ASSESSMENT" onPress={start} size="lg" />
    </View>
  );
}

function Row({ label, value, last }: { label: string; value: string; last?: boolean }) {
  const { colors, type } = useTheme();
  return (
    <View style={[styles.row, !last && styles.rowBorder]}>
      <Text style={[type.bodySmall, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[type.bodySmall, { color: colors.text, fontWeight: '700' }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10 },
  rowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(0,0,0,0.06)' },
});