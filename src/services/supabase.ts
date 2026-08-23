import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from '@/constants/config';
import { createDemoClient, type DemoClient } from '@/services/demo/client';
import { DEMO_EMAIL } from '@/services/demo/store';
import type { Json } from '@/types/database';

/**
 * Supabase client.
 *
 * Auth tokens live in SecureStore on native (never AsyncStorage). On web,
 * SecureStore is unavailable so we fall back to localStorage. When the
 * project is not configured (.env missing), getSupabase() returns the demo
 * client — a localStorage-backed stand-in so the whole product is playable
 * without a backend.
 */

const secureStoreAdapter = {
  getItem: (key: string) =>
    Platform.OS === 'web'
      ? Promise.resolve(localStorage.getItem(key))
      : SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
      return Promise.resolve();
    }
    return SecureStore.setItemAsync(key, value);
  },
  removeItem: (key: string) => {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
      return Promise.resolve();
    }
    return SecureStore.deleteItemAsync(key);
  },
};

let client: SupabaseClient | null = null;
let demoClient: DemoClient | null = null;

/** True when running without a configured Supabase project. */
export function isDemoMode(): boolean {
  return !isSupabaseConfigured;
}

function getDemo(): DemoClient {
  if (!demoClient) demoClient = createDemoClient();
  return demoClient;
}

export function getSupabase(): SupabaseClient {
  if (!isSupabaseConfigured) {
    return getDemo() as unknown as SupabaseClient;
  }
  if (!client) {
    client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        storage: secureStoreAdapter,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });
  }
  return client;
}

/** Shortcut used across feature APIs. */
export function sb(): SupabaseClient {
  return getSupabase();
}

/** Sign into the seeded demo athlete (demo mode only — no-op otherwise). */
export async function demoSignIn(): Promise<{ ok: boolean; error: string | null }> {
  if (!isDemoMode()) return { ok: false, error: null };
  try {
    const { error } = await getDemo().auth.signInWithPassword({
      email: DEMO_EMAIL,
      password: 'demo',
    });
    return { ok: !error, error: error?.message ?? null };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Demo sign-in failed' };
  }
}

/** Wipe demo data and restore the fresh seed (demo mode only). */
export function resetDemoData(): void {
  if (!isDemoMode()) return;
  getDemo().reset();
}

/** Query helper with a uniform error envelope. */
export async function safeQuery<T>(
  run: () => Promise<{ data: T | null; error: { message: string } | null }>,
): Promise<{ data: T | null; error: string | null }> {
  try {
    const { data, error } = await run();
    return { data, error: error?.message ?? null };
  } catch (e) {
    return { data: null, error: e instanceof Error ? e.message : 'Unexpected error' };
  }
}

export type { Json as DatabaseJson };