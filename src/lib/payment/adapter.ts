import type { PaymentAdapter } from './types';

// No-op adapter: every payment fails as NOT_CONFIGURED. Replace THIS file only (see README.md).
export const adapter: PaymentAdapter = {
  init: async () => {},
  startPayment: async () => ({
    status: 'failed',
    code: 'NOT_CONFIGURED',
    message: 'Payment adapter is not configured',
  }),
};
