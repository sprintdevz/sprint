/**
 * Route parameter contracts for dynamic expo-router routes.
 * Kept in one place so screens, links and deep links stay in sync.
 */

export interface SessionParams {
  sessionId: string;
}

export interface AssessmentParams {
  assessmentId: string;
}

export interface SkillParams {
  skillId: string;
}

export interface SeasonParams {
  seasonId: string;
}

export interface ChallengeParams {
  challengeId: string;
}

export interface ResultsParams {
  sessionId: string;
  /** Optional override — defaults to the session's own plan. */
  planIndex?: number;
}

export type RouteParams = {
  '/session/[sessionId]': SessionParams;
  '/assessment/[assessmentId]': AssessmentParams;
  '/skill/[skillId]': SkillParams;
  '/compete/season/[seasonId]': SeasonParams;
  '/compete/challenge/[challengeId]': ChallengeParams;
};