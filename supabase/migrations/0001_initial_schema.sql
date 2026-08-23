-- SPRINT — initial schema
-- Normalized PostgreSQL schema + Row Level Security.
-- All rating/achievement mutations go through edge functions (service role);
-- clients only ever read/write their own rows.

create extension if not exists "pgcrypto";

/* ─────────────────────────── enums ─────────────────────────── */

create type rating_scope      as enum ('overall', 'sport', 'skill');
create type session_status    as enum ('planned', 'active', 'completed', 'abandoned');
create type attempt_status    as enum ('in_progress', 'completed', 'abandoned');
create type season_status     as enum ('upcoming', 'active', 'completed');
create type friend_status     as enum ('pending', 'accepted', 'blocked');
create type request_status    as enum ('pending', 'accepted', 'declined');
create type plan_name         as enum ('free', 'pro');
create type subscription_status as enum ('active', 'past_due', 'canceled', 'expired');
create type video_status      as enum ('uploading', 'ready', 'processing', 'failed');
create type notification_type as enum
  ('session_reminder', 'streak_alert', 'milestone', 'challenge', 'friend', 'achievement', 'system');

/* ────────────────────── users & profiles ────────────────────── */

create table public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  full_name     text,
  username      text unique,
  avatar_url    text,
  email         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table public.user_settings (
  user_id           uuid primary key references auth.users(id) on delete cascade,
  dark_mode         text not null default 'system',
  reduce_motion     boolean not null default false,
  units             text not null default 'metric',
  analytics_opt_in  boolean not null default true,
  notifications     jsonb not null default '{}'::jsonb,
  quiet_hours       jsonb not null default '{}'::jsonb,
  updated_at        timestamptz not null default now()
);

create table public.athletes (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references auth.users(id) on delete cascade unique,
  sport              text not null default 'basketball',
  position           text,
  height_cm          int,
  weight_kg          int,
  birth_year         int,
  experience_years   int not null default 0,
  experience_level   text,
  goal               text,
  training_frequency int,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

/* ─────────────────── reference / content ─────────────────── */

create table public.skills (
  id          uuid primary key default gen_random_uuid(),
  sport       text not null,
  code        text not null,
  name        text not null,
  category    text not null,
  description text,
  weight      numeric(4,3) not null default 0.1,
  sort_order  int not null default 0,
  unique (sport, code)
);

create table public.skill_prerequisites (
  skill_id          uuid not null references public.skills(id) on delete cascade,
  requires_skill_id uuid not null references public.skills(id) on delete cascade,
  primary key (skill_id, requires_skill_id)
);

create table public.drills (
  id            uuid primary key default gen_random_uuid(),
  sport         text not null,
  code          text not null,
  name          text not null,
  description   text,
  category      text not null,
  skill_code    text not null,
  intensity     text not null default 'medium',
  duration_s    int not null,
  equipment     jsonb not null default '[]'::jsonb,
  premium       boolean not null default false,
  difficulty_rating int not null default 1000,
  unique (sport, code)
);

create table public.assessments (
  id              uuid primary key default gen_random_uuid(),
  sport           text not null,
  code            text not null,
  title           text not null,
  description     text,
  difficulty      text not null default 'beginner',
  minutes         int not null default 10,
  challenge_count int not null default 5,
  is_initial      boolean not null default false,
  premium         boolean not null default false,
  unique (sport, code)
);

create table public.sports (
  id          text primary key,
  name        text not null,
  icon        text,
  tagline     text,
  is_active   boolean not null default true
);

/* ─────────────────── athlete state ─────────────────── */

create table public.athlete_skills (
  athlete_id     uuid not null references public.athletes(id) on delete cascade,
  skill_id       uuid not null references public.skills(id) on delete cascade,
  skill_code     text not null,
  rating         int not null default 1000,
  deviation      int not null default 350,
  mastery        numeric(5,4) not null default 0,
  trend          int not null default 0,
  attempts       int not null default 0,
  personal_best  int not null default 0,
  last_played_at timestamptz,
  updated_at     timestamptz not null default now(),
  primary key (athlete_id, skill_id)
);

create table public.athlete_ratings (
  id           uuid primary key default gen_random_uuid(),
  athlete_id   uuid not null references public.athletes(id) on delete cascade,
  scope        rating_scope not null,
  focus        text, -- sport code (scope='sport') or skill code (scope='skill')
  rating       int not null default 1000,
  deviation    int not null default 350,
  games        int not null default 0,
  provisional  boolean not null default true,
  peak         int not null default 1000,
  updated_at   timestamptz not null default now(),
  unique (athlete_id, scope, focus)
);

create table public.rating_history (
  id             uuid primary key default gen_random_uuid(),
  athlete_id     uuid not null references public.athletes(id) on delete cascade,
  scope          rating_scope not null,
  focus          text,
  rating_before  int not null,
  rating_after   int not null,
  delta          int not null,
  deviation_after int not null,
  event_type     text not null default 'session',
  session_id     uuid references public.sessions(id) on delete set null,
  assessment_id  uuid references public.assessment_attempts(id) on delete set null,
  notes          text,
  occurred_at    timestamptz not null default now()
);

create index idx_rating_history_athlete on public.rating_history (athlete_id, occurred_at desc);

/* ─────────────────── assessments ─────────────────── */

create table public.assessment_attempts (
  id             uuid primary key default gen_random_uuid(),
  athlete_id     uuid not null references public.athletes(id) on delete cascade,
  assessment_id  uuid not null references public.assessments(id),
  status         attempt_status not null default 'in_progress',
  score          numeric(5,4) not null default 0,
  started_at     timestamptz not null default now(),
  completed_at   timestamptz,
  skill_results  jsonb not null default '{}'::jsonb,
  rating_deltas  jsonb not null default '{}'::jsonb
);

create table public.assessment_results (
  id             uuid primary key default gen_random_uuid(),
  attempt_id     uuid not null references public.assessment_attempts(id) on delete cascade,
  skill_id       uuid references public.skills(id),
  skill_code     text not null,
  score          numeric(5,4) not null,
  benchmark_text text,
  rating_delta   int not null default 0,
  mastery_before numeric(5,4),
  mastery_after  numeric(5,4)
);

/* ─────────────────── sessions ─────────────────── */

create table public.sessions (
  id               uuid primary key default gen_random_uuid(),
  athlete_id       uuid not null references public.athletes(id) on delete cascade,
  sport            text not null default 'basketball',
  focus_skill_code text not null,
  focus_reason     text,
  status           session_status not null default 'planned',
  difficulty       text not null default 'intermediate',
  minutes          int not null default 25,
  xp               int not null default 0,
  elo_before       int,
  elo_after        int,
  plan             jsonb not null default '{}'::jsonb,
  started_at       timestamptz,
  completed_at     timestamptz,
  plan_token       text unique
);

create index idx_sessions_athlete on public.sessions (athlete_id, created_at desc);

create table public.session_drills (
  id         uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  drill_id   uuid references public.drills(id),
  position   int not null,
  sets       int not null default 1,
  reps       int not null default 1,
  target     jsonb not null default '{}'::jsonb,
  completed  boolean not null default false
);

create table public.session_results (
  id             uuid primary key default gen_random_uuid(),
  session_id     uuid not null references public.sessions(id) on delete cascade,
  skill_code     text not null,
  challenge_code text not null,
  label          text not null,
  attempts       int not null default 0,
  achieved       int not null default 0,
  target         int not null default 0,
  result         text not null default 'partial',
  xp             int not null default 0,
  created_at     timestamptz not null default now()
);

/* ─────────────────── competition ─────────────────── */

create table public.seasons (
  id         uuid primary key default gen_random_uuid(),
  sport      text not null default 'basketball',
  name       text not null,
  code       text not null unique,
  starts_at  timestamptz not null,
  ends_at    timestamptz not null,
  status     season_status not null default 'upcoming',
  min_rating int not null default 400,
  rewards    jsonb not null default '{}'::jsonb
);

create table public.season_players (
  season_id     uuid not null references public.seasons(id) on delete cascade,
  athlete_id    uuid not null references public.athletes(id) on delete cascade,
  start_rating  int not null,
  peak_rating   int not null,
  end_rating    int,
  improvement   int not null default 0,
  games         int not null default 0,
  rank          int,
  percentile    numeric(5,4),
  created_at    timestamptz not null default now(),
  primary key (season_id, athlete_id)
);

create table public.challenges (
  id          uuid primary key default gen_random_uuid(),
  season_id   uuid references public.seasons(id) on delete set null,
  sport       text not null default 'basketball',
  title       text not null,
  description text,
  metric      text not null,
  target      jsonb not null default '{}'::jsonb,
  reward_xp   int not null default 50,
  premium     boolean not null default false,
  starts_at   timestamptz not null,
  ends_at     timestamptz not null,
  status      text not null default 'active'
);

create table public.challenge_attempts (
  id            uuid primary key default gen_random_uuid(),
  challenge_id  uuid not null references public.challenges(id) on delete cascade,
  athlete_id    uuid not null references public.athletes(id) on delete cascade,
  progress      numeric not null default 0,
  best          numeric not null default 0,
  completed     boolean not null default false,
  completed_at  timestamptz,
  rewards       jsonb not null default '{}'::jsonb
);

/* ─────────────────── progression ─────────────────── */

create table public.achievements (
  id          uuid primary key default gen_random_uuid(),
  code        text not null unique,
  name        text not null,
  description text not null,
  icon        text not null default 'trophy',
  category    text not null default 'general',
  xp          int not null default 0,
  hidden      boolean not null default false,
  sort_order  int not null default 0
);

create table public.athlete_achievements (
  athlete_id      uuid not null references public.athletes(id) on delete cascade,
  achievement_id  uuid not null references public.achievements(id) on delete cascade,
  unlocked_at     timestamptz not null default now(),
  primary key (athlete_id, achievement_id)
);

create table public.streaks (
  athlete_id  uuid primary key references public.athletes(id) on delete cascade,
  current     int not null default 0,
  longest     int not null default 0,
  last_active text,
  updated_at  timestamptz not null default now()
);

/* ─────────────────── social ─────────────────── */

create table public.friends (
  id         uuid primary key default gen_random_uuid(),
  user_a     uuid not null references auth.users(id) on delete cascade,
  user_b     uuid not null references auth.users(id) on delete cascade,
  status     friend_status not null default 'pending',
  created_at timestamptz not null default now(),
  check (user_a <> user_b),
  unique (user_a, user_b)
);

create table public.friend_requests (
  id           uuid primary key default gen_random_uuid(),
  sender_id    uuid not null references auth.users(id) on delete cascade,
  recipient_id uuid not null references auth.users(id) on delete cascade,
  status       request_status not null default 'pending',
  created_at   timestamptz not null default now(),
  unique (sender_id, recipient_id)
);

create table public.leaderboards (
  id          uuid primary key default gen_random_uuid(),
  scope       text not null,
  sport       text,
  period      text not null default 'season',
  focus       text,
  data        jsonb not null default '[]'::jsonb,
  computed_at timestamptz not null default now()
);

/* ─────────────────── notifications / billing / media ─────────────────── */

create table public.notifications (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  type          notification_type not null default 'system',
  title         text not null,
  body          text not null,
  data          jsonb not null default '{}'::jsonb,
  read_at       timestamptz,
  scheduled_for timestamptz,
  created_at    timestamptz not null default now()
);

create index idx_notifications_user on public.notifications (user_id, created_at desc);

create table public.subscriptions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  plan        plan_name not null default 'free',
  status      subscription_status not null default 'active',
  provider    text not null default 'none',
  provider_id text,
  renews_at   timestamptz,
  started_at  timestamptz not null default now(),
  canceled_at timestamptz
);

create table public.video_uploads (
  id             uuid primary key default gen_random_uuid(),
  athlete_id     uuid not null references public.athletes(id) on delete cascade,
  session_id     uuid references public.sessions(id) on delete set null,
  title          text not null default 'Form video',
  storage_path   text not null,
  duration_sec   int,
  size           bigint,
  mime           text,
  status         video_status not null default 'uploading',
  thumbnail_path text,
  created_at     timestamptz not null default now()
);

create table public.injury_limitations (
  id          uuid primary key default gen_random_uuid(),
  athlete_id  uuid not null references public.athletes(id) on delete cascade,
  injury      text not null,
  body_part   text not null,
  restriction text,
  severity    text not null default 'minor',
  notes       text,
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);

create table public.analytics_events (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete set null,
  event_name  text not null,
  properties  jsonb not null default '{}'::jsonb,
  device      jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now()
);

create index idx_analytics_events_name on public.analytics_events (event_name, occurred_at desc);

/* ─────────────────── reference: equipment / locations ─────────────────── */

create table public.equipment (
  id       uuid primary key default gen_random_uuid(),
  sport    text not null,
  name     text not null,
  slug     text not null,
  category text not null default 'gear',
  icon     text not null default 'basketball',
  unique (sport, slug)
);

create table public.athlete_equipment (
  athlete_id   uuid not null references public.athletes(id) on delete cascade,
  equipment_id uuid not null references public.equipment(id) on delete cascade,
  primary key (athlete_id, equipment_id)
);

alter table public.athlete_equipment enable row level security;
create policy "own equipment" on public.athlete_equipment
  for all using (auth.uid() = (select user_id from public.athletes where id = athlete_id));

create table public.training_locations (
  id      uuid primary key default gen_random_uuid(),
  sport   text not null,
  name    text not null,
  slug    text not null unique,
  icon    text not null default 'location',
  indoors boolean not null default false
);

create table public.training_goals (
  id          uuid primary key default gen_random_uuid(),
  sport       text not null,
  code        text not null,
  name        text not null,
  description text,
  metric      text not null default 'improvement',
  unique (sport, code)
);

create policy "content readable" on public.training_locations for select using (true);
create policy "content readable" on public.training_goals      for select using (true);

/* ─────────────────── RLS policies ─────────────────── */

alter table public.profiles            enable row level security;
alter table public.athletes            enable row level security;
alter table public.athlete_skills      enable row level security;
alter table public.athlete_ratings     enable row level security;
alter table public.rating_history      enable row level security;
alter table public.assessment_attempts enable row level security;
alter table public.assessment_results  enable row level security;
alter table public.sessions            enable row level security;
alter table public.session_drills      enable row level security;
alter table public.session_results     enable row level security;
alter table public.seasons             enable row level security;
alter table public.season_players      enable row level security;
alter table public.challenges          enable row level security;
alter table public.challenge_attempts  enable row level security;
alter table public.achievements        enable row level security;
alter table public.athlete_achievements enable row level security;
alter table public.streaks             enable row level security;
alter table public.friends             enable row level security;
alter table public.friend_requests     enable row level security;
alter table public.leaderboards        enable row level security;
alter table public.notifications       enable row level security;
alter table public.subscriptions       enable row level security;
alter table public.video_uploads       enable row level security;
alter table public.injury_limitations  enable row level security;
alter table public.analytics_events    enable row level security;
alter table public.skills              enable row level security;
alter table public.skill_prerequisites enable row level security;
alter table public.drills              enable row level security;
alter table public.assessments         enable row level security;
alter table public.equipment           enable row level security;

-- Content tables: readable by everyone, writable by no one (service role only).
create policy "content readable" on public.skills              for select using (true);
create policy "content readable" on public.skill_prerequisites for select using (true);
create policy "content readable" on public.drills              for select using (true);
create policy "content readable" on public.assessments         for select using (true);
create policy "content readable" on public.equipment           for select using (true);
create policy "content readable" on public.seasons             for select using (true);
create policy "content readable" on public.challenges          for select using (true);
create policy "content readable" on public.achievements        for select using (true);
create policy "content readable" on public.leaderboards        for select using (true);

-- Own data: the classic "auth.uid() = owner" pattern.
create policy "own profile"       on public.profiles             for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "own athlete"       on public.athletes            for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own skills"        on public.athlete_skills      for all using (auth.uid() = (select user_id from public.athletes where id = athlete_id));
create policy "own ratings"       on public.athlete_ratings     for all using (auth.uid() = (select user_id from public.athletes where id = athlete_id));
create policy "own rating hist"   on public.rating_history      for select using (auth.uid() = (select user_id from public.athletes where id = athlete_id));
create policy "own attempts"      on public.assessment_attempts for all using (auth.uid() = (select user_id from public.athletes where id = athlete_id));
create policy "own results"       on public.assessment_results  for select using (auth.uid() = (select user_id from public.athletes where id = (select athlete_id from public.assessment_attempts where id = attempt_id)));
create policy "own sessions"      on public.sessions            for all using (auth.uid() = (select user_id from public.athletes where id = athlete_id));
create policy "own session drills" on public.session_drills     for all using (auth.uid() = (select user_id from public.athletes where id = (select athlete_id from public.sessions where id = session_id)));
create policy "own session results" on public.session_results   for select using (auth.uid() = (select user_id from public.athletes where id = (select athlete_id from public.sessions where id = session_id)));
create policy "own season rows"   on public.season_players      for select using (auth.uid() = (select user_id from public.athletes where id = athlete_id));
create policy "own challenge"     on public.challenge_attempts  for all using (auth.uid() = (select user_id from public.athletes where id = athlete_id));
create policy "own achievements"  on public.athlete_achievements for select using (auth.uid() = (select user_id from public.athletes where id = athlete_id));
create policy "own streak"        on public.streaks             for select using (auth.uid() = (select user_id from public.athletes where id = athlete_id));
create policy "own friends"       on public.friends for select using (auth.uid() = user_a or auth.uid() = user_b);
create policy "own friend reqs"   on public.friend_requests     for all using (auth.uid() = sender_id or auth.uid() = recipient_id);
create policy "own notifications" on public.notifications       for all using (auth.uid() = user_id);
create policy "own subscription"  on public.subscriptions       for select using (auth.uid() = user_id);
create policy "own videos"        on public.video_uploads       for all using (auth.uid() = (select user_id from public.athletes where id = athlete_id));
create policy "own injuries"      on public.injury_limitations  for all using (auth.uid() = (select user_id from public.athletes where id = athlete_id));
create policy "own settings"      on public.user_settings       for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "own analytics"     on public.analytics_events    for insert with check (true);

-- Trigger: keep profiles in sync with auth.users.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Trigger: updated_at maintenance.
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger touch_profiles  before update on public.profiles       for each row execute function public.touch_updated_at();
create trigger touch_athletes  before update on public.athletes       for each row execute function public.touch_updated_at();
create trigger touch_athlete_skills before update on public.athlete_skills for each row execute function public.touch_updated_at();
create trigger touch_settings   before update on public.user_settings for each row execute function public.touch_updated_at();