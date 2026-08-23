import { Pressable, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { formatMinutes } from '@/utils/formatting';
import { Badge } from '@/components/ui/Badge';

interface SessionCardProps {
  focusTitle: string;
  focusSkillName?: string;
  reason?: string | null;
  minutes: number;
  xpPreview?: number;
  eloPreview?: number;
  onPress?: () => void;
  ctaLabel?: string;
}

/** "TODAY'S FOCUS" card — the recommended session on home. */
export function SessionCard({ focusTitle, focusSkillName, reason, minutes, eloPreview, onPress, ctaLabel = 'START SESSION' }: SessionCardProps) {
  const { colors, radius, type, spacing } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.navySurface, borderRadius: radius.xl, padding: spacing['2xl'] }]}>
      <Text style={[type.caption, { color: colors.onNavyMuted }]}>TODAY'S FOCUS</Text>
      <Text style={[type.displayTitle, { color: colors.onNavy, marginTop: 2, textTransform: 'uppercase' }]}>
        {focusTitle}
      </Text>
      {reason && (
        <Text style={[type.bodySmall, { color: colors.onNavyMuted, marginTop: 6 }]}>{reason}</Text>
      )}

      <View style={styles.meta}>
        <View style={styles.metaItem}>
          <Ionicons name="time-outline" size={16} color="#FFB26B" />
          <Text style={[type.label, { color: colors.onNavy, fontSize: 12 }]}>{formatMinutes(minutes)}</Text>
        </View>
        {eloPreview !== undefined && (
          <View style={styles.metaItem}>
            <Ionicons name="trending-up" size={16} color="#4ADE80" />
            <Text style={[type.label, { color: '#4ADE80', fontSize: 12 }]}>~+{Math.max(0, Math.round(eloPreview))} ELO</Text>
          </View>
        )}
      </View>

      {onPress && (
        <Pressable
          accessibilityRole="button"
          onPress={onPress}
          style={({ pressed }) => [
            styles.cta,
            { backgroundColor: colors.accent, borderRadius: radius.md, paddingVertical: spacing.md, opacity: pressed ? 0.85 : 1 },
          ]}
        >
          <Text style={[type.button, { color: colors.accentText, fontSize: 14 }]}>{ctaLabel}</Text>
          <Ionicons name="arrow-forward" size={18} color={colors.accentText} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {},
  meta: { flexDirection: 'row', gap: 16, marginTop: 12 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cta: { marginTop: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
});