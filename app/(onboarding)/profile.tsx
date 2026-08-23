import { ScrollView, Text, TextInput, View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/Button';
import { getSport } from '@/sports';
import { useOnboardingStore } from '@/features/onboarding/store';
import { useUserStore } from '@/store/userStore';
import { type } from '@/constants/typography';

/** Step 2 — athlete profile (name, position, height/weight). */
export default function ProfileScreen() {
  const { colors, radius, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const sport = useOnboardingStore((s) => s.data.sport);
  const data = useOnboardingStore((s) => s.data);
  const set = useOnboardingStore((s) => s.set);
  const user = useUserStore((s) => s.user);

  const sportConfig = getSport(sport);
  const fullName = data.fullName || user?.user_metadata?.full_name?.toString() || '';
  const position = data.position;
  const heightCm = data.heightCm?.toString() ?? '';
  const weightKg = data.weightKg?.toString() ?? '';

  const next = () => {
    const h = Number.parseFloat(heightCm);
    const w = Number.parseFloat(weightKg);
    router.push('/(onboarding)/experience');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}>
      <Text style={[type.caption, { color: colors.textMuted }]}>STEP 2 OF 6</Text>
      <Text style={[type.displayTitle, { color: colors.text, marginTop: 4 }]}>Your athlete profile.</Text>

      <ScrollView style={{ marginTop: spacing['2xl'] }} keyboardShouldPersistTaps="handled">
        <Text style={[type.label, { color: colors.textSecondary }]}>FULL NAME</Text>
        <TextInput value={fullName} onChangeText={(v) => set('fullName', v)} placeholder="Alex Rivers"
          placeholderTextColor={colors.textMuted}
          style={[styles.input, { backgroundColor: colors.inputBackground, borderRadius: radius.md, color: colors.text }]} />

        <Text style={[type.label, { color: colors.textSecondary, marginTop: spacing.lg }]}>POSITION</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {sportConfig.meta.positions.map((p) => {
            const selected = position === p;
            return (
              <Text
                key={p}
                onPress={() => set('position', selected ? null : p)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: selected ? colors.infoSoft : colors.surface,
                    borderColor: selected ? colors.primary : colors.border,
                    borderWidth: 1,
                    borderRadius: radius.full,
                    color: selected ? colors.primary : colors.textSecondary,
                  },
                ]}
              >
                {p}
              </Text>
            );
          })}
        </View>

        <View style={{ flexDirection: 'row', gap: 12, marginTop: spacing.lg }}>
          <View style={{ flex: 1 }}>
            <Text style={[type.label, { color: colors.textSecondary }]}>HEIGHT (CM)</Text>
            <TextInput value={heightCm} onChangeText={(v) => set('heightCm', toNumber(v))}
              keyboardType="numeric" placeholder="183" placeholderTextColor={colors.textMuted}
              style={[styles.input, { backgroundColor: colors.inputBackground, borderRadius: radius.md, color: colors.text }]} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[type.label, { color: colors.textSecondary }]}>WEIGHT (KG)</Text>
            <TextInput value={weightKg} onChangeText={(v) => set('weightKg', toNumber(v))}
              keyboardType="numeric" placeholder="82" placeholderTextColor={colors.textMuted}
              style={[styles.input, { backgroundColor: colors.inputBackground, borderRadius: radius.md, color: colors.text }]} />
          </View>
        </View>
      </ScrollView>      <Button label="CONTINUE" onPress={next} disabled={!fullName.trim()} size="lg" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24 },
  input: { padding: 16, fontSize: 16 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    fontWeight: '700',
    overflow: 'hidden',
  },
});

function toNumber(v: string): number | null {
  if (!v.trim()) return null;
  const n = Number.parseFloat(v);
  return Number.isFinite(n) ? n : null;
}
