import type { NotificationCategory } from '@/features/notifications/types';

/** Contextual, useful notifications — never spam. */
export interface NotificationTemplate {
  category: NotificationCategory;
  title: string;
  body: (data: Record<string, number | string | null>) => string;
}

export const NOTIFICATION_TEMPLATES: Record<NotificationCategory, NotificationTemplate> = {
  session_reminder: {
    category: 'session_reminder',
    title: 'Time to sprint',
    body: (d) => `Your ${d.focus ?? 'focused'} session is waiting. ${d.minutes ?? 25} minutes, one level at a time.`,
  },
  streak_alert: {
    category: 'streak_alert',
    title: 'Keep it alive',
    body: () => 'One session today keeps your streak burning. You trained yesterday — don\'t break the chain.',
  },
  milestone: {
    category: 'milestone',
    title: 'A milestone in reach',
    body: (d) => `You're ${d.gap ?? 0} ELO away from ${d.target ?? 1300}. Your next session can close it.`,
  },
  challenge: {
    category: 'challenge',
    title: 'Challenge ends soon',
    body: () => 'Your weekly challenge ends tomorrow. Log one session to lock it in.',
  },
  friend: {
    category: 'friend',
    title: 'Friend activity',
    body: (d) => `${d.name ?? 'A friend'} just beat their personal best. Can you?`,
  },
};

export function render(category: NotificationCategory, data: Record<string, number | string | null> = {}) {
  const t = NOTIFICATION_TEMPLATES[category];
  return { title: t.title, body: t.body(data) };
}