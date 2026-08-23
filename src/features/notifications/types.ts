export type NotificationCategory =
  | 'session_reminder'
  | 'streak_alert'
  | 'milestone'
  | 'challenge'
  | 'friend';

export interface NotificationPreferences {
  sessionReminders: boolean;
  streakAlerts: boolean;
  milestoneAlerts: boolean;
  challengeAlerts: boolean;
  friendActivity: boolean;
  marketing: boolean;
  quietHoursStart: number;
  quietHoursEnd: number;
}

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  sessionReminders: true,
  streakAlerts: true,
  milestoneAlerts: true,
  challengeAlerts: true,
  friendActivity: true,
  marketing: false,
  quietHoursStart: 22,
  quietHoursEnd: 8,
};