import { isAxiosError } from 'axios';

import { SecureKey, secureStorage, storage } from '@/lib/storage';

import { requestTokenRefresh } from './authRefresh';
import type { ApiError, TokenPair } from './types';

const ACCESS_TOKEN_KEY = 'auth.accessToken';

type AuthConfig = { onSessionExpired: () => void };
let authConfig: AuthConfig = { onSessionExpired: () => {} };
let refreshInFlight: Promise<string> | null = null;

export function configureApiAuth(config: AuthConfig) {
  authConfig = config;
}

export function getAccessToken() {
  return storage.getString(ACCESS_TOKEN_KEY);
}

export async function saveTokens({ accessToken, refreshToken }: TokenPair) {
  storage.set(ACCESS_TOKEN_KEY, accessToken);
  if (refreshToken) await secureStorage.set(SecureKey.RefreshToken, refreshToken);
}

export async function clearTokens() {
  storage.remove(ACCESS_TOKEN_KEY);
  await secureStorage.remove(SecureKey.RefreshToken);
}

/** Single-flight: every concurrent caller awaits the same refresh. */
export function refreshAccessToken(): Promise<string> {
  refreshInFlight ??= runRefresh().finally(() => {
    refreshInFlight = null;
  });
  return refreshInFlight;
}

async function runRefresh(): Promise<string> {
  const refreshToken = await secureStorage.get(SecureKey.RefreshToken);
  if (!refreshToken) return expireSession();
  try {
    const pair = await requestTokenRefresh(refreshToken);
    await saveTokens(pair);
    return pair.accessToken;
  } catch (error) {
    const status = isAxiosError(error) ? error.response?.status : undefined;
    if (status !== undefined && status >= 400 && status < 500) return expireSession();
    throw error; // network / 5xx: keep the session
  }
}

async function expireSession(): Promise<never> {
  await clearTokens();
  authConfig.onSessionExpired();
  const expired: ApiError = { code: 'SESSION_EXPIRED', message: 'Session expired', status: 401 };
  throw expired;
}
