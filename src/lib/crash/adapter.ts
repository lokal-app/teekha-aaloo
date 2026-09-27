import type { CrashAdapter } from './types';

// No-op adapter. Wire a vendor by replacing THIS file only (see README.md / /add-adapter).
export const adapter: CrashAdapter = {
  init: async () => {},
  recordError: () => {},
  log: () => {},
  setUser: () => {},
};
