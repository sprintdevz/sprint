import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from '@/constants/config';
import type { Json } from '@/types/database';

/**
 * Supabase client.
 *
 * Auth tokens live in SecureStore (never AsyncStorage). When the project is
 * not configured (.env missing), getSupabase() throws a descriptive error so
 * screens can render the friendly "connect Supabase" state instead of
 * crashing with a mystery error.
 */

const secureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!isSupabaseConfigured) {
    throw new Error(
      'Supabase is not configured. Add EXPO_PUBLIC_SUPABASE_URL and ' +
        'EXPO_PUBLIC_SUPABASE_ANON_KEY to your .env file (see .env.example).',
    );
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