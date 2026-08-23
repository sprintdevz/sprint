import { FlatList, View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { Card } from '@/components/ui/Card';
import { DrillCard } from '@/components/training/DrillCard';
import { getSport } from '@/sports';
import { useAthleteStore } from '@/store/athleteStore';
import { type } from '@/constants/typography';

/** All drills for a skill. */
export default function DrillsScreen() {
  const { colors, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ skill?: string }>();
  const sportId = useAthleteStore((s) => s.athlete?.sport) ?? 'basketball';
  const sport = getSport(sportId);
  const drills = sport.drills.filter((d) => !params.skill || d.skillCode === params.skill);

  return (
    <FlatList
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 32, paddingHorizontal: 24, gap: 12 }}
      data={drills}
      keyExtractor={(d) => d.code}
      ListHeaderComponent={
        <View style={{ marginBottom: 4 }}>
          <Text style={[type.displayTitle, { color: colors.text }]}>Drills</Text>
          <Text style={[type.bodySmall, { color: colors.textSecondary }]}>
            {drills.length} drills · tap one to run a focused session
          </Text>
        </View>
      }
      renderItem={({ item }) => (
        <Card onPress={() => router.push('/session/[sessionId]')} style={{ padding: 0, overflow: 'hidden' }}>
          <View style={{ padding: 12 }}>
            <DrillCard
              name={item.name}
              description={item.description}
              intensity={item.intensity}
              durationSec={item.durationSec}
              equipment={item.equipment}
              sets={item.sets}
              reps={item.reps}
            />
          </View>
        </Card>
      )}
    />
  );
}

const styles = StyleSheet.create({});