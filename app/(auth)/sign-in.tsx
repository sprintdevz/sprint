import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/Button';
import { useAuthActions } from '@/features/auth/hooks';
import { trackEvent } from '@/services/analytics';
import { type } from '@/constants/typography';

export default function SignInScreen() {
  const { colors, radius, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { signIn } = useAuthActions();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError(null);
    if (!email.trim() || !password) {
      setError('Enter your email and password.');
      return;
    }
    setLoading(true);
    const result = await signIn({ email, password });
    setLoading(false);
    if (!result.ok) {
      setError(result.error ?? 'Sign-in failed');
      return;
    }
    trackEvent('account_created', {}, { useDatabase: false });
    router.replace('/');
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={[type.displayTitle, { color: colors.text }]}>Welcome back.</Text>
      <Text style={[type.body, { color: colors.textSecondary, marginTop: 4 }]}>Ready to get rated?</Text>

      {error && (
        <Text style={[type.bodySmall, { color: colors.danger, marginTop: spacing.md }]}>{error}</Text>
      )}

      <View style={styles.form}>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          placeholderTextColor={colors.textMuted}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
          style={[styles.input, { backgroundColor: colors.inputBackground, borderRadius: radius.md, color: colors.text }]}
        />
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          placeholderTextColor={colors.textMuted}
          secureTextEntry
          autoComplete="password"
          style={[styles.input, { backgroundColor: colors.inputBackground, borderRadius: radius.md, color: colors.text }]}
        />
        <Button label="SIGN IN" onPress={submit} loading={loading} size="lg" />
        <Link href="/(auth)/forgot-password" style={[type.bodySmall, { color: colors.primary, textAlign: 'center' }]}>
          Forgot password?
        </Link>
        <Text style={[type.bodySmall, { color: colors.textMuted, textAlign: 'center' }]}>
          New here? <Link href="/(auth)/sign-up" style={{ color: colors.primary, fontWeight: '700' }}>Create an account</Link>
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24 },
  form: { gap: 12, marginTop: 24 },
  input: { padding: 16, fontSize: 16 },
});