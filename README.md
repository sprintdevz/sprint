# SPRINT 🏃⚡

**Athletic skill progression, gamified.**

SPRINT measures your abilities as an athlete, computes a real **ELO-style
rating** (Glicko-1), finds your **biggest weakness**, generates
**personalized training sessions**, and turns improvement into a game —
complete with a cheetah mascot named Cheetah, leagues, streaks, seasons,
achievements and leaderboards.

> Three questions, answered on every launch:
> **Where am I? · What is holding me back? · What should I do next?**

<img src="docs/assets/hero.png" width="120" alt="SPRINT mascot" />

## Stack

- **Expo SDK 57 + React Native + TypeScript** (strict, no `any`)
- **Expo Router** · **Zustand** · **TanStack Query**
- **Supabase** — PostgreSQL, Auth, Storage, Edge Functions
- **Reanimated** · **Gesture Handler** · **Expo Haptics/Notifications/Camera/SecureStore**
- **React Hook Form + Zod** for forms, **react-native-svg** for the mascot
- Jest (jest-expo) for tests

## Quick start

```bash
npm install
# 1. Configure Supabase (see .env.example)
cp .env.example .env
#    EXPO_PUBLIC_SUPABASE_URL=…
#    EXPO_PUBLIC_SUPABASE_ANON_KEY=…
npm start
```

### Local Supabase

```bash
npx supabase start
npx supabase db reset        # schema + seed + demo athlete (demo@sprint.dev / demo1234)
npx supabase functions deploy calculate-elo generate-session update-athlete process-assessment
```

> **No Supabase needed for the demo.** With an empty `.env` the app runs in
> **demo mode**: a localStorage-backed demo backend stands in for Supabase,
> so the whole product — sign-in, onboarding, assessment, ELO, sessions,
> leaderboards — is playable with zero setup.

## 🌐 Play it now (web)

**https://sprintdevz.github.io/sprint/** — the live web build, deployed to
GitHub Pages. Hit **TRY THE DEMO INSTANTLY** on the welcome screen to jump
in as a seeded athlete (Alex Rivera · ELO 1247 · GOLD — with a 7-day streak
and a real weakness analysis), or sign in with any email to run the full
onboarding → assessment → ELO reveal loop.

Everything is computed by the same engines used in production; only where
rows live changes (your browser, via localStorage).

### Rebuilding the web demo

```bash
npx expo export --platform web --output-dir dist-web
node scripts/fix-gh-pages-paths.mjs   # makes asset URLs relative for the /sprint/ subpath
rm -rf /tmp/gh && mkdir -p /tmp/gh && cp -r dist-web/. /tmp/gh && touch /tmp/gh/.nojekyll
cd /tmp/gh && git init -q -b gh-pages && git add -A && git commit -qm deploy \
  && git remote add origin https://github.com/sprintdevz/sprint.git \
  && git push -f -q origin gh-pages
```

> Note: deep-link reloads on the subpath aren't served by GitHub Pages;
> click **“TRY THE DEMO”** at the root URL and navigate in-app — the SPA
> handles all routes client-side. For a root-domain deploy (Vercel/Netlify)
> the export works without path rewriting.

## Scripts

```bash
npm run start         # dev server
npm run android       # Android emulator
npm run ios           # iOS simulator (macOS)
npm run typecheck     # tsc --noEmit
npm test              # jest (unit + integration)
npm run lint          # eslint
npm run supabase:start
npm run supabase:db:reset
```

## Project map

```
app/            routes (auth · onboarding · tabs · session · assessment · compete …)
src/features/   per-domain: auth, onboarding, athlete, assessment, training, elo,
                skills, competition, achievements, notifications, subscription
src/sports/     sport abstraction + basketball (full), soccer/tennis (skeleton)
src/components/ ui · athlete · training · competition · progression · mascot (SVG cheetah)
supabase/       migrations · seed.sql · edge functions
tests/          unit + integration (elo, assessment, training, progression)
docs/           architecture · elo-system · sport-system · training-engine · database
```

## Product pillars

| Pillar | Implementation |
| --- | --- |
| ELO | Glicko-1 + uncertainty, benchmark matches, anti-farm/anti-punishment (`src/features/elo`) |
| Weakness engine | `analyzeWeakness` — gap × skill-weight (`features/athlete/calculations`) |
| Personal sessions | `selectFocus` + `generateSession` — highest improvement/min (`features/training`) |
| Sports | generic `SportConfig` — add soccer/tennis without touching the app (`src/sports`) |
| Competition | leagues, seasons, weekly challenges, global/friends/local boards |
| Monetization | Free/Pro from config (`constants/config.ts`), paywall screen |
| Offline | AsyncStorage snapshots, idempotent session submission (plan_token) |
| Security | RLS everywhere, server-side rating + achievement validation |

## Screens (routes)

Welcome · Sign in/up · Onboarding (sport → profile → experience → goals →
training → equipment → assessment → ELO reveal → first session) · Home
dashboard · Train · Progress skill tree · Compete (leaderboards, seasons,
challenges, friends) · Profile/stats/achievements · Session runner
(challenge/rest/results/rating-change) · Skills (detail/drills/history) ·
Settings (notifications/privacy/subscription/account).

## Roadmap highlights

- StoreKit / Play Billing integration behind `subscription/api.ts`
- PostHog/Amplitude behind `services/analytics.ts` (console today)
- Apple Health / Google Fit behind `services/health.ts`
- Video upload (Pro) wired to `services/storage.ts` + `video_uploads`
- EAS builds via `eas.json` (dev/preview/production channels)

---

Built with ❤️ for athletes who want to watch a number go up.