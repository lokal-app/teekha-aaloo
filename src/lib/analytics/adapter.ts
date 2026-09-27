import type { AnalyticsAdapter } from './types';

// No-op adapter. Wire a vendor by replacing THIS file only (see README.md / /add-adapter).
export const adapter: AnalyticsAdapter = {
  init: async () => {},
  trackEvent: () => {},
  identify: () => {},
  setUserProperties: () => {},
  reset: () => {},
};
