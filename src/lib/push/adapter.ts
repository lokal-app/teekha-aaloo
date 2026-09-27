import type { PushAdapter } from './types';

// No-op adapter. Wire a vendor by replacing THIS file only (see README.md / /add-adapter).
export const adapter: PushAdapter = {
  registerNotificationHandlers: () => {},
  init: async () => {},
  getToken: async () => null,
  onNotificationOpened: () => () => {},
};
