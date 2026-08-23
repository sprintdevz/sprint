import type { Ionicons } from '@expo/vector-icons';

/** Icon names available from the bundled Ionicons set. */
export type IconName = keyof typeof Ionicons.glyphMap;

/** Async UI state machine — every network request maps to one of these. */
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

/** Perceived difficulty of drills / assessments / sessions. */
export type Difficulty = 'beginner' | 'intermediate' | 'advanced' | 'elite';

/** Physical intensity of a drill. */
export type Intensity = 'easy' | 'medium' | 'high';

export type SkillCategory =
  | 'shooting'
  | 'ball-handling'
  | 'finishing'
  | 'passing'
  | 'defense'
  | 'athleticism'
  | 'mentality';

/** A generic result envelope for local data operations. */
export interface Result<T> {
  ok: boolean;
  data?: T;
  error?: string;
}

/** Milliseconds epoch or ISO string helper type. */
export type Timestamp = string | number | Date;