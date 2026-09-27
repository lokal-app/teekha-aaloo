import type { ObservabilityAdapter } from './types';

// No-op adapter. Wire a vendor by replacing THIS file only (see README.md / /add-adapter).
export const adapter: ObservabilityAdapter = {
  init: async () => {},
  startTrace: () => ({ setAttribute: () => {}, stop: () => {} }),
};
