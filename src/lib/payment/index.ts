import { adapter } from './adapter';
import type { PaymentRequest } from './types';

export type { PaymentAdapter, PaymentRequest, PaymentResult } from './types';

export function initPayment() {
  return adapter.init();
}

export function startPayment(request: PaymentRequest) {
  return adapter.startPayment(request);
}
