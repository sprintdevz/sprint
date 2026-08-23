import { clamp, standardDeviation } from '@/utils/numbers';
import { romanNumerals } from '@/utils/formatting';

/**
 * League / division mapping (pure rating → tier).
 *
 * Leagues span 300 rating points with 5 divisions of 50:
 *   BRONZE 800–1099 · GOLD 1100–1399 · PLATINUM 1400–1699 · DIAMOND 1700–1999
 *   MASTER 2000–2299 · ELITE 2300+
 * Initial rating (1000) lands in BRONZE I.
 */

export interface League {
  code: string;
  name: string;
  minRating: number;
  /** Division floors, oldest (V) → newest (I). */
  divisions: readonly [number, number, number, number, number];
  color: string;
}

export const LEAGUES: readonly League[] = [
  { code: 'rookie', name: 'ROOKIE', minRating: 400, divisions: [400, 480, 560, 640, 720], color: '#8B99B8' },
  { code: 'bronze', name: 'BRONZE', minRating: 800, divisions: [800, 850, 900, 950, 1000], color: '#B07A4F' },
  { code: 'gold', name: 'GOLD', minRating: 1100, divisions: [1100, 1150, 1200, 1250, 1300], color: '#E5A000' },
  { code: 'platinum', name: 'PLATINUM', minRating: 1400, divisions: [1400, 1450, 1500, 1550, 1600], color: '#4FB8B0' },
  { code: 'diamond', name: 'DIAMOND', minRating: 1700, divisions: [1700, 1750, 1800, 1850, 1900], color: '#5B8CFF' },
  { code: 'master', name: 'MASTER', minRating: 2000, divisions: [2000, 2050, 2100, 2150, 2200], color: '#B06BFF' },
  { code: 'elite', name: 'ELITE', minRating: 2300, divisions: [2300, 2350, 2400, 2450, 2500], color: '#FF4D5E' },
] as const;

export interface LeagueInfo {
  league: League;
  /** 1 (highest) .. 5 (lowest) division number. */
  division: number;
  /** Display label: "GOLD III". */
  label: string;
  /** Floor of the current division. */
  divisionFloor: number;
  /** Floor of the next division (or next league). */
  nextFloor: number;
}

const ROOKIE = LEAGUES[0]!;

export function leagueInfo(rating: number): LeagueInfo {
  const league = [...LEAGUES].reverse().find((l) => rating >= l.minRating) ?? ROOKIE;
  let division = 5;
  let floor = league.divisions[0]!;
  for (let i = 0; i < league.divisions.length; i++) {
    if (rating >= league.divisions[i]!) {
      division = 5 - i;
      floor = league.divisions[i]!;
    }
  }
  const nextLeague = LEAGUES.find((l) => l.minRating > league.minRating);
  const nextFloor =
    division > 1 ? floor + 50 : (nextLeague?.minRating ?? league.minRating + 50);

  return {
    league,
    division,
    label: `${league.name} ${romanNumerals(division)}`,
    divisionFloor: floor,
    nextFloor,
  };
}

/** Rating required to reach the next division/league. */
export function nextMilestone(rating: number): number {
  const info = leagueInfo(rating);
  return Math.max(info.nextFloor, info.divisionFloor + 1);
}

export function leagueProgress(rating: number, next: number): number {
  const info = leagueInfo(rating);
  const span = Math.max(1, next - info.divisionFloor);
  return clamp((rating - info.divisionFloor) / span, 0, 1);
}

/** Trend of recent rating events (last - first over the window). */
export function ratingTrend(history: number[], windowSize = 7): number {
  if (history.length === 0) return 0;
  const slice = history.slice(-windowSize);
  return slice[slice.length - 1]! - slice[0]!;
}

/** Historical consistency 0..1 — low variance in recent deltas = consistent. */
export function consistencyScore(deltas: number[]): number {
  if (deltas.length < 2) return 0.5;
  const recent = deltas.slice(-10);
  const sd = standardDeviation(recent);
  if (!Number.isFinite(sd)) return 0.5;
  return clamp(1 - sd / 60, 0, 1);
}

/** Whether a rating still needs more evidence (provisional period). */
export function isProvisional(games: number, provisionalGames: number): boolean {
  return games < provisionalGames;
}