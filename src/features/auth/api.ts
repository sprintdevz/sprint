import { sb } from '@/services/supabase';
import type { AuthResult, SignInInput, SignUpInput } from '@/features/auth/types';

/** Wrap supabase auth calls with a uniform envelope. */
async function call(
  run: () => Promise<{ error: { message: string } | null }>,
): Promise<AuthResult> {
  try {
    const { error } = await run();
    return { ok: !error, error: error?.message };
  } catch (e) {
    return { ok: false, error: friendlyMessage(e) };
  }
}

function friendlyMessage(e: unknown): string {
  if (e instanceof Error) {
    const msg = e.message;
    if (msg.includes('Invalid login credentials')) return 'Wrong email or password.';
    if (msg.includes('already registered')) return 'That email is already registered.';
    if (msg.includes('Email not confirmed')) return 'Confirm your email first.';
    return msg;
  }
  return 'Something went wrong. Please try again.';
}

export async function signIn(input: SignInInput): Promise<AuthResult> {
  return call(() => sb().auth.signInWithPassword({ email: input.email.trim(), password: input.password }));
}

export async function signUp(input: SignUpInput): Promise<AuthResult> {
  return call(() =>
    sb().auth.signUp({
      email: input.email.trim(),
      password: input.password,
      options: {
        data: { full_name: input.fullName.trim(), username: input.username.trim() },
      },
    }),
  );
}

export async function signOut(): Promise<void> {
  try {
    await sb().auth.signOut();
  } catch {
    // ignore — local sign-out matters more
  }
}

export async function requestPasswordReset(email: string): Promise<AuthResult> {
  return call(() =>
    sb().auth.resetPasswordForEmail(email.trim(), { redirectTo: 'sprint://settings/account/reset' }),
  );
}

export async function updatePassword(newPassword: string): Promise<AuthResult> {
  return call(() => sb().auth.updateUser({ password: newPassword }));
}

export async function resendVerification(email: string): Promise<AuthResult> {
  return call(() => sb().auth.resend({ type: 'signup', email }));
}