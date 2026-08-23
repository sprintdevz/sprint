import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { getSport } from '@/sports';
import { runAssessment } from '@/features/assessment/engine';
import { stageAssessmentResult } from '@/features/assessment/transfer';
import type { ChallengeResult } from '@/features/assessment/types';
import { useOnboardingStore } from '@/features/onboarding/store';
import { success as hapticSuccess, tap as hapticTap } from '@/services/haptics';
import { type } from '@/constants/typography';

/**
 * The initial assessment — one challenge at a time, big score entry,
 * haptic feedback per rep. Scored by the engine; the reveal lives on
 * assessment-results.
 */
export default function OnboardingAssessmentScreen() {
  const { colors, radius, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ assessmentId?: string }>();
  const sportId = useOnboardingStore((s) => s.data.sport) || 'basketball';
  const sport = getSport(sportId);
  const assessment =
    sport.assessments.find((a) => a.id === params.assessmentId) ??
    sport.assessments.find((a) => a.isInitial);

  const [index, setIndex] = useState(0);
  const [rawValues, setRawValues] = useState<Record<number, number>>({});
  const [entered, setEntered] = useState('');

  if (!assessment) return null;
  const challenge = assessment.challenges[index]!;
  const isLast = index === assessment.challenges.length - 1;
  const current = rawValues[index] ?? 0;

  const inc = (step: number) => {
    const next = Math.max(0, current + step);
    setRawValues((prev) => ({ ...prev, [index]: next }));
    setEntered('');
    if (step > 0) void hapticSuccess();
    else void hapticTap();
  };

  const nextChallenge = () => {
    if (isLast) {
      void finishAssessment();
      return;
    }
    setIndex(index + 1);
    setEntered('');
  };

  const finishAssessment = async () => {
    const results: ChallengeResult[] = assessment.challenges.map((c, i) => {
      const raw = Math.max(0, rawValues[i] ?? 0);
      const attempts = Array.from({ length: c.attempts }, (_, k) => (k === 0 ? Math.min(raw, c.attempts) : 0));
      const performance = c.performanceOf(attempts);
      return { challengeIndex: i, skillCode: c.skillCode, performance, benchmarkText: c.benchmarkLabel, raw };
    });
    const result = runAssessment(assessment, results, sportId);
    await stageAssessmentResult(result);
    void hapticSuccess();
    router.push('/(onboarding)/assessment-results');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}>
      <Text style={[type.caption, { color: colors.textMuted }]}>
        CHALLENGE {String(index + 1).padStart(2, '0')} / {String(assessment.challenges.length).padStart(2, '0')}
      </Text>
      <View style={{ marginTop: spacing.sm }}>
        <ProgressBar progress={(index + 1) / assessment.challenges.length} height={6} />
      </View>

      <Text style={[type.displayTitle, { color: colors.text, marginTop: spacing['2xl'], textTransform: 'uppercase' }]}>
        {challenge.title}
      </Text>
      <Text style={[type.body, { color: colors.textSecondary, marginTop: 6 }]}>{challenge.description}</Text>
      <Text style={[type.caption, { color: colors.textMuted, marginTop: 4 }]}>
        {challenge.attempts} ATTEMPTS · {challenge.benchmarkLabel.toUpperCase()}
      </Text>

      <View style={[styles.score, { marginTop: spacing['3xl'] }]}>
        <Text style={[type.displayHero, { color: colors.text, fontVariant: ['tabular-nums'] }]}>{current}</Text>
        <Text style={[type.caption, { color: colors.textMuted }]}>SCORE</Text>
      </View>

      <View style={[styles.counterRow, { backgroundColor: colors.navySurface, borderRadius: radius.xl, padding: spacing.lg }]}>
        <Pressable onPress={() => inc(-1)} style={styles.countBtn} accessibilityLabel="Decrease score" hitSlop={8}>
          <Text style={styles.countBtnText}>−</Text>
        </Pressable>
        <View style={styles.centerBox}>
          <Text style={[type.caption, { color: colors.onNavyMuted, fontSize: 9 }]}>OR TYPE IT</Text>
          <TextInput
            value={entered}
            onChangeText={(v) => {
              setEntered(v);
              const n = Number.parseFloat(v);
              if (Number.isFinite(n)) setRawValues((prev) => ({ ...prev, [index]: n }));
            }}
            placeholder={`${challenge.benchmarkLabel}`}
            placeholderTextColor={colors.onNavyMuted}
            keyboardType="numeric"
            style={[styles.valueInput, { color: colors.onNavy }]}
          />
        </View>
        <Pressable onPress={() => inc(1)} style={styles.countBtn} accessibilityLabel="Increase score" hitSlop={8}>
          <Text style={styles.countBtnText}>+</Text>
        </Pressable>
      </View>

      <Button label={isLast ? 'FINISH & SEE RESULTS' : 'NEXT CHALLENGE'} onPress={nextChallenge} size="lg" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24 },
  score: { alignItems: 'center', gap: 0 },
  counterRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 32 },
  centerBox: { flex: 1, alignItems: 'center', gap: 4 },
  countBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  countBtnText: { color: '#FFFFFF', fontSize: 34, fontWeight: '700' },
  valueInput: { fontSize: 18, fontWeight: '700', textAlign: 'center', minWidth: 120 },
});