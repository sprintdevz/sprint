import {
  cancelScheduled,
  requestPermissions,
  scheduleReminder,
  type ReminderType,
} from '@/services/notifications';
import { render } from '@/features/notifications/templates';
import type { NotificationPreferences } from '@/features/notifications/types';
import { NOTIFICATION_DEFAULTS } from '@/constants/config';

/**
 * Scheduler — decides WHAT to send and WHEN, honoring preferences and
 * quiet hours. Frequency rules keep it contextual (never daily spam).
 */

const MIN_INTERVAL_MS = 6 * 3600_000; // at most ~4 reminders/day

interface ScheduleOptions {
  userId: string;
  prefs?: Partial<NotificationPreferences>;
  lastSentAt?: Record<string, number>;
  quietNow: () => boolean;
}

export function shouldSend(
  category: ReminderType,
  prefs: NotificationPreferences,
  quietNow: boolean,
  lastSentAt?: number,
): boolean {
  if (quietNow) return false;
  const gate: Record<ReminderType, keyof NotificationPreferences> = {
    session_reminder: 'sessionReminders',
    streak_alert: 'streakAlerts',
    milestone: 'milestoneAlerts',
    challenge: 'challengeAlerts',
    friend: 'friendActivity',
  };
  const enabled = prefs[gate[category]];
  if (enabled === false) return false;
  if (lastSentAt && Date.now() - lastSentAt < MIN_INTERVAL_MS) return false;
  return true;
}

/** Schedule a single contextual reminder (resolving quiet hours + prefs). */
export async function scheduleContextual(
  input: {
    id: string;
    category: ReminderType;  data?: Record<string, number | string | null>;
  at: number | Date;
  prefs: NotificationPreferences;
}): Promise<boolean> {
  const { id, category, data, at, prefs } = input;
  const quiet = isQuietHours(at, prefs);
  if (!shouldSend(category, prefs, quiet)) return false;
  const granted = await requestPermissions();
  if (!granted) return false;
  const { title, body } = render(category, data);
  const cleanData: Record<string, string | number> = {};
  for (const [k, v] of Object.entries(data ?? {})) {
    if (v !== null) cleanData[k] = v;
  }
  const identifier = await scheduleReminder({ id, type: category, title, body, at, data: cleanData });
  return identifier !== null;
}

function isQuietHours(at: number | Date, prefs: NotificationPreferences): boolean {
  const d = typeof at === 'number' ? new Date(at) : at;
  const hours = d.getHours();
  const start = prefs.quietHoursStart ?? NOTIFICATION_DEFAULTS.quietHoursStart;
  const end = prefs.quietHoursEnd ?? NOTIFICATION_DEFAULTS.quietHoursEnd;
  if (start <= end) return hours >= start && hours < end;
  return hours >= start || hours < end; // overnight range
}

export { cancelScheduled };