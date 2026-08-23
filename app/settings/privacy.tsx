import { ScrollView, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { Card } from '@/components/ui/Card';
import { type } from '@/constants/typography';

/** Privacy + analytics opt-out. */
export default function PrivacyScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 32, paddingHorizontal: 24, gap: 12 }}>
      <Text style={[type.displayTitle, { color: colors.text }]}>Privacy</Text>
      <Card>
        <Text style={[type.bodySmall, { color: colors.textSecondary }]}>
          Your training data belongs to you. SPRINT never sells personal data. Analytics are anonymized
          and you can opt out at any time.
        </Text>
      </Card>
      <Card>
        <Text style={[type.bodySmall, { color: colors.textSecondary }]}>
          Ratings are protected server-side: your ELO can only change when the server verifies a
          performance. Client-side values are never trusted.
        </Text>
      </Card>
      <Text style={[type.caption, { color: colors.textMuted, fontSize: 10, textAlign: 'center' }]}>
        SPRINT · privacy · data deletion available in Account
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({});