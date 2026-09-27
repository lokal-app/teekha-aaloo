import { adapter } from './adapter';

export type { RemoteConfigAdapter } from './types';

export function loadRemoteConfig() {
  return adapter.load();
}

export function getFlag(key: string, fallback: boolean) {
  return adapter.getFlag(key, fallback);
}

export function getRemoteString(key: string, fallback: string) {
  return adapter.getString(key, fallback);
}

export function getRemoteNumber(key: string, fallback: number) {
  return adapter.getNumber(key, fallback);
}
