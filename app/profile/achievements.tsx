import { FlatList, View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { AchievementCard } from '@/components/progression/AchievementCard';
import { ACHIEVEMENTS } from '@/features/achievements/definitions';
import { type } from '@/constants/typography';

/** All achievements — earned and locked. */
export default function AchievementsScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const earned = new Set(['first-assessment']); // hydrated from server in production

  return (
    <FlatList
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 32, paddingHorizontal: 24, gap: 12 }}
      data={ACHIEVEMENTS.filter((a) => !a.hidden || earned.has(a.code))}
      keyExtractor={(a) => a.code}
      numColumns={2}
      columnWrapperStyle={{ gap: 10 }}
      ListHeaderComponent={
        <View style={{ width: '100%', marginBottom: 4 }}>
          <Text style={[type.displayTitle, { color: colors.text }]}>Achievements</Text>
          <Text style={[type.bodySmall, { color: colors.textSecondary }]}>
            Earned, never given — every badge means something.
          </Text>
        </View>
      }
      renderItem={({ item }) => (
        <View style={{ flex: 1 }}>
          <AchievementCard
            name={item.name}
            description={item.description}
            icon={item.icon}
            xp={item.xp}
            unlocked={earned.has(item.code)}
          />
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({});