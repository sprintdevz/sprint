import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { formatRating, formatDelta } from '@/utils/formatting';
import { Badge } from '@/components/ui/Badge';

interface AthleteRatingProps {
  rating: number;
  delta?: number;
  leagueLabel?: string;
  /** Compact variant for headers. */
  size?: 'hero' | 'compact';
  provisional?: boolean;
}

/** The hero number — ELO with change indicator. The "I want my number to go up" moment. */
export function AthleteRating({ rating, delta = 0, leagueLabel, size = 'hero', provisional = false }: AthleteRatingProps) {
  const { colors, type, spacing } = useTheme();
  const hero = size === 'hero';

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        {hero && leagueLabel && <Badge label={leagueLabel} tone="navy" />}
        {provisional && <Badge label="PROVISIONAL" tone="accent" />}
      </View>
      <View style={styles.ratingRow}>
        <Text
          style={[
            hero ? type.displayHero : type.stat,
            { color: colors.text, fontVariant: ['tabular-nums'] },
          ]}
        >
          {formatRating(rating)}
        </Text>
        {delta !== 0 && (
          <Text
            style={[
              hero ? type.statSmall : type.bodySmall,
              { color: delta > 0 ? colors.success : colors.danger },
            ]}
          >
            {formatDelta(delta)}
          </Text>
        )}
      </View>
      {hero && !leagueLabel && (
        <Text style={[type.caption, { color: colors.textMuted, letterSpacing: 2 }]}>ELO</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 4 },
  row: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  ratingRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 10 },
});