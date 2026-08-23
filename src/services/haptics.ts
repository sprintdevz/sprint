import * as Haptics from 'expo-haptics';

/**
 * Haptics service.
 * Every tactile interaction is intentional: light taps for counters,
 * success pulses for completions, warning for errors.
 * Respects the "reduce motion" accessibility setting (no haptics).
 */

let muted = false;

export function setHapticsMuted(value: boolean): void {
  muted = value;
}

export function isHapticsMuted(): boolean {
  return muted;
}

export async function tap(): Promise<void> {
  if (muted) return;
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch {
    // noop
  }
}

export async function press(): Promise<void> {
  if (muted) return;
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  } catch {
    // noop
  }
}

export async function success(): Promise<void> {
  if (muted) return;
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  } catch {
    // noop
  }
}

export async function warning(): Promise<void> {
  if (muted) return;
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  } catch {
    // noop
  }
}

export async function error(): Promise<void> {
  if (muted) return;
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  } catch {
    // noop
  }
}

/** Countdown vibe — pulse as 3,2,1 approaches. */
export async function countdown(): Promise<void> {
  if (muted) return;
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
  } catch {
    // noop
  }
}