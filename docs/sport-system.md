# SPRINT Sport System

The sport abstraction is the most important architecture decision:
**no sport-specific code lives outside `src/sports/`.** Every feature consumes
the `SportConfig` interface, so adding soccer or tennis in the future is one
folder + one registry entry + seed rows — no app rewrite.

## The contract (`src/sports/types.ts`)

```ts
interface SportConfig {
  meta: SportMeta;                       // name, icon, positions, locations
  skills: SportSkill[];                  // graph with weights + prerequisites
  skillWeights: Record<string, number>;  // importance for overall rating
  assessments: SportAssessment[];        // challenge lists w/ scoring fns
  drills: SportDrill[];                  // difficulty rating per drill
  benchmarks: BenchLevel[];              // rating bands + mastery curves
  progression: Record<string, stages>;   // mastery stage bands
  rating: Partial<EloEngineConfig>;      // rating tweaks per sport
  training: TrainingRules;               // session shapes, core skills
}
```

## Skills

Each skill carries:
- `weight` (sums to ~1 per sport) — used in `overallRatingFromSkills`
- `prerequisites` — drives the skill tree and trainability gating
- `category`, `icon`, `description`

## Benchmarks

`BenchLevel` maps each skill to rating bands ("Rookie…Elite") and a mastery
curve (rating → 0..1). Basketball uses an S-curve centered around 1150.

## Adding a sport (skeleton: soccer, tennis already exist)

1. `src/sports/<sport>/config.ts` — meta
2. `.../skills.ts` — skills + weights
3. `.../assessments.ts` — initial + hurdle assessments (challenges have
   `performanceOf`, `difficultyRating`, `attempts`)
4. `.../drills.ts` — drills carrying `difficultyRating` (the benchmark)
5. `.../benchmarks.ts`, `.../progression.ts`
6. `.../index.ts` — assemble `SportConfig`
7. Register in `src/sports/index.ts`

The seed (`supabase/seed.sql`) must mirror the same sports/skills/drills rows.

## What's fully implemented

- **Basketball** — 10 skills, 30 drills, 3 assessments, realistic benchmarks,
  5 seeded seasons. The reference sport.

## Can't do

- Never `import` a sport directly in features — always `getSport(id)`.
- Never hardcode "shooting" outside a sport folder. `getSkill`, `drillsForSkill`
  and `unlockedSkills` exist for exactly this.