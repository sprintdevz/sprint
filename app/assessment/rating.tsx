import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { AthleteRating } from '@/components/athlete/AthleteRating';
import { useAthleteStore } from '@/store/athleteStore';
import { leagueInfo } from '@/features/elo/calculations';
import { type } from '@/constants/typography';

/** Rating detail after an assessment — where you stand now. */
export default function AssessmentRatingScreen() {
  const { colors, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const rating = useAthleteStore((s) => s.overallRating?.rating ?? 1000);
  const league = leagueInfo(rating);

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}>
      <View style={{ alignItems: 'center' }}>
        <AthleteRating rating={rating} leagueLabel={league.label} />
        <Text style={[type.body, { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.lg }]}>
          Your rating updates after every session and assessment — earned, never given.
        </Text>
      </View>

      <Card style={{ marginTop: spacing['2xl'] }}>
        <Text style={[type.bodySmall, { color: colors.textSecondary, textAlign: 'center' }]}>
          The math: every session is a match against a benchmark of your difficulty. Beat it → rating up. Meet it → hold. Miss it → small dip, big lesson.
        </Text>
      </Card>

      <View style={{ flex: 1 }} />
      <Button label="BACK TO HOME" size="lg" onPress={() => router.replace('/(tabs)')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24 },
});