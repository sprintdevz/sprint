import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
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
import { leagueInfo } from '@/features/elo/calculations';
import { formatRating } from '@/utils/formatting';
import { trackEvent } from '@/services/analytics';
import { success as hapticSuccess } from '@/services/haptics';
import { useOnboardingStore } from '@/features/onboarding/store';
import { finalizeOnboardingWithAssessment } from '@/features/onboarding/api';
import { type } from '@/constants/typography';

/** THE reveal — "YOUR SPRINT ELO". Excited cheetah, hero number, next steps. */
const styles = StyleSheet.create({
  container: { flex: 1 },
  insights: {},
  next: { alignItems: 'center' },
});

export default function AssessmentResultsScreen() {
  const { colors, spacing, radius } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const sportId = useSportIdFromParams();
  const sport = getSport(sportId);

  useEffect(() => {
    void consumeStagedAssessmentResult().then((r) => {
      setResult(r);
      if (r) {
        // Persist athlete + ratings + skills (demo or real backend).
        const data = useOnboardingStore.getState().data;
        if (data.sport) {
          void finalizeOnboardingWithAssessment(data, r).catch(() => undefined);
        }
        trackEvent('assessment_completed', { rating: r.overallRating });
        trackEvent('elo_assigned', { rating: r.overallRating });
        void hapticSuccess();
      }
    });
  }, []);

  if (!result) return null;

  const league = leagueInfo(result.overallRating);
  const strongest = result.strongestSkill ? sport.skills.find((s) => s.code === result.strongestSkill) : null;
  const opportunity = result.biggestOpportunity ? sport.skills.find((s) => s.code === result.biggestOpportunity) : null;

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}>
      <ScrollView contentContainerStyle={{ alignItems: 'center', paddingHorizontal: 24 }}>
        <CheetahAnimation mode="celebration" expression="celebrating" size={130} />
        <Text style={[type.caption, { color: colors.textMuted, marginTop: spacing.lg, letterSpacing: 2 }]}>YOUR SPRINT ELO</Text>
        <Text style={[type.displayHero, { color: colors.text, marginTop: 4 }]}>{formatRating(result.overallRating)}</Text>
        <Badge label={league.label} tone="navy" />

        <View style={[styles.insights, { marginTop: spacing['2xl'], gap: spacing.md, width: '100%' }]}>
          <Card style={{ backgroundColor: colors.successSoft }}>
            <Text style={[type.caption, { color: colors.success, fontSize: 10 }]}>YOUR STRONGEST SKILL</Text>
            <Text style={[type.sectionTitle, { color: colors.text, marginTop: 2 }]}>
              {strongest?.name ?? '—'}
            </Text>
            {strongest && (
              <Text style={[type.bodySmall, { color: colors.textSecondary, marginTop: 2 }]}>
                {formatRating(result.skillRatings[strongest.code] ?? 1000)}
              </Text>
            )}
          </Card>
          <Card style={{ backgroundColor: colors.warningSoft }}>
            <Text style={[type.caption, { color: colors.warning, fontSize: 10 }]}>BIGGEST OPPORTUNITY</Text>
            <Text style={[type.sectionTitle, { color: colors.text, marginTop: 2 }]}>
              {opportunity?.name ?? '—'}
            </Text>
            {opportunity && (
              <Text style={[type.bodySmall, { color: colors.textSecondary, marginTop: 2 }]}>
                Close this gap and your ELO climbs fastest.
              </Text>
            )}
          </Card>
        </View>

        <View style={[styles.next, { marginTop: spacing['2xl'] }]}>
          <Text style={[type.caption, { color: colors.textMuted }]}>NEXT MILESTONE</Text>
          <Text style={[type.stat, { color: colors.text }]}>
            {formatRating(league.nextFloor >= result.overallRating ? league.nextFloor : result.overallRating + 50)}
          </Text>
        </View>
      </ScrollView>

      <View style={{ paddingHorizontal: 24 }}>
        <Button label="START FIRST SESSION" size="lg" onPress={() => router.push('/(onboarding)/first-session')} />
      </View>
    </View>
  );
}

function useSportIdFromParams(): string {
  // During onboarding the selected sport lives in the onboarding store.
  return useOnboardingStore((s) => s.data.sport) || 'basketball';
}