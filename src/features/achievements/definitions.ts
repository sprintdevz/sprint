/** Achievement catalog — server rows mirror these codes. */

export interface AchievementDefinition {
  code: string;
  name: string;
  description: string;
  icon: string;
  category: 'assessment' | 'milestone' | 'session' | 'streak' | 'competitive' | 'special';
  xp: number;
  hidden: boolean;
  /** Criterion function — receives a context snapshot. */
  check: (ctx: AchievementContext) => boolean;
}

export interface AchievementContext {
  sessionsCompleted: number;
  assessmentsCompleted: number;
  personalBests: number;
  currentStreak: number;
  longestStreak: number;
  elo: number;
  eloDeltaAllTime: number;
  perfectSessions: number;
  weeklyRankTop10: boolean;
  weeklyRankTop1: boolean;
  skillWorkouts: Record<string, number>;
  fastestSessionSec: number;
}

export const ACHIEVEMENTS: AchievementDefinition[] = [
  {
    code: 'first-assessment', name: 'First Assessment', icon: 'clipboard',
    description: 'Complete your initial assessment and get rated.',
    category: 'assessment', xp: 50, hidden: false,
    check: (c) => c.assessmentsCompleted >= 1,
  },
  {
    code: 'first-progress', name: 'First Personal Best', icon: 'trending-up',
    description: 'Beat a personal best.',
    category: 'milestone', xp: 30, hidden: false,
    check: (c) => c.personalBests >= 1,
  },
  {
    code: 'elo-100', name: 'Rising Star', icon: 'star',
    description: 'Gain +100 ELO since your calibration.',
    category: 'milestone', xp: 40, hidden: false,
    check: (c) => c.eloDeltaAllTime >= 100,
  },
  {
    code: 'elo-250', name: 'Heating Up', icon: 'flame',
    description: 'Gain +250 ELO since your calibration.',
    category: 'milestone', xp: 80, hidden: false,
    check: (c) => c.eloDeltaAllTime >= 250,
  },
  {
    code: 'tier-gold', name: 'Gold Standard', icon: 'medal',
    description: 'Reach GOLD league.',
    category: 'milestone', xp: 60, hidden: false,
    check: (c) => c.elo >= 1100,
  },
  {
    code: 'tier-platinum', name: 'Platinum Pedigree', icon: 'medal',
    description: 'Reach PLATINUM league.',
    category: 'milestone', xp: 100, hidden: false,
    check: (c) => c.elo >= 1400,
  },
  {
    code: 'sessions-10', name: 'Ten Sessions', icon: 'calendar',
    description: 'Complete 10 sessions.',
    category: 'session', xp: 50, hidden: false,
    check: (c) => c.sessionsCompleted >= 10,
  },
  {
    code: 'sessions-25', name: 'Twenty-Five Sessions', icon: 'calendar',
    description: 'Complete 25 sessions.',
    category: 'session', xp: 90, hidden: false,
    check: (c) => c.sessionsCompleted >= 25,
  },
  {
    code: 'sessions-50', name: 'Half Century', icon: 'calendar',
    description: 'Complete 50 sessions.',
    category: 'session', xp: 150, hidden: false,
    check: (c) => c.sessionsCompleted >= 50,
  },
  {
    code: 'sessions-100', name: 'Century Club', icon: 'ribbon',
    description: 'Complete 100 sessions.',
    category: 'session', xp: 300, hidden: true,
    check: (c) => c.sessionsCompleted >= 100,
  },
  {
    code: 'streak-7', name: 'Week Warrior', icon: 'calendar',
    description: 'Train 7 days in a row.',
    category: 'streak', xp: 60, hidden: false,
    check: (c) => c.currentStreak >= 7 || c.longestStreak >= 7,
  },
  {
    code: 'streak-30', name: 'Unstoppable', icon: 'flame',
    description: 'Train 30 days in a row.',
    category: 'streak', xp: 200, hidden: true,
    check: (c) => c.currentStreak >= 30 || c.longestStreak >= 30,
  },
  {
    code: 'comeback', name: 'The Comeback', icon: 'refresh',
    description: 'Recover 40 points after a bad week.',
    category: 'special', xp: 80, hidden: false,
    check: () => false, // computed from history in engine
  },
  {
    code: 'perfect-session', name: 'Flawless', icon: 'checkmark-circle',
    description: 'Complete a session with every challenge passed.',
    category: 'session', xp: 70, hidden: false,
    check: (c) => c.perfectSessions >= 1,
  },
  {
    code: 'weak-hand', name: 'Ambidextrous', icon: 'hand-left',
    description: 'Win a weak-hand challenge 10+ times.',
    category: 'special', xp: 60, hidden: false,
    check: () => false,
  },
  {
    code: 'top-10', name: 'Top 10%', icon: 'podium',
    description: 'Finish a week in the top 10% of your peer group.',
    category: 'competitive', xp: 120, hidden: true,
    check: (c) => c.weeklyRankTop10,
  },
  {
    code: 'top-1', name: 'Top 1%', icon: 'trophy',
    description: 'Finish a week in the top 1% of your peer group.',
    category: 'competitive', xp: 250, hidden: true,
    check: (c) => c.weeklyRankTop1,
  },
];

export const achievementByCode = new Map(ACHIEVEMENTS.map((a) => [a.code, a]));