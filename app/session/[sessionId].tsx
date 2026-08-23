import { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ChallengeCard } from '@/components/training/ChallengeCard';
import { CheetahAnimation } from '@/components/mascot/CheetahAnimation';
import { useGenerateSession } from '@/features/training/hooks';
import { useSessionStore } from '@/store/sessionStore';
import { useAthleteStore } from '@/store/athleteStore';
import type { SessionPlan } from '@/features/training/types';
import { type } from '@/constants/typography';

/** Session setup — plan overview + the START button. */
export default function SessionSetupScreen() {
  const { colors, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ sessionId?: string }>();
  const { plan, generating } = useGenerateSession();
  const challenges = useSessionStore((s) => s.challenges);
  const hydrate = useSessionStore((s) => s.hydrate);
  const athleteId = useAthleteStore((s) => s.athlete?.id);
  const [planPreview, setPlanPreview] = useState<SessionPlan | null>(null);

  useEffect(() => {
    if (challenges.length > 0) return;
    let mounted = true;
    void plan(25).then((p) => {
      if (mounted && p) {
        setPlanPreview(p);
        hydrate({
          sessionId: params.sessionId ?? null,
          focusSkillCode: p.focusSkillCode,
          focusReason: p.focusReason,
          durationMinutes: p.totalMinutes,
          challenges: p.blocks.map((b, i) => ({
            challengeId: b.id,
            label: b.title,
            skillCode: b.skillCode,
            attempts: b.attempts,
            achieved: 0,
            target: b.target,
            status: i === 0 ? ('active' as const) : ('pending' as const),
            xp: b.xp,
          })),
        });
      }
    });
    return () => {
      mounted = false;
    };
  }, [challenges.length, plan, hydrate, params.sessionId]);

  const start = () => {
    useSessionStore.getState().start(params.sessionId ?? 'local', athleteId ?? '');
    router.push('/session/challenge');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 }]}>
      <View style={{ alignItems: 'center' }}>
        <CheetahAnimation mode="run" expression="determined" size={90} />
        <Text style={[type.displayTitle, { color: colors.text }]}>Game time.</Text>
      </View>

      <Text style={[type.caption, { color: colors.textMuted, textAlign: 'center', marginTop: 4 }]}>
        {planPreview ? `${planPreview.totalMinutes} MIN · ${planPreview.difficulty.toUpperCase()}` : 'PREPARING…'}
      </Text>

      <ScrollView
        style={{ flex: 1, width: '100%', marginTop: spacing['2xl'] }}
        contentContainerStyle={{ gap: 12, paddingHorizontal: 24 }}
      >
        {generating && challenges.length === 0 ? (
          <Card>
            <Text style={[type.bodySmall, { color: colors.textSecondary, textAlign: 'center' }]}>Building your session…</Text>
          </Card>
        ) : (
          challenges.map((c, i) => (
            <ChallengeCard
              key={c.challengeId}
              index={i}
              label={`BLOCK ${String(i + 1).padStart(2, '0')}`}
              title={c.label}
              attempts={c.attempts}
              achieved={c.achieved}
              target={c.target}
              xp={c.xp}
              status={c.status}
            />
          ))
        )}
      </ScrollView>

      <View style={{ paddingHorizontal: 24 }}>
        <Button
          label={`START SESSION (${challenges.length} BLOCKS)`}
          size="lg"
          onPress={start}
          disabled={challenges.length === 0}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});