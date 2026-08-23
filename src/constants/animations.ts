/**
 * Animation language.
 *
 * SPRINT animations are fast, springy, and purposeful — they reinforce
 * progression (reps counting, ELO rising, powers-up). All motion respects
 * the user's "reduce motion" accessibility setting via src/hooks/useReducedMotion.
 */

export const durations = {
  /** 120ms — micro-interactions (press states) */
  fast: 120,
  /** 180ms — small transitions */
  quick: 180,
  /** 260ms — standard transitions, card entrances */
  normal: 260,
  /** 420ms — celebratory reveals */
  slow: 420,
  /** 600ms — confetti / victory */
  celebration: 600,
} as const;

export const springs = {
  /** Snappy UI response */
  snappy: {
    damping: 18,
    stiffness: 220,
    mass: 0.8,
  },
  /** Bouncy, playful — mascot, rewards */
  playful: {
    damping: 12,
    stiffness: 160,
    mass: 0.9,
  },
  /** Large confirmations — XP flyout, ELO change */
  heroic: {
    damping: 10,
    stiffness: 140,
    mass: 1,
  },
} as const;

/** Convenience map: reuse tokens from any animation. */
export const easing = {
  standard: 'cubic-bezier(0.2, 0.8, 0.4, 1)',
  in: 'cubic-bezier(0.4, 0, 1, 1)',
  out: 'cubic-bezier(0, 0, 0.2, 1)',
} as const;

export const animationPresets = {
  enter: { duration: durations.normal },
  exit: { duration: durations.quick },
} as const;