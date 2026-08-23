# SPRINT Rating System (ELO + Glicko)

The rating is the product. Rules:

- **Rating reflects demonstrated ability — never participation.**
- **Uncertainty matters.** New athletes have RD 350; tested athletes RD 30.
- **Sessions are matches vs. benchmarks.** Difficulty rating = the opponent.
  Performance = weighted success rate vs. targets.
- **Anti-farm.** Repeating the same benchmark at the same difficulty shrinks
  the weight (`1 / (1 + 0.3 × repeats)`). Dominating far-below-level content
  yields ~0.
- **Anti-punishment.** One bad day costs less than a normal day gains (`×0.7`).

## Math (pure functions in `src/features/elo`)

- `glicko.ts` — canonical Glicko-1: `g(RD)`, expected score, batch update.
- `engine.ts` — `createEloSystem()` facade with all product rules applied.
- `calculations.ts` — leagues, divisions, trends, consistency.
- `calibration.ts` — raw performance (0..1) → provisional rating
  (`1000 − 400 + 800 × score`, bounded 300..3000).

## Leagues

| League | Range |
| --- | --- |
| ROOKIE | 400–799 |
| BRONZE | 800–1099 |
| GOLD | 1100–1399 |
| PLATINUM | 1400–1699 |
| DIAMOND | 1700–1999 |
| MASTER | 2000–2299 |
| ELITE | 2300+ |

Each league has 5 divisions of 50 (`GOLD III` etc.).

## Server-side enforcement

The `calculate-elo` edge function re-derives every update from raw
performance and never accepts a `delta` from the client. `athlete_ratings`
stores scope (`overall`/`sport`/`skill`), `rating_history` stores every event
for graphs, trends and consistency.

## What moves ELO

| Event | How |
| --- | --- |
| Session | Performance vs benchmark difficulty (~1 game) |
| Assessment | Multi-benchmark batch (+ provisional rating) |
| Friend challenge | Head-to-head result (win/loss/draw) |
| Calibration | First assessment → provisional rating (RD × 0.72) |

## Guardrails proven in tests (`tests/unit/elo`)

- expectation performance ⇒ delta ≈ 0 (no farming)
- beating a harder benchmark ⇒ positive delta
- farming easy content ⇒ near-zero delta
- repeating same benchmark ⇒ smaller delta
- one bad session ⇒ small negative delta