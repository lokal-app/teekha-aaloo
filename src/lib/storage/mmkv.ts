import { createMMKV } from 'react-native-mmkv';

/** THE app storage: the single plain MMKV instance (sync, µs reads). */
export const storage = createMMKV({ id: 'app-storage' });

const HAS_LAUNCHED_KEY = 'app.hasLaunched';

/** MMKV is wiped with the app sandbox on uninstall, so a missing flag means a fresh install. */
export function isFirstRun() {
  return !storage.getBoolean(HAS_LAUNCHED_KEY);
}

export function markLaunched() {
  storage.set(HAS_LAUNCHED_KEY, true);
}
