import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { clearTokens, queryClient } from '@/lib/api-client';
import { logger } from '@/lib/logger';
import { zustandStorage } from '@/lib/storage';

export type AuthStatus = 'restoring' | 'unauthenticated' | 'authenticated';

type AuthState = {
  status: AuthStatus;
  hasSeenIntro: boolean;
};

type AuthActions = {
  /** Called by the login screen data hook AFTER the login mutation has saved tokens. */
  signIn: () => void;
  /** Clears tokens + the whole query cache; also the session-expiry callback (§A6.2.1 #6). */
  signOut: () => void;
  markIntroSeen: () => void;
};

const initialState: AuthState = {
  status: 'unauthenticated',
  hasSeenIntro: false,
};

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set) => ({
      ...initialState,
      signIn: () => set({ status: 'authenticated' }),
      signOut: () => {
        set({ status: 'unauthenticated' });
        // Reset session-scoped stores here (e.g. registration) as they are added.
        queryClient.clear();
        clearTokens().catch((error: unknown) =>
          logger.error('clearTokens failed on sign-out', error),
        );
      },
      markIntroSeen: () => set({ hasSeenIntro: true }),
    }),
    {
      name: 'auth',
      version: 1,
      storage: createJSONStorage(() => zustandStorage),
      partialize: (state) => ({
        status: state.status === 'authenticated' ? state.status : 'unauthenticated',
        hasSeenIntro: state.hasSeenIntro,
      }),
      migrate: (persisted) => persisted as AuthState,
    },
  ),
);
