import { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { CheetahAnimation } from '@/components/mascot/CheetahAnimation';
import { consumeStagedAssessmentResult } from '@/features/assessment/transfer';
import type { AssessmentResult } from '@/features/assessment/types';
import { getSport } from '@/sports';
import { useAthleteStore } from '@/store/athleteStore';
import { formatRating, formatPercent } from '@/utils/formatting';
import { type } from '@/constants/typography';

/** Assessment results — per-skill scores, ratings, then rating detail. */
const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
});

export default function AssessmentResultsScreen() {
  const { colors, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const sport = useAthleteStore((s) => s.athlete?.sport) ?? 'basketball';
  const sportConfig = getSport(sport);

  useEffect(() => {
    void consumeStagedAssessmentResult().then(setResult);
  }, []);

  if (!result) return null;

  const entries = Object.entries(result.skillRatings).sort((a, b) => b[1] - a[1]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, alignItems: 'center' }}>
        <CheetahAnimation mode="celebration" expression="excited" size={110} />
        <Text style={[type.displayTitle, { color: colors.text, marginTop: spacing.md }]}>Assessment complete</Text>
        <Text style={[type.body, { color: colors.textSecondary }]}>Your results are locked in.</Text>

        <Card style={{ width: '100%', marginTop: spacing['2xl'] }}>
          {entries.map(([code, rating], i) => (
            <View
              key={code}
              style={[styles.row, i < entries.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border, marginBottom: spacing.sm }]}
            >
              <Text style={[type.bodySmall, { color: colors.text }]}>
                {sportConfig.skills.find((s) => s.code === code)?.name ?? code}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={[type.bodySmall, { color: colors.textMuted }]}>{formatPercent(result.skillScores[code] ?? 0)}</Text>
                <Text style={[type.bodySmall, { color: colors.text, fontWeight: '800', fontVariant: ['tabular-nums'] }]}>
                  {formatRating(rating)}
                </Text>
              </View>
            </View>
          ))}
        </Card>

        <Badge label={`OVERALL ${formatRating(result.overallRating)}`} tone="navy" />
      </ScrollView>

      <View style={{ paddingHorizontal: 24 }}>
        <Button label="RATING DETAILS" size="lg" onPress={() => router.push('/assessment/rating')} />
      </View>
    </View>
  );
}

