import { ACHIEVEMENTS, type AchievementContext, type AchievementDefinition } from '@/features/achievements/definitions';

/**
 * Achievement engine — evaluates the catalog against an athlete snapshot.
 * Newly satisfied codes are returned so callers can persist + animate them.
 * Hidden achievements are excluded until the user earns them.
 */

export function evaluateAchievements(
  ctx: AchievementContext,
  earnedCodes: Set<string>,
): { newlyEarned: AchievementDefinition[]; stillLocked: AchievementDefinition[] } {
  const newlyEarned: AchievementDefinition[] = [];
  const stillLocked: AchievementDefinition[] = [];

  for (const achievement of ACHIEVEMENTS) {
    if (earnedCodes.has(achievement.code)) continue;
    if (achievement.check(ctx)) {
      newlyEarned.push(achievement);
    } else {
      stillLocked.push(achievement);
    }
  }
  return { newlyEarned, stillLocked };
}

/** Locked achievements visible to the user (unhiden only). */
export function visibleLockedAchievements(ctx: AchievementContext, earned: Set<string>) {
  return ACHIEVEMENTS.filter((a) => !a.hidden && !earned.has(a.code));
}