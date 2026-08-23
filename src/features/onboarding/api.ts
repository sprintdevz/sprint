import { sb } from '@/services/supabase';
import { overallRatingFromSkills } from '@/features/athlete/calculations';
import type { AssessmentResult } from '@/features/assessment/types';
import type { OnboardingData } from '@/features/onboarding/types';

/**
 * Persists the completed onboarding as an athlete row.
 * Called once after the ELO reveal; returns the new athlete id.
 */
export async function createAthleteFromOnboarding(data: OnboardingData): Promise<{
  athleteId: string;
  error: string | null;
}> {
  try {
    const { data: userData } = await sb().auth.getUser();
    const user = userData.user;
    if (!user) return { athleteId: '', error: 'Not signed in' };
    const userId = user.id;

    const { data: inserted, error } = await sb()
      .from('athletes')
      .insert({
        user_id: userId,
        sport: data.sport,
        position: data.position,
        height_cm: data.heightCm,
        weight_kg: data.weightKg,
        birth_year: data.birthYear,
        experience_years: 0,
        experience_level: data.experience,
        goal: data.goals.primaryGoal,
        training_frequency: data.training.sessionsPerWeek,
      })
      .select('id')
      .single();

    if (error) return { athleteId: '', error: error.message };

    if (data.fullName) {
      await sb().from('profiles').upsert({
        id: userId,
        full_name: data.fullName,
        username: user.user_metadata?.username ?? null,
      });
    }

    return { athleteId: inserted?.id ?? '', error: null };
  } catch (e) {
    return { athleteId: '', error: e instanceof Error ? e.message : 'Failed to create athlete' };
  }
}

/**
 * Persist the completed onboarding AND the assessment result in one step:
 * athlete row + profile + per-skill ratings + streaks. This is the moment
 * ratings first exist — mirrors what the process-assessment edge function
 * would do on the server.
 */
export async function finalizeOnboardingWithAssessment(
  data: OnboardingData,
  result: AssessmentResult,
): Promise<{ athleteId: string; error: string | null }> {
  const { athleteId, error } = await createAthleteFromOnboarding(data);
  if (error || !athleteId) return { athleteId: '', error };

  try {
    const sport = data.sport || 'basketball';
    const skillRatings = result.skillRatings;
    const entries = Object.entries(skillRatings).map(([skillCode, rating]) => ({ skillCode, rating }));
    const overall = overallRatingFromSkills(sport, entries);
    const now = new Date().toISOString();

    const ratingRows = [
      { athlete_id: athleteId, scope: 'overall', focus: null, rating: overall, deviation: 200, games: 1, peak: overall, updated_at: now },
      { athlete_id: athleteId, scope: 'sport', focus: null, rating: overall, deviation: 200, games: 1, peak: overall, updated_at: now },
      ...entries.map(({ skillCode, rating }) => ({
        athlete_id: athleteId,
        scope: 'skill',
        focus: skillCode,
        rating,
        deviation: 150,
        games: 1,
        peak: rating,
        updated_at: now,
      })),
    ];
    await sb().from('athlete_ratings').upsert(ratingRows);

    const skillRows = entries.map(({ skillCode, rating }) => ({
      athlete_id: athleteId,
      skill_code: skillCode,
      rating,
      deviation: 150,
      mastery: Number(Math.min(1, rating / 2000).toFixed(2)),
      trend: 0,
      attempts: 1,
      personal_best: rating,
      last_played_at: now,
    }));
    await sb().from('athlete_skills').upsert(skillRows);

    const { data: athleteRow } = await sb()
      .from('athletes')
      .select('user_id')
      .eq('id', athleteId)
      .maybeSingle();
    const userId = athleteRow?.user_id as string | undefined;
    if (userId) {
      await sb().from('streaks').upsert({ user_id: userId, current: 1, longest: 1, last_active: now });
    }

    return { athleteId, error: null };
  } catch (e) {
    return { athleteId, error: e instanceof Error ? e.message : 'Failed to persist rating' };
  }
}

/** Persists equipment selection (join rows) for the athlete. */
export async function applyOnboardingPreferences(data: OnboardingData): Promise<void> {
  try {
    if (!data.sport) return;
    const { data: userData } = await sb().auth.getUser();
    if (!userData.user) return;

    const { data: athlete } = await sb()
      .from('athletes')
      .select('id')
      .eq('user_id', userData.user.id)
      .maybeSingle();
    if (!athlete) return;

    const { data: equipment } = await sb()
      .from('equipment')
      .select('id, slug')
      .eq('sport', data.sport);
    const slugs = new Set(data.equipment);
    const rows = (equipment ?? [])
      .filter((e) => slugs.has(e.slug))
      .map((e) => ({ athlete_id: athlete.id, equipment_id: e.id }));
    if (rows.length) {
      await sb().from('athlete_equipment').upsert(rows);
    }
  } catch {
    // non-fatal
  }
}