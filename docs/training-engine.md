# SPRINT Training Engine

The engine's job: **highest expected improvement per minute**, personalized
to the athlete. It never outputs random workouts.

## Inputs → Output

```
athlete profile, sport, position, goal,
skill ratings, weak skills, recent sessions,
available time, equipment, location, frequency,
recent performance, injuries, difficulty
        │
        ▼
   selectFocus (optimizer)        generateSession (generator)
        │                              │
        ▼                              ▼
 focus skill + reasons        SessionPlan: blocks, targets, difficulty,
                              plan token (duplicate guard)
```

## Optimizer (`src/features/training/optimizer.ts`)

Scores every skill by:

```
score = gap × weight × 2.5
      × freshness(1/(1+0.4×recent))   // trained this week? dampen
      × prerequisites ok?              // locked skills weighted down
      × equipment fit
```

The winning skill becomes the session's *focus*. The product brief example
("Decision Making is the biggest weakness") passes as a unit test.

## Generator (`src/features/training/generator.ts`)

Deterministic per seed. Builds a progression-shaped session:

1. **Core challenge** — the focus skill at ~rating+80 difficulty; target
   derived from a pass-rate curve (rookies ~60%, elite ~90%).
2. **Reinforcing drill** — equipment-aware, from the sport drill library.
3. **Harder read** — same skill, +60 difficulty, higher bar.

Session minutes clamp to the sport's `minSessionMinutes..maxSessionMinutes`,
rounded to 5-minute blocks.

## Rating impact

The generator previews ELO change through `estimateEloDelta` (same engine as
the server), so the "~+N ELO" on a session card is honest. The server
recomputes the authoritative delta in `calculate-elo`.

## XP vs ELO

`features/training/calculations.ts`:

- **XP** — participation currency: per-block rewards, perfect-session bonus.
  Used for levels, achievements, challenges.
- **ELO** — ability currency: Glicko vs. benchmark difficulty. Never earned
  for completing; earned for performing.

## Anti-duplicate

`SessionPlan.planToken` (unique per generation) is checked server-side;
submitting twice returns the same result — no double dip.