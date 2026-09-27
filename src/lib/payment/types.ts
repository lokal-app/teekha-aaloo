/** Vendor-neutral payment request — no business semantics (§A6.5). */
export type PaymentRequest = {
  /** Amount in the currency's minor unit (paise, cents). */
  amountMinor: number;
  currency: string;
  /** Server-issued order/intent id the vendor checkout is opened for. */
  referenceId: string;
  description?: string;
};

export type PaymentResult =
  | { status: 'succeeded'; transactionId: string; signature?: string }
  | { status: 'cancelled' }
  | { status: 'failed'; code: string; message: string };

export type PaymentAdapter = {
  init(): Promise<void>;
  startPayment(request: PaymentRequest): Promise<PaymentResult>;
};
