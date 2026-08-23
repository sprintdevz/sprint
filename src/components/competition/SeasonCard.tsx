import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import type { Season } from '@/features/competition/types';
import { remainingDays } from '@/utils/dates';
import { formatDate } from '@/utils/formatting';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';

interface SeasonCardProps {
  season: Season;
  onPress?: () => void;
}

export function SeasonCard({ season, onPress }: SeasonCardProps) {
  const { colors, type, spacing } = useTheme();
  const active = season.status === 'active';
  const days = remainingDays(new Date(season.endsAt));

  return (
    <Card emphasis={active} style={styles.wrap} onPress={onPress}>
      <View style={styles.top}>
        <Text style={[type.title, { color: colors.text }]}>{season.name}</Text>
        {active ? (
          <Badge label={`${days} DAYS LEFT`} tone="accent" dot />
        ) : (
          <Badge label={season.status.toUpperCase()} tone="neutral" />
        )}
      </View>
      <Text style={[type.bodySmall, { color: colors.textSecondary }]}>
        {formatDate(season.startsAt)} → {formatDate(season.endsAt)}
      </Text>
      <View style={styles.footer}>
        <Ionicons name="trophy-outline" size={14} color={colors.gold} />
        <Text style={[type.caption, { color: colors.textMuted, fontSize: 10 }]}>
          {String(season.rewards.title ?? `${season.rewards.xp ?? 0} XP reward`)}
        </Text>
      </View>
    </Card>
  );
}

export const styles = StyleSheet.create({
  wrap: {},
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  subtitle: {},
  footer: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
});