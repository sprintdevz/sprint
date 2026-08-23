# SPRINT — Architecture

SPRINT is an athletic skill progression game: measure abilities → compute a rating
(ELO/Glicko) → identify the biggest weakness → generate personalized sessions →
track improvement. The design answers three questions on every launch:
**Where am I? What is holding me back? What should I do next?**

## Stack

| Layer | Choice |
| --- | --- |
| App | Expo (SDK 57) + React Native + TypeScript (strict) |
| Routing | Expo Router (typed routes) |
| Client state | Zustand |
| Server state | TanStack Query |
| Forms/validation | React Hook Form + Zod (schemas live next to features) |
| Backend | Supabase (PostgreSQL, Auth, Storage, Edge Functions) |
| Animation | Reanimated + Gesture Handler |
| Feel | Expo Haptics, Notifications, SecureStore, Camera |

## Directory conventions

```
app/            routes (expo-router). Thin screens: orchestrate, never compute ratings.
src/
  components/   presentational components, grouped by domain
  features/     one folder per domain: types, api, hooks, engine, validation, store
  sports/       the sport abstraction + per-sport configurations
  services/     infra wrappers (supabase, analytics, haptics, storage…)
  store/        global zustand stores
  hooks/        cross-feature hooks (useAuth, useAthlete, useElo…)
  constants/    design tokens + product config (plans, rating defaults)
  types/        global types mirroring the DB schema
  utils/        pure helpers
supabase/       config, migrations, seed, edge functions
tests/          unit + integration
docs/           this documentation set
```

## Rules enforced by the architecture

1. **No business logic in components.** Screens orchestrate: they call feature
   APIs/hooks and render components. Rating math lives in `features/elo`,
   session generation in `features/training`, sport data in `sports/*`.
2. **No sport-specific code outside `src/sports`.** Features consume the
   `SportConfig` interface. Adding a sport = one folder + one registry entry.
3. **Never trust the client for competitive events.** ELO changes and
   achievement unlocks are re-derived server-side (edge functions) and the
   client can only *display* them.
4. **Every network request renders loading / empty / error / retry.**
   Shared components (`Card`, `Skeleton`, `Leaderboard`, toast) make this cheap.
5. **XP and ELO are different systems.** XP = participation (budget, level).
   ELO = demonstrated ability (Glicko, guarded against farming).

## How a session flows

```
Home "today's focus"
        │ useGenerateSession (features/training)
        ▼
plan → session setup screen → session/challenge (counter + haptics)
        → session/rest → … → session/results → session/rating-change
Server: createSession (plan_token) → submitSession (idempotent)
Ratings: calculate-elo edge function (server recomputes; client previews only)
```

## Error & offline strategy

- Athlete snapshot, ratings, skills, today's session and completed state are
  cached to AsyncStorage (`src/utils/storage.ts`) and hydrated before network.
- Sessions can run with no connection; results sync when connectivity returns.
- `plan_token` on sessions prevents duplicate submissions.
- Every query has `retry`, and every screen has branded loading/error/empty states.

## Security

- Secrets never enter the client (`EXPO_PUBLIC_*` only).
- RLS: users only access their own rows; content tables are read-only to clients.
- Edge functions use the service role key *server-side only* and verify
  ownership (`athlete.user_id === auth.uid()`).