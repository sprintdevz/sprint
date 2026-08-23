/** Onboarding domain types. */

export type OnboardingStepId =
  | 'sport'
  | 'profile'
  | 'experience'
  | 'goals'
  | 'training'
  | 'equipment'
  | 'assessment-intro';

export interface ExperienceLevel {
  code: string;
  label: string;
  description: string;
  years: number;
}

export const EXPERIENCE_LEVELS: ExperienceLevel[] = [
  { code: 'beginner', label: 'New to it', description: 'Under a year of organized play.', years: 0 },
  { code: 'casual', label: 'Casual', description: 'Play sometimes; fundamentals solidifying.', years: 1 },
  { code: 'competitive', label: 'Competitive', description: 'Regular organized play, knows the game.', years: 3 },
  { code: 'advanced', label: 'Advanced', description: 'High level — HS/college or pro-adjacent.', years: 6 },
];

export interface OnboardingGoals {
  primaryGoal: string;
  secondaryGoal: string | null;
}

export interface OnboardingTraining {
  sessionsPerWeek: number;
  minutesPerSession: number;
  location: string;
}

export interface EquipmentSelection {
  slugs: string[];
}

export interface OnboardingData {
  sport: string;
  position: string | null;
  fullName: string;
  birthYear: number | null;
  heightCm: number | null;
  weightKg: number | null;
  experience: string;
  goals: OnboardingGoals;
  training: OnboardingTraining;
  equipment: string[];
  completed: boolean;
}