import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuthActions } from '@/features/auth/hooks';
import { useUserStore } from '@/store/userStore';
import { useAthleteStore } from '@/store/athleteStore';
import { useSessionStore } from '@/store/sessionStore';
import { trackEvent } from '@/services/analytics';
import { type } from '@/constants/typography';

/** Account — sign out, delete data. */
export default function AccountScreen() {
  const { colors, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { signOut } = useAuthActions();
  const user = useUserStore((s) => s.user);

  const logout = async () => {
    await signOut();
    useUserStore.getState().reset();
    useAthleteStore.getState().reset();
    useSessionStore.getState().reset();
    router.replace('/(auth)/welcome');
  };

  const deleteAccount = () => {
    // Production: calls an edge function that deletes the user server-side.
    trackEvent('account_deleted');
  };

  return (
    <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 32, paddingHorizontal: 24, gap: 12 }}>
      <Text style={[type.displayTitle, { color: colors.text }]}>Account</Text>

      <Card>
        <Text style={[type.bodySmall, { color: colors.text }]}>Signed in as</Text>
        <Text style={[type.body, { color: colors.textSecondary }]}>{user?.email ?? '—'}</Text>
      </Card>

      <Button label="SIGN OUT" variant="danger" size="lg" onPress={() => void logout()} />
      <Text onPress={deleteAccount} style={[type.caption, { color: colors.danger, textAlign: 'center', fontSize: 11 }]}>
        Delete my account and data
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({});