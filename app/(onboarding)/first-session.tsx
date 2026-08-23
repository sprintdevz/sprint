import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { CheetahAnimation } from '@/components/mascot/CheetahAnimation';
import { useGenerateSession } from '@/features/training/hooks';
import { useAthleteStore } from '@/store/athleteStore';
import { markOnboardingComplete } from '@/features/onboarding/persistence';
import { getSport } from '@/sports';
import type { SessionPlan } from '@/features/training/types';
import { type } from '@/constants/typography';

/** First recommended session after the ELO reveal — "the journey starts now". */
export default function FirstSessionScreen() {
  const { colors, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { plan, generating, error } = useGenerateSession();
  const [sessionPlan, setSessionPlan] = useState<SessionPlan | null>(null);
  const sport = useAthleteStore((s) => s.athlete?.sport) ?? 'basketball';
  const sportConfig = getSport(sport);

  useEffect(() => {
    let mounted = true;
    void plan(25).then((p) => {
      if (mounted) setSessionPlan(p);
    });
    return () => {
      mounted = false;
    };
  }, [plan]);

  const start = async () => {
    await markOnboardingComplete();
    router.push('/session/[sessionId]');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}>
      <CheetahAnimation mode="bounce" expression="excited" size={110} />
      <Text style={[type.displayTitle, { color: colors.text, marginTop: spacing['2xl'], textAlign: 'center' }]}>
        Your first session.
      </Text>
      <Text style={[type.body, { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.sm }]}>
        Built around your biggest opportunity — {sportConfig.meta.name} from the ground up.
      </Text>

      <View style={styles.centerContent}>
        {generating || !sessionPlan ? (
          <Card style={{ alignItems: 'center' }}>
            <ActivityIndicator color={colors.primary} />
            <Text style={[type.bodySmall, { color: colors.textSecondary, textAlign: 'center', marginTop: 8 }]}>
              Building your plan…
            </Text>
          </Card>
        ) : (
          <Card>
            <Text style={[type.caption, { color: colors.textMuted, fontSize: 10 }]}>TODAY'S FOCUS</Text>
            <Text style={[type.displayTitle, { color: colors.text, textTransform: 'uppercase' }]}>
              {sessionPlan.focusSkillCode}
            </Text>
            <Text style={[type.bodySmall, { color: colors.textSecondary, marginTop: 6 }]}>
              {sessionPlan.focusReason}
            </Text>
            <View style={styles.meta}>
              <Text style={[type.label, { color: colors.primary, fontSize: 12 }]}>{sessionPlan.totalMinutes} MIN</Text>
              <Text style={[type.label, { color: colors.textMuted, fontSize: 12 }]}>{sessionPlan.blocks.length} CHALLENGES</Text>
            </View>
          </Card>
        )}
        {error && <Text style={[type.bodySmall, { color: colors.danger, textAlign: 'center', marginTop: 8 }]}>{error}</Text>}
      </View>

      <Button label="TRAIN NOW" size="lg" onPress={start} disabled={!sessionPlan} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24, alignItems: 'center' },
  centerContent: { flex: 1, width: '100%', justifyContent: 'center' },
  meta: { flexDirection: 'row', gap: 16, marginTop: 10 },
});