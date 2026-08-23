import { useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/Button';
import { SessionProgress } from '@/components/training/SessionProgress';
import { ExerciseCounter } from '@/components/training/ExerciseCounter';
import { MascotBubble } from '@/components/mascot/MascotBubble';
import { useSessionStore } from '@/store/sessionStore';
import { success as hapticSuccess } from '@/services/haptics';
import { formatXp } from '@/utils/formatting';
import { type } from '@/constants/typography';

/** ACTIVE CHALLENGE — the big counter, the game moment. */
export default function ChallengeScreen() {
  const { colors, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const challenges = useSessionStore((s) => s.challenges);
  const index = useSessionStore((s) => s.currentChallengeIndex);
  const setResult = useSessionStore((s) => s.setChallengeResult);
  const next = useSessionStore((s) => s.nextChallenge);
  const complete = useSessionStore((s) => s.complete);
  const advancing = useRef(false);

  const challenge = challenges[index];
  if (!challenge) {
    router.replace('/session/[sessionId]');
    return null;
  }

  const done = challenge.achieved >= challenge.target;
  const doneCount = challenges.filter((c) => c.status === 'done').length;
  const xpEarned = challenges.reduce((acc, c) => acc + (c.status === 'done' ? c.xp : 0), 0);

  const handleDone = () => {
    if (advancing.current) return;
    advancing.current = true;
    setResult(index, challenge.achieved, { completed: true });
    void hapticSuccess();
    if (index >= challenges.length - 1) {
      complete();
      router.replace('/session/results');
    } else {
      next();
      router.push('/session/rest');
    }
  };

  const bump = (amount: number) => {
    const achieved = Math.min(challenge.target, Math.max(0, challenge.achieved + amount));
    setResult(index, achieved);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 }]}>
      <View style={{ paddingHorizontal: 24 }}>
        <SessionProgress done={doneCount + (done ? 1 : 0)} total={challenges.length} xp={xpEarned} />
      </View>

      <View style={styles.center}>
        <MascotBubble text={done ? 'Clean. Lock it in.' : 'Every rep counts.'} expression={done ? 'excited' : 'focused'} size={80} position="side" />

        <Text style={[type.caption, { color: colors.textMuted }]}>
          CHALLENGE {String(index + 1).padStart(2, '0')}
        </Text>
        <Text style={[type.displayTitle, { color: colors.text, textAlign: 'center', textTransform: 'uppercase' }]}>
          {challenge.label}
        </Text>
        <Text style={[type.caption, { color: colors.textMuted, marginTop: 2 }]}>
          {challenge.target} TARGET · {formatXp(challenge.xp)}
        </Text>

        <View style={{ marginTop: spacing['3xl'], alignItems: 'center' }}>
          <ExerciseCounter
            achieved={challenge.achieved}
            target={challenge.target}
            onIncrement={() => bump(1)}
            onIncrementBy={(n) => bump(n)}
          />
        </View>

        {done && (
          <View style={{ marginTop: spacing['2xl'], width: '100%' }}>
            <Button label="NEXT →" size="lg" onPress={handleDone} />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    gap: 6,
  },
});