import type { SportConfig, SportId } from '@/sports/types';
import { basketballConfig } from '@/sports/basketball';
import { soccerConfig } from '@/sports/soccer';
import { tennisConfig } from '@/sports/tennis';
import { DEFAULT_SPORT } from '@/constants/config';

/**
 * Sport registry — the only place sports are registered.
 * Adding a new sport = create src/sports/<sport>/ + one line here.
 * No feature code ever imports a sport directly; it calls `getSport()`.
 */

const REGISTRY: Record<string, SportConfig> = {
  basketball: basketballConfig,
  soccer: soccerConfig,
  tennis: tennisConfig,
};

const ALL: SportConfig[] = [basketballConfig, soccerConfig, tennisConfig];

export function getSport(id: string | null | undefined): SportConfig {
  const key = id ?? DEFAULT_SPORT;
  const config = REGISTRY[key];
  if (!config) {
    throw new Error(`Unknown sport: ${key}. Registered sports: ${Object.keys(REGISTRY).join(', ')}`);
  }
  return config;
}

export function hasSport(id: string): boolean {
  return id in REGISTRY;
}

export function listSports(): SportConfig[] {
  return ALL;
}

export function sportIds(): SportId[] {
  return ALL.map((s) => s.meta.id);
}

/** Resolve a skill definition inside a sport config. Throws if unknown. */
export function getSkill(sportId: string, skillCode: string) {
  const sport = getSport(sportId);
  const skill = sport.skills.find((s) => s.code === skillCode);
  if (!skill) {
    throw new Error(`Unknown skill "${skillCode}" in sport "${sportId}"`);
  }
  return skill;
}

/** List skill codes in priority order (weight desc, prerequisites satisfied by weight order). */
export function skillOrder(sportId: string): string[] {
  const sport = getSport(sportId);
  return [...sport.skills].sort((a, b) => b.weight - a.weight).map((s) => s.code);
}

export function getDrill(sportId: string, drillCode: string) {
  const sport = getSport(sportId);
  const drill = sport.drills.find((d) => d.code === drillCode);
  if (!drill) {
    throw new Error(`Unknown drill "${drillCode}" in sport "${sportId}"`);
  }
  return drill;
}

/** All drill codes for a skill. */
export function drillsForSkill(sportId: string, skillCode: string) {
  const sport = getSport(sportId);
  return sport.drills.filter((d) => d.skillCode === skillCode);
}

/** Assessments for a sport (optional filter: initial only). */
export function assessmentsFor(sportId: string, initialOnly = false) {
  const sport = getSport(sportId);
  return initialOnly ? sport.assessments.filter((a) => a.isInitial) : sport.assessments;
}

export * from '@/sports/types';