# SPRINT Database

Supabase PostgreSQL schema — fully in `supabase/migrations/0001_initial_schema.sql`.
Row types in `src/types/database.ts` mirror it (keep in sync).

## Tables by domain

**Users & identity**
- `profiles` (syncs from auth.users via trigger), `user_settings`

**Athlete state**
- `athletes` (sport, position, goals, history)
- `athlete_skills` (per-skill rating/deviation/mastery/trend/PB)
- `athlete_ratings` (scope: overall | sport | skill)
- `rating_history` (every event → graphs, streaks, season math)

**Content / reference**
- `sports`, `skills`, `skill_prerequisites`, `drills`, `assessments`
- `equipment`, `athlete_equipment`, `training_locations`, `training_goals`

**Assessments & sessions**
- `assessment_attempts`, `assessment_results`
- `sessions` (plan jsonb + `plan_token` for duplicate guard), `session_drills`,
  `session_results`

**Competition**
- `seasons`, `season_players`, `challenges`, `challenge_attempts`,
  `leaderboards` (materialized jsonb), `friends`, `friend_requests`

**Progression & comms**
- `achievements`, `athlete_achievements`, `streaks`, `notifications`,
  `subscriptions`, `video_uploads`, `injury_limitations`, `analytics_events`

## Row Level Security summary

- Content tables (`skills`, `drills`, `assessments`, `seasons`, `challenges`,
  `achievements`, `leaderboards`, `training_*`): **SELECT for everyone**,
  write only via service-role edge functions.
- Own-data tables (`athletes`, `athlete_*`, `sessions`, `assessment_*`,
  `streaks`, `notifications`, `subscriptions`, `injury_*`): 
  `auth.uid() = owner` (with subquery joins to `athletes.user_id`).
- `analytics_events`: insert-only, any authenticated user.
- Ratings/achievements are *write-protected from clients* — they mutate via
  edge functions only (see `calculate-elo`, `process-assessment`).

## Seeding

- `supabase/seed.sql` — realistic basketball content: 10 skills, 30 drills,
  3 assessments, 5 seasons, weekly challenges ×5, equipment, goals.
- `supabase/migrations/0002_demo_user.sql` — demo athlete
  (`demo@sprint.dev` / `demo1234`) with a believable rating snapshot.

## Local dev

```bash
npx supabase start      # boots stack
npx supabase db reset   # migrations + seed
```

Functions are declared in `supabase/config.toml` and deployed with
`supabase functions deploy calculate-elo generate-session update-athlete process-assessment`.