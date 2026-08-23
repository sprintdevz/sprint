import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { PlayerRow } from '@/components/competition/PlayerRow';
import type { Leaderboard as LeaderboardType } from '@/features/competition/types';
import { Card } from '@/components/ui/Card';

interface LeaderboardProps {
  data: LeaderboardType | null;
  loading?: boolean;
  error?: string | null;
  emptyMessage?: string;
  onRetry?: () => void;
}

/** Ready-made leaderboard list with empty + error states — never blank. */
export function Leaderboard({ data, loading, error, emptyMessage = 'No players yet — be the first!', onRetry }: LeaderboardProps) {
  const { colors, type, spacing } = useTheme();

  if (error) {
    return (
      <Card>
        <Text style={[type.body, { color: colors.danger, textAlign: 'center' }]}>Couldn't load the board.</Text>
        <Text style={[type.bodySmall, { color: colors.textSecondary }]}>{error}</Text>
        {onRetry && (
          <Pressable onPress={onRetry} style={{ marginTop: 12 }}>
            <Text style={[type.label, { color: colors.primary }]}>RETRY</Text>
          </Pressable>
        )}
      </Card>
    );
  }

  if (loading || !data) {
    return (
      <Card>
        <Text style={[type.body, { color: colors.textSecondary }]}>Loading the board…</Text>
      </Card>
    );
  }

  if (data.players.length === 0) {
    return (
      <Card>
        <Text style={[type.body, { color: colors.textSecondary }]}>{emptyMessage}</Text>
      </Card>
    );
  }

  return (
    <FlatList
      data={data.players}
      keyExtractor={(p) => p.athleteId}
      renderItem={({ item }) => <PlayerRow player={item} highlight={item.isPeerOfUser} />}
      ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
      contentContainerStyle={{ paddingBottom: 24 }}
    />
  );
}

const styles = StyleSheet.create({});