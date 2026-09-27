import { useEffect } from 'react';

import { initAnalytics } from '@/lib/analytics';
import { configureApiAuth, setupReactQueryNative } from '@/lib/api-client';
import { initCrash } from '@/lib/crash';
import { initI18n } from '@/lib/i18n';
import { logger } from '@/lib/logger';
import { initObservability } from '@/lib/observability';
import { requestTrackingPermission } from '@/lib/permissions';
import { initPush, registerNotificationHandlers } from '@/lib/push';
import { getFlag, loadRemoteConfig } from '@/lib/remoteConfig';
import { isFirstRun, markLaunched, secureStorage } from '@/lib/storage';
import { RootNavigator } from '@/navigation/RootNavigator';
import { Providers } from '@/providers';
import { useAuthStore } from '@/stores/auth';
import { useSettingsStore } from '@/stores/settings';

// ── §A13 module load (before React renders). Order is load-bearing — never reorder. ──

// 1–2. First-run check → wipe SecureStore on fresh install (iOS Keychain survives reinstall).
if (isFirstRun()) {
  secureStorage
    .wipeAll()
    .catch((error: unknown) => logger.error('First-run SecureStore wipe failed', error));
  markLaunched();
}

// 3. Auth + settings stores hydrate synchronously from MMKV on import (persist + sync storage);
//    the persisted locale is applied immediately so the first frame is translated.
initI18n(useSettingsStore.getState().language);

// 4. Session expiry reaches app state only through this callback (lib/ never imports stores/).
configureApiAuth({ onSessionExpired: () => useAuthStore.getState().signOut() });

// 5. React Query ↔ React Native: focus = AppState, online = expo-network.
setupReactQueryNative();

// 6. Initial theme scheme: resolved synchronously by ThemeProvider from stores/settings on first render.

// 7. OS-level notification handlers (Android channels + iOS VoIP).
registerNotificationHandlers();

// 8. Core analytics adapter.
initAnalytics().catch((error: unknown) => logger.error('initAnalytics failed', error));

// ── §A13 component mount ──

async function runStep(name: string, step: () => Promise<unknown>) {
  try {
    await step();
  } catch (error) {
    logger.error(`Bootstrap step failed: ${name}`, error);
  }
}

async function bootstrapOnMount() {
  // 9. Load fonts — TODO(fonts): add families to assets/fonts/ and load them here (blocking render).
  await runStep('crash', initCrash); // 10
  await runStep('push', initPush); // 11
  await runStep('remoteConfig', loadRemoteConfig); // 12
  if (getFlag('observability_enabled', false)) {
    await runStep('observability', initObservability); // 13 (remote kill-switch)
  }
  await runStep('trackingPermission', requestTrackingPermission); // 14
  // 15. Hide bootsplash — TODO(bootsplash): requires expo-splash-screen (§A0 approval).
}

export function App() {
  useEffect(() => {
    void bootstrapOnMount();
  }, []);

  // 16.
  return (
    <Providers>
      <RootNavigator />
    </Providers>
  );
}
