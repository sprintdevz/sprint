/** Auth feature domain types. */

export interface SignInInput {
  email: string;
  password: string;
}

export interface SignUpInput extends SignInInput {
  fullName: string;
  username: string;
}

export interface AuthResult {
  ok: boolean;
  error?: string;
}

export type AuthMethod = 'email' | 'apple' | 'google';

export interface AuthState {
  loading: boolean;
  error: string | null;
}