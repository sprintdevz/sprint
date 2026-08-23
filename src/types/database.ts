/**
 * Row types for the Supabase PostgreSQL schema (supabase/migrations/0001_schema.sql).
 * Keep in sync with that migration — these are the source of truth for
 * every query the app issues.
 */

export type Json = Record<string, unknown> | unknown[] | string | number | boolean | null;

/* ── Enums (as string unions) ─────────────────────────────────────────────── */

export type RatingScope = 'overall' | 'sport' | 'skill';
export type RatingScopeFocus = 'overall' | string; // sport code or skill code
export type SessionStatus = 'planned' | 'active' | 'completed' | 'abandoned';
export type AttemptStatus = 'in_progress' | 'completed' | 'abandoned';
export type SeasonStatus = 'upcoming' | 'active' | 'completed';
export type FriendStatus = 'pending' | 'accepted' | 'blocked';
export type RequestStatus = 'pending' | 'accepted' | 'declined';
export type PlanName = 'free' | 'pro';
export type SubscriptionStatus = 'active' | 'past_due' | 'canceled' | 'expired';
export type VideoStatus = 'uploading' | 'ready' | 'processing' | 'failed';
export type NotificationType =
  | 'session_reminder'
  | 'streak_alert'
  | 'milestone'
  | 'challenge'
  | 'friend'
  | 'achievement'
  | 'system';

/* ── Users & profiles ─────────────────────────────────────────────────────── */

export interface ProfileRow {
  id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  email: string | null;
  created_at: string;
  updated_at: string;
}

export interface AthleteRow {
  id: string;
  user_id: string;
  sport: string;
  position: string | null;
  height_cm: number | null;
  weight_kg: number | null;
  birth_year: number | null;
  experience_years: number;
  experience_level: string | null;
  goal: string | null;
  training_frequency: number | null;
  created_at: string;
  updated_at: string;
}

export interface UserSettingsRow {
  user_id: string;
  dark_mode: 'system' | 'light' | 'dark';
  reduce_motion: boolean;
  units: 'metric' | 'imperial';
  analytics_opt_in: boolean;
  notifications: Json;
  quiet_hours: Json;
  updated_at: string;
}

/* ── Sports content ───────────────────────────────────────────────────────── */

export interface SkillRow {
  id: string;
  sport: string;
  code: string;
  name: string;
  category: string;
  description: string | null;
  weight: number;
  sort_order: number;
}

export interface SkillPrerequisiteRow {
  skill_id: string;
  requires_skill_id: string;
}

export interface DrillRow {
  id: string;
  sport: string;
  code: string;
  name: string;
  description: string | null;
  category: string;
  skill_code: string;
  intensity: 'easy' | 'medium' | 'high';
  duration_s: number;
  equipment: string[];
  premium: boolean;
}

export interface AssessmentRow {
  id: string;
  sport: string;
  code: string;
  title: string;
  description: string | null;
  difficulty: string;
  minutes: number;
  challenge_count: number;
  is_initial: boolean;
  premium: boolean;
}

/* ── Athlete state ────────────────────────────────────────────────────────── */

export interface AthleteSkillRow {
  athlete_id: string;
  skill_id: string;
  skill_code: string;
  rating: number;
  deviation: number;
  mastery: number; // 0..1
  trend: number; // +/- rating over last 7 days
  attempts: number;
  personal_best: number;
  last_played_at: string | null;
  updated_at: string;
}

export interface AthleteRatingRow {
  id: string;
  athlete_id: string;
  scope: RatingScope;
  focus: string | null; // sport code for 'sport' scope, skill code for 'skill' scope
  rating: number;
  deviation: number;
  games: number;
  provisional: boolean;
  peak: number;
  updated_at: string;
}

export interface RatingHistoryRow {
  id: string;
  athlete_id: string;
  scope: RatingScope;
  focus: string | null;
  rating_before: number;
  rating_after: number;
  delta: number;
  deviation_after: number;
  event_type: 'session' | 'assessment' | 'challenge' | 'calibration';
  session_id: string | null;
  assessment_id: string | null;
  notes: string | null;
  occurred_at: string;
}

/* ── Assessments ──────────────────────────────────────────────────────────── */

export interface AssessmentAttemptRow {
  id: string;
  athlete_id: string;
  assessment_id: string;
  status: AttemptStatus;
  score: number;
  started_at: string;
  completed_at: string | null;
  skill_results: Json;
  rating_deltas: Json;
}

export interface AssessmentResultRow {
  id: string;
  attempt_id: string;
  skill_id: string | null;
  skill_code: string;
  score: number;
  benchmark_text: string;
  rating_delta: number;
  mastery_before: number;
  mastery_after: number;
}

/* ── Sessions ─────────────────────────────────────────────────────────────── */

export interface SessionRow {
  id: string;
  athlete_id: string;
  sport: string;
  focus_skill_code: string;
  focus_reason: string | null;
  status: SessionStatus;
  difficulty: string;
  minutes: number;
  xp: number;
  elo_before: number;
  elo_after: number | null;
  plan: Json;
  started_at: string | null;
  completed_at: string | null;
}

export interface SessionDrillRow {
  id: string;
  session_id: string;
  drill_id: string;
  position: number;
  sets: number;
  reps: number;
  target: Json;
  completed: boolean;
}

export interface SessionRecordRow {
  id: string;
  session_id: string;
  skill_code: string;
  challenge_code: string;
  label: string;
  attempts: number;
  achieved: number;
  target: number;
  result: 'passed' | 'failed' | 'partial';
  xp: number;
  created_at: string;
}

/* ── Competition ──────────────────────────────────────────────────────────── */

export interface SeasonRow {
  id: string;
  sport: string;
  name: string;
  code: string;
  starts_at: string;
  ends_at: string;
  status: SeasonStatus;
  min_rating: number;
  rewards: Json;
}

export interface SeasonPlayerRow {
  season_id: string;
  athlete_id: string;
  start_rating: number;
  peak_rating: number;
  end_rating: number | null;
  improvement: number;
  games: number;
  rank: number | null;
  percentile: number | null;
  created_at: string;
}

export interface ChallengeRow {
  id: string;
  season_id: string | null;
  sport: string;
  title: string;
  description: string | null;
  metric: string;
  target: Json;
  reward_xp: number;
  premium: boolean;
  starts_at: string;
  ends_at: string;
  status: 'upcoming' | 'active' | 'completed';
}

export interface ChallengeAttemptRow {
  id: string;
  challenge_id: string;
  athlete_id: string;
  progress: number;
  best: number;
  completed: boolean;
  completed_at: string | null;
  rewards: Json;
}

export interface LeaderboardRow {
  id: string;
  scope: string; // global | local | age | skill | friends | season
  sport: string | null;
  period: string;
  focus: string | null;
  data: Json;
  computed_at: string;
}

/* ── Progression ──────────────────────────────────────────────────────────── */

export interface AchievementRow {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  xp: number;
  hidden: boolean;
  sort_order: number;
}

export interface AthleteAchievementRow {
  athlete_id: string;
  achievement_id: string;
  unlocked_at: string;
}

export interface StreakRow {
  athlete_id: string;
  current: number;
  longest: number;
  last_active: string; // yyyy-mm-dd
  updated_at: string;
}

/* ── Social ───────────────────────────────────────────────────────────────── */

export interface FriendRow {
  id: string;
  user_a: string;
  user_b: string;
  status: FriendStatus;
  created_at: string;
}

export interface FriendRequestRow {
  id: string;
  sender_id: string;
  recipient_id: string;
  status: RequestStatus;
  created_at: string;
}

/* ── Notifications / subscriptions / media ────────────────────────────────── */

export interface NotificationRow {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string;
  data: Json;
  read_at: string | null;
  scheduled_for: string | null;
  created_at: string;
}

export interface SubscriptionRow {
  id: string;
  user_id: string;
  plan: PlanName;
  status: SubscriptionStatus;
  provider: string;
  provider_id: string | null;
  renews_at: string | null;
  started_at: string;
  canceled_at: string | null;
}

export interface VideoUploadRow {
  id: string;
  athlete_id: string;
  session_id: string | null;
  title: string;
  storage_path: string;
  duration_sec: number | null;
  size: number | null;
  mime: string | null;
  status: VideoStatus;
  thumbnail_path: string | null;
  created_at: string;
}

export interface AnalyticsEventRow {
  id: string;
  user_id: string | null;
  event_name: string;
  properties: Json;
  device: Json;
  occurred_at: string;
}

/* ── Reference tables ─────────────────────────────────────────────────────── */

export interface EquipmentRow {
  id: string;
  sport: string;
  name: string;
  slug: string;
  category: string;
  icon: string;
}

export interface AthleteEquipmentRow {
  athlete_id: string;
  equipment_id: string;
}

export interface TrainingLocationRow {
  id: string;
  sport: string;
  name: string;
  slug: string;
  icon: string;
  indoors: boolean;
}

export interface TrainingGoalRow {
  id: string;
  sport: string;
  code: string;
  name: string;
  description: string;
  metric: string;
}

export interface InjuryLimitationRow {
  id: string;
  athlete_id: string;
  injury: string;
  body_part: string;
  restriction: string;
  severity: 'minor' | 'moderate' | 'major';
  notes: string | null;
  active: boolean;
  created_at: string;
}