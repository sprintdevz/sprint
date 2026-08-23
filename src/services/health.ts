/**
 * Health integration (optional).
 * SPRINT is training-first, but heart-rate/blood-oxygen context can improve
 * recovery-aware session generation. The provider is swappable — we currently
 * expose a stub that reports "not granted" without adding native permissions.
 */

export interface HealthSummary {
  available: boolean;
  granted: boolean;
  /** Average resting heart rate (bpm), when available. */
  restingHeartRate: number | null;
  /** Recent VO2max estimate, when available. */
  vo2Max: number | null;
  /** Minutes of activity today. */
  activeMinutesToday: number | null;
}

export async function getHealthSummary(): Promise<HealthSummary> {
  return {
    available: false,
    granted: false,
    restingHeartRate: null,
    vo2Max: null,
    activeMinutesToday: null,
  };
}

export async function requestHealthPermissions(): Promise<boolean> {
  return false;
}

export async function startWorkout(
  type: 'running' | 'training' | 'other',
): Promise<void> {
  void type;
  // Not implemented without the native module.
}

export async function endWorkout(): Promise<void> {
  // Not implemented without the native module.
}