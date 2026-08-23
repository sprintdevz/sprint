import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { CircularProgress } from '@/components/ui/CircularProgress';
import { Button } from '@/components/ui/Button';
import { getSport } from '@/sports';
import { useAthleteStore } from '@/store/athleteStore';
import { masteryFor, masteryStage } from '@/features/skills/mastery';
import { formatRating } from '@/utils/formatting';
import { type } from '@/constants/typography';

/** SKILL DETAIL — rating, mastery, benchmark, recent history, drills. */
export default function SkillDetailScreen() {
  const { colors, spacing, radius } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ skillId: string }>();
  const sportId = useAthleteStore((s) => s.athlete?.sport) ?? 'basketball';
  const skills = useAthleteStore((s) => s.skills);
  const sport = getSport(sportId);

  const skill = sport.skills.find((s) => s.code === params.skillId) ?? sport.skills[0];
  if (!skill) return null;

  const state = skills.find((s) => s.skillCode === skill.code);
  const rating = state?.rating ?? 1000;
  const mastery = masteryFor(sportId, skill.code, rating);
  const stage = masteryStage(sportId, skill.code, rating);
  const drills = sport.drills.filter((d) => d.skillCode === skill.code).slice(0, 5);

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 }]}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, gap: 16 }}>
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={[type.caption, { color: colors.textMuted }]}>SKILL</Text>
            <Text style={[type.displayTitle, { color: colors.text }]}>{skill.name}</Text>
            <Text style={[type.bodySmall, { color: colors.textSecondary, marginTop: 4 }]}>{skill.description}</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
              <Badge label={stage.label.toUpperCase()} tone="navy" />
              <Badge label={`TREND ${state?.trend ?? 0}`} tone="accent" />
            </View>
          </View>
          <CircularProgress progress={mastery} size={72} label={formatRating(rating)} sublabel={`${Math.round(mastery * 100)}%`} />
        </View>

        <Card>
          <Text style={[type.label, { color: colors.textSecondary, fontSize: 11 }]}>REQUIRED FIRST</Text>
          {skill.prerequisites.length === 0 ? (
            <Text style={[type.bodySmall, { color: colors.textMuted }]}>None — trainable now.</Text>
          ) : (
            skill.prerequisites.map((p) => (
              <Text key={p} style={[type.bodySmall, { color: colors.text }]} onPress={() => router.push(`/skill/${p}`)}>
                {sport.skills.find((s) => s.code === p)?.name ?? p} →
              </Text>
            ))
          )}
        </Card>

        <View>
          <View style={styles.sectionHeader}>
            <Text style={[type.sectionTitle, { color: colors.text }]}>DRILLS</Text>
            <Text style={[type.caption, { color: colors.primary }]} onPress={() => router.push(`/skill/drills?skill=${skill.code}`)}>
              View all
            </Text>
          </View>
          {drills.map((d) => (
            <Pressable key={d.code} onPress={() => router.push('/session/[sessionId]')} style={{ marginBottom: 8 }}>
              <Card style={{ paddingVertical: 12 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View style={{ flex: 1 }}>
                    <Text style={[type.bodySmall, { color: colors.text, fontWeight: '700' }]}>{d.name}</Text>
                    <Text style={[type.caption, { color: colors.textMuted, fontSize: 10 }]} numberOfLines={1}>{d.description}</Text>
                  </View>
                  <Text style={{ color: colors.primary, fontSize: 18, marginLeft: 8 }}>›</Text>
                </View>
              </Card>
            </Pressable>
          ))}
        </View>

        <Button
          label={`TRAIN ${skill.name.toUpperCase()}`}
          size="lg"
          onPress={() => router.push('/session/[sessionId]')}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
});