import { sb } from '@/services/supabase';
import type { SkillDetail } from '@/features/skills/types';

/** Full skill detail: definition + athlete state + recent history. */
export async function fetchSkillDetail(
  athleteId: string,
  sportId: string,
  skillCode: string,
): Promise<SkillDetail | null> {
  const client = sb();

  const [{ data: skillRow }, { data: athleteSkill }, { data: history }] = await Promise.all([
    client.from('skills').select('*').eq('sport', sportId).eq('code', skillCode).maybeSingle(),
    client
      .from('athlete_skills')
      .select('*')
      .eq('athlete_id', athleteId)
      .eq('skill_code', skillCode)
      .maybeSingle(),
    client
      .from('rating_history')
      .select('rating_before, rating_after, delta, occurred_at')
      .eq('athlete_id', athleteId)
      .eq('scope', 'skill')
      .eq('focus', skillCode)
      .order('occurred_at', { ascending: false })
      .limit(14),
  ]);

  if (!skillRow) return null;

  const { getSport } = await import('@/sports');
  const sport = getSport(sportId);
  const definition = sport.skills.find((s) => s.code === skillCode);

  return {
    summary: {
      skillCode,
      name: definition?.name ?? skillRow.name,
      rating: athleteSkill?.rating ?? 1000,
      deviation: athleteSkill?.deviation ?? 350,
      mastery: Number(athleteSkill?.mastery ?? 0),
      trend: athleteSkill?.trend ?? 0,
      attempts: athleteSkill?.attempts ?? 0,
      personalBest: athleteSkill?.personal_best ?? 0,
    },
    description: definition?.description ?? skillRow.description ?? '',
    category: skillRow.category,
    prerequisites: definition?.prerequisites ?? [],
    benchmark: { label: 'Developing', description: 'Building a consistent base.' },
    progressionStage: { label: 'Foundation', color: '#8B99B8' },
    recentHistory: (history ?? []).map((h) => ({
      occurredAt: h.occurred_at,
      delta: h.delta,
      ratingAfter: h.rating_after,
    })),
  };
}