import { sb } from '@/services/supabase';
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