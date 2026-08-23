import { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/Button';
import { useAuthActions } from '@/features/auth/hooks';
import { type } from '@/constants/typography';

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24 },
  form: { gap: 12, marginTop: 24 },
  input: { padding: 16, fontSize: 16 },
});

export default function ForgotPasswordScreen() {
  const { colors, radius, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const { resetPassword } = useAuthActions();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError(null);
    if (!email.trim()) {
      setError('Enter your email.');
      return;
    }
    setLoading(true);
    const result = await resetPassword(email);
    setLoading(false);
    if (!result.ok) {
      setError(result.error ?? 'Could not send reset email');
      return;
    }
    setSent(true);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}>
      <Text style={[type.displayTitle, { color: colors.text }]}>Reset password.</Text>
      <Text style={[type.body, { color: colors.textSecondary, marginTop: 4 }]}>
        Enter your email and we'll send a reset link.
      </Text>

      {sent ? (
        <Text style={[type.body, { color: colors.success, marginTop: spacing['2xl'], textAlign: 'center' }]}>
          ✓ Check your inbox. Follow the link to set a new password.
        </Text>
      ) : (
        <View style={styles.form}>
          {error && <Text style={[type.bodySmall, { color: colors.danger }]}>{error}</Text>}
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="none"
            keyboardType="email-address"
            style={[styles.input, { backgroundColor: colors.inputBackground, borderRadius: radius.md, color: colors.text }]}
          />
          <Button label="SEND RESET LINK" onPress={submit} loading={loading} size="lg" />
        </View>
      )}
    </View>
  );
}