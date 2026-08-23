import { useState } from 'react';
import { View, Text, TextInput, FlatList, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { Card } from '@/components/ui/Card';
import { PlayerRow } from '@/components/competition/PlayerRow';
import { Button } from '@/components/ui/Button';
import { useUserStore } from '@/store/userStore';
import { useFriends } from '@/features/competition/hooks';
import { sendFriendRequest } from '@/features/competition/api';
import { type } from '@/constants/typography';

/** Friends — add by username, compare ratings, stay motivated. */
export default function FriendsScreen() {
  const { colors, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const user = useUserStore((s) => s.user);
  const { data: friends, isLoading, refetch } = useFriends(user?.id ?? null);
  const [query, setQuery] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  const add = async () => {
    if (!query.trim()) return;
    const result = await sendFriendRequest(query);
    setMessage(result.ok ? 'Request sent!' : (result.error ?? 'Failed'));
    if (result.ok) setQuery('');
    void refetch();
  };

  const rows = (friends ?? []).map((f, i) => ({
    rank: i + 1,
    athleteId: f.id,
    displayName: f.username,
    sport: f.sport,
    rating: f.rating,
    improvement: 0,
    streak: f.streak,
    isPeerOfUser: false,
  }));

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16 }]}>
      <View style={{ paddingHorizontal: 24 }}>
        <Text style={[type.displayTitle, { color: colors.text }]}>Friends</Text>
        <Text style={[type.bodySmall, { color: colors.textSecondary, marginTop: 4 }]}>
          Rivalry is the best training partner.
        </Text>

        <View style={[styles.addRow, { marginTop: spacing.md, gap: 8 }]}>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Username or email"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="none"
            style={[styles.input, { backgroundColor: colors.inputBackground, borderRadius: 12, color: colors.text }]}
          />
          <Pressable onPress={() => void add()} disabled={!query.trim()}>
            <Text style={[type.label, { color: query.trim() ? colors.primary : colors.textMuted, fontSize: 13 }]}>ADD</Text>
          </Pressable>
        </View>
        {message && <Text style={[type.bodySmall, { color: colors.success, marginTop: 4 }]}>{message}</Text>}

        <Button label="FRIEND LEADERBOARD" variant="ghost" size="sm" style={{ marginTop: 8, alignSelf: 'flex-start' }} onPress={() => {}} />
      </View>

      <FlatList
        style={{ marginTop: spacing.lg }}
        contentContainerStyle={{ paddingHorizontal: 24, gap: 8 }}
        data={rows}
        keyExtractor={(r) => r.athleteId}
        ListEmptyComponent={
          <Card>
            <Text style={[type.bodySmall, { color: colors.textSecondary, textAlign: 'center' }]}>
              No friends yet. Add someone you want to catch on the leaderboard.
            </Text>
          </Card>
        }
        renderItem={({ item }) => <PlayerRow player={item} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  addRow: { flexDirection: 'row', alignItems: 'center' },
  input: { flex: 1, padding: 12, fontSize: 14 },
});