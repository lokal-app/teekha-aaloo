import * as SecureStore from 'expo-secure-store';

/** Every SecureStore key lives here — ad-hoc string keys are forbidden (§A6.5). */
export enum SecureKey {
  RefreshToken = 'auth.refreshToken',
}

const MAX_VALUE_BYTES = 2048;

const OPTIONS: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
};

function byteLength(value: string) {
  return new TextEncoder().encode(value).length;
}

/** Secrets vault ONLY: long-lived credentials / crypto secrets, ≤2KB, async. */
export const secureStorage = {
  get(key: SecureKey): Promise<string | null> {
    return SecureStore.getItemAsync(key, OPTIONS);
  },
  async set(key: SecureKey, value: string): Promise<void> {
    if (byteLength(value) > MAX_VALUE_BYTES) {
      throw new Error(`secureStorage: value for "${key}" exceeds ${MAX_VALUE_BYTES} bytes`);
    }
    await SecureStore.setItemAsync(key, value, OPTIONS);
  },
  remove(key: SecureKey): Promise<void> {
    return SecureStore.deleteItemAsync(key, OPTIONS);
  },
  /** iOS Keychain survives reinstall — wiped on first run so a new install never inherits secrets. */
  async wipeAll(): Promise<void> {
    await Promise.all(
      Object.values(SecureKey).map((key) => SecureStore.deleteItemAsync(key, OPTIONS)),
    );
  },
};
