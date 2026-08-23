import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import type { Intensity } from '@/types/common';

interface DrillCardProps {
  name: string;
  description: string;
  intensity: Intensity;
  durationSec: number;
  equipment: string[];
  sets?: number;
  reps?: number;
}

/** Drill block card shown inside training summaries. */
export function DrillCard({ name, description, intensity, durationSec, equipment, sets, reps }: DrillCardProps) {
  const { colors, radius, type, spacing } = useTheme();
  const flame = { easy: 1, medium: 2, high: 3 }[intensity];

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md }]}>
      <View style={styles.row}>
        <View style={[styles.icon, { backgroundColor: colors.infoSoft, borderRadius: radius.sm }]}>
          <Ionicons name="fitness" size={16} color={colors.primary} />
        </View>
        <View style={styles.info}>
          <Text style={[type.bodySmall, { color: colors.text, fontWeight: '700' }]}>{name}</Text>
          <Text style={[type.caption, { color: colors.textMuted, fontSize: 11 }]} numberOfLines={2}>
            {description}
          </Text>
        </View>
        <View style={styles.meta}>
          <Text style={[type.caption, { color: colors.textMuted, fontSize: 10 }]}>
            {Math.round(durationSec / 60)} min
          </Text>
          <Text style={[type.caption, { color: colors.textMuted, fontSize: 10 }]}>
            {'🔥'.repeat(flame)} {sets ? `${sets}×${reps}` : ''}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {},
  row: { flexDirection: 'row', gap: 10 },
  icon: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1 },
  meta: { alignItems: 'flex-end' },
});