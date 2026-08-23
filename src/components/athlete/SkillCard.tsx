import { Pressable, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { formatRating, formatDelta } from '@/utils/formatting';
import { ProgressBar } from '@/components/ui/ProgressBar';
import type { IconName } from '@/types/common';

interface SkillCardProps {
  name: string;
  rating: number;
  mastery: number;
  trend: number;
  icon?: IconName;
  onPress?: () => void;
  /** Highlight the weakest skill (nudge toward it). */
  isWeakest?: boolean;
}

/** Compact skill row used on the home screen and skill grids. */
export function SkillCard({ name, rating, mastery, trend, icon = 'basketball', onPress, isWeakest = false }: SkillCardProps) {
  const { colors, radius, type, spacing } = useTheme();

  const content = (
    <View style={[styles.card, { backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: StyleSheet.hairlineWidth, borderColor: isWeakest ? colors.accent : colors.border }]}>
      <View style={[styles.iconBox, { backgroundColor: isWeakest ? colors.warningSoft : colors.infoSoft, borderRadius: radius.md }]}>
        <Ionicons name={icon} size={18} color={isWeakest ? colors.accent : colors.primary} />
      </View>
      <View style={styles.info}>
        <View style={styles.top}>
          <Text style={[type.bodySmall, { color: colors.text, flex: 1, fontWeight: '600' }]} numberOfLines={1}>
            {name}
            {isWeakest && ' ●'}
          </Text>
          <Text style={[type.bodySmall, { color: colors.text, fontWeight: '800', fontVariant: ['tabular-nums'] }]}>
            {formatRating(rating)}
          </Text>
        </View>
        <ProgressBar progress={mastery} height={5} />
        <View style={styles.bottom}>
          <Text style={[type.caption, { color: colors.textMuted, fontSize: 10 }]}>
            {Math.round(mastery * 100)}%
          </Text>
          {trend !== 0 && (
            <Text style={[type.caption, { color: trend > 0 ? colors.success : colors.danger, fontSize: 10 }]}>
              {formatDelta(trend)} 7d
            </Text>
          )}
        </View>
      </View>
    </View>
  );

  if (!onPress) return content;
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`${name} ${formatRating(rating)}`}>
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', padding: 12, gap: 10, alignItems: 'center' },
  iconBox: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1, gap: 4 },
  top: { flexDirection: 'row', gap: 8 },
  name: {},
  bottom: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 2 },
});