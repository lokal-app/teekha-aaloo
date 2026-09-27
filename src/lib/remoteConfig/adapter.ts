import type { RemoteConfigAdapter } from './types';

// No-op adapter: every read returns its fallback. Replace THIS file only (see README.md).
export const adapter: RemoteConfigAdapter = {
  load: async () => {},
  getFlag: (_key, fallback) => fallback,
  getString: (_key, fallback) => fallback,
  getNumber: (_key, fallback) => fallback,
};
