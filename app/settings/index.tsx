import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useSubscription } from '@/hooks/useSubscription';
import { type } from '@/constants/typography';

const MENU = [
  { title: 'Notifications', href: '/settings/notifications', icon: 'notifications' },
  { title: 'Privacy', href: '/settings/privacy', icon: 'shield' },
  { title: 'Subscription', href: '/settings/subscription', icon: 'card' },
  { title: 'Account', href: '/settings/account', icon: 'person' },
];

export default function SettingsScreen() {
  const { colors, type } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isPro } = useSubscription();

  return (
    <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 32, paddingHorizontal: 24, gap: 12 }}>
      <Text style={[type.displayTitle, { color: colors.text }]}>Settings</Text>
      {MENU.map((item) => (
        <Card key={item.title} onPress={() => router.push(item.href as never)} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={[type.body, { color: colors.text, fontWeight: '600' }]}>{item.title}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            {item.title === 'Subscription' && <Badge label={isPro ? 'PRO' : 'FREE'} tone={isPro ? 'gold' : 'neutral'} />}
            <Text style={{ color: colors.textMuted, fontSize: 18 }}>›</Text>
          </View>
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({});