import { QueryClient } from '@tanstack/react-query';

import type { ApiError } from './types';

declare module '@tanstack/react-query' {
  interface Register {
    defaultError: ApiError;
  }
}

const DAY_MS = 24 * 60 * 60 * 1000;

/** Only transient failures retry; a 4xx (including SESSION_EXPIRED) never does (§A6.2 #11). */
function isTransient(error: ApiError) {
  return error.status === 0 || error.status === 408 || error.status === 429 || error.status >= 500;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: DAY_MS,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      retry: (failureCount, error) => failureCount < 2 && isTransient(error),
    },
    mutations: {
      retry: 0,
    },
  },
});
