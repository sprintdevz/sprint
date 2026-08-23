export type PlanName = 'free' | 'pro';

export interface SubscriptionState {
  plan: PlanName;
  status: 'active' | 'past_due' | 'canceled' | 'expired';
  renewsAt: string | null;
  startedAt: string | null;
}

export interface PlanDefinition {
  id: PlanName;
  name: string;
  tagline: string;
  priceMonthly: number | null;
  features: string[];
}

export const PLANS: PlanDefinition[] = [
  {
    id: 'free',
    name: 'Free',
    tagline: 'Get rated and get moving.',
    priceMonthly: 0,
    features: [
      'One sport',
      'Initial assessment + ELO',
      '3 training sessions per week',
      'Basic progress & streaks',
      'Community leaderboards',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    tagline: 'The full training lab.',
    priceMonthly: 9.99,
    features: [
      'All sports',
      'Unlimited training sessions',
      'Advanced analytics & skill tracking',
      'Video form analysis',
      'Premium challenges & hurdles',
      'Historical analytics',
    ],
  },
];