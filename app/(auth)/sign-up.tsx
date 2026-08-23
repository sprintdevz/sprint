import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/Button';
import { useAuthActions } from '@/features/auth/hooks';
import { signUpSchema } from '@/features/auth/validation';
import { trackEvent } from '@/services/analytics';
import { type } from '@/constants/typography';

export default function SignUpScreen() {
  const { colors, radius, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { signUp } = useAuthActions();
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError(null);
    const parsed = signUpSchema.safeParse({ fullName, username, email, password });
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      setError(first ? first.message : 'Check your details');
      return;
    }
    setLoading(true);
    const result = await signUp({
      fullName: fullName.trim(),
      username: username.trim(),
      email,
      password,
    });
    setLoading(false);
    if (!result.ok) {
      setError(result.error ?? 'Sign-up failed');
      return;
    }
    trackEvent('account_created');
    router.replace('/');
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        style={{ backgroundColor: colors.background }}
        contentContainerStyle={{ paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24, paddingHorizontal: 24 }}
      >
        <Text style={[type.displayTitle, { color: colors.text }]}>Create your account.</Text>
        <Text style={[type.body, { color: colors.textSecondary, marginTop: 4 }]}>Takes 30 seconds. Your climb starts now.</Text>

        {error && <Text style={[type.bodySmall, { color: colors.danger, marginTop: spacing.md }]}>{error}</Text>}

        <View style={styles.form}>
          <TextInput value={fullName} onChangeText={setFullName} placeholder="Full name" placeholderTextColor={colors.textMuted}
            autoComplete="name" style={[styles.input, { backgroundColor: colors.inputBackground, borderRadius: radius.md, color: colors.text }]} />
          <TextInput value={username} onChangeText={setUsername} placeholder="Username" placeholderTextColor={colors.textMuted}
            autoCapitalize="none" style={[styles.input, { backgroundColor: colors.inputBackground, borderRadius: radius.md, color: colors.text }]} />
          <TextInput value={email} onChangeText={setEmail} placeholder="Email" placeholderTextColor={colors.textMuted}
            autoCapitalize="none" keyboardType="email-address" autoComplete="email"
            style={[styles.input, { backgroundColor: colors.inputBackground, borderRadius: radius.md, color: colors.text }]} />
          <TextInput value={password} onChangeText={setPassword} placeholder="Password (8+ chars, letter & number)" placeholderTextColor={colors.textMuted}
            secureTextEntry autoComplete="new-password"
            style={[styles.input, { backgroundColor: colors.inputBackground, borderRadius: radius.md, color: colors.text }]} />

          <Button label="CREATE ACCOUNT" onPress={submit} loading={loading} size="lg" />
          <Text style={[type.bodySmall, { color: colors.textMuted, textAlign: 'center' }]}>
            Already have an account? <Link href="/(auth)/sign-in" style={{ color: colors.primary, fontWeight: '700' }}>Sign in</Link>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  form: { gap: 12, marginTop: 24 },
  input: { padding: 16, fontSize: 16 },
});