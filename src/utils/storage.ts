import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

/**
 * Storage layer.
 * - AsyncStorage: non-sensitive cache (athlete snapshot, today's session, leaderboards)
 * - SecureStore:    secrets (supabase session tokens, provider credentials)
 */

export interface CacheEntry<T> {
  value: T;
  cachedAt: number;
}

const CACHE_PREFIX = 'sprint:cache:';

export async function cacheGet<T>(key: string, maxAgeMs?: number): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;
    const entry = JSON.parse(raw) as CacheEntry<T>;
    if (maxAgeMs !== undefined && Date.now() - entry.cachedAt > maxAgeMs) {
      return null;
    }
    return entry.value;
  } catch {
    return null;
  }
}

export async function cacheSet<T>(key: string, value: T): Promise<void> {
  try {
    const entry: CacheEntry<T> = { value, cachedAt: Date.now() };
    await AsyncStorage.setItem(CACHE_PREFIX + key, JSON.stringify(entry));
  } catch {
    // cache writes must never crash the app
  }
}

export async function cacheRemove(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(CACHE_PREFIX + key);
  } catch {
    // noop
  }
}

/** ---- SecureStore ---- */

const TOKEN_KEY = 'sprint.auth.tokens';

export interface StoredTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt?: number;
}

export async function saveTokens(tokens: StoredTokens): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, JSON.stringify(tokens), {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
}

export async function loadTokens(): Promise<StoredTokens | null> {
  const raw = await SecureStore.getItemAsync(TOKEN_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredTokens;
  } catch {
    return null;
  }
}

export async function clearTokens(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

/** Simple key-value in SecureStore (small secrets only). */
export async function setSecret(key: string, value: string): Promise<void> {
  await SecureStore.setItemAsync(`sprint:secret:${key}`, value, {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
}

export async function getSecret(key: string): Promise<string | null> {
  return SecureStore.getItemAsync(`sprint:secret:${key}`);
}