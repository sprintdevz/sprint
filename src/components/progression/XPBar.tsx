import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { formatXp } from '@/utils/formatting';

interface XPBarProps {
  xp: number;
  /** XP needed for the next level/milestone. */
  nextXp: number;
  levelLabel?: string;
}

/** XP economy bar — participation, separate from ELO. */
export function XPBar({ xp, nextXp, levelLabel }: XPBarProps) {
  const { colors, type, spacing } = useTheme();
  const progress = nextXp > 0 ? Math.min(1, xp / nextXp) : 0;

  return (
    <View style={{ gap: spacing.xs }}>
      <View style={styles.row}>
        {levelLabel && <Text style={[type.caption, { color: colors.textMuted, fontSize: 10 }]}>{levelLabel}</Text>}
        <Text style={[type.label, { color: colors.accent, fontSize: 12 }]}>{formatXp(xp)}</Text>
      </View>
      <ProgressBar progress={progress} height={7} color={colors.accent} />
      <Text style={[type.caption, { color: colors.textMuted, fontSize: 9 }]}>
        {formatXp(Math.max(0, nextXp - xp))} to next level
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between' },
});