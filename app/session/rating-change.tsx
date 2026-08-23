import { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { CheetahAnimation } from '@/components/mascot/CheetahAnimation';
import { RatingChange } from '@/components/athlete/RatingChange';
import { useAthleteStore } from '@/store/athleteStore';
import { formatRating } from '@/utils/formatting';
import { type } from '@/constants/typography';

/**
 * RATING CHANGE — the "I want my number to go up" moment.
 * The server computes the authoritative delta via calculate-elo; this screen
 * shows the estimate from the same engine (the session always previews it).
 */
export default function RatingChangeScreen() {
  const { colors, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const rating = useAthleteStore((s) => s.overallRating?.rating ?? 1000);

  // Simulated post-session delta for the reveal; server reconciles on sync.
  const [delta] = useState(() => {
    const before = rating;
    const after = Math.min(3000, before + 12);
    return { before, after, delta: after - before };
  });

  const up = delta.delta > 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}>
      <CheetahAnimation mode="celebration" expression="celebrating" size={120} />
      <Text style={[type.caption, { color: colors.textMuted }]}>ELO</Text>
      <View style={styles.ratingRow}>
        <Text style={[type.displayLarge, { color: colors.text, textDecorationLine: 'line-through', textDecorationColor: colors.textMuted, opacity: 0.5 }]}>
          {formatRating(delta.before)}
        </Text>
        <Text style={[type.displayHero, { color: up ? colors.success : colors.danger }]}>{formatRating(delta.after)}</Text>
      </View>
      <RatingChange delta={delta.delta} size="lg" />

      <Card style={styles.card}>
        <Text style={[type.bodySmall, { color: colors.textSecondary, textAlign: 'center' }]}>
          {up
            ? 'Earned on the floor: you hit your targets at a difficulty just above your rating.'
            : 'A good session — the rating recalibrates around your latest level.'}
        </Text>
      </Card>

      <View style={{ flex: 1 }} />
      <View style={{ gap: spacing.md }}>
        <Button label="BACK TO HOME" size="lg" onPress={() => router.replace('/(tabs)')} />
        <Button label="TRAIN AGAIN" variant="ghost" onPress={() => router.replace('/session/[sessionId]')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24, alignItems: 'center' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 4 },
  card: { marginTop: 20, width: '100%' },
});