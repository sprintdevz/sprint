import { Pressable, ScrollView, Text, View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/Button';
import { useOnboardingStore } from '@/features/onboarding/store';
import { applyOnboardingPreferences } from '@/features/onboarding/api';
import { trackEvent } from '@/services/analytics';
import { type } from '@/constants/typography';

/** Step 6 — equipment (the trainer only assigns drills you can actually do). */
export default function EquipmentScreen() {
  const { colors, radius, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const sport = useOnboardingStore((s) => s.data.sport);
  const selected = useOnboardingStore((s) => s.data.equipment);
  const set = useOnboardingStore((s) => s.set);

  const equipment = [
    { slug: 'basketball', name: 'Basketball', icon: 'basketball' },
    { slug: 'hoop', name: 'Court / Hoop', icon: 'business' },
    { slug: 'cones', name: 'Cones', icon: 'flag' },
    { slug: 'wall', name: 'Wall', icon: 'business' },
    { slug: 'sled', name: 'Sled / Bands', icon: 'gym' },
    { slug: 'stopwatch', name: 'Stopwatch', icon: 'timer' },
  ];

  const toggle = (slug: string) => {
    const next = selected.includes(slug) ? selected.filter((s) => s !== slug) : [...selected, slug];
    set('equipment', next);
  };

  const finish = async () => {
    void applyOnboardingPreferences(useOnboardingStore.getState().data).catch(() => undefined);
    trackEvent('onboarding_completed', { sport });
    router.push('/(onboarding)/assessment-intro');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}>
      <Text style={[type.caption, { color: colors.textMuted }]}>STEP 6 OF 6</Text>
      <Text style={[type.displayTitle, { color: colors.text, marginTop: 4 }]}>What do you have?</Text>
      <Text style={[type.body, { color: colors.textSecondary, marginTop: 4 }]}>
        Pick what you can use today. Sessions adapt to your gear.
      </Text>

      <ScrollView style={{ marginTop: spacing['2xl'] }} contentContainerStyle={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {equipment.map((e) => {
          const on = selected.includes(e.slug);
          return (
            <Pressable key={e.slug} onPress={() => toggle(e.slug)}
              style={({ pressed }) => [
                styles.tile,
                {
                  backgroundColor: on ? colors.infoSoft : colors.surface,
                  borderColor: on ? colors.primary : colors.border,
                  borderWidth: 2,
                  borderRadius: radius.lg,
                  opacity: pressed ? 0.9 : 1,
                },
              ]}>
              <Text style={styles.tileEmoji}>{e.icon}</Text>
              <Text style={[type.bodySmall, { color: on ? colors.primary : colors.text, fontWeight: on ? '700' : '400' }]}>{e.name}</Text>
              <Ionicons name={on ? 'checkmark-circle' : 'add-circle-outline'} size={18} color={on ? colors.primary : colors.textMuted} style={{ marginTop: 4 }} />
            </Pressable>
          );
        })}
      </ScrollView>

      <Button label="CONTINUE TO ASSESSMENT" onPress={finish} size="lg" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24 },
  tile: { width: '47%', alignItems: 'center', padding: 16, gap: 2 },
  tileEmoji: { fontSize: 26 },
});