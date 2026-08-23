import { useMemo } from 'react';
import { ScrollView, Text, View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { useAthlete } from '@/hooks/useAthlete';
import { useElo } from '@/hooks/useElo';
import { useAuth } from '@/hooks/useAuth';
import { AthleteHeader } from '@/components/athlete/AthleteHeader';
import { AthleteRating } from '@/components/athlete/AthleteRating';
import { SkillGrid } from '@/components/athlete/SkillGrid';
import { PerformanceGap } from '@/components/athlete/PerformanceGap';
import { SessionCard } from '@/components/training/SessionCard';
import { MilestoneCard } from '@/components/progression/MilestoneCard';
import { Card } from '@/components/ui/Card';
import { SkeletonBlock } from '@/components/ui/Skeleton';
import { getSport } from '@/sports';
import { useGenerateSession } from '@/features/training/hooks';
import { analyzeWeakness } from '@/features/athlete/calculations';
import { useAthleteStore } from '@/store/athleteStore';
import { type } from '@/constants/typography';

/** HOME — answers "Where am I? What's holding me back? What next?" */
export default function HomeScreen() {
  const { colors, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { profile } = useAuth();
  const { loading } = useAthlete();
  const { rating, league, nextMilestone, leagueProgress } = useElo();
  const peakRating = useAthleteStore((s) => s.overallRating?.peak ?? rating);
  const skills = useAthleteStore((s) => s.skills);
  const athlete = useAthleteStore((s) => s.athlete);
  const streak = useAthleteStore((s) => s.streak?.current ?? 0);
  const { planAndStart } = useGenerateSession();

  const sport = athlete?.sport ?? 'basketball';
  const sportConfig = getSport(sport);
  const weakness = useMemo(() => analyzeWeakness(sport, skills), [sport, skills]);

  const start = async () => {
    await planAndStart(25);
    router.push('/session/[sessionId]');
  };

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 32, paddingHorizontal: 24, gap: 20 }}
      showsVerticalScrollIndicator={false}
    >
      <AthleteHeader
        name={profile?.fullName ?? null}
        sportName={sportConfig.meta.name}
        position={athlete?.position ?? null}
        streakDays={Math.max(streak, 0)}
      />

      {loading || skills.length === 0 ? (
        <SkeletonBlock lines={4} />
      ) : (
        <>
          {/* HERO RATING CARD */}
          <View style={[styles.hero, { backgroundColor: colors.navySurface, borderRadius: 24, padding: spacing['2xl'] }]}>
            <AthleteRating
              rating={rating}
              delta={0}
              leagueLabel={league.label}
              provisional={false}
              size="hero"
            />
            <View style={styles.heroRow}>
              <Text style={[styles.heroCaption, { color: colors.onNavyMuted }]}>7 DAY STREAK</Text>
              <Text style={[styles.heroCaption, { color: '#4ADE80' }]}>ALL-TIME BEST {peakRating}</Text>
            </View>
          </View>

          {/* Progress toward next milestone */}
          <MilestoneCard currentRating={rating} nextMilestone={nextMilestone} progress={leagueProgress} leagueLabel={league.label} />

          {/* What is holding me back? */}
          {weakness.biggestGapSkill && (
            <PerformanceGap
              weakestName={weakness.opportunities[0]?.name ?? weakness.biggestGapSkill}
              weakestRating={skills.find((s) => s.skillCode === weakness.biggestGapSkill)?.rating ?? rating}
              overallRating={rating}
              insight={weakness.insight}
            />
          )}

          {/* What should I do next? */}
          <SessionCard
            focusTitle={weakness.biggestGapSkill ?? 'Build your base'}
            focusSkillName={undefined}
            reason={weakness.opportunities[0]?.name ? `Close the gap in ${weakness.opportunities[0].name}.` : 'Sharpen your edge.'}
            minutes={25}
            eloPreview={76}
            onPress={start}
          />

          {/* Skills snapshot */}
          <View>
            <View style={styles.sectionHeader}>
              <Text style={[type.sectionTitle, { color: colors.text }]}>SKILL RATINGS</Text>
              <Text onPress={() => router.push('/skill/[skillId]')} style={[type.caption, { color: colors.primary }]}>
                View all
              </Text>
            </View>
            <SkillGrid
              skills={skills.slice(0, 5).map((s) => ({
                skillCode: s.skillCode,
                name: sportConfig.skills.find((sk) => sk.code === s.skillCode)?.name ?? s.skillCode,
                rating: s.rating,
                mastery: s.mastery,
                trend: s.trend,
              }))}
              weakestCodes={weakness.biggestGapSkill ? [weakness.biggestGapSkill] : []}
              onSkillPress={(code) => router.push(`/skill/${code}`)}
            />
          </View>

          <Card>
            <Text style={[type.bodySmall, { color: colors.textSecondary, textAlign: 'center' }]}>
              Your rating is earned on the floor. Sessions move it. XP keeps score.
            </Text>
          </Card>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', gap: 8 },
  heroRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 8 },
  heroCaption: { fontSize: 10, fontWeight: '800', letterSpacing: 1.2 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
});