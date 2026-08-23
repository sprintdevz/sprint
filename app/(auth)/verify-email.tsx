import { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/Button';
import { MascotBubble } from '@/components/mascot/MascotBubble';
import { useAuthActions } from '@/features/auth/hooks';
import { type } from '@/constants/typography';

/** Post-signup confirmation — usually skipped (email confirmations off), but ready if enabled. */
export default function VerifyEmailScreen() {
  const { colors, radius, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ email?: string }>();
  const { resendVerification } = useAuthActions();
  const [email, setEmail] = useState(params.email ?? '');
  const [sent, setSent] = useState(false);

  const resend = async () => {
    if (!email.trim()) return;
    await resendVerification(email.trim());
    setSent(true);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}>
      <MascotBubble text="Check your inbox — one tap and you're in." expression="focused" />
      <Text style={[type.displayTitle, { color: colors.text, marginTop: spacing['2xl'] }]}>Verify your email</Text>
      <Text style={[type.body, { color: colors.textSecondary, marginTop: 4 }]}>
        We sent a confirmation link. No email yet? Resend below.
      </Text>
      <View style={{ marginTop: spacing['2xl'], gap: spacing.md }}>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          placeholderTextColor={colors.textMuted}
          autoCapitalize="none"
          keyboardType="email-address"
          style={[styles.input, { backgroundColor: colors.inputBackground, borderRadius: radius.md, color: colors.text }]}
        />
        <Button label="RESEND EMAIL" onPress={resend} disabled={!email.trim()} />
        {sent && <Text style={[type.bodySmall, { color: colors.success, textAlign: 'center' }]}>Sent! Check your inbox.</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24 },
  input: { padding: 16, fontSize: 16 },
});

