import type { ConfigContext, ExpoConfig } from 'expo/config';

import { BuildTimeEnv, ClientEnv } from './env.ts';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: ClientEnv.NAME,
  slug: BuildTimeEnv.SLUG,
  scheme: ClientEnv.SCHEME,
  version: ClientEnv.VERSION,
  ...(BuildTimeEnv.EXPO_ACCOUNT_OWNER ? { owner: BuildTimeEnv.EXPO_ACCOUNT_OWNER } : {}),
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'automatic',
  ios: {
    bundleIdentifier: ClientEnv.BUNDLE_ID,
    supportsTablet: false,
  },
  android: {
    package: ClientEnv.PACKAGE,
    allowBackup: false,
    adaptiveIcon: {
      backgroundColor: '#FFFFFF',
      foregroundImage: './assets/android-icon-foreground.png',
      backgroundImage: './assets/android-icon-background.png',
      monochromeImage: './assets/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: false,
  },
  plugins: ['expo-dev-client', 'expo-secure-store', 'expo-image'],
  extra: {
    ...ClientEnv,
    ...(BuildTimeEnv.EAS_PROJECT_ID ? { eas: { projectId: BuildTimeEnv.EAS_PROJECT_ID } } : {}),
  },
});
