import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { leagueInfo } from '@/features/elo/calculations';
import { formatRating } from '@/utils/formatting';

interface EloBadgeProps {
  rating: number;
  size?: 'sm' | 'lg';
}

/** Colored league + rating chip (leaderboards, player rows). */
export function EloBadge({ rating, size = 'sm' }: EloBadgeProps) {
  const { radius, type } = useTheme();
  const info = leagueInfo(rating);

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: `${info.league.color}22`,
          borderRadius: radius.sm,
          paddingHorizontal: size === 'lg' ? 14 : 10,
          paddingVertical: size === 'lg' ? 8 : 5,
        },
      ]}
    >
      <Text style={[type.label, { color: info.league.color, fontSize: size === 'lg' ? 13 : 10 }]}>
        {info.label}
      </Text>
      <Text style={[type.label, { color: info.league.color, fontSize: size === 'lg' ? 13 : 10, opacity: 0.8 }]}>
        {formatRating(rating)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { flexDirection: 'row', alignItems: 'center', gap: 6 },
});