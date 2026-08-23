import { Pressable, ScrollView, Text, View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/Button';
import { listSports } from '@/sports';
import { useOnboardingStore } from '@/features/onboarding/store';
import { trackEvent } from '@/services/analytics';
import { type } from '@/constants/typography';

/** Step 1 — choose the sport. Basketball is fully live; soccer/tennis are wired. */
export default function SportScreen() {
  const { colors, radius, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const sport = useOnboardingStore((s) => s.data.sport);
  const set = useOnboardingStore((s) => s.set);

  const sports = listSports();

  const next = () => {
    if (!sport) return;
    trackEvent('sport_selected', { sport });
    router.push('/(onboarding)/profile');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}>
      <Text style={[type.caption, { color: colors.textMuted }]}>STEP 1 OF 6</Text>
      <Text style={[type.displayTitle, { color: colors.text, marginTop: 4 }]}>What do you play?</Text>
      <Text style={[type.body, { color: colors.textSecondary, marginTop: 4 }]}>
        Pick your primary sport. You can add more with Pro.
      </Text>

      <ScrollView style={{ marginTop: spacing['2xl'] }} contentContainerStyle={{ gap: 12 }}>
        {sports.map((s) => {
          const selected = sport === s.meta.id;
          return (
            <Pressable
              key={s.meta.id}
              onPress={() => set('sport', s.meta.id)}
              style={({ pressed }) => [
                styles.option,
                {
                  backgroundColor: colors.surface,
                  borderRadius: radius.lg,
                  borderWidth: 2,
                  borderColor: selected ? colors.primary : colors.border,
                  opacity: pressed ? 0.9 : 1,
                },
              ]}
            >
              <View style={[styles.iconBox, { backgroundColor: selected ? colors.infoSoft : colors.surface }]}>
                <Ionicons name={s.meta.icon} size={28} color={selected ? colors.primary : colors.textSecondary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[type.sectionTitle, { color: colors.text }]}>{s.meta.name}</Text>
                <Text style={[type.bodySmall, { color: colors.textSecondary }]}>{s.meta.tagline}</Text>
              </View>
              <Ionicons
                name={selected ? 'checkmark-circle' : 'ellipse-outline'}
                size={24}
                color={selected ? colors.primary : colors.textMuted}
              />
            </Pressable>
          );
        })}
      </ScrollView>

      <Button label="CONTINUE" onPress={next} disabled={!sport} size="lg" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24 },
  option: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 14 },
  iconBox: { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
});