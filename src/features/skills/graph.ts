import { getSport } from '@/sports';
import type { SkillGraphEdge } from '@/features/skills/types';

/** Directed prerequisite edges: skill → skills it unlocks. */
export function skillGraphEdges(sportId: string): SkillGraphEdge[] {
  const sport = getSport(sportId);
  const edges: SkillGraphEdge[] = [];
  for (const skill of sport.skills) {
    for (const prereq of skill.prerequisites) {
      edges.push({ from: prereq, to: skill.code });
    }
  }
  return edges;
}

/** Skill codes whose prerequisites are all met (trainable now). */
export function unlockedSkills(
  sportId: string,
  ratings: Record<string, number>,
  minimumPrereqRating = 950,
): string[] {
  const sport = getSport(sportId);
  return sport.skills
    .filter((s) =>
      s.prerequisites.every((p) => (ratings[p] ?? 0) >= minimumPrereqRating),
    )
    .map((s) => s.code);
}

/** Direct prerequisites of a skill. */
export function prerequisitesOf(sportId: string, skillCode: string): string[] {
  const sport = getSport(sportId);
  return sport.skills.find((s) => s.code === skillCode)?.prerequisites ?? [];
}

/** Skills that depend on this one (downstream). */
export function dependantsOf(sportId: string, skillCode: string): string[] {
  return skillGraphEdges(sportId)
    .filter((e) => e.from === skillCode)
    .map((e) => e.to);
}