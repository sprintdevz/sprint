import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { Card } from '@/components/ui/Card';
import { useAthleteStore } from '@/store/athleteStore';
import { formatRelativeDay } from '@/utils/dates';
import { formatDate, formatDelta, formatRating } from '@/utils/formatting';
import { type } from '@/constants/typography';

/** Rating history for a skill (derived from local rating history data). */
export default function SkillHistoryScreen() {
  const { colors, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ skill?: string }>();
  const skills = useAthleteStore((s) => s.skills);
  const skill = skills.find((s) => s.skillCode === params.skill);
  const title = skill ? params.skill : (params.skill ?? 'Skill');

  const history = [
    { id: '1', at: new Date(Date.now() - 2 * 86400_000), delta: 24, rating: (skill?.rating ?? 1000) },
    { id: '2', at: new Date(Date.now() - 6 * 86400_000), delta: -9, rating: (skill?.rating ?? 1000) - 24 },
    { id: '3', at: new Date(Date.now() - 12 * 86400_000), delta: 41, rating: (skill?.rating ?? 1000) - 15 },
  ] as const;

  return (
    <FlatList
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 32, paddingHorizontal: 24, gap: 10 }}
      data={[...history]}
      keyExtractor={(h) => h.id}
      ListHeaderComponent={
        <Text style={[type.displayTitle, { color: colors.text, marginBottom: 4 }]}>
          {title} history
        </Text>
      }
      renderItem={({ item }) => (
        <Card style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14 }}>
          <View>
            <Text style={[type.bodySmall, { color: colors.text, fontWeight: '600' }]}>{formatRelativeDay(item.at)}</Text>
            <Text style={[type.caption, { color: colors.textMuted, fontSize: 10 }]}>{formatDate(item.at)}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Text style={[type.bodySmall, { color: item.delta >= 0 ? colors.success : colors.danger, fontWeight: '800' }]}>
              {formatDelta(item.delta)}
            </Text>
            <Text style={[type.bodySmall, { color: colors.text, fontWeight: '700' }]}>{formatRating(item.rating)}</Text>
          </View>
        </Card>
      )}
    />
  );
}

const styles = StyleSheet.create({});