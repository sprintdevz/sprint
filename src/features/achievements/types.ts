export interface EarnedAchievement {
  code: string;
  name: string;
  description: string;
  icon: string;
  xp: number;
  unlockedAt: string;
}

export interface AchievementProgress {
  earned: EarnedAchievement[];
  /** Codes visible but not yet earned. */
  locked: string[];
}