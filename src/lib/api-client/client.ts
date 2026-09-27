import { env } from '@env';
import { type AxiosError, create, isAxiosError } from 'axios';

import { getAccessToken, refreshAccessToken } from './session';
import { type ApiError, isApiError } from './types';

declare module 'axios' {
  interface AxiosRequestConfig {
    skipAuth?: boolean;
    _retried?: boolean;
  }
}

export const apiClient = create({
  baseURL: env.API_URL,
  timeout: 15_000,
  headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
});

// Interceptor order is load-bearing (§A6.2.1): request → unwrap → refresh → normalize.

// request: attach access token (sync MMKV read; skipped when config.skipAuth)
apiClient.interceptors.request.use((config) => {
  if (!config.skipAuth) {
    const token = getAccessToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// response 1: envelope unwrap (fulfilled handler only)
apiClient.interceptors.response.use((response) => {
  response.data = unwrapEnvelope(response.data);
  return response;
});

// response 2: 401 → refresh + retry (rejected handler only)
apiClient.interceptors.response.use(undefined, async (error: AxiosError) => {
  const original = error.config;
  if (error.response?.status !== 401 || !original || original.skipAuth || original._retried) {
    throw error; // → response 3 normalizes it
  }
  original._retried = true;
  const token = await refreshAccessToken();
  original.headers.Authorization = `Bearer ${token}`;
  return apiClient(original);
});

// response 3: error → ApiError (rejected handler only; passes ApiError through)
apiClient.interceptors.response.use(undefined, (error: unknown) => {
  throw toApiError(error);
});

/** Envelope contract `{ data: T, … }` → `T`, handled ONCE here. Adjust here if the backend differs. */
function unwrapEnvelope(body: unknown): unknown {
  if (typeof body === 'object' && body !== null && !Array.isArray(body) && 'data' in body) {
    return (body as { data: unknown }).data;
  }
  return body;
}

type ErrorBody = {
  code?: unknown;
  message?: unknown;
  error?: { code?: unknown; message?: unknown };
};

function toApiError(error: unknown): ApiError {
  if (isApiError(error)) return error;
  if (isAxiosError(error)) {
    if (!error.response) {
      return { code: 'NETWORK_ERROR', message: error.message, status: 0 };
    }
    const { status, data } = error.response;
    const body = (typeof data === 'object' && data !== null ? data : {}) as ErrorBody;
    const code = body.code ?? body.error?.code;
    const message = body.message ?? body.error?.message;
    return {
      code: typeof code === 'string' ? code : `HTTP_${status}`,
      message: typeof message === 'string' ? message : error.message,
      status,
      details: data,
    };
  }
  return {
    code: 'UNKNOWN_ERROR',
    message: error instanceof Error ? error.message : String(error),
    status: 0,
  };
}
