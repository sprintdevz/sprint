import { Pressable, ScrollView, Text, View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/Button';
import { useOnboardingStore } from '@/features/onboarding/store';
import type { OnboardingTraining } from '@/features/onboarding/types';
import { getSport } from '@/sports';
import { type } from '@/constants/typography';

const FREQUENCIES = [1, 2, 3, 4, 5, 6];
const DURATIONS = [15, 20, 25, 30, 45, 60];

/** Step 5 — training frequency, session length and location. */
export default function TrainingScreen() {
  const { colors, radius, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const sport = useOnboardingStore((s) => s.data.sport);
  const training = useOnboardingStore((s) => s.data.training);
  const set = useOnboardingStore((s) => s.set);

  const locations = getSport(sport).meta.locations;
  const update = (patch: Partial<OnboardingTraining>) => set('training', { ...training, ...patch });

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}>
      <Text style={[type.caption, { color: colors.textMuted }]}>STEP 5 OF 6</Text>
      <Text style={[type.displayTitle, { color: colors.text, marginTop: 4 }]}>Your training routine.</Text>

      <ScrollView style={{ marginTop: spacing['2xl'] }} contentContainerStyle={{ gap: 8 }}>
        <Text style={[type.label, { color: colors.textSecondary }]}>SESSIONS PER WEEK</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {FREQUENCIES.map((n) => (
            <Chip key={n} label={`${n}×`} selected={training.sessionsPerWeek === n}
              onPress={() => update({ sessionsPerWeek: n })} />
          ))}
        </View>

        <Text style={[type.label, { color: colors.textSecondary, marginTop: spacing.lg }]}>SESSION LENGTH (MIN)</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {DURATIONS.map((n) => (
            <Chip key={n} label={`${n}`} selected={training.minutesPerSession === n}
              onPress={() => update({ minutesPerSession: n })} />
          ))}
        </View>

        <Text style={[type.label, { color: colors.textSecondary, marginTop: spacing.lg }]}>WHERE DO YOU TRAIN?</Text>
        <View style={{ gap: 8 }}>
          {locations.map((loc) => {
            const selected = training.location === loc;
            return (
              <Pressable key={loc} onPress={() => update({ location: loc })}
                style={[styles.option, { backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: selected ? colors.primary : colors.border }]}>
                <Text style={[type.bodySmall, { color: selected ? colors.primary : colors.text, fontWeight: selected ? '700' : '400' }]}>{loc}</Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <Button label="CONTINUE" onPress={() => router.push('/(onboarding)/equipment')} disabled={!training.location} size="lg" />
    </View>
  );
}

function Chip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  const { colors, radius } = useTheme();
  return (
    <Pressable onPress={onPress}
      style={[styles.chip, { backgroundColor: selected ? colors.infoSoft : colors.surface, borderColor: selected ? colors.primary : colors.border, borderWidth: 1, borderRadius: radius.full }]}>
      <Text style={[type.label, { color: selected ? colors.primary : colors.textSecondary, fontSize: 13 }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24 },
  chip: { paddingHorizontal: 16, paddingVertical: 12 },
  option: { padding: 14 },
});