import { z } from 'zod';

/** Sport step — at least one sport selected. */
export const sportStepSchema = z.object({
  sport: z.string().min(1, 'Pick a sport to begin'),
});

/** Profile step. */
export const profileStepSchema = z.object({
  fullName: z.string().min(2, 'Enter your name').max(60),
  birthYear: z
    .number()
    .min(1950, 'Enter a valid birth year')
    .max(new Date().getFullYear() - 5, 'Enter a valid birth year')
    .optional()
    .nullable(),
  heightCm: z.number().min(100).max(250).optional().nullable(),
  weightKg: z.number().min(30).max(300).optional().nullable(),
});

/** Training preferences. */
export const trainingStepSchema = z.object({
  sessionsPerWeek: z.number().min(1).max(7),
  minutesPerSession: z.number().min(10).max(120),
  location: z.string().min(1, 'Pick where you train'),
});

export type ProfileStepValues = z.infer<typeof profileStepSchema>;
export type TrainingStepValues = z.infer<typeof trainingStepSchema>;