import { Text, StyleSheet, View } from 'react-native';
import { Link } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/Button';
import { Cheetah } from '@/components/mascot/Cheetah';
import { APP_NAME, APP_TAGLINE } from '@/constants/config';
import { type } from '@/constants/typography';

/** The first screen — brand + CTA. */
export default function WelcomeScreen() {
  const { spacing } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + 32, paddingBottom: insets.bottom + 24 }]}>
      <View style={styles.brand}>
        <Cheetah size={140} expression="excited" pose="running" />
        <Text style={styles.logo}>{APP_NAME}</Text>
        <Text style={[type.body, styles.tagline]}>{APP_TAGLINE}</Text>
      </View>

      <View style={styles.actions}>
        <Link href="/(auth)/sign-up" asChild>
          <Button label="CREATE ACCOUNT" size="lg" onPress={() => {}} />
        </Link>
        <Link href="/(auth)/sign-in" asChild>
          <Button label="I ALREADY HAVE AN ACCOUNT" variant="secondary" size="md" onPress={() => {}} />
        </Link>
        <Text style={[type.caption, styles.footnote, { marginTop: spacing.md }]}>
          RATE YOUR SKILLS · TRAIN WEAKNESSES · CLIMB THE LEAGUE
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1B3A',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  brand: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  logo: {
    color: '#FFFFFF',
    fontSize: 44,
    fontWeight: '800',
    letterSpacing: 6,
    fontFamily: 'SpaceGrotesk_700Bold',
  },
  tagline: {
    color: '#A9BBD9',
    textAlign: 'center',
  },
  actions: {
    gap: 12,
  },
  footnote: {
    color: '#7683A8',
    textAlign: 'center',
    fontSize: 10,
  },
});