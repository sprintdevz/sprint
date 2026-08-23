import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { CircularProgress } from '@/components/ui/CircularProgress';
import { formatRating } from '@/utils/formatting';

interface MilestoneCardProps {
  currentRating: number;
  nextMilestone: number;
  progress: number;
  leagueLabel: string;
}

/** "Progress toward next milestone" — the next goal always visible. */
export function MilestoneCard({ currentRating, nextMilestone, progress, leagueLabel }: MilestoneCardProps) {
  const { colors, type, spacing, radius } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.lg }]}>
      <View style={styles.row}>
        <CircularProgress progress={progress} size={64} label={formatRating(currentRating)} />
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={[type.caption, { color: colors.textMuted, fontSize: 10 }]}>NEXT MILESTONE</Text>
          <Text style={[type.statSmall, { color: colors.text }]}>{formatRating(nextMilestone)}</Text>
          <Text style={[type.caption, { color: colors.textSecondary, fontSize: 10 }]}>{leagueLabel}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {},
  row: { flexDirection: 'row', alignItems: 'center', gap: 16 },
});