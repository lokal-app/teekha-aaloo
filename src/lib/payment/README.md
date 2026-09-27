# lib/payment — adapter slot

**Contract:** `types.ts` (`PaymentAdapter`, `PaymentRequest`, `PaymentResult`). **Public API:**
`index.ts` — `initPayment`, `startPayment`. **Ships as:** no-op `adapter.ts` (fails `NOT_CONFIGURED`).

**Recommended vendor (pre-approved):** Razorpay — `react-native-razorpay` (India; UPI/cards/wallets).

**Wiring steps** (`/add-adapter payment razorpay` → adapter-wirer):
1. User runs `! pnpm add react-native-razorpay` (+ a config plugin in `plugins/` if native setup is needed).
2. Implement `adapter.ts`: `RazorpayCheckout.open({ key, order_id: referenceId, amount: amountMinor,
   currency, description })` → map success/cancel/error to `PaymentResult`. The public key comes
   from `@env` (add it to `env.ts` client schema + `.env.*`).
3. Server-side signature verification is mandatory — the app never trusts `succeeded` alone; the
   calling screen data hook posts the result to the backend (an `api/<resource>/` mutation).
4. No bootstrap slot (lazy) — call `initPayment()` before the first checkout if the vendor needs it.

**Gotchas:** never put secret keys in the app; amounts always in minor units.
