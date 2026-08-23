import { sb } from '@/services/supabase';
import { cacheGet, cacheSet } from '@/utils/storage';
import { CACHE_KEYS } from '@/constants/config';
import { getSport } from '@/sports';
import type { AthleteOverview } from '@/features/athlete/types';
import type { RatingState } from '@/features/elo/types';

/**
 * Athlete API — loads the full athlete snapshot (row + ratings + skills +
 * streak) and caches it so the home screen renders instantly offline.
 */

export async function fetchAthleteOverview(userId: string): Promise<AthleteOverview | null> {
  const client = sb();

  const { data: athlete } = await client
    .from('athletes')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  if (!athlete) return null;

  const [{ data: ratings }, { data: skills }] = await Promise.all([
    client.from('athlete_ratings').select('*').eq('athlete_id', athlete.id),
    client.from('athlete_skills').select('*').eq('athlete_id', athlete.id),
  ]);

  const overallRow = (ratings ?? []).find((r) => r.scope === 'overall');
  const sportRow = (ratings ?? []).find((r) => r.scope === 'sport');

  const sport = getSport(athlete.sport);
  const nameFor = (code: string) => sport.skills.find((s) => s.code === code)?.name ?? code;

  const overview: AthleteOverview = {
    athlete: {
      id: athlete.id,
      sport: athlete.sport,
      position: athlete.position,
      goal: athlete.goal,
      experienceLevel: athlete.experience_level,
      trainingFrequency: athlete.training_frequency,
    },
    overall: rowToRating(overallRow ?? null),
    sportRating: rowToRating(sportRow ?? null),
    skills: (skills ?? []).map((s) => ({
      skillCode: s.skill_code,
      name: nameFor(s.skill_code),
      rating: s.rating,
      deviation: s.deviation,
      mastery: Number(s.mastery),
      trend: s.trend,
      attempts: s.attempts,
      personalBest: s.personal_best,
    })),
    streak: null,
    weeklySessionsCompleted: 0,
    xpTotal: 0,
  };

  await cacheSet(CACHE_KEYS.athlete, overview);
  return overview;
}

export async function loadCachedAthlete(): Promise<AthleteOverview | null> {
  return cacheGet<AthleteOverview>(CACHE_KEYS.athlete);
}

export async function updateAthleteSport(athleteId: string, sport: string): Promise<{ ok: boolean; error: string | null }> {
  try {
    const { error } = await sb().from('athletes').update({ sport }).eq('id', athleteId);
    return { ok: !error, error: error?.message ?? null };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Update failed' };
  }
}

function rowToRating(
  row: { rating: number; deviation: number; games: number; peak: number; updated_at: string } | null,
): RatingState | null {
  if (!row) return null;
  return {
    rating: row.rating,
    deviation: row.deviation,
    games: row.games,
    peak: row.peak,
    updatedAt: row.updated_at,
  };
}