import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

/**
 * Local notification service — contextual, never spammy.
 * Server-side reminders can be scheduled via Supabase edge functions
 * (src/features/notifications/scheduler.ts + supabase/functions/notify-users).
 */

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export type ReminderType =
  | 'session_reminder'
  | 'streak_alert'
  | 'milestone'
  | 'challenge'
  | 'friend';

export async function requestPermissions(): Promise<boolean> {
  try {
    const current = await Notifications.getPermissionsAsync();
    if (current.granted) return true;
    const requested = await Notifications.requestPermissionsAsync();
    return requested.granted;
  } catch {
    return false;
  }
}

export async function scheduleReminder(params: {
  id: string;
  type: ReminderType;
  title: string;
  body: string;
  /** Milliseconds from now (or a Date). */
  at: number | Date;
  data?: Record<string, string | number>;
}): Promise<string | null> {
  try {
    const triggerMs = typeof params.at === 'number' ? params.at : params.at.getTime();
    if (triggerMs <= Date.now() + 15_000) return null;

    const trigger: Notifications.TimeIntervalTriggerInput = {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: Math.round((triggerMs - Date.now()) / 1000),
    };

    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: params.title,
        body: params.body,
        data: { id: params.id, type: params.type, ...params.data },
        sound: Platform.OS === 'ios' ? 'default' : undefined,
      },
      trigger,
    });
    return identifier;
  } catch {
    return null;
  }
}

/** Cancel by app-generated id (callers keep the `id` they passed in). */
export async function cancelScheduled(ids: string[]): Promise<void> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  for (const n of scheduled) {
    const data = n.content.data as Record<string, unknown> | undefined;
    if (data && typeof data.id === 'string' && ids.includes(data.id)) {
      await Notifications.cancelScheduledNotificationAsync(n.identifier);
    }
  }
}

export async function clearAllNotifications(): Promise<void> {
  try {
    await Notifications.dismissAllNotificationsAsync();
  } catch {
    // noop
  }
}

export { Notifications as ExpoNotifications };