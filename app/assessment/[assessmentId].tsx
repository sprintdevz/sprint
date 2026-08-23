import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { getSport } from '@/sports';
import { useAthleteStore } from '@/store/athleteStore';
import { type } from '@/constants/typography';

/** Generic assessment intro (post-onboarding hurdles). */
const styles = StyleSheet.create({
  container: { flex: 1 },
});

export default function AssessmentIntroScreen() {
  const { colors, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ assessmentId: string }>();
  const sport = useAthleteStore((s) => s.athlete?.sport) ?? 'basketball';
  const assessment = getSport(sport).assessments.find((a) => a.id === params.assessmentId);

  if (!assessment) return null;

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 24 }}>
        <Text style={[type.caption, { color: colors.textMuted }]}>ASSESSMENT</Text>
        <Text style={[type.displayTitle, { color: colors.text, marginTop: 4 }]}>{assessment.title}</Text>
        <Text style={[type.body, { color: colors.textSecondary, marginTop: 8 }]}>{assessment.description}</Text>

        <View style={{ marginTop: spacing['2xl'], gap: spacing.md }}>
          <Card>
            <Text style={[type.bodySmall, { color: colors.textSecondary }]}>
              {assessment.challenges.length} challenges · {assessment.minutes} min · {assessment.difficulty}
            </Text>
          </Card>
          {assessment.premium && (
            <Text style={[type.bodySmall, { color: colors.warning, textAlign: 'center' }]}>PRO ASSESSMENT</Text>
          )}
        </View>
      </ScrollView>

      <View style={{ paddingHorizontal: 24 }}>
        <Button
          label="START ASSESSMENT"
          size="lg"
          onPress={() =>
            router.push({ pathname: '/assessment/challenge', params: { assessmentId: assessment.id, index: '0' } })
          }
        />
      </View>
    </View>
  );
}