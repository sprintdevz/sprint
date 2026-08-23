import { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { ExerciseCounter } from '@/components/training/ExerciseCounter';
import { getSport } from '@/sports';
import { useAthleteStore } from '@/store/athleteStore';
import { runAssessment } from '@/features/assessment/engine';
import { stageAssessmentResult } from '@/features/assessment/transfer';
import type { ChallengeResult } from '@/features/assessment/types';
import { success as hapticSuccess } from '@/services/haptics';
import { type } from '@/constants/typography';

/** Challenge-by-challenge assessment runner (generic). */
export default function AssessmentChallengeScreen() {
  const { colors, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ assessmentId: string; index?: string }>();
  const sport = useAthleteStore((s) => s.athlete?.sport) ?? 'basketball';
  const assessment = getSport(sport).assessments.find((a) => a.id === params.assessmentId);

  const startIndex = Number(params.index ?? 0);
  const [index, setIndex] = useState(startIndex);
  const [scores, setScores] = useState<Record<number, number>>({});

  if (!assessment) return null;
  const challenge = assessment.challenges[index]!;
  const isLast = index >= assessment.challenges.length - 1;
  const current = scores[index] ?? 0;

  const record = (value: number) => {
    setScores((prev) => ({ ...prev, [index]: Math.max(0, value) }));
    void hapticSuccess();
  };

  const next = async () => {
    if (!isLast) {
      setIndex(index + 1);
      return;
    }
    const results: ChallengeResult[] = assessment.challenges.map((c, i) => {
      const raw = scores[i] ?? 0;
      const attempts = Array.from({ length: c.attempts }, (_, k) => (k === 0 ? Math.min(raw, c.attempts) : 0));
      const performance = c.performanceOf(attempts);
      return { challengeIndex: i, skillCode: c.skillCode, performance, benchmarkText: c.benchmarkLabel, raw };
    });
    const result = runAssessment(assessment, results, sport);
    await stageAssessmentResult(result);
    router.replace('/assessment/results');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 }]}>
      <View style={{ paddingHorizontal: 24 }}>
        <ProgressBar progress={(index + 1) / assessment.challenges.length} height={6} />
        <Text style={[type.caption, { color: colors.textMuted, marginTop: 8 }]}>
          {String(index + 1).padStart(2, '0')} / {assessment.challenges.length}
        </Text>
      </View>

      <View style={styles.center}>
        <Text style={[type.displayTitle, { color: colors.text, textTransform: 'uppercase', textAlign: 'center' }]}>
          {challenge.title}
        </Text>
        <Text style={[type.body, { color: colors.textSecondary, textAlign: 'center', marginTop: 6 }]}>
          {challenge.description}
        </Text>
        <Text style={[type.caption, { color: colors.textMuted, marginTop: 4 }]}>
          {challenge.attempts} ATTEMPTS · {challenge.benchmarkLabel.toUpperCase()}
        </Text>

        <View style={{ marginTop: spacing['3xl'] }}>
          <ExerciseCounter
            achieved={current}
            target={challenge.attempts}
            onIncrement={() => record(current + 1)}
            onIncrementBy={(n) => record(current + n)}
          />
          <Text style={[type.bodySmall, { color: colors.textMuted, textAlign: 'center', marginTop: spacing.md }]}>
            Tap + for each {challenge.metric.replace('reps', 'rep').replace('seconds', 'second')} completed
          </Text>
        </View>

        <Pressable onPress={next} style={{ marginTop: spacing['2xl'] }}>
          <Button label={isLast ? 'FINISH ASSESSMENT' : 'NEXT CHALLENGE'} size="lg" onPress={() => void next()} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', paddingHorizontal: 24, alignItems: 'center' },
});