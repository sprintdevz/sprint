import { useEffect, useState } from 'react';
import { ScrollView, View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SessionCard } from '@/components/training/SessionCard';
import { Badge } from '@/components/ui/Badge';
import { useGenerateSession } from '@/features/training/hooks';
import { useAthleteStore } from '@/store/athleteStore';
import { useSubscription } from '@/hooks/useSubscription';
import { formatXp } from '@/utils/formatting';
import { type } from '@/constants/typography';

/** TRAIN — generate today's session, choose duration, enter the runner. */
export default function TrainScreen() {
  const { colors, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { plan, planAndStart, generating } = useGenerateSession();
  const { isPro } = useSubscription();
  const [planPreview, setPlanPreview] = useState(null as Awaited<ReturnType<typeof plan>> | null);

  useEffect(() => {
    void plan(25).then(setPlanPreview);
  }, [plan]);

  const start = async (minutes: number) => {
    const { sessionId, plan: generated } = await planAndStart(minutes);
    void sessionId;
    void generated;
    router.push('/session/[sessionId]');
  };

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 32, paddingHorizontal: 24, gap: 20 }}
    >
      <Text style={[type.displayTitle, { color: colors.text }]}>Train.</Text>
      <Text style={[type.body, { color: colors.textSecondary }]}>Every session is built for your biggest opportunity.</Text>

      {generating || !planPreview ? (
        <Card style={{ alignItems: 'center', padding: 32 }}>
          <ActivityIndicator color={colors.primary} />
          <Text style={[type.bodySmall, { color: colors.textSecondary, marginTop: 8 }]}>Designing your session…</Text>
        </Card>
      ) : (
        <SessionCard
          focusTitle={planPreview.focusSkillCode.replace('-', ' ')}
          reason={planPreview.focusReason}
          minutes={planPreview.totalMinutes}
          eloPreview={76}
          ctaLabel="START NOW"
          onPress={() => start(planPreview.totalMinutes)}
        />
      )}

      <View style={{ gap: spacing.sm }}>
        <Text style={[type.label, { color: colors.textSecondary }]}>QUICK START (MIN)</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {[15, 25, 30, 45].map((m) => (
            <View key={m} style={{ flex: 1 }}>
              <Button label={`${m}`} variant="secondary" size="sm" onPress={() => start(m)} disabled={generating} />
            </View>
          ))}
        </View>
      </View>

      {!isPro && (
        <Card style={{ alignItems: 'center', gap: 8 }}>
          <Badge label="FREE PLAN" tone="neutral" />
          <Text style={[type.bodySmall, { color: colors.textSecondary, textAlign: 'center' }]}>
            Free athletes get 3 sessions per week. Pro = unlimited, plus video form analysis. {'\n'}
            <Text style={{ color: colors.primary, fontWeight: '700' }} onPress={() => router.push('/settings/subscription')}>
              Upgrade →
            </Text>
          </Text>
        </Card>
      )}
    </ScrollView>
  );
}