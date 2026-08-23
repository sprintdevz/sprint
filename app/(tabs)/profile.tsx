import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { EloBadge } from '@/components/competition/EloBadge';
import { useAthleteStore } from '@/store/athleteStore';
import { useElo } from '@/hooks/useElo';
import { type } from '@/constants/typography';

const MENU: Array<{ title: string; href: string; icon: string }> = [
  { title: 'Edit Profile', href: '/profile/edit', icon: 'person' },
  { title: 'Statistics', href: '/profile/statistics', icon: 'stats-chart' },
  { title: 'Achievements', href: '/profile/achievements', icon: 'trophy' },
  { title: 'Settings', href: '/profile/settings', icon: 'settings' },
];

/** PROFILE — athlete identity, rating, stats, menu. */
export default function ProfileScreen() {
  const { colors, spacing, radius } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { profile } = useAuth();
  const { isPro } = useSubscription();
  const athlete = useAthleteStore((s) => s.athlete);
  const { rating } = useElo();

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 32, paddingHorizontal: 24, gap: 20 }}
    >
      <View style={[styles.header, { backgroundColor: colors.navySurface, borderRadius: radius.xl, padding: spacing['2xl'] }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <Avatar name={profile?.fullName} size={56} />
          <View style={{ flex: 1 }}>
            <Text style={[type.sectionTitle, { color: colors.onNavy }]}>{profile?.fullName ?? 'Athlete'}</Text>
            <Text style={[type.bodySmall, { color: colors.onNavyMuted }]}>@{profile?.username ?? athlete?.id?.slice(0, 8)}</Text>
          </View>
          <Badge label={isPro ? 'PRO' : 'FREE'} tone={isPro ? 'gold' : 'neutral'} />
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 20 }}>
          <View>
            <Text style={[type.caption, { color: colors.onNavyMuted, fontSize: 9 }]}>SPRINT ELO</Text>
            <Text style={[type.displayLarge, { color: colors.onNavy }]}>{rating}</Text>
          </View>
          <EloBadge rating={rating} size="lg" />
        </View>
      </View>

      {MENU.map((item) => (
        <Card key={item.title} onPress={() => router.push(item.href as never)} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={[type.body, { color: colors.text, fontWeight: '600' }]}>{item.title}</Text>
          <Text style={{ color: colors.textMuted, fontSize: 18 }}>›</Text>
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: {},
});