import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { formatXp } from '@/utils/formatting';

interface ChallengeCardProps {
  title: string;
  description?: string;
  attempts: number;
  achieved: number;
  target: number;
  xp: number;
  /** 'pending' | 'active' | 'done' */
  status: 'pending' | 'active' | 'done';
  index?: number;
  label?: string;
}

/** One challenge block inside a session — the game-like counter. */
export function ChallengeCard({ title, description, attempts, achieved, target, xp, status, index, label }: ChallengeCardProps) {
  const { colors, radius, type, spacing } = useTheme();
  const progress = target > 0 ? Math.min(1, achieved / target) : 0;
  const active = status === 'active';
  const done = status === 'done';

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderRadius: radius.lg,
          borderWidth: 2,
          borderColor: active ? colors.accent : done ? colors.success : colors.border,
          padding: spacing.lg,
          opacity: status === 'pending' ? 0.6 : 1,
        },
      ]}
    >
      <View style={styles.top}>
        <Text style={[type.caption, { color: colors.textMuted, fontSize: 10 }]}>
          {index !== undefined ? `CHALLENGE ${String(index + 1).padStart(2, '0')}` : label ?? 'CHALLENGE'}
        </Text>
        <Text style={[type.label, { color: active ? colors.accent : done ? colors.success : colors.textMuted, fontSize: 12 }]}>
          {formatXp(xp)}
        </Text>
      </View>
      <Text style={[type.title, { color: colors.text, fontSize: 18 }]}>{title}</Text>
      {description && <Text style={[type.bodySmall, { color: colors.textSecondary }]}>{description}</Text>}

      <View style={styles.counter}>
        <Text style={[type.displayLarge, { color: colors.text, fontVariant: ['tabular-nums'] }]}>{achieved}</Text>
        <Text style={[type.body, { color: colors.textMuted }]}> / {target}</Text>
      </View>
      <ProgressBar progress={progress} color={done ? colors.success : colors.accent} accessibilityLabel={`${title} progress`} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { gap: 4 },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  counter: { flexDirection: 'row', alignItems: 'baseline', marginTop: 4 },
});