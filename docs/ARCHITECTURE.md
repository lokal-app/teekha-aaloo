# RN/Expo Template — Constitution & Claude Harness

> **This document is the ruleset.** It is designed to be injected verbatim into the context of any AI coding agent (Claude Code or otherwise) at the start of any project built from `rn-template`. It is not a discussion document: every rule in Part A is absolute, every file in Part B ships verbatim in the template. An AI reading this document needs **no further context** about architecture, folder structure, naming, theming, state management, or API patterns. The only open inputs per project are: the Figma file (design tokens + screens), the Postman collection (API contracts), and the PRD (business logic). Everything else is fixed here.
>
> **Rule violations require an ADR (`docs/adr/`), never a silent bypass.**


# PART A — THE CONSTITUTION

Absolute rules. Part B ships them into Claude's context; ESLint and hooks enforce them mechanically. Any AI (or human) producing code in a project built from this template follows Part A without exception.

## A0. The locked stack

| Concern | Choice | Forbidden alternatives |
|---|---|---|
| Framework | Expo CNG (Prebuild) + Dev Client + EAS | Expo Go workflows, bare RN |
| Package manager | pnpm (enforced via `.npmrc` + preinstall) | npm, yarn, bun |
| Language | TypeScript strict | JS files in `src/` |
| Navigation | `@react-navigation/native` + native-stack + bottom-tabs | Expo Router, react-native-navigation |
| Server state | TanStack Query v5 + `react-query-kit` | Raw axios in components, SWR, RTK Query |
| Client state | Zustand | Redux, Recoil, Jotai, MobX, raw Context for shared state |
| Persistence (app state) | Plain MMKV via `lib/storage` — the single app storage | AsyncStorage; SecureStore for app state |
| Persistence (secrets) | expo-secure-store via `lib/storage` `secureStorage` — long-lived credentials/crypto secrets only (≤2KB, async) | Secrets in MMKV; hand-rolled keychain access |
| HTTP | axios instance in `lib/api-client` | fetch calls scattered in code |
| Validation | zod (env, API wire schemas — non-production runtime parse (`APP_ENV` gate), forms) | yup, io-ts, hand-rolled |
| Forms | react-hook-form + `@hookform/resolvers` + zod | Formik, uncontrolled ad-hoc state |
| Styling | RN `StyleSheet` + design tokens via the canonical `createStyles(theme)` pattern (§A7) | Inline styles (absolute ban), styled-components, NativeWind, Tamagui, Unistyles |
| Lists | `@shopify/flash-list` for any scrollable data list | `FlatList`/`SectionList` for data lists |
| Images | `expo-image` | RN `Image` |
| i18n | i18next + react-i18next; ALL user-facing strings via `t()` | Hardcoded string literals in JSX |
| Dates | dayjs | moment, date-fns mixing |
| Logging | `lib/logger` | `console.*` in `src/` |
| Animations | react-native-reanimated | Animated API for new code |
| Error boundaries | react-error-boundary | hand-rolled |
| Network status | expo-network (only via `lib/api-client` `onlineManager` binding) | `@react-native-community/netinfo`, ad-hoc connectivity polling |
| Gestures | react-native-gesture-handler | RN responder system (`onResponder*`, `PanResponder`) for new code |
| Safe area | react-native-safe-area-context (consumed via `ui/Screen` or `useStyles` params) | `SafeAreaView` from `react-native` |
| Keyboard | react-native-keyboard-controller | `KeyboardAvoidingView`, hand-rolled keyboard offsets |
| Bottom sheets | @gorhom/bottom-sheet (only via `ui/BottomSheet`) | Modal-based hand-rolled sheets |
| Toast | react-native-flash-message (only via `lib/toast`) | Other toast/snackbar libraries |
| Testing | **None for now (locked decision).** Adding any test framework requires an ADR. | — |

**Versions** are pinned by the template's `package.json` lockfile; upgrades are batch PRs, never drive-by bumps inside feature work.

## A1. Decision tree — where new code goes

```
Pure helper (no React, no side effects)?              → src/utils/
Cross-cutting infrastructure / integration?           → src/lib/
Isolated feature (passes 4-of-4 admission test)?      → src/features/<name>/
Otherwise (the common case)                           → spine:
                                                        src/api/<resource>/
                                                        src/components/<area>/  (or common/ or ui/)
                                                        src/screens/<area>/<screen>/
                                                        src/stores/<area>/
                                                        src/hooks/use<Name>.ts
```

**4-of-4 admission test for `features/`** (ALL must hold, else it's spine):
1. Own domain model (its types don't appear in spine `api/` or `stores/`)
2. Terminal navigator boundary (it owns a `navigator.tsx`; spine only mounts it)
3. No spine state read/write (no imports from `src/stores/`)
4. Deletable in one PR with no dangling references

**The `hooks/` exception (explicit):** `src/hooks/` is the **one flat layer folder** — files live directly at its root as `use<Name>.ts`, one hook per file. `hooks/` holds **cross-area UI/infra hooks only** (`useAppState`, `useDebounce`, `useKeyboardVisible`, …) and **never imports `api/` or `stores/`** — that is what makes it safe for `components/` and `features/` to import (otherwise a hook would be a back door around "components never fetch or read stores" and the features 4-of-4 criterion #3). Server state + client state are composed only in screen data hooks (§A6.1); reusable store-derived selectors live in their `stores/<area>/` barrel. Every other layer folder (`api/`, `components/`, `screens/`, `stores/`, `lib/`, `features/`) forbids root-level `.ts`/`.tsx` files.

## A2. The locked `src/` tree

```
src/
├── App.tsx                     canonical bootstrap (§A13) — the ONLY .tsx at src/ root
├── api/                        server state — one folder per backend resource (§A6.2)
│   └── <resource>/             e.g. bookings/, users/, feed/
├── components/
│   ├── ui/                     design-system primitives — atomic, token-only (§A7)
│   ├── common/                 cross-area BUSINESS components (used in ≥2 areas, not atomic)
│   └── <area>/                 area-shared components (used by ≥2 screens of one area)
├── screens/
│   └── <area>/<screen>/        two-level: area, then one folder per screen (§A6.1)
├── stores/
│   └── <area>/                 Zustand stores per concern area (§A6.3)
├── hooks/
│   └── use<Name>.ts            flat — cross-area UI/infra hooks, one per file (no api/, no stores/)
├── navigation/                 React Navigation — locked shape (§A8)
├── providers/                  single root composition — providers/index.tsx only
├── theme/                      tokens + themes — bottom of the dependency stack (§A7)
├── lib/                        INFRASTRUCTURE ONLY — no business code (§A6.5)
├── features/                   isolated features passing 4-of-4 (§A6.4)
├── utils/                      pure helpers — no React, no side effects
└── translations/               i18n JSON resources (en.json, hi.json, …)
```

**Creating any new top-level `src/` folder requires an ADR.** No exceptions.

## A3. Dependency direction (one-way, no cycles)

```
theme/  ──────────────►  imports NOTHING from src/
utils/  ──────────────►  imports nothing from src/ except types
lib/    ──────────────►  may import utils/ types only; NEVER spine, features, theme
components/ui/ ───────►  theme/ + utils/ ONLY
components/common|<area>/ ► ui/, theme/, utils/, hooks/ (NOT api/, NOT stores/, NOT screens/)
hooks/  ──────────────►  lib/, utils/, theme/ ONLY (NEVER api/, stores/, screens/, components/)
stores/ ──────────────►  lib/, utils/ (NEVER screens/, components/, api/)
api/    ──────────────►  lib/api-client, lib/, utils/ (NEVER components/, screens/, stores/)
screens/ ─────────────►  everything above + features/<x> via barrel only
navigation/ ──────────►  screens/, features/ barrels, stores/ (for auth state), theme/
features/<x>/ ────────►  ui/, theme/, lib/, utils/, hooks/ — NEVER another feature, NEVER spine stores/screens
providers/ ───────────►  anything (it is the composition root)
```

Enforced by `import/no-restricted-paths` (§A12). Components never fetch and never read stores directly — data enters components through props; screens (via their data hooks) are the only place server state, client state, and navigation meet.

## A4. Naming & casing (complete table)

| Thing | Convention | Example |
|---|---|---|
| Folders | kebab-case | `booking-history/`, `registration/` |
| Component files | PascalCase, named after the component | `BookingCard.tsx` |
| Screen files | PascalCase + `Screen` suffix | `LoginScreen.tsx` |
| Screen data hooks | `use<Name>Screen.ts` (one per screen folder) | `useBillingAddressScreen.ts` |
| Screen analytics hooks | `useTrack.ts` (fixed name, optional) | — |
| Hooks | camelCase `use` prefix | `useAppState.ts` |
| Stores | camelCase + `Store` suffix | `authStore.ts` → exports `useAuthStore` |
| API hooks | `use<Verb><Noun>.ts` (verbs: Get, List, Create, Update, Delete — List covers paginated) | `useListBookings.ts` |
| Wire (API) types | `Api` prefix, zod-derived; never imported outside `src/api/**` (sole exemption: `ApiError` from `lib/api-client`, app-facing) | `ApiBooking` |
| App-facing API types | clean noun, no suffix | `Booking` |
| Transformer functions | `to<Noun>()` in `transformer.ts` | `toBooking()` |
| Other non-component files | camelCase | `transformer.ts`, `linking.ts` |
| Component exports | **Named exports only.** `export function BookingCard()`. Default exports forbidden (ESLint) except config files that require them. | |
| Props types | Local `type Props = {…}`; export as `<Component>Props` only from `components/ui/` | |
| Translation keys | `<area>.<screen-or-component>.<key>` | `auth.login.submitCta` |
| Analytics events | `snake_case`, `<area>_<object>_<action>` | `booking_card_clicked` |
| Zustand store names | `use<Name>Store` | `useRegistrationStore` |
| Top-level functions | Function declarations (`function x()`), not arrow consts | |

No `.ts`/`.tsx` files at the root of any layer folder except `src/hooks/` (§A1) and `src/App.tsx`.

## A5. Barrels — boundary only (locked; do not reopen)

A barrel (`index.ts` re-exporting siblings) exists **only** at a module boundary with a public-API purpose. **Complete whitelist:**

- `src/features/<name>/index.ts` — feature public API
- `src/lib/<slot>/index.ts` — adapter slot public API
- `src/theme/index.ts` (tokens are theme-internal — no `tokens/` barrel)
- `src/components/ui/index.ts` — design-system entry
- `src/screens/<area>/<screen>/index.ts` — screen public API (the navigator imports this)
- `src/stores/<area>/index.ts` — area store public API

**Forbidden:** layer-root barrels (`api/index.ts`, `screens/index.ts`, `stores/index.ts`, `hooks/index.ts`, `components/index.ts`), cascading/universal barrels, partial barrels (re-export everything or nothing). Deep imports into `features/<name>/` internals are forbidden — only `@/features/<name>`.

*Rationale (recorded):* broad barrels bloat the bundle (Metro doesn't tree-shake them away), slow `tsc` and editor go-to-definition, multiply circular-dep surface, and tax every rename. Path aliases (`@/…`) already give clean imports.

## A6. Canonical file shapes (mandatory, exact)

Each shape lists its **complete legal file inventory**. Files not in the inventory require an ADR. Scaffolding skills (Part B) produce exactly these shapes; `pr-reviewer` rejects deviations.

### A6.1 `screens/<area>/<screen>/` (locked)

Areas map to product domains / navigation groups (`auth/`, `billing/`, `home/`, …) and are fixed per app at plan time by `architecture-guard`. Complete file inventory:

```
screens/billing/billing-address/
├── BillingAddressScreen.tsx     render ONLY — the one and only component in this file
├── useBillingAddressScreen.ts   ALL wiring: queries, store selectors, derived state,
│                                handlers, typed navigation calls
├── useTrack.ts                  OPTIONAL — the screen's analytics (see rules below)
├── styles.ts                    the screen's styles: exports createStyles(theme) ONLY
├── constants.ts                 OPTIONAL — screen-local config (snap points, sizes, …)
├── components/                  OPTIONAL — components used by THIS screen only
│   └── StateSheetContent.tsx    (each with its own in-file createStyles tail)
├── variants/                    OPTIONAL — A/B experiment variants (see rules below)
│   ├── LoginControl.tsx
│   └── LoginRedesign.tsx
└── index.ts                     barrel: export { BillingAddressScreen }
```

**Hard rules:**
- `<Name>Screen.tsx` contains **exactly one component** (the screen) and **zero** data logic: no `useQuery`/`useMutation`, no store access, no axios, no navigation calls, no analytics calls. It consumes `use<Name>Screen()` and renders. Any other JSX component → `components/`. ≤ 200 lines.
- `use<Name>Screen.ts` is the **only** place server state, client state, navigation, and tracking meet for the screen. Navigation via typed `useNavigation` inside the hook — screens never take a `navigation` prop. It returns a single object; for data screens it must expose `status: 'loading' | 'error' | 'empty' | 'ready'` plus `retry()` — and the screen renders ONE wrapper (`<Screen>` primitive) and branches only the body on **all four** states using `LoadingState` / `ErrorState` / `EmptyState` from `components/ui/`. Never duplicate the layout tree per state.
- **`styles.ts`** exports `createStyles(theme)` and **nothing else** — constants belong in `constants.ts`, never in `styles.ts`. Consumed via `const styles = useStyles(createStyles)` in the screen. (Components keep the in-file tail per §A7 — the split is by file type, fully deterministic.)
- **`useTrack.ts`** (when the screen has ≥ 2 analytics events; below that, call `lib/analytics` from the data hook directly): a thin wrapper over `lib/analytics` — defines the screen's base payload once, exposes `track<Event>()` functions, holds no state and no business logic, and is called **only from the data hook / its handlers**, never from JSX.
- **`variants/` (A/B experiments):** variants are presentation-only components sharing **one** data hook, **one** route, **one** `useTrack` (variant name passed as an event property). `<Name>Screen.tsx` becomes the switcher: reads the experiment flag (exposed by the data hook from `lib/remoteConfig`) and renders the active variant. Killing the loser = delete one file + one switch line — no navigator surgery. Sibling `-v2` screen folders are forbidden.
- **Component placement ladder (robotic):** used by 1 screen → `screens/<area>/<screen>/components/`; used by ≥2 screens in one area → `components/<area>/`; used across areas and carries business meaning → `components/common/`; atomic + token-only + zero business meaning → `components/ui/`. Promotion is a move in the same PR that creates the second consumer — never a copy.
- **No `screens/index.ts`, ever** (§A5): a root barrel would execute every screen module at startup — measurable TTI cost on low-end devices. Navigators import each screen's folder barrel directly (`@/screens/billing/billing-address`).

### A6.2 `api/<resource>/` — server state (React Query, locked conventions)

The 3-file shape (field-proven in the org's existing codebase, formalized here):

```
api/bookings/
├── types.ts                  wire types (Api-prefixed, zod-derived) + app types (clean nouns) — together
├── transformer.ts            to<Noun>() functions — the ONLY place wire and app shapes meet
├── useListBookings.ts        one react-query-kit hook per file
├── useGetBooking.ts
├── useCreateBooking.ts
└── (no index.ts — consumers import hooks directly: @/api/bookings/useListBookings)
```

**The locked React Query ruleset:**

1. **Client:** a single axios instance lives in `src/lib/api-client/` (`client.ts` with auth-token, **envelope-unwrapping** (`data.data` vs `data` handled ONCE here, never per-hook), 401-refresh and error-normalization interceptors; `session.ts` + `authRefresh.ts` for tokens and single-flight refresh; `reactQueryNative.ts` for AppState/connectivity bindings; `types.ts` with the `ApiError` envelope; `validateResponse.ts`; `queryClient.ts` with defaults; `index.ts` — full inventory and behaviour in §A6.2.1). Nothing else in `src/` imports axios.
2. **Error envelope:** the interceptor normalizes every failure to `ApiError { code: string; message: string; status: number; details?: unknown }` — network failures and timeouts (no HTTP response) normalize to `status: 0`, `code: 'NETWORK_ERROR'`; errors that are already an `ApiError` (e.g. `SESSION_EXPIRED` from §A6.2.1) pass through untouched. UI code never touches `AxiosError` and never digs through `error.response.data.message` — that mapping happens once, in the interceptor.
3. **`types.ts` contract:** one zod schema per wire entity; the wire type is derived (`export type ApiBooking = z.infer<typeof apiBookingSchema>`) — no double bookkeeping. App types are plain TS with the clean noun (`Booking`). `Api*` types/schemas never leave `src/api/**` (ESLint-guarded, §A12).
4. **Validation is non-production-only:** fetchers call `validateResponse(schema, data)` from `lib/api-client` — `schema.parse` (throws loudly) whenever `env.APP_ENV !== 'production'` (development AND staging), typed passthrough in production. The gate is `APP_ENV`, **never `__DEV__`** — staging ships as a release build where `__DEV__` is `false`, so a `__DEV__` gate would silently skip validation exactly where QA runs. Wire drift is caught in dev/staging at zero production CPU cost on low-end devices.
5. **The transformer is mandatory** — even when it's near-identity. `transformer.ts` exports `to<Noun>(api: Api<Noun>): <Noun>` (and `from<Noun>Input()` for write bodies). It is the only file where `Api*` and app types meet.
6. **Fetcher pipeline (fixed):** `apiClient` call → `validateResponse` → `to<Noun>` → return app type. **The cache stores app types only** — never raw wire data, never `{ raw, transformed }` pairs. `select` is for per-consumer derivation only.
7. **Every hook is built with react-query-kit** — `createQuery` / `createMutation`. Hooks return the kit query object **unmodified** — no hand-rolled `{ loading, error, data }` wrapper objects; mapping to screen `status` is the screen data hook's job (§A6.1).
8. **Query keys** come exclusively from the kit: `queryKey: ['<resource>', '<operation>']` declared once; consumers and invalidators use `use<Hook>.getKey(variables)`. Hand-written key arrays are forbidden.
9. **Hook naming:** `useGet<Noun>` (single), `useList<Noun>s` (any collection), `useCreate/useUpdate/useDelete<Noun>`. **Pagination is an implementation detail, not a name:** when the endpoint is cursor/page-based, `useList<Noun>s` uses `createInfiniteQuery` internally and exposes flattened items + `fetchNextPage`/`hasNextPage` — the filename does not change.
10. **Mutations must invalidate** via `getKey()` in `onSuccess`. Optimistic updates only with full rollback (`onMutate`/`onError`/`onSettled`) — partial optimism is forbidden.
11. **Defaults (in `queryClient.ts`):** `staleTime: 60_000`, `gcTime: 24h`, `refetchOnWindowFocus: true` (on RN this means *app returns to foreground*, via the §A6.2.1 `focusManager` binding — only stale queries refetch, so `staleTime` bounds the cost), `refetchOnReconnect: true`, mutations `retry: 0`, queries retry **only transient failures**: `retry: (count, error: ApiError) => count < 2 && (error.status === 0 || error.status === 408 || error.status === 429 || error.status >= 500)` — a 4xx (including `SESSION_EXPIRED`) is never retried. Per-hook overrides allowed with a one-line comment saying why.
12. **Growth rule:** exactly one `types.ts` + one `transformer.ts` per resource — never split them. If either exceeds ~200 lines, the *resource* splits (`api/bookings/` + `api/booking-slots/`), keeping every folder uniform.

**Canonical files (verbatim pattern):**

```ts
// src/api/bookings/types.ts
import { z } from 'zod';

export const apiBookingSchema = z.object({
  id: z.string(),
  vendor_name: z.string(),
  starts_at: z.string(),            // ISO string on the wire
  status: z.enum(['pending', 'confirmed', 'cancelled']),
});
export type ApiBooking = z.infer<typeof apiBookingSchema>;
export const apiBookingListSchema = z.object({
  items: z.array(apiBookingSchema),
  next_cursor: z.string().nullable(),
});
export type ApiBookingList = z.infer<typeof apiBookingListSchema>;

// App-facing (clean nouns, camelCase, real types)
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled';
export type Booking = {
  id: string;
  vendorName: string;
  startsAt: Date;
  status: BookingStatus;
};
```

```ts
// src/api/bookings/transformer.ts
import type { ApiBooking, Booking } from './types';

export function toBooking(api: ApiBooking): Booking {
  return {
    id: api.id,
    vendorName: api.vendor_name,
    startsAt: new Date(api.starts_at),
    status: api.status,
  };
}
```

```ts
// src/api/bookings/useListBookings.ts
import { createQuery } from 'react-query-kit';
import { apiClient, validateResponse } from '@/lib/api-client';
import { apiBookingListSchema } from './types';
import { toBooking } from './transformer';
import type { Booking } from './types';

type Variables = { city: string };

export const useListBookings = createQuery<Booking[], Variables>({
  queryKey: ['bookings', 'list'],
  fetcher: async ({ city }) => {
    const res = await apiClient.get('/v1/bookings', { params: { city } });
    return validateResponse(apiBookingListSchema, res.data).items.map(toBooking);
  },
});
```

```ts
// src/api/bookings/useCreateBooking.ts
import { createMutation } from 'react-query-kit';
import { queryClient, apiClient } from '@/lib/api-client';
import { useListBookings } from './useListBookings';
// …
export const useCreateBooking = createMutation({
  mutationFn: async (input: CreateBookingInput) => { /* post + validate + toBooking */ },
  onSuccess: () => queryClient.invalidateQueries({ queryKey: useListBookings.getKey() }),
});
```

### A6.2.1 `lib/api-client/` — session refresh & React Query native wiring (locked mechanism)

Every app needs these, identically, and they are where RN apps most often break — so the template ships them as code in `lib/api-client/`, not as guidance. What varies per app is isolated to **one** file (`authRefresh.ts`).

```
lib/api-client/
├── client.ts            the axios instance + interceptors, registered in THIS order (order is load-bearing):
│                        request: attach access token (sync MMKV read; skipped when config.skipAuth)
│                        response 1: envelope unwrap        (fulfilled handler only)
│                        response 2: 401 → refresh + retry  (rejected handler only)
│                        response 3: error → ApiError       (rejected handler only; passes ApiError through)
├── session.ts           token read/write + the single-flight refresh + configureApiAuth()
├── authRefresh.ts       THE per-app file: requestTokenRefresh(refreshToken) → TokenPair
│                        (ships as a placeholder POST with // TODO(auth-protocol))
├── reactQueryNative.ts  setupReactQueryNative(): focusManager ↔ AppState, onlineManager ↔ expo-network
├── queryClient.ts       defaults (§A6.2 #11)
├── validateResponse.ts
├── types.ts             ApiError, TokenPair
└── index.ts             apiClient, queryClient, validateResponse, saveTokens, clearTokens,
                         configureApiAuth, setupReactQueryNative, ApiError, TokenPair
```

*Why the order:* the refresh handler must see the raw 401 (so it sits before normalization), and its retried request already went through the full chain — so no interceptor *after* it may have a fulfilled handler, or the envelope would be unwrapped twice.

**Session refresh — the locked behaviour:**
1. **Single-flight.** N concurrent requests that hit 401 trigger **one** refresh; all N await the same promise, then retry once with the new token. A request is retried at most once (`_retried`), so a 401 after refresh is a real 401.
2. **Excluded requests** pass `{ skipAuth: true }` (login, OTP, the refresh call itself) — no token attached, no refresh attempted.
3. **Refresh rejected by the server (4xx) or no refresh token stored** → tokens cleared, `onSessionExpired()` called **once**, every waiter rejects with `ApiError { code: 'SESSION_EXPIRED', status: 401 }`.
4. **Refresh failed on network / 5xx** → session is **kept**, the error propagates. Going offline must never log a user out.
5. **Token placement** stays per §A6.5: access → MMKV (sync, read on every request), refresh → `secureStorage`. Rotated refresh tokens are persisted when the server returns one.
6. **Crossing into app state without breaking §A3:** `lib/` cannot import `stores/`, so the app registers the callback at module load in `App.tsx` (§A13): `configureApiAuth({ onSessionExpired: () => useAuthStore.getState().signOut() })`. `authStore.signOut()` sets `status: 'unauthenticated'`, resets session-scoped stores, and calls `queryClient.clear()` — the previous user's cache never survives a sign-out.
7. **Login writes tokens via `saveTokens()`** in the login mutation's fetcher (`api/auth/`), then the screen data hook flips `authStore`. Nothing outside `lib/api-client` reads or writes tokens directly.

```ts
// src/lib/api-client/session.ts
import axios from 'axios';
import { secureStorage, SecureKey, storage } from '@/lib/storage';
import { requestTokenRefresh } from './authRefresh';
import type { ApiError, TokenPair } from './types';

const ACCESS_TOKEN_KEY = 'auth.accessToken';

type AuthConfig = { onSessionExpired: () => void };
let authConfig: AuthConfig = { onSessionExpired: () => {} };
let refreshInFlight: Promise<string> | null = null;

export function configureApiAuth(config: AuthConfig) {
  authConfig = config;
}

export function getAccessToken() {
  return storage.getString(ACCESS_TOKEN_KEY);
}

export async function saveTokens({ accessToken, refreshToken }: TokenPair) {
  storage.set(ACCESS_TOKEN_KEY, accessToken);
  if (refreshToken) await secureStorage.set(SecureKey.RefreshToken, refreshToken);
}

export async function clearTokens() {
  storage.delete(ACCESS_TOKEN_KEY);
  await secureStorage.remove(SecureKey.RefreshToken);
}

/** Single-flight: every concurrent caller awaits the same refresh. */
export function refreshAccessToken(): Promise<string> {
  refreshInFlight ??= runRefresh().finally(() => {
    refreshInFlight = null;
  });
  return refreshInFlight;
}

async function runRefresh(): Promise<string> {
  const refreshToken = await secureStorage.get(SecureKey.RefreshToken);
  if (!refreshToken) return expireSession();
  try {
    const pair = await requestTokenRefresh(refreshToken);
    await saveTokens(pair);
    return pair.accessToken;
  } catch (error) {
    const status = axios.isAxiosError(error) ? error.response?.status : undefined;
    if (status !== undefined && status >= 400 && status < 500) return expireSession();
    throw error; // network / 5xx: keep the session
  }
}

async function expireSession(): Promise<never> {
  await clearTokens();
  authConfig.onSessionExpired();
  const expired: ApiError = { code: 'SESSION_EXPIRED', message: 'Session expired', status: 401 };
  throw expired;
}
```

```ts
// src/lib/api-client/client.ts — the refresh interceptor (response 2 of 3)
declare module 'axios' {
  interface AxiosRequestConfig {
    skipAuth?: boolean;
    _retried?: boolean;
  }
}

apiClient.interceptors.response.use(undefined, async (error: AxiosError) => {
  const original = error.config;
  if (error.response?.status !== 401 || !original || original.skipAuth || original._retried) {
    throw error; // → response 3 normalizes it
  }
  original._retried = true;
  const token = await refreshAccessToken();
  original.headers.Authorization = `Bearer ${token}`;
  return apiClient(original);
});
```

**React Query ↔ React Native wiring (`reactQueryNative.ts`, called once at module load — §A13):** React Query's defaults assume a browser. Without these two bindings, "window focus" and "reconnect" never fire on a device.

```ts
// src/lib/api-client/reactQueryNative.ts
import { focusManager, onlineManager } from '@tanstack/react-query';
import * as Network from 'expo-network';
import { AppState } from 'react-native';

export function setupReactQueryNative() {
  focusManager.setEventListener((setFocused) => {
    const sub = AppState.addEventListener('change', (state) => setFocused(state === 'active'));
    return () => sub.remove();
  });
  onlineManager.setEventListener((setOnline) => {
    const sub = Network.addNetworkStateListener((state) => setOnline(!!state.isConnected));
    return () => sub.remove();
  });
}
```

With these bound: returning to the foreground refetches **stale** queries only (bounded by `staleTime`), reconnecting refetches what failed offline, and queries **pause** instead of burning retries while offline (`networkMode: 'online'`, the default).

### A6.3 `stores/<area>/` — client state (Zustand, locked usage rules)

```
stores/auth/
├── authStore.ts              one store per concern; multiple stores per area allowed
└── index.ts                  barrel
```

**The locked Zustand ruleset:**

1. **Shape:** `type <Name>State` (data) + `type <Name>Actions` (functions), combined in `create<State & Actions>()`. Actions are defined **inside** the store; components never call `setState` from outside.
2. **Selector-only consumption:** `useAuthStore((s) => s.status)`. Subscribing to the whole store (`useAuthStore()`) is forbidden (re-render storms). Multiple fields → multiple selectors or `useShallow`.
3. **Outside React** (api hooks, lib-adjacent spine code): `useAuthStore.getState()` is the only legal access.
4. **Persistence:** `persist` middleware with the MMKV storage adapter from `lib/storage` — never AsyncStorage, never hand-rolled hydration. Stores with persisted fields must declare `partialize` explicitly.
5. **Server data never enters a store.** If it came from the API, it lives in the React Query cache. Stores hold UI/session/client state only.
6. **Placement:** never in `lib/`, never at `stores/` root — always `stores/<area>/`.

### A6.4 `features/<name>/` — isolated features

```
features/kyc/
├── api/                      same shape as A6.2, scoped to the feature
├── components/
├── screens/                  same shape as A6.1
├── stores/                   same shape as A6.3 (if any)
├── hooks/                    (if any)
├── navigator.tsx             the feature's terminal navigator
├── types.ts
├── utils.ts                  (if any)
└── index.ts                  PUBLIC API — the only legal import surface
```

### A6.5 `lib/<slot>/` — adapter slots & concrete infra

Slots (`analytics/`, `crash/`, `push/`, `remoteConfig/`, `observability/`, `payment/`) each ship exactly three files: `index.ts` (public API re-exporting `./adapter`), `types.ts` (the adapter contract interface), `adapter.ts` (a **no-op implementation** satisfying the contract, with a README pointing to the recommended vendor and wiring steps). Swapping vendors = replacing one file. Concrete infra: `api-client/`, `logger/`, `storage/`, `toast/` (`showToast()` over react-native-flash-message's imperative `showMessage` — called from data hooks; `lib/toast` renders NOTHING and imports nothing from `components/`/`theme/` — the `<FlashMessage MessageComponent={ToastMessage} />` host is mounted in `providers/index.tsx`, the composition root), `i18n/`, `permissions/`, `env.ts` (@env shim). **No business semantics anywhere in `lib/` — ever.**

**`lib/storage/` (locked shape — the layered persistence pattern):**

```
lib/storage/
├── mmkv.ts             the single plain MMKV instance — THE app storage (sync, µs reads)
├── secure.ts           typed expo-secure-store wrapper: fixed key enum, ≤2KB guard,
│                       first-run wipe (iOS Keychain survives reinstall)
├── zustandAdapter.ts   persist() storage adapter over the MMKV instance
└── index.ts            exports: storage, secureStorage, zustandStorage
```

**Decision rule (robotic):** long-lived credential or cryptographic secret (refresh token, PIN, encryption key) → `secureStorage`. Everything else → `storage` (MMKV). Tokens: **refresh → secureStorage, access → MMKV** (short-lived; the axios interceptor reads it synchronously). New SecureStore keys go in the `secure.ts` enum — ad-hoc string keys are forbidden. Upgrade path if PII must persist encrypted at rest: the encrypted-MMKV `keyManager` pattern in this folder's README, gated by an ADR.

## A7. Theme & design system (locked taxonomy + the one styling pattern)

**Source of truth: the design team's Figma file.** Token *keys* below are fixed by this constitution; token *values* are supplied by design via Figma variables and synced by the `token-reconciler` agent. **Neither engineers nor AI ever invent a value.** If a Figma design uses a value with no matching token, the rule is: flag it to design, block on the answer — never hardcode the nearest-looking number.

```
src/theme/
├── tokens/                   PRIMITIVES — scheme-agnostic, INTERNAL to theme/ (nothing
│   │                         outside src/theme/ may import from here; ESLint-enforced)
│   ├── palette.ts            raw hex lives HERE and nowhere else. Names mirror Figma
│   │                         variables (blue500, gray100, …). Append-only.
│   ├── spacing.ts            Fixed keys: none, xxs, xs, sm, md, lg, xl, xxl, xxxl.
│   │                         Values from Figma's spacing scale (4-pt grid expected).
│   ├── typography.ts         Fixed variant keys: display, h1, h2, h3, bodyLg, body, bodySm,
│   │                         label, caption, button. Each: fontFamily, fontSize, lineHeight,
│   │                         fontWeight, letterSpacing — values from Figma text styles.
│   ├── radius.ts             Fixed keys: none, sm, md, lg, full.
│   └── shadows.ts            Fixed keys: none, sm, md, lg — platform-aware (elevation/shadow*).
├── themes/                   SKINS — the only place scheme-ness exists
│   ├── default.ts            the COMPLETE base ThemeSpec: colors.light + colors.dark
│   │                         (both mandatory for the base) + spacing/typography/radius/
│   │                         shadows composed from tokens. Semantic color keys (fixed,
│   │                         extending = ADR): background, surface, surfaceElevated,
│   │                         textPrimary, textSecondary, textDisabled, primary, onPrimary,
│   │                         secondary, onSecondary, error, onError, success, warning,
│   │                         info, border, divider, overlay.
│   ├── createTheme.ts        deep-merge factory: createTheme(base, DeepPartial<ThemeSpec>)
│   ├── <custom>.ts           e.g. festival.ts — createTheme(defaultTheme, overrides).
│   │                         May override ANY token group. Single-scheme skins assign one
│   │                         map to both schemes explicitly (the spec type always has both).
│   └── registry.ts           themes record + ThemeName union + DEFAULT_THEME
├── types.ts                  ThemeSpec (authoring shape), Theme (resolved, what
│                             createStyles receives), SemanticColors (the key contract)
├── ThemeProvider.tsx         provider + useTheme colocated; resolves
│                             registry[themeName] × colorScheme (system | user override),
│                             both persisted in stores/settings (themeName may be driven
│                             by lib/remoteConfig — remotely launched/killed skins)
├── useStyles.ts              the memoized createStyles consumer — useStyles(createStyles[, params]),
│                             re-runs on theme change or shallow params change (below)
├── navigationTheme.ts        Theme → React Navigation theme adapter (skins reach nav chrome)
├── index.ts                  the ONE public barrel
└── CLAUDE.md                 token + theme rules (Part B)
```

**Theme rules:** a theme = `createTheme(defaultTheme, overrides)` — only what changes is declared, everything else inherits. **Adding a theme touches exactly two files** (`themes/<name>.ts` + a registry line) and zero components — the payoff of semantic-only consumption. `default.ts` must define both schemes in full (the dark-mode mandate applies to the base); custom skins may be single-scheme by assigning one map to both. A full app redesign = new theme file flipped to `DEFAULT_THEME` (or token-value changes if the design language itself moves). Custom theme values come from Figma like all others — `token-reconciler` maintains `palette`/scales/`default.ts`; custom theme files cite their Figma source in a header comment.

**THE one legal styling pattern (absolute, everywhere in `src/`, no exceptions):**

```tsx
// any component or screen file
import { StyleSheet } from 'react-native';
import { useStyles, type Theme } from '@/theme';

export function BookingCard({ booking }: Props) {
  const styles = useStyles(createStyles);
  return <View style={styles.root}>…</View>;
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    root: {
      backgroundColor: theme.colors.surface,
      padding: theme.spacing.md,
      borderRadius: theme.radius.md,
    },
  });
```

- **Placement is deterministic by file type:** components define `createStyles` as the **last declaration in their own file**; screens define it in their folder's **`styles.ts`** (exporting `createStyles` and nothing else — §A6.1). `useStyles` (shipped in `theme/`) memoizes per theme either way.
- **Inline styles (`style={{…}}`) are banned in every file in `src/`** — not just `components/ui/`. Conditional styling = style arrays with booleans (`[styles.root, isActive && styles.active]`).
- **Runtime values (the sanctioned paths — there are exactly two):**
  1. **Params form** — for values known only at render time that are *not* animation frames: safe-area insets, measured layout, window dimensions, API-sourced colors (avatar/category tint). `createStyles(theme, params)` takes a typed second argument; the component calls `useStyles(createStyles, params)`. `useStyles` re-runs the factory only when `theme` changes or `params` changes by **shallow equality**, so pass a small flat object of primitives (never a whole entity). Params carry *runtime data*, never design constants — a number that could be a token must be a token.
     ```tsx
     const insets = useSafeAreaInsets();
     const styles = useStyles(createStyles, { top: insets.top, tint: category.color });
     // …
     type StyleParams = { top: number; tint: string };
     const createStyles = (theme: Theme, { top, tint }: StyleParams) =>
       StyleSheet.create({
         root: { paddingTop: top + theme.spacing.md, borderColor: tint },
       });
     ```
  2. **Reanimated** — `useAnimatedStyle()` results are legal as a style-array element: `style={[styles.card, animatedStyle]}`. The worklet may read `theme` values captured outside it; it must not introduce raw design constants.
  Nothing else is legal: no object literals in JSX, no `StyleSheet.flatten` hand-merging in the component body, no style objects built in render.
- Colors/spacing/typography/radius/shadows may **only** come from `theme`. No raw hex/rgb outside `palette.ts`, no off-scale numbers, no raw `fontSize`.
- Text renders **only** via `<Typography variant="…">` — never raw `<Text>` with font props.
- `components/ui/*` primitives are **atomic**: no business logic, no API calls, no store reads. Full contract in §A7.1.

### A7.1 `components/ui/` — the design-system layer (locked)

The **only** place raw building blocks (RN built-ins like `Pressable`/`TextInput` + locked-stack libs like `@gorhom/bottom-sheet`, FlashList, expo-image) get wrapped, token-bound, and variant-typed. Everything above this layer composes primitives — never the raw material. **Per-app customization happens through tokens, never structural edits**: the anatomy is identical across all apps; each app's Figma sync changes only `theme/tokens/` values. The base-library set is **closed** — wrapping a new third-party UI kit requires an ADR.

**Shipped inventory (the standard 13):**

```
components/ui/
├── Screen.tsx          safe-area + status bar + themed background — every screen's wrapper
├── Typography.tsx      the only legal text renderer (variant + semantic color props)
├── Icon.tsx            icon-set wrapper — token sizes, semantic colors
├── Button.tsx          variant: primary|secondary|ghost|danger; size: sm|md|lg; loading state
├── TextField.tsx       TextInput + label/error/helper, keyboard-controller aware
├── Checkbox.tsx
├── Switch.tsx
├── BottomSheet/        gorhom wrapper — token-themed handle/background/radius, fixed snap API
├── Divider.tsx
├── LoadingState.tsx    the 'loading' branch of every data screen
├── ErrorState.tsx      message + retry() — the 'error' branch
├── EmptyState.tsx      the 'empty' branch
├── ToastMessage.tsx    token-styled message renderer, mounted as the toast host in providers/
└── index.ts            the one curated barrel — every primitive is registered here
```

**The primitive contract (every primitive, no exceptions):**

1. Named export + exported `<Name>Props` type.
2. `variant` and `size` are the standardized prop names across ALL primitives, typed as token-derived unions — never free-form strings, never raw style values as props.
3. **Semantic tokens only** (`theme.colors.primary`, `theme.spacing.md`) via the theme object. `theme/tokens/*` is internal to `src/theme/` (palette is consumable only by theme files) — which makes every primitive correct under any skin and scheme by construction.
4. Accessibility defaults are built in (`accessibilityRole`, `accessibilityState`, 44pt touch targets) — screens inherit the §A10 a11y floor for free.
5. Text arrives **via props** — primitives never call `t()` (translation keys belong to screens/components above).
6. Primitives may compose other primitives (Button renders Typography); they import **only** from `theme/`, `utils/`, and sibling primitives — nothing above the ui layer.
7. **`style?: StyleProp<ViewStyle>` — layout-only escape hatch**, merged LAST onto the root. Legal: placement (`margin*`, `flex*`, `alignSelf`, `width`). Violation: any visual property (colors, padding, radius, typography) — that's what variants are for. `pr-reviewer` enforces; a color in a primitive's `style` prop is an unambiguous finding.
8. File shape: flat `<Name>.tsx` until a second file is genuinely needed, then `<Name>/` folder. `ui/index.ts` is the only import surface either way.
9. **No `Spacer`/`Box`/`Row`/`Stack` layout primitives** — sibling spacing uses `gap` in `createStyles`; style-prop-driven layout components would open a second styling channel that bypasses `createStyles` + ESLint.
10. Toast is imperative infra: `showToast()` lives in `lib/toast` (react-native-flash-message wrapper) and is called from **data hooks** — never from JSX; `ToastMessage.tsx` is its token-styled renderer, wired into the flash-message host inside `providers/index.tsx` (lib/ may never import ui/ — §A3).

## A8. Navigation (locked shape for the canonical app flow)

The canonical flow: **intro slider (first launch only) → login → multi-step registration** = unauthenticated; **everything after** = authenticated.

```
src/navigation/
├── RootNavigator.tsx         switches on EXACTLY three states from useAuthStore:
│                             'restoring' → splash | 'unauthenticated' → UnauthenticatedStack
│                             | 'authenticated' → AuthenticatedStack
├── unauthenticated/
│   ├── UnauthenticatedStack.tsx   routes: Intro, Login, + Registration Stack.Group (one route per step)
│   └── types.ts                   UnauthenticatedStackParamList
├── authenticated/
│   ├── AuthenticatedStack.tsx     BottomTabs + pushed screens + a Stack.Group for modals
│   ├── BottomTabsNavigator.tsx
│   └── types.ts                   AuthenticatedStackParamList, BottomTabsParamList
├── types.ts                  RootParamList composition + the global ReactNavigation declaration
├── navigationRef.ts          createNavigationContainerRef — the ONLY way to navigate outside React
├── linking.ts                deep-link config
└── README.md
```

**Hard rules:**
- The root switch is **dumb**: it reads only `authStore.status`. The intro slider is **not** a root state — it is the `initialRouteName` of `UnauthenticatedStack` when the persisted `hasSeenIntro` flag (authStore, MMKV) is false. Intro → Login is plain navigation: no remount, no flicker.
- Registration steps are a `Stack.Group` inside the unauthenticated stack — one route per step (`RegistrationName`, `RegistrationOtp`, …). Cross-step form state lives in `stores/registration/registrationStore.ts` and is **reset on completion or abandonment** — never passed as giant route params.
- Auth state hydrates from MMKV at module load (§A13), so the root switch renders correctly on first frame; `'restoring'` exists only for async migrations.
- Every navigator owns its `types.ts`; route params are always typed; `as never` casts are forbidden.
- Feature navigators (`features/<x>/navigator.tsx`) are mounted as single screens inside `AuthenticatedStack` — the spine never reaches into a feature's routes.
- Screens never import navigators. Navigation calls live in `use<Name>Screen.ts` via typed `useNavigation`.

## A9. State management summary

| Kind | Where | How |
|---|---|---|
| Server state | `api/<resource>/` (or `features/<x>/api/`) | React Query via react-query-kit (§A6.2) |
| Client/session state | `stores/<area>/` (or `features/<x>/stores/`) | Zustand (§A6.3) |
| Persistent client state | same stores | `persist` + MMKV adapter from `lib/storage` |
| Secrets (refresh token, PIN, crypto keys) | `lib/storage` `secureStorage` | expo-secure-store — async, ≤2KB, fixed key enum |
| Form state | inside the screen | react-hook-form + zodResolver; multi-step → area store |
| Theme prefs (`themeName`, `colorScheme`) + locale | `stores/settings/` | persisted Zustand; `themeName` may be remote-config driven |

Forbidden: Redux/Recoil/Jotai/MobX, raw Context for shared state, server data in Zustand, stores in `lib/`, stores at `stores/` root.

## A10. Micro-conventions (robotic defaults)

1. **Named exports only**; default exports forbidden (exception: config files that require them — `app.config.ts`, etc.).
2. **All user-facing strings via `t('area.scope.key')`** — no string literals in JSX. Keys live in `src/translations/<lang>.json`, namespaced per §A4.
3. **No `console.*`** in `src/` — use `lib/logger` (`logger.debug/info/warn/error`).
4. **`any` is forbidden** (`@typescript-eslint/no-explicit-any: error`). `@ts-ignore` forbidden; `@ts-expect-error` requires a trailing description.
5. **FlashList** for every scrollable data list; `FlatList` only with an ADR-level justification comment.
6. **expo-image** for every image; RN `Image` forbidden.
7. **Accessibility floor:** every `Pressable`/touchable sets `accessibilityRole`; non-obvious targets set `accessibilityLabel`; touch targets ≥ 44pt.
8. **Limits:** `max-lines-per-function: 120`; component files ≤ 250 lines (split into screen-private components past that); hooks files ≤ 150 lines.
9. **Analytics** only through `lib/analytics` (`trackEvent('booking_card_clicked', props)`); event names per §A4; no vendor SDK calls in feature code.
10. **Side effects** in screens live in the data hook, never in the component body.
11. **Comments** state non-obvious constraints only — no narration, no change-log comments.

## A11. Forbidden patterns (consolidated quick list)

- Inline styles anywhere in `src/` (the absolute rule)
- Raw hex/rgb outside `theme/tokens/palette.ts`; off-scale spacing; raw `fontSize`; raw `<Text>`
- Redux / Recoil / Jotai / MobX / shared-state Context
- Server data in Zustand; stores in `lib/`; stores at `stores/` root
- Raw `useQuery`/`useMutation` in screens (react-query-kit only); hand-written query-key arrays
- `Api*` wire types imported outside `src/api/**`; caching raw wire data or `{ raw, transformed }` pairs; per-hook envelope unwrapping or error digging (`error.response.data…`)
- Hand-rolled `{ loading, error, data }` wrappers around query hooks (return the kit object; screens map to `status`)
- axios imports outside `lib/api-client`
- Per-hook/per-screen 401 handling or token refresh; reading/writing tokens outside `lib/api-client` (use `saveTokens`/`clearTokens`); sign-out without `queryClient.clear()`
- Business code in `lib/`; React or side effects in `utils/`
- Layer-root / cascading / partial barrels; deep imports into `features/<x>/`
- Cross-feature imports (`features/a` → `features/b`)
- Default exports; `console.*`; `any`; `@ts-ignore`; hardcoded user-facing strings
- `FlatList` for data lists; RN `Image`; AsyncStorage
- Long-lived credentials in MMKV (refresh tokens → `secureStorage`); app state in SecureStore (≤2KB vault, not a database); ad-hoc SecureStore string keys (use the `secure.ts` enum)
- Visual properties through a primitive's `style` prop (variants are the visual API); `Spacer`/`Box`/`Row` layout primitives (use `gap`); `theme/tokens/*` imported outside `src/theme/`; new third-party UI kits without an ADR; `t()` inside `components/ui/`; `showToast` called from JSX (data hooks only)
- Theme files outside `themes/` (a skin = `themes/<name>.ts` via `createTheme` + one registry line); semantic color values hardcoded in a theme override instead of referencing `palette`
- Data fetching or store access inside `components/**`; navigation calls inside `<Screen>Screen.tsx`
- Nested provider wrappers outside `providers/index.tsx`
- Untyped route params / `as never` navigation casts
- New top-level `src/` folders, new token keys, or any rule bypass without an ADR

## A12. ESLint as architecture enforcement (full inventory)

Base: flat config, `eslint-config-expo`, React Compiler plugin, Prettier integration, `simple-import-sort/{imports,exports}`, `import/no-cycle` (maxDepth ∞), `max-lines-per-function: 120`.

**Stock rules in service of the constitution:** `import/no-default-export` (with config-file overrides) • `no-console` • `@typescript-eslint/no-explicit-any` • `@typescript-eslint/ban-ts-comment` (allow `ts-expect-error` with description) • `react-native/no-inline-styles: error` (global) • `i18next/no-literal-string` (JSX scope) • `no-restricted-imports` banning `axios` (outside `lib/api-client`), `react-native` `FlatList`/`Image` (suggest FlashList/expo-image), `@react-native-async-storage/*` • `no-restricted-syntax` (non-`src/api/**` files): `ImportSpecifier[imported.name=/^Api(?!Error$)[A-Z]/]` — wire types stay in the API layer. `ApiError` (the normalized error envelope from `lib/api-client`, §A6.2 #2) is app-facing by design and is the one exemption — screen data hooks and `ErrorState` consume it.

**`import/no-restricted-paths` zones** (the §A3 matrix): theme imports nothing from src • lib never imports spine/features/theme • components/** never import api/stores/screens • hooks never import api/stores/screens/components • stores never import screens/components/api • api never imports components/screens/stores • features never import other features or spine stores/screens • only barrels importable from features.

**Custom plugin `eslint-plugin-design-system`** (local workspace package, ships with the template):
- `design-system/no-raw-colors` — hex/rgb/hsl in style values → error, suggests nearest palette token
- `design-system/spacing-scale-only` — numeric padding/margin/gap/inset not in the spacing scale → error
- `design-system/typography-component-only` — `<Text fontSize|fontWeight|fontFamily>` → error, require `<Typography>`
- `design-system/styles-pattern` — every `StyleSheet.create` must sit inside a `createStyles(theme[, params])` factory (in-file tail for components, `styles.ts` for screens); styles defined anywhere else → error
- `design-system/tokens-only` — color/spacing/typography/radius/shadow constants imported from anywhere except `@/theme` → error
- `design-system/no-tokens-outside-theme` — importing anything from `theme/tokens/*` anywhere outside `src/theme/` → error (tokens are theme-internal; the theme object is the only consumption surface)
- `design-system/no-layer-root-barrels` — `index.ts` outside the §A5 whitelist → error

## A13. `App.tsx` bootstrap order (canonical)

**Module-load (before React renders):** first-run check → wipe SecureStore on fresh install (iOS Keychain persistence) → hydrate auth + settings stores from MMKV (sync) → `configureApiAuth({ onSessionExpired: () => useAuthStore.getState().signOut() })` → `setupReactQueryNative()` → resolve initial theme scheme → register OS-level notification handlers (Android channels + iOS VoIP) → init core analytics adapter.
**Component-mount (inside `App`):** load fonts → init crash adapter → init push adapter → load remote config → conditionally init observability (remote-config kill-switch) → request tracking permission → hide bootsplash → render `<Providers><RootNavigator/></Providers>`.
*Why this order:* side effects that must observe early app state (push, crash) come first; gated/optional services last so kill-switches work. Vendor calls live in `lib/<slot>/adapter.ts` — `App.tsx` only calls slot public APIs.

## A14. ADR process

Any deviation from Part A → `docs/adr/NNNN-<slug>.md` from the shipped template (context, decision, consequences, rule(s) overridden). The PR that deviates must link the ADR. AI agents must refuse to produce deviating code without being pointed at an approved ADR.

