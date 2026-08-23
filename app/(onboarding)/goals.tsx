import { Pressable, ScrollView, Text, View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/Button';
import { useOnboardingStore } from '@/features/onboarding/store';
import { type } from '@/constants/typography';

const GOALS = [
  { code: 'all-around', title: 'All-Around Dominance', desc: 'No weaknesses. Raise the whole game.', icon: '🏆' },
  { code: 'scoring', title: 'Scoring Machine', desc: 'Shooting, finishing, spacing — score at will.', icon: '🎯' },
  { code: 'playmaker', title: 'Floor General', desc: 'Handle pressure, make the right read, set up teammates.', icon: '🧠' },
  { code: 'athletic', title: 'Athletic Peak', desc: 'Speed, explosiveness, conditioning.', icon: '⚡' },
  { code: 'lockdown', title: 'Lockdown Defender', desc: 'Become the player opponents avoid.', icon: '🛡️' },
] as const;

/** Step 4 — primary goal (shapes the training engine's optimization). */
export default function GoalsScreen() {
  const { colors, radius, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const goal = useOnboardingStore((s) => s.data.goals.primaryGoal);
  const set = useOnboardingStore((s) => s.set);

  const select = (code: string) => set('goals', { primaryGoal: code, secondaryGoal: null });

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}>
      <Text style={[type.caption, { color: colors.textMuted }]}>STEP 4 OF 6</Text>
      <Text style={[type.displayTitle, { color: colors.text, marginTop: 4 }]}>What's the mission?</Text>
      <Text style={[type.body, { color: colors.textSecondary, marginTop: 4 }]}>
        Your goal steers which skills SPRINT prioritizes.
      </Text>

      <ScrollView style={{ marginTop: spacing['2xl'] }} contentContainerStyle={{ gap: 10 }}>
        {GOALS.map((g) => {
          const selected = goal === g.code;
          return (
            <Pressable
              key={g.code}
              onPress={() => select(g.code)}
              style={({ pressed }) => [
                styles.option,
                {
                  backgroundColor: colors.surface,
                  borderRadius: radius.lg,
                  borderWidth: 2,
                  borderColor: selected ? colors.accent : colors.border,
                  padding: spacing.lg,
                  opacity: pressed ? 0.9 : 1,
                },
              ]}
            >
              <Text style={styles.emoji}>{g.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[type.sectionTitle, { color: colors.text }]}>{g.title}</Text>
                <Text style={[type.bodySmall, { color: colors.textSecondary }]}>{g.desc}</Text>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>

      <Button label="CONTINUE" onPress={() => router.push('/(onboarding)/training')} disabled={!goal} size="lg" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24 },
  option: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  emoji: { fontSize: 24 },
});