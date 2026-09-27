import { NavigationContainer } from '@react-navigation/native';

import { LoadingState, Screen } from '@/components/ui';
import { useAuthStore } from '@/stores/auth';
import { toNavigationTheme, useTheme } from '@/theme';

import { AuthenticatedStack } from './authenticated/AuthenticatedStack';
import { linking } from './linking';
import { navigationRef } from './navigationRef';
import { UnauthenticatedStack } from './unauthenticated/UnauthenticatedStack';

/** Dumb three-state switch on authStore.status ONLY (§A8). */
export function RootNavigator() {
  const status = useAuthStore((s) => s.status);
  const theme = useTheme();
  return (
    <NavigationContainer ref={navigationRef} theme={toNavigationTheme(theme)} linking={linking}>
      {status === 'restoring' ? (
        <Screen>
          <LoadingState />
        </Screen>
      ) : status === 'authenticated' ? (
        <AuthenticatedStack />
      ) : (
        <UnauthenticatedStack />
      )}
    </NavigationContainer>
  );
}
