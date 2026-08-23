import { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { XPBar } from '@/components/progression/XPBar';
import { SkillTree } from '@/components/progression/SkillTree';
import { AchievementCard } from '@/components/progression/AchievementCard';
import { getSport } from '@/sports';
import { useAthleteStore } from '@/store/athleteStore';
import { masteryFor, masteryStage } from '@/features/skills/mastery';
import { unlockedSkills } from '@/features/skills/graph';
import { type } from '@/constants/typography';

/** PROGRESS — skills, mastery tree, achievements, XP. */
export default function ProgressScreen() {
  const { colors, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const athlete = useAthleteStore((s) => s.athlete);
  const skills = useAthleteStore((s) => s.skills);
  const sport = athlete?.sport ?? 'basketball';
  const sportConfig = getSport(sport);

  const ratings = useMemo(
    () => Object.fromEntries(skills.map((s) => [s.skillCode, s.rating])),
    [skills],
  );
  const open = useMemo(() => unlockedSkills(sport, ratings), [sport, ratings]);

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 32, paddingHorizontal: 24, gap: 20 }}
    >
      <Text style={[type.displayTitle, { color: colors.text }]}>Progress.</Text>
      <Text style={[type.body, { color: colors.textSecondary }]}>
        Participation (XP) and ability (ratings) — kept separate for a reason.
      </Text>

      <XPBar xp={420} nextXp={1000} levelLabel="LEVEL 4 · SPRINTER" />

      <View style={{ gap: spacing.sm }}>
        <Text style={[type.sectionTitle, { color: colors.text }]}>SKILL TREE</Text>
        <SkillTree
          nodes={open.map((code) => {
            const skill = sportConfig.skills.find((s) => s.code === code);
            const state = skills.find((s) => s.skillCode === code);
            const rating = state?.rating ?? 1000;
            const stage = masteryStage(sport, code, rating);
            return {
              skillCode: code,
              name: skill?.name ?? code,
              mastery: masteryFor(sport, code, rating),
              rating,
              stageLabel: stage.label,
              stageColor: stage.color,
            };
          })}
          onNodePress={(code) => router.push(`/skill/${code}`)}
        />
      </View>

      <View style={{ gap: spacing.sm }}>
        <Text style={[type.sectionTitle, { color: colors.text }]}>ACHIEVEMENTS</Text>
        <View style={styles.achievementsRow}>
          <View style={{ flex: 1 }}>
            <AchievementCard name="First Assessment" description="Complete your initial assessment." icon="clipboard" xp={50} unlocked />
          </View>
          <View style={{ flex: 1 }}>
            <AchievementCard name="Rising Star" description="Gain +100 ELO since calibration." icon="star" xp={40} unlocked={false} />
          </View>
        </View>
        <Text style={[type.bodySmall, { color: colors.primary, fontWeight: '700' }]} onPress={() => router.push('/profile/achievements')}>
          View all achievements →
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  achievementsRow: { flexDirection: 'row', gap: 10 },
});