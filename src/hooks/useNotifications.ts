import { useState } from 'react';
import { requestPermissions } from '@/services/notifications';
import { scheduleContextual } from '@/features/notifications/scheduler';
import { DEFAULT_NOTIFICATION_PREFERENCES, type NotificationPreferences } from '@/features/notifications/types';

/** Notification preferences + permission helper for the settings screen. */
export function useNotifications() {
  const [prefs, setPrefs] = useState<NotificationPreferences>(DEFAULT_NOTIFICATION_PREFERENCES);
  const [permission, setPermission] = useState<boolean | null>(null);

  const ask = async (): Promise<boolean> => {
    const granted = await requestPermissions();
    setPermission(granted);
    return granted;
  };

  return { prefs, setPrefs, permission, ask, scheduleContextual };
}