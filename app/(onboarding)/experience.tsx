import { Pressable, ScrollView, Text, View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/Button';
import { EXPERIENCE_LEVELS } from '@/features/onboarding/types';
import { useOnboardingStore } from '@/features/onboarding/store';
import { type } from '@/constants/typography';

/** Step 3 — experience level (drives calibration priors). */
export default function ExperienceScreen() {
  const { colors, radius, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const experience = useOnboardingStore((s) => s.data.experience);
  const set = useOnboardingStore((s) => s.set);

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}>
      <Text style={[type.caption, { color: colors.textMuted }]}>STEP 3 OF 6</Text>
      <Text style={[type.displayTitle, { color: colors.text, marginTop: 4 }]}>How long have you played?</Text>
      <Text style={[type.body, { color: colors.textSecondary, marginTop: 4 }]}>
        Honest answer = better calibration.
      </Text>

      <ScrollView style={{ marginTop: spacing['2xl'] }} contentContainerStyle={{ gap: 12 }}>
        {EXPERIENCE_LEVELS.map((level) => {
          const selected = experience === level.code;
          return (
            <Pressable
              key={level.code}
              onPress={() => set('experience', level.code)}
              style={({ pressed }) => [
                styles.option,
                {
                  backgroundColor: colors.surface,
                  borderRadius: radius.lg,
                  borderWidth: 2,
                  borderColor: selected ? colors.primary : colors.border,
                  opacity: pressed ? 0.9 : 1,
                  padding: spacing.lg,
                },
              ]}
            >
              <View style={{ flex: 1 }}>
                <Text style={[type.sectionTitle, { color: colors.text }]}>{level.label}</Text>
                <Text style={[type.bodySmall, { color: colors.textSecondary }]}>{level.description}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={[type.caption, { color: colors.textMuted, fontSize: 10 }]}>{level.years}+ YEARS</Text>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>

      <Button label="CONTINUE" onPress={() => router.push('/(onboarding)/goals')} disabled={!experience} size="lg" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24 },
  option: { flexDirection: 'row', alignItems: 'center', gap: 12 },
});