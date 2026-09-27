import type { StateStorage } from 'zustand/middleware';

import { storage } from './mmkv';

/** persist() storage over MMKV — synchronous, so stores hydrate at module load. */
export const zustandStorage: StateStorage = {
  getItem: (name) => storage.getString(name) ?? null,
  setItem: (name, value) => storage.set(name, value),
  removeItem: (name) => {
    storage.remove(name);
  },
};
