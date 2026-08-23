import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { Avatar } from '@/components/ui/Avatar';
import { EloBadge } from '@/components/competition/EloBadge';
import type { LeaderboardPlayer } from '@/features/competition/types';

interface PlayerRowProps {
  player: LeaderboardPlayer;
  highlight?: boolean;
}

/** One row on any leaderboard. */
export function PlayerRow({ player, highlight = false }: PlayerRowProps) {
  const { colors, type, spacing } = useTheme();
  const medal = player.rank === 1 || player.rank === 2 || player.rank === 3;

  return (
    <View
      style={[
        styles.row,
        {
          backgroundColor: highlight ? colors.warningSoft : colors.surface,
          borderRadius: 12,
          padding: spacing.md,
          gap: spacing.md,
        },
      ]}
    >
      <View style={styles.rank}>
        {medal ? (
          <Ionicons
            name={player.rank === 1 ? 'trophy' : 'medal'}
            size={20}
            color={player.rank === 1 ? '#FFC53D' : player.rank === 2 ? '#C0C8D8' : '#E08A3C'}
          />
        ) : (
          <Text style={[type.title, { color: colors.textMuted, fontSize: 16, width: 16, textAlign: 'center' }]}>
            {player.rank}
          </Text>
        )}
      </View>

      <Avatar name={player.displayName} size={36} />
      <View style={{ flex: 1 }}>
        <Text style={[type.bodySmall, { color: colors.text, fontWeight: '700' }]} numberOfLines={1}>
          {player.displayName}
          {player.isPeerOfUser && <Text style={{ color: colors.primary }}> (you)</Text>}
        </Text>
        {player.improvement !== 0 && (
          <Text style={[type.caption, { color: player.improvement > 0 ? colors.success : colors.danger, fontSize: 10 }]}>
            {player.improvement > 0 ? '+' : ''}{player.improvement} this season
          </Text>
        )}
      </View>
      <EloBadge rating={player.rating} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  rank: { width: 24, alignItems: 'center' },
});