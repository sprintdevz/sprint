import { sb } from '@/services/supabase';
import type {
  CompetitiveChallenge,
  Friend,
  Leaderboard,
  LeaderboardPlayer,
  LeaderboardScope,
  Season,
} from '@/features/competition/types';
import { rankPlayers } from '@/features/competition/leaderboard';

export async function fetchLeaderboard(
  scope: LeaderboardScope,
  opts: { sport?: string; focus?: string | null; seasonId?: string } = {},
): Promise<Leaderboard> {
  const client = sb();

  if (scope === 'friends') {
    // Friends board = ratings of accepted friends + self.
    const { data: friends } = await client
      .from('friends')
      .select('user_a, user_b');
    const friendIds = (friends ?? []).flatMap((f) => [f.user_a, f.user_b]);

    const { data: profiles } = await client
      .from('profiles')
      .select('id, username, full_name')
      .in('id', friendIds);

    const { data: ratings } = await client.from('athlete_ratings')
      .select('athlete_id, rating')
      .eq('scope', 'overall');
    const ratingMap = new Map((ratings ?? []).map((r) => [r.athlete_id, r.rating]));

    const players: LeaderboardPlayer[] = (profiles ?? []).map((p, i) => ({
      rank: i + 1,
      athleteId: p.id,
      displayName: p.username ?? p.full_name ?? 'Athlete',
      sport: opts.sport ?? 'basketball',
      rating: ratingMap.get(p.id) ?? 1000,
      improvement: 0,
      streak: 0,
      isPeerOfUser: false,
    }));
    return { scope, period: 'all-time', players, userRank: null, totalPlayers: players.length };
  }

  // General boards read the materialized leaderboards table (or empty state).
  const { data: rows } = await client
    .from('leaderboards')
    .select('*')
    .eq('scope', scope)
    .eq('sport', opts.sport ?? 'basketball')
    .order('computed_at', { ascending: false })
    .limit(1);

  const row = rows?.[0];
  const parsed: LeaderboardPlayer[] = Array.isArray(row?.data)
    ? (row.data as LeaderboardPlayer[])
    : [];
  return {
    scope,
    period: row?.period ?? 'season',
    players: parsed.slice(0, 50),
    userRank: null,
    totalPlayers: row?.data?.length ?? 0,
    focus: opts.focus ?? null,
  };
}

export async function fetchSeasons(sport: string): Promise<Season[]> {
  const { data } = await sb()
    .from('seasons')
    .select('*')
    .eq('sport', sport)
    .order('starts_at', { ascending: false });
  return (data ?? []).map((s) => ({
    id: s.id,
    sport: s.sport,
    name: s.name,
    code: s.code,
    startsAt: s.starts_at,
    endsAt: s.ends_at,
    status: s.status,
    minRating: s.min_rating,
    rewards: s.rewards as Record<string, unknown>,
  }));
}

export async function fetchActiveChallenges(sport: string): Promise<CompetitiveChallenge[]> {
  const now = new Date().toISOString();
  const { data } = await sb()
    .from('challenges')
    .select('*')
    .eq('sport', sport)
    .lte('starts_at', now)
    .gte('ends_at', now)
    .order('ends_at', { ascending: true });
  return (data ?? []).map((c) => ({
    id: c.id,
    sport: c.sport,
    title: c.title,
    description: c.description,
    metric: c.metric,
    target: c.target as Record<string, unknown>,
    rewardXp: c.reward_xp,
    premium: c.premium,
    startsAt: c.starts_at,
    endsAt: c.ends_at,
    status: c.status,
  }));
}

export async function submitChallengeResult(
  challengeId: string,
  athleteId: string,
  progress: number,
  best: number,
  target: number,
): Promise<{ completed: boolean; error: string | null }> {
  try {
    const done = progress >= target;
    const { data, error } = await sb()
      .from('challenge_attempts')
      .upsert({
        challenge_id: challengeId,
        athlete_id: athleteId,
        progress,
        best,
        completed: done,
        completed_at: done ? new Date().toISOString() : null,
        rewards: { xp: done ? 50 : 0 },
      })
      .select('completed')
      .single();
    if (error) return { completed: false, error: error.message };
    return { completed: data?.completed ?? false, error: null };
  } catch (e) {
    return { completed: false, error: e instanceof Error ? e.message : 'Failed to submit' };
  }
}

export async function listFriends(userId: string): Promise<Friend[]> {
  const client = sb();
  const { data: friends } = await client
    .from('friends')
    .select('user_a, user_b')
    .eq('status', 'accepted')
    .or(`user_a.eq.${userId},user_b.eq.${userId}`);
  if (!friends) return [];

  const otherIds = friends.map((f) => (f.user_a === userId ? f.user_b : f.user_a));
  const { data: profiles } = await client
    .from('profiles')
    .select('id, username, full_name')
    .in('id', otherIds);

  const { data: ratings } = await client.from('athlete_ratings')
    .select('athlete_id, rating')
    .eq('scope', 'overall');
  const ratingMap = new Map((ratings ?? []).map((r) => [r.athlete_id, r.rating]));

  return (profiles ?? []).map((p) => ({
    id: p.id,
    userId: p.id,
    username: p.username ?? 'athlete',
    fullName: p.full_name,
    rating: ratingMap.get(p.id) ?? 1000,
    streak: 0,
    sport: 'basketball',
  }));
}

export async function sendFriendRequest(usernameOrEmail: string): Promise<{ ok: boolean; error: string | null }> {
  try {
    const { data: target } = await sb()
      .from('profiles')
      .select('id')
      .or(`username.eq.${usernameOrEmail.trim()},email.eq.${usernameOrEmail.trim()}`)
      .maybeSingle();
    if (!target) return { ok: false, error: 'No athlete found with that name.' };
    const me = sb().auth.getUser();
    const { data: meData } = await me;
    if (!meData.user) return { ok: false, error: 'Not signed in' };
    if (target.id === meData.user.id) return { ok: false, error: "That's you!" };
    const { error } = await sb().from('friend_requests').insert({
      sender_id: meData.user.id,
      recipient_id: target.id,
    });
    return { ok: !error, error: error?.message ?? null };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Request failed' };
  }
}