import { env } from '@env';
import axios from 'axios';

import type { TokenPair } from './types';

type RefreshResponse = { access_token: string; refresh_token?: string };

/**
 * THE per-app file (§A6.2.1): exchanges a refresh token for a new pair.
 * Uses bare axios (not apiClient) so the 401-refresh chain can never recurse and the raw
 * AxiosError status reaches session.ts (4xx → expire session, network/5xx → keep it).
 */
export async function requestTokenRefresh(refreshToken: string): Promise<TokenPair> {
  // TODO(auth-protocol): replace the path, body and response mapping with the backend's refresh contract.
  const res = await axios.post<RefreshResponse>(
    `${env.API_URL}/v1/auth/refresh`,
    { refresh_token: refreshToken },
    { timeout: 15_000 },
  );
  return { accessToken: res.data.access_token, refreshToken: res.data.refresh_token };
}
