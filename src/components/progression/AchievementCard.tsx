import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';

interface AchievementCardProps {
  name: string;
  description: string;
  icon: string;
  xp: number;
  unlocked: boolean;
  unlockedAt?: string | null;
}

/** Achievement tile — earned (color) or locked (dimmed). */
export function AchievementCard({ name, description, icon, xp, unlocked, unlockedAt }: AchievementCardProps) {
  const { colors, radius, type, spacing } = useTheme();
  const unlockedAtDate = unlockedAt ? new Date(unlockedAt) : null;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderRadius: radius.lg,
          padding: spacing.md,
          opacity: unlocked ? 1 : 0.55,
          borderWidth: 1,
          borderColor: unlocked ? colors.gold : colors.border,
        },
      ]}
    >
      <View style={[styles.icon, { backgroundColor: unlocked ? colors.warningSoft : colors.skeleton }]}>
        <Ionicons name={icon as keyof typeof Ionicons.glyphMap} size={22} color={unlocked ? '#E5A000' : colors.textMuted} />
      </View>
      <Text style={[type.bodySmall, { color: colors.text, fontWeight: '700', marginTop: 6 }]}>{name}</Text>
      <Text style={[type.caption, { color: colors.textMuted, fontSize: 10, marginTop: 2 }]} numberOfLines={2}>{description}</Text>
      <Text style={[type.caption, { color: unlocked ? colors.accent : colors.textMuted, fontSize: 9, marginTop: 4 }]}>
        {unlocked ? (unlockedAtDate ? `Unlocked ${unlockedAtDate.toLocaleDateString()}` : 'Unlocked') : `+${xp} XP on unlock`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {},
  icon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
});