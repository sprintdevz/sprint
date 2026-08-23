import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { formatRating } from '@/utils/formatting';
import { ProgressBar } from '@/components/ui/ProgressBar';

interface PerformanceGapProps {
  /** The blocking skill. */
  weakestName: string;
  weakestRating: number;
  overallRating: number;
  insight: string;
}

/** "What is holding me back?" — the gap card. */
export function PerformanceGap({ weakestName, weakestRating, overallRating, insight }: PerformanceGapProps) {
  const { colors, type, spacing, radius } = useTheme();
  const gap = Math.max(0, overallRating - weakestRating);

  return (
    <View style={[styles.card, { backgroundColor: colors.navySurface, borderRadius: radius.xl, padding: spacing.lg }]}>
      <Text style={[type.caption, { color: colors.onNavyMuted }]}>BIGGEST OPPORTUNITY</Text>
      <Text style={[type.title, { color: colors.onNavy, marginTop: 4 }]}>{weakestName}</Text>
      <Text style={[type.bodySmall, { color: colors.onNavyMuted, marginTop: 4 }]}>{insight}</Text>

      <View style={styles.barRow}>
        <View style={{ flex: 1 }}>
          <ProgressBar progress={overallRating > 0 ? weakestRating / (overallRating + gap + 1) : 0} color="#FF9A4D" trackColor="rgba(255,255,255,0.12)" />
          <View style={styles.labels}>
            <Text style={[type.caption, { color: colors.onNavyMuted, fontSize: 10 }]}>{weakestName} {formatRating(weakestRating)}</Text>
            <Text style={[type.caption, { color: colors.onNavyMuted, fontSize: 10 }]}>Overall {formatRating(overallRating)}</Text>
          </View>
        </View>
        {gap > 0 && (
          <View style={[styles.gapBox, { backgroundColor: 'rgba(255, 122, 26, 0.2)', borderRadius: radius.md }]}>
            <Text style={[type.statSmall, { color: '#FFB26B' }]}>−{gap}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

function gapRating(g: number): number {
  return Math.round(g);
}

const styles = StyleSheet.create({
  card: {},
  barRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 12, marginTop: 12 },
  labels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  gapBox: { paddingHorizontal: 12, paddingVertical: 6, alignItems: 'center' },
});