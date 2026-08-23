/**
 * SPRINT demo backend — a localStorage-backed datastore that stands in for
 * Supabase when no project is configured (EXPO_PUBLIC_SUPABASE_URL empty).
 *
 * It is NOT a toy: sessions, assessments and ratings run through the same
 * real engines the production edge functions use (src/features/elo,
 * src/features/training). The only thing "fake" is where the rows live —
 * your browser — which makes the whole product playable without an account.
 *
 * Web persists to localStorage; native keeps an in-memory copy (a demo, so
 * data surviving a reload is a bonus, not a contract).
 */

import { Platform } from 'react-native';
import { getSport } from '@/sports';
import { createEloSystem } from '@/features/elo/engine';
import { planSuccessRate, averageDifficulty } from '@/features/training/calculations';
import { overallRatingFromSkills } from '@/features/athlete/calculations';
import { seededRandom } from '@/utils/numbers';
import type { SessionPlan } from '@/features/training/types';

/** Loose row shape — the demo store trades full typing for flexibility. */
export type DbRow = Record<string, unknown>;

export interface DemoUser {
  id: string;
  email: string;
  fullName: string;
  username: string;
}

export interface DemoSession {
  accessToken: string;
  refreshToken: string;
  user: DemoUser;
}

const DB_KEY = 'sprint.demo.db.v1';
const SESSION_KEY = 'sprint.demo.session.v1';

/* ────────────────────────── persistence ────────────────────────── */

const memory: Record<string, string> = {};

function read(key: string): string | null {
  try {
    if (Platform.OS === 'web') {
      return globalThis.localStorage?.getItem(key) ?? null;
    }
  } catch {
    // fall through to memory
  }
  return memory[key] ?? null;
}

function write(key: string, value: string): void {
  try {
    if (Platform.OS === 'web') {
      globalThis.localStorage?.setItem(key, value);
      return;
    }
  } catch {
    // fall through to memory
  }
  memory[key] = value;
}

function removeKey(key: string): void {
  try {
    if (Platform.OS === 'web') {
      globalThis.localStorage?.removeItem(key);
      return;
    }
  } catch {
    // fall through
  }
  delete memory[key];
}

/* ── id + date helpers ── */

export function makeId(prefix = ''): string {
  const body =
    Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 10);
  return prefix ? `${prefix}-${body}` : body;
}

function nowIso(): string {
  return new Date().toISOString();
}

function daysFromNow(days: number): string {
  return new Date(Date.now() + days * 86_400_000).toISOString();
}

function dateKey(offsetDays = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

/* ── fake competitor pool ── */

const FIRST_NAMES = [
  'Jordan', 'Marcus', 'Devin', 'Tyler', 'Isaiah', 'Andre', 'Kobe', 'Malik', 'Darius', 'Jaylen',
  'Riley', 'Owen', 'Diego', 'Mateo', 'Ethan', 'Nate', 'Caleb', 'Amir', 'Theo', 'Xavier',
  'Maya', 'Aaliyah', 'Jasmine', 'Nia', 'Sofia', 'Chloe', 'Zoe', 'Kiana', 'Bria', 'Tessa',
  'Avery', 'Lexi', 'Piper', 'Morgan', 'Sydney', 'Camille', 'Dakota', 'Sage', 'Reese', 'Jordan',
];

const LAST_NAMES = [
  'Carter', 'Wright', 'Bennett', 'Hayes', 'Brooks', 'Reed', 'Coleman', 'Turner', 'Parker', 'Woods',
  'Ellis', 'Sanders', 'Price', 'Barnes', 'Ross', 'Powell', 'Long', 'Hughes', 'Foster', 'Butler',
  'Gonzalez', 'Bryant', 'Fleming', 'Boyd', 'Myers', 'Holt', 'Knight', 'McCoy', 'Reyes', 'Henderson',
];

const POSITIONS = ['Point Guard', 'Shooting Guard', 'Small Forward', 'Power Forward', 'Center'];
const LEVELS = ['beginner', 'casual', 'competitive', 'advanced'];

/* ── the demo athlete (signature profile that showcases the product) ── */

export const DEMO_USER_ID = 'demo-0000-0000-0000-0000';
export const DEMO_ATHLETE_ID = 'demo-athlete';
export const DEMO_USERNAME = 'alexr';
export const DEMO_FULL_NAME = 'Alex Rivera';
export const DEMO_EMAIL = 'demo@sprint.app';

const DEMO_SKILLS: Array<{
  code: string;
  rating: number;
  deviation: number;
  mastery: number;
  trend: number;
  attempts: number;
  personalBest: number;
}> = [
  { code: 'shooting', rating: 1412, deviation: 58, mastery: 0.81, trend: 5, attempts: 42, personalBest: 1430 },
  { code: 'handling', rating: 1331, deviation: 61, mastery: 0.72, trend: 2, attempts: 38, personalBest: 1355 },
  { code: 'finishing', rating: 1205, deviation: 70, mastery: 0.55, trend: -4, attempts: 27, personalBest: 1236 },
  { code: 'passing', rating: 1180, deviation: 74, mastery: 0.5, trend: 8, attempts: 19, personalBest: 1210 },
  { code: 'defense', rating: 1172, deviation: 76, mastery: 0.49, trend: -1, attempts: 24, personalBest: 1202 },
  { code: 'speed', rating: 1300, deviation: 64, mastery: 0.68, trend: 6, attempts: 16, personalBest: 1345 },
  { code: 'agility', rating: 1250, deviation: 67, mastery: 0.6, trend: 3, attempts: 22, personalBest: 1288 },
  { code: 'explosiveness', rating: 1290, deviation: 65, mastery: 0.65, trend: 9, attempts: 18, personalBest: 1331 },
  { code: 'reaction', rating: 1200, deviation: 72, mastery: 0.52, trend: -2, attempts: 12, personalBest: 1231 },
  { code: 'decision', rating: 1104, deviation: 82, mastery: 0.4, trend: 8, attempts: 14, personalBest: 1120 },
];

/* ── rating summary shape (typed reads over loose rows) ── */

export interface RatingSummary {
  rating: number;
  deviation: number;
  games: number;
  peak: number;
}


/* ── the datastore ── */

export class DemoStore {
  tables: Record<string, DbRow[]>;
  session: DemoSession | null;

  constructor() {
    this.tables = {};
    this.session = null;

    const saved = read(DB_KEY);
    if (saved) {
      try {
        this.tables = JSON.parse(saved) as Record<string, DbRow[]>;
      } catch {
        this.tables = {};
      }
    }
    this.seedIfEmpty();
    this.restoreSession();
  }

  /** Accessor for a table (initializes on demand — each access gives an array). */
  table(name: string): DbRow[] {
    this.tables[name] = this.tables[name] ?? [];
    return this.tables[name]!;
  }

  /* ── persistence ── */

  persist(): void {
    write(DB_KEY, JSON.stringify(this.tables));
  }

  /** Wipe everything and reseed — the "reset demo" escape hatch. */
  resetDemo(): void {
    removeKey(DB_KEY);
    removeKey(SESSION_KEY);
    this.tables = {};
    this.session = null;
    this.seedIfEmpty();
  }

  /* ── session (auth) ── */

  restoreSession(): void {
    const raw = read(SESSION_KEY);
    if (!raw) return;
    try {
      this.session = JSON.parse(raw) as DemoSession;
    } catch {
      this.session = null;
    }
  }

  saveSession(session: DemoSession | null): void {
    this.session = session;
    if (session) write(SESSION_KEY, JSON.stringify(session));
    else removeKey(SESSION_KEY);
  }

  /* ── seeding ── */

  seedIfEmpty(): void {
    if ((this.table('profiles')?.length ?? 0) > 0) return;
    this.tables = {
      profiles: [],
      athletes: [],
      athlete_ratings: [],
      athlete_skills: [],
      athlete_equipment: [],
      assessment_attempts: [],
      assessment_results: [],
      sessions: [],
      rating_history: [],
      streaks: [],
      subscriptions: [],
      friends: [],
      friend_requests: [],
      challenge_attempts: [],
      leaderboards: [],
    };
    this.seedSkills();
    this.seedEquipment();
    this.seedSeasons();
    this.seedChallenges();
    this.seedCompetitors();
    this.seedDemoAthlete();
    this.persist();
  }

  private seedSkills(): void {
    const rows: DbRow[] = [];
    for (const sportId of ['basketball', 'soccer', 'tennis']) {
      for (const s of getSport(sportId).skills) {
        rows.push({
          id: makeId('sk'),
          sport: sportId,
          code: s.code,
          name: s.name,
          category: s.category,
          description: s.description,
        });
      }
    }
    this.tables['skills'] = rows;
  }

  private seedEquipment(): void {
    const slugs = [
      { slug: 'basketball', name: 'Basketball' },
      { slug: 'hoop', name: 'Court / Hoop' },
      { slug: 'cones', name: 'Cones' },
      { slug: 'wall', name: 'Wall' },
      { slug: 'sled', name: 'Sled / Bands' },
      { slug: 'stopwatch', name: 'Stopwatch' },
    ];
    const rows: DbRow[] = [];
    for (const sportId of ['basketball', 'soccer', 'tennis']) {
      for (const e of slugs) {
        rows.push({ id: makeId('eq'), sport: sportId, slug: e.slug, name: e.name });
      }
    }
    this.tables['equipment'] = rows;
  }

  private seedSeasons(): void {
    const mk = (name: string, code: string, endOffsetDays: number, status: string): DbRow => ({
      id: makeId('sea'),
      sport: 'basketball',
      name,
      code,
      starts_at: daysFromNow(endOffsetDays - 56),
      ends_at: daysFromNow(endOffsetDays),
      status,
      min_rating: 700,
      rewards: { xp: 2000, badge: 'season_finisher' },
    });
    this.tables['seasons'] = [
      mk('Season 5', 'S5', 12, 'active'),
      mk('Season 4', 'S4', -44, 'completed'),
      mk('Season 3', 'S3', -100, 'completed'),
      mk('Season 2', 'S2', -156, 'completed'),
      mk('Season 1', 'S1', -212, 'completed'),
    ];
  }

  private seedChallenges(): void {
    const r = seededRandom(2026);
    const defs = [
      { title: 'Bucket Burst', description: 'Most makes in 90 seconds — any spot you like.', metric: 'makes', target: { makes: 25 }, reward_xp: 120 },
      { title: 'Wing Swarm', description: 'Corner threes, catch-and-shoot rhythm.', metric: 'makes', target: { makes: 18 }, reward_xp: 100 },
      { title: 'Dribble Gauntlet', description: 'Cross + between-the-legs combo, 60 seconds.', metric: 'reps', target: { reps: 40 }, reward_xp: 90 },
      { title: 'Layup Ladder', description: 'Alternating-hand finishes at the rim.', metric: 'makes', target: { makes: 22 }, reward_xp: 110 },
      { title: 'Defense Drill-Off', description: 'Lateral slides + ball pokes in 45s.', metric: 'reps', target: { reps: 30 }, reward_xp: 85 },
      { title: 'Deep-Read Challenge', description: 'Decision reps under a shot clock.', metric: 'reps', target: { reps: 24 }, reward_xp: 95 },
      { title: 'Sprint & Stop', description: '5-10-5 shuttle — log your best time.', metric: 'seconds', target: { seconds: 6.4 }, reward_xp: 105 },
      { title: 'Board Battle', description: 'Box-out + rebound touches, 60s.', metric: 'reps', target: { reps: 20 }, reward_xp: 80 },
    ];
    this.tables['challenges'] = defs.map((d, i) => {
      const active = i % 5 !== 4;
      return {
        id: makeId('ch'),
        sport: 'basketball',
        title: d.title,
        description: d.description,
        metric: d.metric,
        target: d.target,
        reward_xp: d.reward_xp,
        premium: i % 4 === 3,
        starts_at: daysFromNow(active ? -2 : 3),
        ends_at: daysFromNow(active ? 3 + Math.floor(r() * 5) : 10),
        status: active ? 'active' : 'upcoming',
      };
    });
  }

  private seedCompetitors(): void {
    const r = seededRandom(7);
    const sport = getSport('basketball');
    const skillCodes = sport.skills.map((s) => s.code);

    for (let i = 0; i < 90; i++) {
      const id = makeId('cmp');
      const first = FIRST_NAMES[Math.floor(r() * FIRST_NAMES.length)]!;
      const last = LAST_NAMES[Math.floor(r() * LAST_NAMES.length)]!;
      const userId = `user-${i}`;
      const username = `${first.toLowerCase()}.${last.toLowerCase()}`;
      const overall = Math.round(1000 + (r() + r() + r() - 1.5) * 440);
      const streak = Math.floor(r() * 21);

      this.table('profiles').push({
        id: userId,
        username,
        full_name: `${first} ${last}`,
        email: `${username}@sprint.app`,
        avatar_url: null,
      });
      this.table('athletes').push({
        id,
        user_id: userId,
        sport: 'basketball',
        position: POSITIONS[i % POSITIONS.length],
        height_cm: 180 + Math.floor(r() * 30),
        weight_kg: 78 + Math.floor(r() * 20),
        birth_year: 1996 + Math.floor(r() * 20),
        experience_years: 1 + Math.floor(r() * 10),
        experience_level: LEVELS[i % LEVELS.length],
        goal: 'improve',
        training_frequency: 3 + Math.floor(r() * 3),
        created_at: nowIso(),
        updated_at: nowIso(),
      });
      this.table('athlete_ratings').push({
        id: makeId('rat'),
        athlete_id: id,
        scope: 'overall',
        focus: null,
        rating: overall,
        deviation: 55 + Math.floor(r() * 30),
        games: 8 + Math.floor(r() * 60),
        peak: overall + 20 + Math.floor(r() * 60),
        updated_at: nowIso(),
      });
      for (const code of skillCodes) {
        const skillRating = Math.max(720, Math.min(1850, Math.round(overall + (r() - 0.5) * 190)));
        this.table('athlete_ratings').push({
          id: makeId('rat'),
          athlete_id: id,
          scope: 'skill',
          focus: code,
          rating: skillRating,
          deviation: 60 + Math.floor(r() * 40),
          games: 1 + Math.floor(r() * 40),
          peak: skillRating + Math.floor(r() * 40),
          updated_at: nowIso(),
        });
        this.table('athlete_skills').push({
          id: makeId('as'),
          athlete_id: id,
          skill_code: code,
          rating: skillRating,
          deviation: 60 + Math.floor(r() * 40),
          mastery: Number((0.2 + r() * 0.75).toFixed(2)),
          trend: Math.round((r() - 0.5) * 16),
          attempts: 2 + Math.floor(r() * 50),
          personal_best: skillRating + Math.floor(r() * 35),
          last_played_at: daysFromNow(-Math.floor(r() * 10)),
        });
      }
      this.table('streaks').push({
        id: makeId('str'),
        user_id: userId,
        current: streak,
        longest: Math.max(streak, Math.floor(r() * 30)),
        last_active: daysFromNow(-Math.floor(r() * streak)),
      });
    }
  }

  private seedDemoAthlete(): void {
    this.table('profiles').push({
      id: DEMO_USER_ID,
      username: DEMO_USERNAME,
      full_name: DEMO_FULL_NAME,
      email: DEMO_EMAIL,
      avatar_url: null,
    });
    this.table('athletes').push({
      id: DEMO_ATHLETE_ID,
      user_id: DEMO_USER_ID,
      sport: 'basketball',
      position: 'Point Guard',
      height_cm: 185,
      weight_kg: 82,
      birth_year: 2004,
      experience_years: 4,
      experience_level: 'competitive',
      goal: 'all-around',
      training_frequency: 4,
      created_at: nowIso(),
      updated_at: nowIso(),
    });

    this.table('athlete_ratings').push(
      { id: makeId('rat'), athlete_id: DEMO_ATHLETE_ID, scope: 'overall', focus: null, rating: 1247, deviation: 90, games: 24, peak: 1278, updated_at: nowIso() },
      { id: makeId('rat'), athlete_id: DEMO_ATHLETE_ID, scope: 'sport', focus: null, rating: 1262, deviation: 88, games: 24, peak: 1295, updated_at: nowIso() },
    );
    for (const s of DEMO_SKILLS) {
      this.table('athlete_ratings').push({
        id: makeId('rat'),
        athlete_id: DEMO_ATHLETE_ID,
        scope: 'skill',
        focus: s.code,
        rating: s.rating,
        deviation: s.deviation,
        games: s.attempts,
        peak: s.personalBest,
        updated_at: nowIso(),
      });
      this.table('athlete_skills').push({
        id: makeId('as'),
        athlete_id: DEMO_ATHLETE_ID,
        skill_code: s.code,
        rating: s.rating,
        deviation: s.deviation,
        mastery: s.mastery,
        trend: s.trend,
        attempts: s.attempts,
        personal_best: s.personalBest,
        last_played_at: daysFromNow(-1),
      });
    }

    this.table('streaks').push({
      id: makeId('str'),
      user_id: DEMO_USER_ID,
      current: 7,
      longest: 21,
      last_active: dateKey(0),
    });

    this.table('subscriptions').push({
      id: makeId('sub'),
      user_id: DEMO_USER_ID,
      plan: 'pro',
      status: 'active',
      provider: 'demo',
      started_at: daysFromNow(-14),
      renews_at: daysFromNow(7),
    });
  }

  /* ── reads ── */

  /** Shaped overall + sport + skill ratings for an athlete. */
  ratingSummary(athleteId: string): {
    overall: RatingSummary | null;
    sport: RatingSummary | null;
    skills: Record<string, RatingSummary>;
  } {
    const out: ReturnType<DemoStore['ratingSummary']> = { overall: null, sport: null, skills: {} };
    for (const r of this.table('athlete_ratings') ?? []) {
      if (r.athlete_id !== athleteId) continue;
      const summary: RatingSummary = {
        rating: Number(r.rating),
        deviation: Number(r.deviation),
        games: Number(r.games),
        peak: Number(r.peak),
      };
      if (r.scope === 'overall') out.overall = summary;
      else if (r.scope === 'sport') out.sport = summary;
      else if (r.scope === 'skill' && typeof r.focus === 'string') out.skills[r.focus] = summary;
    }
    return out;
  }

  /* ── writes (with the real engines) ── */

  /**
   * A completed assessment's rating_deltas map to final skill ratings.
   * Materializes athlete_ratings (overall/sport/skill), athlete_skills and
   * rating_history — the equivalent of process-assessment on the server.
   */
  applyAssessmentResult(athleteId: string, attempt: DbRow): void {
    const skillRatings = attempt.rating_deltas as Record<string, number> | undefined;
    if (!skillRatings || Object.keys(skillRatings).length === 0) return;

    const sport = (this.table('athletes').find((a) => a.id === athleteId)?.sport as string | undefined) ?? 'basketball';
    const before = this.ratingSummary(athleteId);
    const overall = overallRatingFromSkills(
      sport,
      Object.entries(skillRatings).map(([skillCode, rating]) => ({ skillCode, rating })),
    );

    for (const [code, rating] of Object.entries(skillRatings)) {
      const pb = Math.max(before.skills[code]?.peak ?? 0, rating);
      this.upsertRow(this.table('athlete_ratings'), { athlete_id: athleteId, scope: 'skill', focus: code }, {
        rating,
        deviation: 120,
        games: (before.skills[code]?.games ?? 0) + 1,
        peak: pb,
        updated_at: nowIso(),
      });
      this.upsertRow(this.table('athlete_skills'), { athlete_id: athleteId, skill_code: code }, {
        rating,
        deviation: 120,
        mastery: Number(Math.min(1, rating / 2000).toFixed(2)),
        trend: rating - (before.skills[code]?.rating ?? 1000),
        attempts: (before.skills[code]?.games ?? 0) + 1,
        personal_best: pb,
        last_played_at: nowIso(),
      });
    }

    const peak = Math.max(before.overall?.peak ?? 0, overall);
    this.upsertRow(this.table('athlete_ratings'), { athlete_id: athleteId, scope: 'overall' }, {
      rating: overall,
      deviation: 200,
      games: (before.overall?.games ?? 0) + 1,
      peak,
      updated_at: nowIso(),
    });
    this.upsertRow(this.table('athlete_ratings'), { athlete_id: athleteId, scope: 'sport' }, {
      rating: overall,
      deviation: 200,
      games: (before.sport?.games ?? 0) + 1,
      peak: Math.max(before.sport?.peak ?? 0, overall),
      updated_at: nowIso(),
    });

    this.table('rating_history').push({
      id: makeId('rh'),
      athlete_id: athleteId,
      scope: 'overall',
      focus: null,
      event: 'calibration',
      rating_before: before.overall?.rating ?? 1000,
      rating_after: overall,
      delta: overall - (before.overall?.rating ?? 1000),
      occurred_at: nowIso(),
    });
  }

  /**
   * A completed training session moves the rating via the real ELO engine —
   * performance vs. benchmark difficulty, repeat-dampened (anti-farm).
   * `plan` is the original generated plan captured BEFORE the row's plan
   * column was overwritten with the submission payload.
   */
  applySessionResult(athleteId: string, skillCode: string, plan: SessionPlan, results: Record<string, number>): void {
    const before = this.ratingSummary(athleteId);
    const successRate = planSuccessRate(plan, results);
    const difficulty = averageDifficulty(plan);
    const repeatCount = this.countRecentSameSkill(athleteId, skillCode);
    const elo = createEloSystem();

    const skillState = {
      rating: before.skills[skillCode]?.rating ?? 1000,
      deviation: before.skills[skillCode]?.deviation ?? 350,
      games: before.skills[skillCode]?.games ?? 0,
      peak: before.skills[skillCode]?.peak ?? 1000,
      updatedAt: nowIso(),
    };
    const overallState = {
      rating: before.overall?.rating ?? 1000,
      deviation: before.overall?.deviation ?? 350,
      games: before.overall?.games ?? 0,
      peak: before.overall?.peak ?? 1000,
      updatedAt: nowIso(),
    };

    const skillApplied = elo.applySession(skillState, { difficultyRating: difficulty, successRate, repeatCount });
    const overallApplied = elo.applySession(overallState, { difficultyRating: difficulty, successRate, repeatCount });

    this.upsertRow(this.table('athlete_ratings'), { athlete_id: athleteId, scope: 'skill', focus: skillCode }, {
      rating: skillApplied.state.rating,
      deviation: skillApplied.state.deviation,
      games: skillApplied.state.games,
      peak: skillApplied.state.peak,
      updated_at: nowIso(),
    });
    this.upsertRow(this.table('athlete_ratings'), { athlete_id: athleteId, scope: 'overall' }, {
      rating: overallApplied.state.rating,
      deviation: overallApplied.state.deviation,
      games: overallApplied.state.games,
      peak: overallApplied.state.peak,
      updated_at: nowIso(),
    });

    const skillRow = this.table('athlete_skills').find(
      (s) => s.athlete_id === athleteId && s.skill_code === skillCode,
    );
    if (skillRow) {
      skillRow.rating = skillApplied.state.rating;
      skillRow.deviation = skillApplied.state.deviation;
      skillRow.attempts = Number(skillRow.attempts ?? 0) + 1;
      skillRow.personal_best = Math.max(Number(skillRow.personal_best ?? 0), skillApplied.state.rating);
      skillRow.trend = Math.round((skillApplied.delta + Number(skillRow.trend ?? 0)) / 2);
      skillRow.last_played_at = nowIso();
    } else {
      this.table('athlete_skills').push({
        id: makeId('as'),
        athlete_id: athleteId,
        skill_code: skillCode,
        rating: skillApplied.state.rating,
        deviation: skillApplied.state.deviation,
        mastery: Number(Math.min(1, skillApplied.state.rating / 2000).toFixed(2)),
        trend: skillApplied.delta,
        attempts: 1,
        personal_best: skillApplied.state.rating,
        last_played_at: nowIso(),
      });
    }

    this.table('rating_history').push(
      {
        id: makeId('rh'),
        athlete_id: athleteId,
        scope: 'skill',
        focus: skillCode,
        event: 'session',
        rating_before: skillState.rating,
        rating_after: skillApplied.state.rating,
        delta: skillApplied.delta,
        occurred_at: nowIso(),
      },
      {
        id: makeId('rh'),
        athlete_id: athleteId,
        scope: 'overall',
        focus: null,
        event: 'session',
        rating_before: overallState.rating,
        rating_after: overallApplied.state.rating,
        delta: overallApplied.delta,
        occurred_at: nowIso(),
      },
    );

    const userId = this.table('athletes').find((a) => a.id === athleteId)?.user_id as string | undefined;
    if (userId) this.bumpStreak(userId);
  }

  /** Materialized leaderboard row for a scope (like the prod table). */
  materializeLeaderboard(scope: string, sportId: string, focus?: string | null): void {
    const sport = sportId || 'basketball';
    const players = this.table('athletes')
      .filter((a) => a.sport === sport)
      .map((a) => {
        const athleteId = a.id as string;
        const userId = a.user_id as string;
        const profile = this.table('profiles').find((p) => p.id === userId);
        const ratings = this.ratingSummary(athleteId);
        let score = ratings.overall?.rating ?? 1000;
        if (scope === 'skill' && focus && ratings.skills[focus]) score = ratings.skills[focus].rating;
        return {
          athleteId,
          userId,
          displayName: (profile?.full_name as string | undefined) ?? (profile?.username as string | undefined) ?? 'Athlete',
          score,
        };
      })
      .filter((p) => p.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 100);

    this.upsertRow(this.table('leaderboards'), { scope, sport }, {
      data: players.map((p, i) => ({
        rank: i + 1,
        athleteId: p.athleteId,
        displayName: p.displayName,
        sport,
        rating: p.score,
        improvement: 0,
        streak: 0,
        isPeerOfUser: false,
      })),
      period: 'all-time',
      computed_at: nowIso(),
    });
  }

  /* ── internal helpers ── */

  private countRecentSameSkill(athleteId: string, skillCode: string): number {
    const weekAgo = Date.now() - 7 * 86_400_000;
    return this.table('sessions').filter(
      (s) =>
        s.athlete_id === athleteId &&
        s.status === 'completed' &&
        s.focus_skill_code === skillCode &&
        typeof s.completed_at === 'string' &&
        new Date(s.completed_at as string).getTime() > weekAgo,
    ).length;
  }

  private bumpStreak(userId: string): void {
    const today = dateKey(0);
    const yesterday = dateKey(-1);
    const row = this.table('streaks').find((s) => s.user_id === userId);
    if (!row) {
      this.table('streaks').push({ id: makeId('str'), user_id: userId, current: 1, longest: 1, last_active: today });
      return;
    }
    const last = row.last_active as string | undefined;
    if (last === today) return;
    const next = last === yesterday ? (Number(row.current ?? 0) + 1) : 1;
    row.current = next;
    row.longest = Math.max(Number(row.longest ?? 0), next);
    row.last_active = today;
  }

  /** Find a unique row by key columns and overwrite/insert. */
  upsertRow(table: DbRow[], key: Partial<DbRow>, payload: DbRow): void {
    const existing = table.find((row) =>
      Object.entries(key).every(([k, v]) => row[k] === v),
    );
    if (existing) {
      for (const [k, v] of Object.entries(payload)) existing[k] = v;
    } else {
      table.push({ ...payload, ...key });
    }
  }
}
