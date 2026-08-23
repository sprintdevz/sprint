import { create } from 'zustand';
import type { OnboardingData } from '@/features/onboarding/types';

const EMPTY_DATA: OnboardingData = {
  sport: '',
  position: null,
  fullName: '',
  birthYear: null,
  heightCm: null,
  weightKg: null,
  experience: '',
  goals: { primaryGoal: '', secondaryGoal: null },
  training: { sessionsPerWeek: 3, minutesPerSession: 25, location: '' },
  equipment: [],
  completed: false,
};

interface OnboardingState {
  data: OnboardingData;
  currentStep: number;
  completed: boolean;
  set: <K extends keyof OnboardingData>(key: K, value: OnboardingData[K]) => void;
  setStep: (step: number) => void;
  next: () => void;
  back: () => void;
  markCompleted: () => void;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingState>()((set, get) => ({
  data: EMPTY_DATA,
  currentStep: 0,
  completed: false,
  set: (key, value) => set({ data: { ...get().data, [key]: value } }),
  setStep: (step) => set({ currentStep: step }),
  next: () => set({ currentStep: get().currentStep + 1 }),
  back: () => set({ currentStep: Math.max(0, get().currentStep - 1) }),
  markCompleted: () => set({ completed: true, data: { ...get().data, completed: true } }),
  reset: () => set({ data: EMPTY_DATA, currentStep: 0, completed: false }),
}));