import { View, Text } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { ProgressBar } from '@/components/ui/ProgressBar';

interface SessionProgressProps {
  done: number;
  total: number;
  xp: number;
}

/** Header strip inside the session runner: challenge dots + XP. */
export function SessionProgress({ done, total, xp }: SessionProgressProps) {
  const { colors, type, spacing } = useTheme();

  return (
    <View style={{ gap: spacing.sm }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={[type.caption, { color: colors.textMuted, fontSize: 10 }]}>
          {done}/{total} COMPLETE
        </Text>
        <Text style={[type.label, { color: colors.accent, fontSize: 12 }]}>+{xp} XP</Text>
      </View>
      <ProgressBar progress={total > 0 ? done / total : 0} height={6} />
    </View>
  );
}