import { NavigationContainer } from '@react-navigation/native';

import { LoadingState, Screen } from '@/components/shell';
import { useAuthStore } from '@/stores/auth';
import { useSettingsStore } from '@/stores/settings';
import { DEFAULT_THEME, navigationThemes, type ThemeName, useTheme } from '@/theme';

import { AuthenticatedStack } from './authenticated/AuthenticatedStack';
import { linking } from './linking';
import { navigationRef } from './navigationRef';
import { UnauthenticatedStack } from './unauthenticated/UnauthenticatedStack';

function isThemeName(name: string): name is ThemeName {
  return Object.prototype.hasOwnProperty.call(navigationThemes, name);
}

/** Dumb three-state switch on authStore.status ONLY (§A8); chrome follows brand, skin and mode. */
export function RootNavigator() {
  const status = useAuthStore((s) => s.status);
  const themeName = useSettingsStore((s) => s.themeName);
  const { mode } = useTheme();
  const navigationTheme =
    navigationThemes[isThemeName(themeName) ? themeName : DEFAULT_THEME][mode];
  return (
    <NavigationContainer ref={navigationRef} theme={navigationTheme} linking={linking}>
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
