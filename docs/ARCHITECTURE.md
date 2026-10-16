<!-- Exported from rn-template-constitution.md (Kagaz edition). The constitution is the source; regenerate, don't hand-edit. -->

# PART A — THE CONSTITUTION

Absolute rules. Part B ships them into Claude's context; ESLint and hooks enforce them mechanically. Any AI (or human) producing code in a project built from this template follows Part A without exception.

## A0. The locked stack

| Concern | Choice | Forbidden alternatives |
|---|---|---|
| Framework | Expo CNG (Prebuild) + Dev Client + EAS. **Expo SDK ≥ 55, React Native ≥ 0.83, React ≥ 19.2, react-native-svg ≥ 15.15** (Kagaz's floor) | Expo Go workflows, bare RN |
| Package manager | pnpm (enforced via `.npmrc` + preinstall) | npm, yarn, bun |
| Language | TypeScript strict | JS files in `src/` |
| **Design system** | **Kagaz**: `@lokal-app/kagaz-components` (shared components) + **exactly one** `@lokal-app/kagaz-brand-<brand>` (dostt, eaze, gaming, bhakti — brand values, fonts, and that brand's **brand-only components/icons** under `/components`, `/icons`, `/geometry`), from GitHub Packages (`@lokal-app` scope, `GITHUB_PACKAGES_TOKEN`) | Any other UI kit (Paper, Tamagui, gluestack, NativeBase, …), a hand-rolled design-system layer, a second brand package, importing Kagaz anywhere but the two gateways (`src/components/ui/` for components, `src/theme/` for tokens — §A7.8), restyling/forking Kagaz components in the gateway, building a brand-only component in the app |
| Design tokens | Kagaz `createTheme(brand, overrides)` built **once** in `src/theme/registry.ts`; read only via `useTokens()` / `useStyles()` from `@/theme` | Local token files, raw hex anywhere, importing `@lokal-app/kagaz-tokens` or a brand package's root entry outside `src/theme/` |
| Token lint | Default: `design-system/no-raw-style-values` (local, same value table as token-police). **Opt-in:** Kagaz's **token-police** (`@lokal-app/kagaz-token-police`) via `/enable-token-police`, pinned to the same Kagaz release (§A12) | No token-value lint at all; both tiers active at once; once opted in, disabling token-police or pinning it to a different Kagaz release |
| Styling | RN `StyleSheet` via the canonical `createStyles(tokens)` + `useStyles` pattern (§A7.3); Kagaz `Box`/`HStack`/`VStack`/`Text` props for token-valued layout and type | Inline styles (absolute ban), styled-components, NativeWind, Tamagui, Unistyles |
| Text | Kagaz `<Text variant color>` — the only text renderer | RN `<Text>` anywhere in `src/` |
| Fonts | The brand package's Expo config plugin embeds fonts at build time (`app.config.ts` `plugins`) | `expo-font` `useFonts`/`loadAsync` at runtime, bundling font files in `assets/` |
| Icons | Kagaz icons + app icons in `components/icons/` (react-native-svg, Kagaz `IconProps` contract, generated from Figma) | `@expo/vector-icons`, icon fonts, PNG icons |
| Navigation | `@react-navigation/native` + native-stack + bottom-tabs; chrome via `@lokal-app/kagaz-components/navigation` — `useTabBarOptions`/`tabItem` re-exported by `@/components/ui`, `adaptNavigationTheme` used only in `theme/navigationTheme.ts` | Expo Router, react-native-navigation, custom tab bars |
| Server state | TanStack Query v5 + `react-query-kit` | Raw axios in components, SWR, RTK Query |
| Client state | Zustand | Redux, Recoil, Jotai, MobX, raw Context for shared state |
| Persistence (app state) | Plain MMKV via `lib/storage` — the single app storage | AsyncStorage; SecureStore for app state |
| Persistence (secrets) | expo-secure-store via `lib/storage` `secureStorage` — long-lived credentials/crypto secrets only (≤2KB, async) | Secrets in MMKV; hand-rolled keychain access |
| HTTP | axios instance in `lib/api-client` | fetch calls scattered in code |
| Validation | zod (env, API wire schemas — non-production runtime parse (`APP_ENV` gate), forms) | yup, io-ts, hand-rolled |
| Forms | react-hook-form + `@hookform/resolvers` + zod | Formik, uncontrolled ad-hoc state |
| Lists | `@shopify/flash-list` for any scrollable data list | `FlatList`/`SectionList` for data lists |
| Images | `expo-image` | RN `Image` |
| i18n | i18next + react-i18next; ALL user-facing strings via `t()` | Hardcoded string literals in JSX |
| Dates | dayjs | moment, date-fns mixing |
| Logging | `lib/logger` | `console.*` in `src/` |
| Animations | react-native-reanimated; durations/easings from `tokens.motion.*` | Animated API for new code; raw ms/bezier literals |
| Error boundaries | react-error-boundary | hand-rolled |
| Network status | expo-network (only via `lib/api-client` `onlineManager` binding) | `@react-native-community/netinfo`, ad-hoc connectivity polling |
| Gestures | react-native-gesture-handler | RN responder system (`onResponder*`, `PanResponder`) for new code |
| Touchables | Kagaz `Pressable` (44pt/48dp target + a11y baseline built in) or a Kagaz button | RN `Pressable`/`Touchable*` in `src/` |
| System UI | `expo-system-ui` — **required only if the app offers the "follow system" setting** (`settings.colorScheme: 'system'`): on Android, `userInterfaceStyle: 'automatic'` is applied through it, and without it the app stays light and Kagaz's `followSystem` never sees dark mode. Not needed for `'brand'`, `'light'` or `'dark'` (Expo requirement, not Kagaz's). **Never installed by the bootstrap** — the developer adds it (`npx expo install expo-system-ui`) only when the app needs "follow system" | Offering "follow system" on Android without it |
| Safe area | react-native-safe-area-context (consumed via `shell/Screen` or `useStyles` params) | `SafeAreaView` from `react-native` |
| Keyboard | react-native-keyboard-controller (`KeyboardProvider` in providers, `KeyboardAwareScrollView` inside `shell/Screen`) — Kagaz inputs never move the screen (Kagaz ADR-0005) | `KeyboardAvoidingView`, hand-rolled keyboard offsets |
| Bottom sheets | @gorhom/bottom-sheet (only via `shell/BottomSheet`) | Modal-based hand-rolled sheets |
| Toast | react-native-flash-message (only via `lib/toast`; rendered by `shell/ToastMessage` with Kagaz `FloatingSnackbar`) | Other toast/snackbar libraries |
| Testing | **None for now (locked decision).** Adding any test framework requires an ADR. | — |

**Versions** are pinned by the template's `package.json` lockfile; upgrades are batch PRs, never drive-by bumps inside feature work. **Kagaz packages are pinned to an exact version** (no `^`): `@lokal-app/kagaz-components` and `@lokal-app/kagaz-tokens` are released together and must always be at the same version; the brand package is versioned on its own (pin the version whose `peerDependencies` accept the installed components/tokens); if the app has opted into token-police, `@lokal-app/kagaz-token-police` is pinned to the same Kagaz release as components (`pnpm kagaz:check` enforces these). Upgrading Kagaz is its own PR via `/kagaz-upgrade` (§B6).

## A1. Decision tree — where new code goes

```
Pure helper (no React, no side effects)?              → src/utils/
Cross-cutting infrastructure / integration?           → src/lib/
Isolated feature (passes 4-of-4 admission test)?      → src/features/<name>/
Otherwise (the common case)                           → spine:
                                                        src/api/<resource>/
                                                        src/components/<area>/  (or common/ or icons/)
                                                        src/screens/<area>/<screen>/
                                                        src/stores/<area>/
                                                        src/hooks/use<Name>.ts
A UI building block?  →  FIRST check Kagaz (§A7.4 ladder step 0): the shared library, THEN this app's
                         brand package (@lokal-app/kagaz-brand-<brand>/components). If either ships it,
                         import it — never re-create, wrap or re-export it. components/shell/ is CLOSED.
                         A component unique to the brand that Kagaz lacks → Kagaz gap (§A7.7): it belongs
                         in the brand package, never in this app.
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
│   ├── ui/                     THE Kagaz gateway: the ONLY place Kagaz components, primitives, icons,
│   │                           brand components and tab-bar helpers are imported; re-exported 1:1
│   │                           for the whole app (§A7.8)
│   ├── shell/                  app-shell primitives Kagaz deliberately leaves to the app —
│   │                           CLOSED list of 6, composed from Kagaz only (§A7.5)
│   ├── icons/                  app-specific icons (Kagaz IconProps contract, from Figma) + index.ts
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
├── theme/                      the app's Kagaz binding: brand, skins, registry, useStyles (§A7.2)
├── lib/                        INFRASTRUCTURE ONLY — no business code (§A6.5)
├── features/                   isolated features passing 4-of-4 (§A6.4)
├── utils/                      pure helpers — no React, no side effects
└── translations/               i18n JSON resources (en.json, hi.json, …)
```

**`components/ui/` is a gateway, not a design-system layer, and there is no `theme/tokens/`.** The design system lives in `node_modules/@lokal-app/kagaz-*`. The app touches it in exactly two places: `src/components/ui/` re-exports the Kagaz components it uses, `src/theme/` binds the brand's tokens. A Kagaz change is absorbed in those two folders and nowhere else. **Creating any new top-level `src/` folder requires an ADR.** No exceptions.

## A3. Dependency direction (one-way, no cycles)

```
theme/  ──────────────►  @lokal-app/kagaz-tokens, @lokal-app/kagaz-brand-<brand>, @lokal-app/kagaz-components
                         (theme/ is the ONLY place the tokens + brand packages may be imported); nothing from src/
utils/  ──────────────►  imports nothing from src/ except types
lib/    ──────────────►  may import utils/ types only; NEVER spine, features, theme, Kagaz
components/ui/ ───────►  @lokal-app/kagaz-components(/primitives,/navigation) + the brand's
                         /components /icons /geometry (+ theme/ for adapters) ONLY — THE component gateway
components/shell/ ────►  theme/ + utils/ + components/ui + the one locked-stack lib
                         each file wraps (safe-area-context, keyboard-controller, bottom-tabs
                         height context, @gorhom/bottom-sheet, react-native-flash-message) ONLY
components/icons/ ────►  react-native-svg + components/ui (IconProps type) ONLY
components/common|<area>/ ► ui/, shell/, icons/, theme/, utils/, hooks/
                         (NOT api/, NOT stores/, NOT screens/, NEVER a Kagaz package directly)
hooks/  ──────────────►  lib/, utils/, theme/ ONLY (NEVER api/, stores/, screens/, components/, Kagaz)
stores/ ──────────────►  lib/, utils/ (NEVER screens/, components/, api/, theme/, Kagaz)
api/    ──────────────►  lib/api-client, lib/, utils/ (NEVER components/, screens/, stores/, Kagaz)
screens/ ─────────────►  everything above (Kagaz only via components/ui) + features/<x> via barrel only
navigation/ ──────────►  screens/, features/ barrels, stores/ (auth + settings state), theme/,
                         components/ui (useTabBarOptions, tabItem, icons)
features/<x>/ ────────►  ui/, shell/, icons/, theme/, lib/, utils/, hooks/ — NEVER a Kagaz package
                         directly, NEVER another feature, NEVER spine stores/screens
providers/ ───────────►  anything (it is the composition root; mounts ThemeProvider from theme/)
```

**Kagaz import zones (ESLint-enforced, §A12):**
- `@lokal-app/kagaz-tokens` and the brand package's **root entry** `@lokal-app/kagaz-brand-<brand>` → **only `src/theme/**`** (and `app.config.ts` for the font plugin).
- The brand package's **subpaths** `@lokal-app/kagaz-brand-<brand>/components` (brand-only components), `/icons` (brand icons) and `/geometry` (layout numbers) → **only `src/components/ui/**`**. Only the app's own brand is installed, so another brand's subpath cannot resolve; `kagaz:check` also rejects it in source.
- `@lokal-app/kagaz-components` and its `/primitives` entry (components, primitives, icons, `useReduceMotion`, `useAnnounce`…) → **only `src/components/ui/**`** (component gateway) and `src/theme/**` (theme binding: `useTokens`, `useTheme`, `ThemeProvider`, `createTheme`, `defineThemeOverrides`, `KagazTokens`).
- `@lokal-app/kagaz-components/navigation` → `src/components/ui/navigation.ts` (`useTabBarOptions`, `tabItem`) and `src/theme/navigationTheme.ts` (`adaptNavigationTheme`) only.
- **Everyone else imports Kagaz components from `@/components/ui`** (screens, components/*, shell, icons, features, navigation) **and theme from `@/theme`** (`useTokens`, `useTheme`, `useStyles`, `Tokens`, and `ThemeProvider` — the latter only in `providers/index.tsx`); `createTheme`/`defineThemeOverrides` only in `theme/`.

Enforced by `import/no-restricted-paths` + `no-restricted-imports` + `design-system/no-foreign-tokens` (§A12). Components never fetch and never read stores directly — data enters components through props; screens (via their data hooks) are the only place server state, client state, and navigation meet.

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
| Icons | PascalCase + `Icon` suffix, one per file, Kagaz `IconProps` | `components/icons/RupeeIcon.tsx` |
| Skins (theme overrides) | kebab-case file, camelCase export | `theme/skins/festival.ts` → `festivalOverrides` |
| Other non-component files | camelCase | `transformer.ts`, `linking.ts` |
| Component exports | **Named exports only.** `export function BookingCard()`. Default exports forbidden (ESLint) except config files that require them. | |
| Component names | **Never equal to a Kagaz export** — shared (`Button`, `TextInput`, `Avatar`, `Text`, `Box`, …) or the brand's (`PlayCard`, `ProgressBar`, …) — ESLint `design-system/no-shadowed-kagaz-components` | `PrimaryCta` ✗ wraps Button → use `Button` from `@/components/ui` |
| Props types | Local `type Props = {…}`; export as `<Component>Props` only from `components/shell/` and `components/icons/` | |
| Style factories | `createStyles` (fixed name) taking `tokens: Tokens` | `const createStyles = (tokens: Tokens) => StyleSheet.create({…})` |
| Translation keys | `<area>.<screen-or-component>.<key>` | `auth.login.submitCta` |
| Analytics events | `snake_case`, `<area>_<object>_<action>` | `booking_card_clicked` |
| Zustand store names | `use<Name>Store` | `useRegistrationStore` |
| Top-level functions | Function declarations (`function x()`), not arrow consts | |

No `.ts`/`.tsx` files at the root of any layer folder except `src/hooks/` (§A1) and `src/App.tsx`.

## A5. Barrels — boundary only (locked; do not reopen)

A barrel (`index.ts` re-exporting siblings) exists **only** at a module boundary with a public-API purpose. **Complete whitelist:**

- `src/features/<name>/index.ts` — feature public API
- `src/lib/<slot>/index.ts` — adapter slot public API
- `src/theme/index.ts` — the app's theme surface (`useStyles`, `useTokens`, `useTheme`, `Tokens`, `themes`, …)
- `src/components/ui/index.ts` — **the Kagaz gateway**, the only barrel allowed to re-export Kagaz (§A7.8)
- `src/components/shell/index.ts` — the closed shell registry
- `src/components/icons/index.ts` — the app icon registry
- `src/screens/<area>/<screen>/index.ts` — screen public API (the navigator imports this)
- `src/stores/<area>/index.ts` — area store public API

**Forbidden:** layer-root barrels (`api/index.ts`, `screens/index.ts`, `stores/index.ts`, `hooks/index.ts`, `components/index.ts`), cascading/universal barrels, partial barrels (re-export everything or nothing), and **any barrel other than `components/ui/index.ts` that re-exports Kagaz components** (`theme/index.ts` re-exports only the theme hooks/types listed in §A7.2). *Bundle note:* the gateway adds no modules — the Kagaz entry is loaded whole either way (Metro doesn't tree-shake); it adds one indirection that makes every Kagaz change a one-folder change. Deep imports into `features/<name>/` internals are forbidden — only `@/features/<name>`.

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
├── styles.ts                    the screen's styles: exports createStyles(tokens) ONLY
├── constants.ts                 OPTIONAL — screen-local config (snap points, sizes, …)
├── components/                  OPTIONAL — components used by THIS screen only
│   └── StateSheetContent.tsx    (each with its own in-file createStyles tail)
├── variants/                    OPTIONAL — A/B experiment variants (see rules below)
│   ├── LoginControl.tsx
│   └── LoginRedesign.tsx
└── index.ts                     barrel: export { BillingAddressScreen }
```

**Hard rules:**
- `<Name>Screen.tsx` contains **exactly one component** (the screen) and **zero** data logic: no `useQuery`/`useMutation`, no store access, no axios, no navigation calls, no analytics calls. It consumes `use<Name>Screen()` and renders. Any other JSX component → `components/`. ≤ 250 lines (the `.tsx` limit).
- `use<Name>Screen.ts` is the **only** place server state, client state, navigation, and tracking meet for the screen. Navigation via typed `useNavigation` inside the hook — screens never take a `navigation` prop. It returns a single object; for data screens it must expose `status: 'loading' | 'error' | 'empty' | 'ready'` plus `retry()` — and the screen renders ONE wrapper (`<Screen>` from `components/shell`) and branches only the body on **all four** states using `LoadingState` / `ErrorState` / `EmptyState` from `components/shell`. Never duplicate the layout tree per state.
- **The screen's UI is Kagaz:** inputs, buttons, chips, toggles, avatars, snackbars, etc. are imported from `@/components/ui` (the Kagaz gateway, §A7.8) and configured by props. Text is Kagaz `<Text variant color>`. Token-valued layout uses `VStack`/`HStack`/`Box` props; everything else is `createStyles(tokens)` in `styles.ts` (§A7.3).
- **`styles.ts`** exports `createStyles(tokens)` and **nothing else** — constants belong in `constants.ts`, never in `styles.ts`. Consumed via `const styles = useStyles(createStyles)` in the screen. (Components keep the in-file tail per §A7.3 — the split is by file type, fully deterministic.)
- **`useTrack.ts`** (when the screen has ≥ 2 analytics events; below that, call `lib/analytics` from the data hook directly): a thin wrapper over `lib/analytics` — defines the screen's base payload once, exposes `track<Event>()` functions, holds no state and no business logic, and is called **only from the data hook / its handlers**, never from JSX.
- **`variants/` (A/B experiments):** variants are presentation-only components sharing **one** data hook, **one** route, **one** `useTrack` (variant name passed as an event property). `<Name>Screen.tsx` becomes the switcher: reads the experiment flag (exposed by the data hook from `lib/remoteConfig`) and renders the active variant. Killing the loser = delete one file + one switch line — no navigator surgery. Sibling `-v2` screen folders are forbidden.
- **Component placement ladder (robotic, §A7.4):** Kagaz ships it → import Kagaz; used by 1 screen → `screens/<area>/<screen>/components/`; used by ≥2 screens in one area → `components/<area>/`; used across areas and carries business meaning → `components/common/`; an app shell primitive Kagaz doesn't ship → `components/shell/` (closed list, ADR to extend). Promotion is a move in the same PR that creates the second consumer — never a copy.
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

## A7. Design system — Kagaz (locked: the binding, the vocabulary, the one styling pattern)

**Source of truth: Kagaz.** Kagaz (`github.com/lokal-app/kagaz`, Storybook: `https://kagaz-storybook.internal.getlokalapp.com/`) is the org's design system, generated from the Kagaz Figma files (Core Components file key `SiZy9MpCZuqzJs1yiU8vRh`). It owns **every** token value, every shared component, every brand-only component (in the brand packages, ADR-0007), the brand fonts and the navigation chrome. An app built from this template **consumes** Kagaz; it never defines tokens, never re-implements a Kagaz component, never wraps or re-exports one, and never patches the package. **Neither engineers nor AI ever invent a value.** If a design needs a value or component Kagaz doesn't have, the rule is the **Kagaz gap protocol** (§A7.7) — never hardcode the nearest-looking number, never build a local look-alike.

How Kagaz is layered (for orientation — apps touch only the top row):

| Layer | Package | What the app does with it |
|---|---|---|
| Components, primitives, icons, `ThemeProvider`, `useTokens`, navigation helpers | `@lokal-app/kagaz-components` (+ `/primitives`, `/navigation` entry points) | Re-exported **only** by `src/components/ui/` (components, primitives, icons, tab helpers) and `src/theme/` (theme hooks, `ThemeProvider`, `createTheme`); the rest of the app imports `@/components/ui` and `@/theme` |
| Brand values + fonts + Expo font plugin + the brand's component tokens (`components(tokens)`, hand-kept in the brand package) | `@lokal-app/kagaz-brand-<brand>` root entry (dostt · eaze · gaming · bhakti) | Imported **once** in `src/theme/brand.ts`; listed **once** in `app.config.ts` `plugins` |
| **Brand-only components**, brand icons, brand layout numbers | `@lokal-app/kagaz-brand-<brand>/components`, `/icons`, `/geometry` (only the subpaths that brand ships — e.g. Gaming: all three; Dostt: `/icons`) | Re-exported by `src/components/ui/brand.ts`; the app imports them from `@/components/ui` like shared ones (§A7.6, §A7.8) |
| Token lint (optional) | `@lokal-app/kagaz-token-police` (ESLint plugin) | Off by default; enabled on request with `/enable-token-police` (§A12) |
| Brand contract, `SemanticTokens`, `createTheme`, `semanticMap` | `@lokal-app/kagaz-tokens` (a dependency of components) | Never imported by the app (types come re-exported from components) |
| Primitives (`_root`) and brand palettes | inside Kagaz | Not exposed. Unreachable by design |

### A7.1 The token vocabulary (fixed by Kagaz, read-only for the app)

Components and screens read the **resolved semantic layer** for the active brand + mode through `useTokens()` (type `Tokens` = Kagaz `KagazTokens`). The key sets below are Kagaz's public API; they change only through a Kagaz release (`/kagaz-upgrade`). The app may not add keys.

| Group | Keys (exact) | Use for |
|---|---|---|
| `color.surface.*` | `page.{default,black,white}` · `primary`/`accent01`(/`accent02..04`?)`.moderate.{default,defaultOpacity,pressed,disabled}` + `.subtle.{default,pressed,disabled}` · `success`/`warning`/`error`.`{subtle,moderate,dark}.{default,pressed,disabled}` · `info.{moderate,subtle}.{…}` · `alpha.{default,inverse}.{subtle,default,pressed}` · `neutral.{subtle,muted,moderate,strong,strongest,intense,intenseOpacity,inverse,disabled}` · `overlay.scrim` | `backgroundColor` |
| `color.text.*` | `primary`/`accent01..04`/`success`/`warning`/`error`/`info`.`{default,pressed,disabled}` · `neutral.{subtle…intense,inverse,disabled}` · `alpha.{subtle,default,strong}` · `static.{white,black}` · `onAccent.{default,disabled}` | text colour (via `<Text color>`) |
| `color.icon.*` | same intents as text · `neutral.*` · `static.*` · `alpha.{subtle,default}` · `onAccent.default` | icon `color` |
| `color.border.*` | intents `.{default,pressed,disabled}` · `neutral.*` · `alpha.{subtle,default,strong}` | `borderColor` |
| `color.highlighter`? | single colour (brand-optional) | highlight marks |
| `spacing` | `0 · 2 · 4 · 8 · 12 · 16 · 20 · 24 · 32 · 48 · 64 · 96 · 128 · 256` (numeric keys: `tokens.spacing[16]`) | padding, margin, gap, insets |
| `cornerRadius` | `sharp · xSmall · small · medium · big · xBig · large · xLarge · xxLarge · rounded` | `borderRadius` |
| `borderWidth` | `none · thinner · thin · thick · thicker` | `borderWidth` |
| `iconSize` | `xSmall · small · medium · large · xLarge · 2xLarge` | icon `size` |
| `controlHeight` / `controlWidth` | `xsmall · small · medium · large` / `min · max` | control-sized boxes |
| `touchTarget` | `ios (44) · android (48)` | hit areas (Kagaz `Pressable` applies it for you) |
| `opacity` | `disabled` | the only legal non-0/1 opacity |
| `motion` | `duration.{fast,normal,slow}` (ms) · `easing.{standard,emphasized}` (cubic-bezier tuple) | every animation |
| `elevation` | `1` (a complete RN `boxShadow` string) | the shared shadow; for a raised **card/box** prefer the brand-following `tokens.component.card.elevation` (below) |
| `blur` | `bottomNav · timerChip` | blur radius (Kagaz uses them internally) |
| `effects`? | `buttonInnerShadow?` (bhakti) · `buttonElevation?` (gaming, fed into its card tokens) · `progress{BaseFilled,PillarFilled,DefaultBase,DefaultPillar}Shadow?` (gaming) | brand-only — consumed by Kagaz/brand components; app code needs them only through component tokens |
| `typography` | `headings.{h1,h2,h3}` · `titles.{title1..title5}` · `body.{body1,body1P,body2,body2P,body3,body3P}` · `labels.{label1,label1P,label2,label2P,label3,label3P,label4,label4P}` · `caption.{caption1,caption2}` | text, via `<Text variant="label1P">` — the **short Figma name** (unique across groups) |
| `component` | `card.{elevation,elevationSmall,elevationSelected}` · `button.{shadow,innerShadow}` · `iconButton.innerShadow` · `chip.{default,selected}` · `languageSelector.{default,selected}` · `coinChip.*` · `tag.{success,warning,error}` · `snackbar.{info,success,warning,error}` · `bottomNav.*` (incl. `labelTypography`) | Looks that differ **by brand** without code. Resolution order: Kagaz defaults → the brand's `components(tokens)` → the app's `createTheme` `components` override. App compositions that raise a surface read `tokens.component.card.elevation` (`null` = flat), so they follow the brand. Values may be `null` (= none) — guard them |

**Figma → code name rule (mechanical):** split the Figma variable name on `/`, camelCase each segment, drop the collection: `text/on-accent/default` → `tokens.color.text.onAccent.default`; `surface/neutral/intense-opacity` → `tokens.color.surface.neutral.intenseOpacity`; `spacing/16` → `tokens.spacing[16]`; `cornerRadius/Medium` → `tokens.cornerRadius.medium`; text style `Labels/Label 1 (P)` → `variant="label1P"` (`<Text>` takes the short name; `tokens.typography.labels.label1P` is the object path); effect style `Elevation-01` → `tokens.elevation[1]`. A Figma node bound to a `_root` or `brand` variable (not a semantic one) is a **design bug** — report it, never read a primitive.

**Brand-optional tokens:** `accent02`, `accent03`, `accent04`, `highlighter` and `effects.*` are absent for some brands (dostt/eaze lack accent02–04 + highlighter; bhakti lacks accent02–04). They are typed optional: read them with `?.` and a semantic fallback, never with `!`. `accent01` exists for every brand. Brand colours with no semantic token (e.g. Gaming's `accent05`) are **brand-component internals** — app code never reads `useTheme().brand.color.*`; if a screen needs one, that is a Kagaz gap (a semantic or component token), §A7.7.

**Both modes always exist:** `createTheme` resolves light **and** dark for every brand. Every screen must look right in both; nothing in `src/` branches on brand id or mode to pick colours (the token already did).

### A7.2 `src/theme/` — the app's Kagaz binding (locked shape)

```
src/theme/
├── brand.ts              THE one brand import, set at bootstrap:
│                         export { default as brand } from '@lokal-app/kagaz-brand-<brand>';
├── overrides.ts          app-wide createTheme overrides (defineThemeOverrides) — ships EMPTY ({}).
│                         Every entry cites its Figma node + design sign-off in a comment.
├── skins/                OPTIONAL named skins (e.g. festival.ts): defineThemeOverrides(...) layered
│   └── <name>.ts         on top of overrides.ts. Header comment cites the Figma source.
├── mergeOverrides.ts     deep-merge for ThemeOverrides (overrides.ts ⊕ skin) — theme-internal
├── registry.ts           themes record built ONCE at module scope:
│                         { default: createTheme(brand, overrides), <skin>: createTheme(brand,
│                         mergeOverrides(overrides, <skin>Overrides)) } + ThemeName + DEFAULT_THEME
├── navigationTheme.ts    adaptNavigationTheme(themes[name], { light: DefaultTheme, dark: DarkTheme })
│                         per ThemeName, built once at module scope
├── useStyles.ts          useStyles(createStyles[, params]) — memoized over useTokens()
├── index.ts              the ONE public surface (below)
└── CLAUDE.md
```

**`index.ts` exports exactly:** `useTokens`, `useTheme` (re-exported from Kagaz), `useStyles`, `type Tokens` (= `KagazTokens`), `type Mode`, `themes`, `type ThemeName`, `DEFAULT_THEME`, `navigationThemes`, `brand`, and `ThemeProvider` (re-exported from Kagaz; usable only in `providers/index.tsx`). Nothing else. Kagaz components are **not** re-exported here — they come from the component gateway `@/components/ui` (§A7.8).

**Theme rules:**
1. **Exactly one brand per app.** `brand.ts` is the only file importing the root entry `@lokal-app/kagaz-brand-<brand>` (its `/components`, `/icons` and `/geometry` subpaths are re-exported by `components/ui/brand.ts`, §A7.8), and `app.config.ts` lists the same package as a plugin. `pnpm kagaz:check` fails if they disagree or if a second brand package is installed.
2. **`createTheme` runs only in `registry.ts`, at module scope** — never inside a component (it validates the brand and throws loudly on a bad override; that must happen at import time).
3. **Override levels, in order of preference** (Kagaz Theming guide): `brand` (a brand value — every derived token follows in both modes) → `tokens.{light,dark}` (one semantic token, per mode) → `components` (component tokens: `card`, `button`, `iconButton`, `chip`, `languageSelector`, `coinChip`, `tag`, `snackbar`, `bottomNav` — applied over the brand's own `components(tokens)`; `createTheme` rejects unknown paths **and wrong value types**, naming the path). Overrides are the **only** place raw hex may appear in `src/`, each value must come from the app's Figma with design sign-off cited in a comment, and an override needed by more than one app is a Kagaz change, not an override (§A7.7).
4. **Skins** (`skins/<name>.ts`) = a named override set layered on the app overrides. Adding a skin touches exactly two files (`skins/<name>.ts` + one `registry.ts` line) and **zero** components. Active skin = `stores/settings` `themeName` (may be driven by `lib/remoteConfig` — remotely launched/killed skins). Unknown names fall back to `DEFAULT_THEME`.
5. **Mode:** `stores/settings` `colorScheme: 'brand' | 'system' | 'light' | 'dark'` (default `'brand'` = the brand's `defaultMode`, decided by design). `providers/index.tsx` maps it onto Kagaz `ThemeProvider`: `'system'` → `followSystem`, `'light'|'dark'` → `mode`, `'brand'` → neither. `app.config.ts` sets `userInterfaceStyle: 'automatic'`. The `'system'` option works on Android only once the developer has installed `expo-system-ui` (§A0) — add it when the app first offers "follow system".
6. **Navigation chrome follows the theme:** `navigationTheme.ts` is the only use of `adaptNavigationTheme`; `RootNavigator` picks `navigationThemes[themeName][mode]` (§A8).
7. `theme/` imports **nothing** from `src/` and is the only folder allowed to import `@lokal-app/kagaz-tokens` / the brand package's root entry.
8. **The brand's component tokens are Kagaz's, not the app's.** A brand ships them hand-kept in its package (`BrandInput.components`, Kagaz ADR-0001 note). The app never re-creates them; it only overrides individual paths through `overrides.ts` `components`, with the same citation rule as any override.

**`useStyles.ts` (ships verbatim):**
```ts
import { useMemo, useState } from 'react';
import { useTokens, type KagazTokens } from '@lokal-app/kagaz-components';

type StyleParams = Record<string, string | number | boolean | undefined>;

/**
 * The memoized createStyles consumer. Re-runs the factory only when the tokens (brand/skin/mode)
 * change or `params` changes by shallow equality. `factory` must be module-scoped (stable).
 */
export function useStyles<S>(factory: (tokens: KagazTokens) => S): S;
export function useStyles<S, P extends StyleParams>(
  factory: (tokens: KagazTokens, params: P) => S,
  params: P,
): S;
export function useStyles<S, P extends StyleParams>(
  factory: (tokens: KagazTokens, params?: P) => S,
  params?: P,
): S {
  const tokens = useTokens();
  const stableParams = useShallowStable(params);
  return useMemo(() => factory(tokens, stableParams), [factory, tokens, stableParams]);
}

function useShallowStable<P extends StyleParams | undefined>(value: P): P {
  const [stable, setStable] = useState(value);
  if (!shallowEqual(stable, value)) {
    setStable(value);
    return value;
  }
  return stable;
}

function shallowEqual(a: StyleParams | undefined, b: StyleParams | undefined): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  const keys = Object.keys(a);
  return keys.length === Object.keys(b).length && keys.every((k) => a[k] === b[k]);
}
```

### A7.3 THE styling pattern (absolute, everywhere in `src/`, no exceptions)

Three channels exist. There is no fourth.

1. **Kagaz component props** — the visual API of every Kagaz component (`variant`, `fill`, `size`, `state`, `error`, `disabled`, `loading`, icon slots…). A component's look is changed **only** through its props or the theme — never through its `style`.
2. **Kagaz primitive props** — token-*named* layout and type: `<VStack gap={16} padding={16} background="surface.page.default" radius="big">`, `<Text variant="title3" color="text.neutral.intense">`. These are typed to token keys, so an off-scale value does not compile. **Prefer this channel** for spacing, background, border, radius and all text.
3. **`createStyles(tokens)` + `useStyles`** — for everything the props can't express (flex, size, position, elevation, borders on RN views, animated containers):

```tsx
// any component (in-file tail) or screen (styles.ts)
import { StyleSheet } from 'react-native';
import { Text, VStack } from '@/components/ui';
import { useStyles, type Tokens } from '@/theme';

export function BookingCard({ booking }: Props) {
  const styles = useStyles(createStyles);
  return (
    <VStack gap={12} padding={16} radius="big" background="surface.neutral.subtle" style={styles.root}>
      <Text variant="title4" color="text.neutral.intense">{booking.vendorName}</Text>
    </VStack>
  );
}

const createStyles = (tokens: Tokens) =>
  StyleSheet.create({
    root: { minHeight: tokens.controlHeight.large, boxShadow: tokens.component.card.elevation ?? undefined },
  });
```

- **Placement is deterministic by file type:** components define `createStyles` as the **last declaration in their own file**, at module scope; screens define it in their folder's **`styles.ts`** (exporting `createStyles` and nothing else — §A6.1).
- **Inline styles (`style={{…}}`) are banned in every file in `src/`.** Conditional styling = style arrays with booleans (`[styles.root, isActive && styles.active]`).
- **`style` on a Kagaz component or primitive is layout-only** (margin, flex, alignSelf, width/height, position) — Kagaz's own contract ("Change its look through the theme, not here"). `Box`/`HStack`/`VStack` enforce it in their types (`BoxLayoutStyle` omits visual keys). Kagaz's `Text` `style` accepts any `TextStyle` (Kagaz loosened it in `1.0.0-next.2`) — **this template does not**: on `Text`, `style` may add only layout and `textAlign`/`textAlignVertical`/`writingDirection`; type and colour come from `variant`/`color`. ESLint enforces both (`design-system/kagaz-style-layout-only`, for every element imported from `@lokal-app/kagaz-components` or a brand `/components`). A colour, padding, radius, border or font in a Kagaz element's `style` is an unambiguous finding. Raised looks: Kagaz components that can be raised (`Button`, `Chip`, `LanguageSelector`, `CoinChip`) follow the brand's elevation; `elevated={false}` is the per-use opt-out — never a shadow in `style`.
- **Every value in the token categories comes from `tokens`:** colour (any `*Color`), spacing (`padding*`/`margin*`/`gap*`), radius, border width, font size/line height/letter spacing/family/weight, opacity (other than 0/1), shadow/elevation, animation duration/easing. No literals — not even "just 4". This is enforced by `design-system/no-raw-style-values` (default) or, if the app opted in, by **Kagaz's own token-police** (`token-police/no-hardcoded-style-value`, same value table), plus `design-system/no-raw-motion` for animation literals (§A12).
- **Content dimensions** (an image's aspect box, a hero height, a fixed card width from Figma) are not tokenized in Kagaz: they go in the screen's `constants.ts` (or a named module-level constant in a component) with a comment citing the Figma node — never inline magic numbers. If the value is a control height/width, use `controlHeight`/`controlWidth`.
- **Runtime values (the sanctioned paths — there are exactly two):**
  1. **Params form** — for values known only at render time that are *not* animation frames: safe-area insets, measured layout, window dimensions, API-sourced colours (avatar/category tint). `createStyles(tokens, params)` takes a typed second argument; the component calls `useStyles(createStyles, params)`. Pass a small flat object of primitives (never a whole entity). Params carry *runtime data*, never design constants — a number that could be a token must be a token.
     ```tsx
     const insets = useSafeAreaInsets();
     const styles = useStyles(createStyles, { top: insets.top, tint: category.color });
     // …
     type StyleParams = { top: number; tint: string };
     const createStyles = (tokens: Tokens, { top, tint }: StyleParams) =>
       StyleSheet.create({
         root: { paddingTop: top + tokens.spacing[16], borderColor: tint },
       });
     ```
  2. **Reanimated** — `useAnimatedStyle()` results are legal as a style-array element: `style={[styles.card, animatedStyle]}`. Durations and easings come from `tokens.motion.*` (`Easing.bezier(...tokens.motion.easing.standard)`), captured outside the worklet; respect `useReduceMotion()` from Kagaz.
  Nothing else is legal: no object literals in JSX, no `StyleSheet.flatten` hand-merging in the component body, no style objects built in render.
- **Text renders only via Kagaz `<Text variant color>`.** RN `Text` is banned in `src/` (Kagaz components render their own text). Never re-create a text style from `tokens.typography.*` on an RN `Text`.
- **Touchables:** Kagaz buttons (`Button`, `IconButton`, `TimerButton`, `Chip`, …) first; for a custom pressable surface, Kagaz `Pressable` (role `button` + 44pt/48dp hit area + `aria-disabled` built in). RN `Pressable`/`Touchable*` are banned in `src/`.
- **Disabled/pressed looks** use each role's own `…pressed` / `…disabled` tokens (they already carry Figma's per-mode opacity) — never stack an extra `opacity` on top; `tokens.opacity.disabled` only where Figma dims a whole layer.

### A7.4 Component placement ladder (robotic — step 0 is Kagaz)

```
0a. Does shared Kagaz ship it (§A7.6)?   → import it from @/components/ui (register it in
                                             ui/kagaz.ts first if it isn't yet). STOP.
0b. Does THIS app's brand ship it?        → import it from @/components/ui (register it in
    (§A7.6 brand-only components)            ui/brand.ts first if it isn't yet). STOP.
    (either way: configure via props; a missing variant/state/prop is a Kagaz gap — §A7.7)
0c. Is it a brand-unique design-system    → NOT app code: a Kagaz gap for the brand package
    component (lives in the brand's Figma    (§A7.7). Temporary KAGAZ-GAP composition only if
    file, reusable by any app of the brand)? approved.
1. App-shell piece Kagaz leaves to apps?  → components/shell/ (CLOSED list of 6, §A7.5)
2. An icon Kagaz doesn't ship?            → components/icons/<Name>Icon.tsx (§A7.6)
3. Used by exactly one screen             → screens/<area>/<screen>/components/
4. Used by ≥2 screens of one area         → components/<area>/
5. Cross-area, carries business meaning   → components/common/
```

Every component on rungs 3–5 is a **composition of Kagaz** (components + primitives + `createStyles(tokens)`) carrying business meaning — a `BookingCard`, an `OrderSummary`. A component that is "a Kagaz component with different defaults/colours/padding" is forbidden: that is a wrapper (use the Kagaz component with props) or a gap (§A7.7). Component names must never equal a Kagaz export, shared or brand (`design-system/no-shadowed-kagaz-components`). **Brand-only vs app-specific:** a component that the brand's design-system Figma file defines (e.g. Gaming's `PlayCard`, `Pipe`, `ProgressBar`) belongs to `@lokal-app/kagaz-brand-<brand>/components` so every app of that brand shares one implementation; a component that only *this app's* screens define, carrying this app's business meaning, belongs on rungs 3–5. When unsure, it is the brand's — ask on the Kagaz issue. Promotion between rungs 3–5 is a move in the same PR that creates the second consumer — never a copy.

### A7.5 `components/shell/` — the closed app-shell list (Kagaz deliberately doesn't ship these)

Kagaz has no navigation, keyboard, sheet or toast dependency by design (Kagaz ADR-0004/0005). The app shell owns those six pieces, built **only** from Kagaz components/primitives + `createStyles(tokens)`:

```
components/shell/
├── Screen.tsx        every screen's wrapper: safe-area insets (params form), page background
│                     surface.page.default, StatusBar style from useTheme().mode, optional
│                     `scroll` → KeyboardAwareScrollView (bottomOffset tokens.spacing[48]),
│                     content padding/gap from tokens (props: padding?: Space, gap?: Space).
│                     (The Kagaz tab bar is solid and takes its own space — no tab-bar inset.)
├── LoadingState.tsx  the 'loading' branch: Kagaz Spinner (icon.neutral.strong, iconSize.xLarge),
│                     centred; aria-busy
├── ErrorState.tsx    the 'error' branch: Text (variant title4 / body2) + Kagaz Button
│                     (variant="outlined") calling onRetry. Props: title, message, retryLabel, onRetry
├── EmptyState.tsx    the 'empty' branch: optional icon (IconSlot, iconSize.2xLarge, icon.neutral.strong),
│                     title, message, optional action (label + onPress → Kagaz Button)
├── BottomSheet/      @gorhom/bottom-sheet wrapper: background surface.page.default, top radius
│   ├── BottomSheet.tsx  cornerRadius.xLarge, handle surface.neutral.strong, backdrop
│   └── index.ts?        surface.overlay.scrim, fixed snap API (snapPoints from the caller's constants.ts)
├── ToastMessage.tsx  the react-native-flash-message renderer: maps the message type
│                     (info|success|warning|danger→error) onto Kagaz FloatingSnackbar
│                     (optional `action={{ label, onPress }}` from the toast options)
└── index.ts          the one curated barrel — exactly these six
```

**Shell contract (every file, no exceptions):** named export + exported `<Name>Props`; text arrives **via props** (shell never calls `t()` — the data hook passes translated strings); imports only `theme/`, `utils/`, `@/components/ui` and the locked-stack lib it wraps (never a brand-only component — the shell is brand-neutral); no business logic, no API, no stores, no navigation; `style?: StyleProp<ViewStyle>` layout-only, merged last. **The list is closed:** a seventh file in `components/shell/` fails `design-system/locked-folders` — extending it requires an ADR, and the ADR must first show Kagaz won't own it.

### A7.6 The Kagaz inventory (what step 0 checks — as of `@lokal-app/kagaz-components@1.0.0-next.2`)

**KAGAZ_BASELINE = `1.0.0-next.2`** — the Kagaz release this constitution was verified against. The tables below are a *snapshot*: a new app is always bootstrapped on the **newest** Kagaz release, and Part D Phase 4b regenerates this section, the component map, the export list and the i18n list from the version actually installed, recording the result in the app's `docs/ARCHITECTURE.md` and `docs/DESIGN_SYSTEM.md`. The rules (Part A/B) do not change with Kagaz releases — the Kagaz maintainers guarantee that patterns, token layering and architecture are stable — and the bootstrap proves it on every run (§D Phase 4b step 3).

Authoritative props: the JSDoc in `node_modules/@lokal-app/kagaz-components/src/<Name>/<Name>.types.ts` (brand-only: `node_modules/@lokal-app/kagaz-brand-<brand>/src/components/<Name>/<Name>.types.ts`) and Storybook. `/kagaz-upgrade` refreshes this section.

**Shared components — `@lokal-app/kagaz-components`** (every brand):

| Kagaz export | Figma set (Core Components) | Key props (all controlled) |
|---|---|---|
| `Button` | Button `620:44746` | `label`, `variant` filled·outlined·text-only, `fill` accent-filled·inverse-filled·transparent, `size` xs·sm·md·lg, `loading`, `disabled`, `leadingIcon`/`trailingIcon`, `fullWidth`, `elevated` (default follows the brand) |
| `IconButton` | Icon Button `439:33618` | `icon`, `accessibilityLabel` (required), `fill` accent-filled·inverse-filled·transparent-filled·gradient-filled·icon-only·danger, `size` xs·sm·md·lg |
| `TimerButton` | Timer Button `597:37788` | `label`, `duration`, `fill`, `size`, `showTimer`, `onComplete` |
| `TextInput` | Text Input `407:45428` | `label`, `value`, `onChangeText`, `placeholder`, `supportingText`, `error`/`errorText`, `disabled`, `loading`, `maxLength`/`showCharacterCount`, `leadingIcon`, `trailingIcon`, `clearable`, `ref` |
| `TextArea` | Text Area Input `429:13769` | as TextInput, multiline (grows as you type) |
| `SearchInput` | Search Input `587:23986` | `value`, `placeholder`, `loading`, `showClearIcon`, `onClear`, `error` |
| `DropdownInput` | Dropdown Input `430:27546` | `isPrefix`; select mode `onPress`/`open`; prefix mode `prefixIcon`/`prefixLabel`/`onPrefixPress` + text input props |
| `OtpInput` | OTP Input `428:8570` | `value`, `onChangeText`, `onComplete`, `length` 1–6, `error`/`errorText`, `autoFocus` |
| `Checkbox` | Checkbox / Checkbox-base `393:9220` (+ with-label `393:8916`) | `checked`, `indeterminate`, `onChange`, `size`, `label`, `helperText`, `controlPosition`, `border`; `accessibilityLabel` required without a visible label |
| `Radio`, `RadioGroup` | Radio / Radio-base `458:33839` (+ with-label `456:30961`) | `value`, `onChange`, `label`, `helperText`, `size` |
| `Toggle` | Toggle / Toggle-base `569:14389` (+ with-label `350:5505`) | `checked`, `onChange`, `size`, `label`, `helperText` |
| `Chip` | chips `635:61987` | `label`, `selected`, `onPress`, `disabled`, `accessibilityRole` checkbox·radio, `elevated` |
| `TimerChip` | Chips / Timer-chip `688:13259` | `duration`, `state` default·danger, `showAddCoins`, `icon`, `onPress` |
| `CoinChip` | — (coin balance) | `value`, `icon` (the brand's `CoinIcon` from `/icons`), `elevated` |
| `Tag` | — (Tag) | `state` success·warning·error, `label`, `icon` (default `SparkleFillIcon`), `background` slot (Lottie/gradient/image) |
| `SegmentedControl`, `SegmentedControlItem` | Tabs/Tab `636:62099`, tabs/tab-base `633:61530` | `value`, `onChange`, 2–3 items, `disabled` |
| `CarouselPointers` | carousel-pointers `818:16365` | `activeItem` (1-based), `count` |
| `BottomNav`, `BottomNavItem` | Bottom Nav / nav `627:60078`, nav-item-base `627:59848` | standalone bar (`media` for image/Lottie tabs, `bottomInset`) — **apps use React Navigation tabs + `useTabBarOptions`/`tabItem` instead** (§A8) |
| `Avatar`, `AvatarStack` | Avatar / avatar `135:1081` | `source`, `name`, `size` 24·36·40·48, `shape`, `status`, `bordered`, `statusLabels` / `avatars`, `max`, `othersLabel` |
| `Badge` | Badge `358:9733` | `count`, `max`, `accessibilityLabel` |
| `Divider` | Divider `276:31823` | `label?` |
| `Tooltip` | Tooltips `295:32545` | `text`, `placement`, `position`, `onClose`, `closeAccessibilityLabel` |
| `FloatingSnackbar` | Floating-Snackbar `534:12081` | `state` info·success·warning·error, `message`, `action={{ label, onPress }}` (never shown on success) — used by `shell/ToastMessage` |
| `SystemSnackbar` | System Snackbar `667:66763` | `state`, `message`, `onDismiss` (close button only when set), `dismissLabel` (inline system banners) |
| `LanguageSelector` | Language selector `624:51671` | `language`, `selected`, `label`, `disabled`, inside `RadioGroup` |
| Primitives: `Text`, `Box`, `HStack`, `VStack`, `Pressable`, `Spinner` | — | `Text` `variant` (short Figma name: `"label1P"`, `"h1"`) + `color`; `padding*`/`gap`/`background`/`borderColor`/`borderWidth`/`radius`/`align`/`justify`/`wrap` (token names) |
| Icons: `PlusIcon`, `XIcon`, `CaretDownIcon`, `CheckIcon`, `CircleNotchIcon`, `MagnifyingGlassIcon`, `SparkleFillIcon`, `HouseIcon`/`HouseFillIcon`, `ChatTextIcon`/`ChatTextFillIcon`, `ClockCounterClockwiseIcon`/`…FillIcon`, `ClockFillIcon`, `UserIcon`/`UserFillIcon`, `PhoneFillIcon`, `VideoCameraFillIcon`, `CurrencyInrIcon`, `FlagUsIcon`, `InfoFillIcon`, `CheckCircleFillIcon`, `WarningCircleIcon`, `WarningCircleFillIcon`, `WarningFillIcon` | Phosphor (Figma) | `color`, `size`; passed to slots as components (`icon={PlusIcon}`) |
| Theme: `ThemeProvider`, `useTokens`, `useTheme`, `createTheme`, `defineThemeOverrides`, `fontStyleFrom` | — | theme binding lives in `theme/`; `ThemeProvider` reaches `providers/` via `@/theme`; hooks via `@/theme` |
| Hooks/utils: `useReduceMotion`, `useAnnounce`, `useStatusAnnouncement`, `STATUS_ICONS` | — | animations respect reduce-motion; iOS announcements; status icon per intent |
| `/navigation`: `adaptNavigationTheme`, `useTabBarOptions`, `tabItem`, `KagazTabButton` | Bottom Nav | `useTabBarOptions`/`tabItem` via `@/components/ui` (`ui/navigation.ts`); `adaptNavigationTheme` only in `theme/navigationTheme.ts` |

**Brand-only components — `@lokal-app/kagaz-brand-<brand>/components`** (Kagaz ADR-0007). Components that exist for one brand live in that brand's package, built to the same rules as the shared library (same lint, token-police, stories, specs), reading tokens with `useTokens()` (so they need the app's `ThemeProvider` like any Kagaz component). An app sees **only its own brand's**; the subpath exists only for brands that ship components.

| Brand | Subpath | Exports | Figma source |
|---|---|---|---|
| gaming | `/components` | `PlayCard` (Play-map game card, scales with screen width, optional pipes; `color` green·purple·blue·yellow·locked, `title`, `image`, `lockedLabel`, `onPress`, `pipe*`), `Pipe` (straight/bent pipes, clamp, `accessory` slot), `ProgressBar` (segmented level progress; `value`, `segments`, `accessibilityLabel` required) | Gaming file `vHX6yu564DbkTCKLgjGQFI`: Gm_Play-card `2040:6417`, _gm_pipe `2065:25867`, gm_Progress-bar `2012:1984` |
| gaming | `/icons` | `CoinIcon`, `PlayIcon`, `LockIcon` | — |
| gaming | `/geometry` | PlayCard sizes for laying out a map without React Native (pure numbers) | — |
| dostt | `/icons` | `CoinIcon` | — |
| eaze, bhakti | — | none yet | — |

**Rules for brand-only components (in apps):**
1. **Step 0b, always:** after the shared library, check the app's brand subpaths before building anything. A brand component is used exactly like a shared one: registered in `components/ui/brand.ts`, imported from `@/components/ui`, configured by props, never wrap/restyle/re-export/fork, `style` layout-only, every text/a11y prop via `t()`.
2. **Import only the app's brand.** Only one brand package is installed, so another brand's subpath can't resolve; `kagaz:check` additionally fails on any `@lokal-app/kagaz-brand-<other>` string in `src/`.
3. **Brand-neutral layers stay neutral:** `components/shell/` never imports a brand `/components` (the shell is identical across brands). Everything else may, through `@/components/ui` (§A3, §A7.8).
4. **A new brand-unique component is a Kagaz change, not app code** (gap protocol, §A7.7): it goes into `@lokal-app/kagaz-brand-<brand>/src/components/` through Kagaz's Figma-component flow, so the next app of that brand gets it for free.
5. **Geometry and brand assets:** layout numbers a brand component needs (e.g. map spacing) come from the brand's `/geometry` — never re-derived as literals in the app. Content (game images, Lottie files, the online-players pill) is app content passed through the component's slots.

**Icons:** shared Kagaz icons first, then the brand's `/icons` (e.g. `CoinIcon` — pass it to `CoinChip`/`TimerChip` `icon`). Any other icon is an app icon in `components/icons/<Name>Icon.tsx`: generated from the Figma Phosphor component (react-native-svg, single `fill={color}`), implementing Kagaz's `IconProps` (`{ color?: string; size: number; testID?: string }`), registered in `components/icons/index.ts`, rendered with a `tokens.color.icon.*` colour and a `tokens.iconSize.*` size. Pass icons to Kagaz slots as **components** (`leadingIcon={RupeeIcon}`) so the slot colours them per state; elements only for multicolour icons. A brand icon many apps of that brand need → Kagaz gap for the brand's `/icons`.

**i18n with Kagaz:** Kagaz components (shared and brand-only) take user-visible and spoken text as props, several with **English defaults**: `TextInput`/`DropdownInput` `clearAccessibilityLabel` 'Clear text', `SearchInput` `clearAccessibilityLabel` 'Clear search', `SystemSnackbar` `dismissLabel` 'Dismiss', `Tooltip` `closeAccessibilityLabel` 'Close', `TimerChip` `addCoinsLabel` 'Add Coins', `CoinChip` `accessibilityLabel` '<value> coins', `CarouselPointers` `accessibilityLabel` 'Item N of M', `OtpInput` 'One-time code', `Avatar` `statusLabels`, `AvatarStack` `othersLabel`, `tabItem`/`BottomNavItem` `badgeAccessibilityLabel`, `DropdownInput` `prefixAccessibilityLabel`, `LanguageSelector` `label`, `Badge` count label, `FloatingSnackbar` `action.label`, Gaming `PlayCard` `lockedLabel` 'More games coming soon' + `accessibilityLabel` 'Play {title}'. In this template **every** such prop that the rendered variant uses is passed explicitly via `t()` — never rely on an English default. `design-system/kagaz-i18n-props` enforces the list in `eslint-plugin-design-system/kagaz-i18n-props.json` (refreshed by `/kagaz-upgrade`, brand components included).

**Fonts:** embedded at build time by the brand's config plugin (`app.config.ts` `plugins: ['@lokal-app/kagaz-brand-<brand>']`, needs `expo-font` installed). No runtime font loading exists in this template; fonts change only with a native build, never over the air. Licence: dostt's Clash Display is under the ITF Free Font License — an app on the dostt brand must keep its repository private and never redistribute the font files (`packages/brands/FONTS.md` in Kagaz).

### A7.7 The Kagaz gap protocol (when the design asks for something Kagaz doesn't have)

| The design needs… | Do | Never |
|---|---|---|
| a **value** with no token (a colour, spacing, radius…) | Check the Figma binding. Unbound or bound to `_root`/`brand` → **design bug**: flag it to design, block on the answer. If design confirms a new semantic token is needed → Kagaz issue (token change). | hardcode a lookalike, add a local token, override a token to fake it |
| a **variant/state/prop** of an existing Kagaz component | Kagaz issue via the "Figma component" form (Figma link, "update") — Kagaz's `/figma-component` pipeline builds it. Block the screen part on it, or ship the closest *existing* variant with design's written OK. | restyle through `style`, wrap the component, fork it |
| a **brand-unique component** (defined in the brand's design-system Figma file, e.g. Gaming's PlayDuo file; any app of that brand would reuse it) | Kagaz issue ("new", brand = `<brand>`) to add it to `@lokal-app/kagaz-brand-<brand>/src/components/` (Kagaz ADR-0007). If the app can't wait: a temporary composition in `components/common/<Name>.tsx` built from Kagaz shared + brand exports, first line `// KAGAZ-GAP(<issue-url>): delete when kagaz-brand-<brand> ships <Name>`, ledger row in `docs/kagaz-gaps.md` | building it as permanent app code; copying another brand's component; putting it in `components/shell/` |
| a **variant/state/prop** of a brand-only component | same as for a shared component — Kagaz issue against the brand package | restyle, wrap or fork it |
| a **new generic component** that lives in the Kagaz Core Components Figma file | Kagaz issue ("new"). If the app can't wait: a temporary composition of Kagaz primitives in `components/common/<Name>.tsx`, first line `// KAGAZ-GAP(<issue-url>): delete when Kagaz ships <Name>`, recorded in `docs/kagaz-gaps.md` | a permanent local look-alike, a new third-party UI kit |
| an **app-specific** composite (lives in the app's own screens Figma, carries this app's business meaning, no other app would reuse it) | normal ladder rungs 3–5 (§A7.4), composed from Kagaz | — |
| a brand value different from the Kagaz brand (one app only) | `theme/overrides.ts` (`brand` level preferred) with Figma + design sign-off comment | change it in more than one app (that's a Kagaz brand change) |

`docs/kagaz-gaps.md` is the app's ledger of open gaps (issue URL, what was built in the meantime, owner). `pr-reviewer` rejects a `KAGAZ-GAP` file without a ledger row; `/kagaz-upgrade` deletes the temporary composition when Kagaz ships the real one.

### A7.8 `components/ui/` — the Kagaz gateway (the ONLY place Kagaz components enter the app)

Every Kagaz component, primitive, icon, brand-only component and tab-bar helper the app uses is imported **once**, here, and re-exported under its **exact Kagaz name**. Screens, components, the shell, icons, features and navigation import them from `@/components/ui` — never from a `@lokal-app/*` package. When Kagaz changes (a rename, a moved export, a prop change, a new brand subpath), the fix is made in this folder and the rest of the app does not change. Tokens have the matching gateway in `src/theme/` (§A7.2); together they are the app's only two contact points with Kagaz.

```
src/components/ui/
├── kagaz.ts          shared Kagaz — explicit named re-exports, values + their types:
│                       export { Button, type ButtonProps, TextInput, type TextInputProps,
│                         Text, Box, HStack, VStack, Pressable, Spinner, PlusIcon, …,
│                         useReduceMotion, useAnnounce, type IconSlot, type IconProps }
│                         from '@lokal-app/kagaz-components';
├── brand.ts          the app's brand — explicit named re-exports from
│                       '@lokal-app/kagaz-brand-<brand>/components' | '/icons' | '/geometry'
│                       (only the subpaths the brand ships; `export {};` when it ships none)
├── navigation.ts     export { useTabBarOptions, tabItem, type TabItemInput, … }
│                       from '@lokal-app/kagaz-components/navigation';
├── adapters/         OPTIONAL — created ONLY by /kagaz-upgrade when a Kagaz release changes an
│   └── <Name>.tsx      API the app already uses: same export name, keeps the app-facing props
│                       stable and maps them onto the new Kagaz API. First line
│                       `// KAGAZ-ADAPTER(<kagaz-version>): <what changed>`, row in the
│                       docs/kagaz-gaps.md "Adapters" table; deleted once call sites migrate.
├── index.ts          THE import surface: export * from './kagaz'; export * from './navigation';
│                     + export * from './brand' once brand.ts has its first re-export (an empty
│                     module can't be `export *`-ed — import/export rejects it); + adapters, which
│                     replace the same name in kagaz.ts/brand.ts — a name is exported exactly once
└── CLAUDE.md
```

**Gateway rules (absolute):**
1. **Single entry.** `@lokal-app/kagaz-components` (incl. `/primitives`, `/navigation`) and the brand's `/components`, `/icons`, `/geometry` are imported **only** in `src/components/ui/**` (plus `src/theme/**` for the theme API — `useTokens`, `useTheme`, `ThemeProvider`, `createTheme`, `defineThemeOverrides`, `adaptNavigationTheme`, `KagazTokens`). Anywhere else → lint error (§A12).
2. **Pass-through, 1:1.** `kagaz.ts`, `brand.ts`, `navigation.ts` contain only `export { … } from '…'` statements — no JSX, no styles, no default props, no HOCs, no aliases (`export { Button as AppButton }` is forbidden). Names stay Kagaz's so Kagaz's docs, Storybook, `.types.ts` JSDoc, the component map and the `design-system/*` rules apply unchanged.
3. **Explicit registration.** Lists are explicit (never `export *` from a Kagaz package): the gateway *is* the reviewed list of Kagaz surface this app depends on, and the exact blast radius of an upgrade. Using a Kagaz export for the first time = add it to `kagaz.ts`/`brand.ts` in the same PR (the scaffolding skills do this in Kagaz step 0).
4. **Never a fork.** The gateway never restyles, wraps for looks, changes defaults or re-implements anything. Visual needs go through props, the theme or the gap protocol (§A7.7). The only code that may live here is an `adapters/` file, and only to absorb a Kagaz API change — never to change how a component looks.
5. **Brand-neutral by construction.** `brand.ts` is the only file that names the brand's subpaths; the shell still never uses brand-only components (§A7.5).
6. **Name collisions** between a shared and a brand export (none today) → ADR; the brand export is then re-exported under `<Brand><Name>` as the single sanctioned alias.

## A8. Navigation (locked shape for the canonical app flow)

The canonical flow: **intro slider (first launch only) → login → multi-step registration** = unauthenticated; **everything after** = authenticated.

```
src/navigation/
├── RootNavigator.tsx         renders NavigationContainer (ref, linking, Kagaz-adapted theme) and
│                             switches on EXACTLY three states from useAuthStore:
│                             'restoring' → splash | 'unauthenticated' → UnauthenticatedStack
│                             | 'authenticated' → AuthenticatedStack
├── unauthenticated/
│   ├── UnauthenticatedStack.tsx   routes: Intro, Login, + Registration Stack.Group (one route per step)
│   └── types.ts                   UnauthenticatedStackParamList
├── authenticated/
│   ├── AuthenticatedStack.tsx     BottomTabs + pushed screens + a Stack.Group for modals
│   ├── BottomTabsNavigator.tsx    Kagaz tab bar: useTabBarOptions + tabItem (below)
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

**Kagaz chrome (locked — Kagaz ADR-0004):**
- **Theme:** `NavigationContainer theme={navigationThemes[themeName][mode]}` — `navigationThemes` from `@/theme` (built by `adaptNavigationTheme` over React Navigation's `DefaultTheme`/`DarkTheme`), `mode` from `useTheme()`, `themeName` from `stores/settings`. Headers, cards and backgrounds therefore follow brand, skin and mode with no per-screen styling.
- **Bottom tabs:** React Navigation's own tab bar, styled by Kagaz — never a custom `tabBar`, never Kagaz `BottomNav` inside a navigator:
  ```tsx
  const insets = useSafeAreaInsets();
  const tabBarOptions = useTabBarOptions({ bottomInset: insets.bottom }); // solid bar, no blur (Kagaz ADR-0004)
  <Tab.Navigator screenOptions={{ ...tabBarOptions, headerShown: false }}>
    <Tab.Screen name="Home" component={HomeScreen}
      options={tabItem({ label: t('tabs.home'), icon: HouseIcon, activeIcon: HouseFillIcon,
                         badgeAccessibilityLabel: (n, max) => t('tabs.badge', { count: n, max }) })} />
  ```
  Labels via `t()`; badge counts may be read from `stores/` in `BottomTabsNavigator.tsx` (navigation may read stores). The Kagaz bar is solid and takes its own space (Kagaz dropped the blur in `1.0.0-next.2`), so screens need no tab-bar inset; bar height, border, item looks and label type come from `tokens.component.bottomNav` (brand-tunable, app-overridable via `createTheme` `components.bottomNav`).
- **Native-stack headers** take colours and fonts from the adapted navigation theme. Any header beyond the native one is a screen-level composition of Kagaz components (`IconButton` + `Text`) — not a custom navigator header component library.
- **Status bar:** owned by `shell/Screen` (style from `useTheme().mode`), never set per screen by hand.

## A9. State management summary

| Kind | Where | How |
|---|---|---|
| Server state | `api/<resource>/` (or `features/<x>/api/`) | React Query via react-query-kit (§A6.2) |
| Client/session state | `stores/<area>/` (or `features/<x>/stores/`) | Zustand (§A6.3) |
| Persistent client state | same stores | `persist` + MMKV adapter from `lib/storage` |
| Secrets (refresh token, PIN, crypto keys) | `lib/storage` `secureStorage` | expo-secure-store — async, ≤2KB, fixed key enum |
| Form state | inside the screen | react-hook-form + zodResolver (Kagaz inputs are controlled: `value`/`onChangeText`/`error`/`errorText` wired from the form); multi-step → area store |
| Theme prefs (`themeName` skin, `colorScheme` brand·system·light·dark) + locale | `stores/settings/` | persisted Zustand; `themeName` may be remote-config driven; consumed only by `providers/` and `navigation/` |
| Design tokens | Kagaz `ThemeProvider` context | read via `useTokens()`/`useStyles()` — never copied into a store, never cached in state |

Forbidden: Redux/Recoil/Jotai/MobX, raw Context for shared state, server data in Zustand, stores in `lib/`, stores at `stores/` root, tokens or theme objects in stores.

## A10. Micro-conventions (robotic defaults)

1. **Named exports only**; default exports forbidden (exception: config files that require them — `app.config.ts`, etc.).
2. **All user-facing strings via `t('area.scope.key')`** — no string literals in JSX, **including every text/accessibility prop of a Kagaz component** (`label`, `placeholder`, `supportingText`, `errorText`, `accessibilityLabel`, and the English-default props in §A7.6). Keys live in `src/translations/<lang>.json`, namespaced per §A4.
3. **No `console.*`** in `src/` — use `lib/logger` (`logger.debug/info/warn/error`).
4. **`any` is forbidden** (`@typescript-eslint/no-explicit-any: error`). `@ts-ignore` forbidden; `@ts-expect-error` requires a trailing description. Never `!` on a brand-optional token.
5. **FlashList** for every scrollable data list; `FlatList` only with an ADR-level justification comment.
6. **expo-image** for every image; RN `Image` forbidden. (Kagaz `Avatar` takes an image source for avatars — use it for avatars.)
7. **Accessibility floor:** Kagaz components carry roles, states and touch targets — keep them by never replacing them. Custom pressables use Kagaz `Pressable` (role + 44pt/48dp target built in) and set `accessibilityLabel` when not obvious; `IconButton` always gets a translated `accessibilityLabel`. Every screen is checked in light **and** dark mode and with large text.
8. **Limits:** `max-lines-per-function: 200` (blank lines and comments not counted) — a backstop against sprawling functions, not a style target; `.tsx` files ≤ 250 lines (split into screen-private components past that). Hook files (`use*.ts`) have **no** length limit — data hooks legitimately grow with forms and validation; split them only when a reviewer sees mixed concerns.
9. **Analytics** only through `lib/analytics` (`trackEvent('booking_card_clicked', props)`); event names per §A4; no vendor SDK calls in feature code.
10. **Side effects** in screens live in the data hook, never in the component body.
11. **Comments** state non-obvious constraints only — no narration, no change-log comments. Exception (required): Figma citations on overrides, content-dimension constants and `KAGAZ-GAP` markers.
12. **Imports from Kagaz** use the package entry points only (`@lokal-app/kagaz-components`, `/primitives`, `/navigation`; the brand's `/components`, `/icons`, `/geometry`) — never `…/src/…` or `…/lib/…` deep paths, never Kagaz internals (`PressableSurface`, `shadowFor`, `blendOver`).

## A11. Forbidden patterns (consolidated quick list)

- Inline styles anywhere in `src/` (the absolute rule)
- Any literal in a token category (colour, spacing, radius, border width, font, opacity, shadow, motion) outside `src/theme/overrides.ts` / `src/theme/skins/*`; raw RN `<Text>`; RN `Pressable`/`Touchable*`
- A local design-system layer: `theme/tokens/`, palette files, local token objects, re-implemented Kagaz components (shared or brand-only), wrappers of Kagaz components, re-exports of Kagaz outside `components/ui/`; anything in `components/ui/` beyond pass-through re-exports and upgrade adapters (§A7.8); aliased re-exports; importing a `@lokal-app/kagaz-*` package outside `components/ui/` and `theme/`; components named like a Kagaz export, `patches/` or `node_modules` edits to `@lokal-app/*`
- A brand-unique design-system component built as permanent app code (it belongs in `@lokal-app/kagaz-brand-<brand>/components`, §A7.7); importing another brand's subpath; brand `/components` inside `components/shell/`; reading brand palette values (`useTheme().brand.color.*`) in app code
- Turning off token-value linting (neither tier active), or running both tiers at once; *if opted into token-police:* disabling or re-configuring its rules, or installing it at a different Kagaz release than components
- Visual properties through a Kagaz component's `style` prop (props and the theme are the visual API); deep imports into Kagaz (`…/src/…`, `…/lib/…`)
- Importing `@lokal-app/kagaz-tokens` or a brand package's root entry outside `src/theme/` (its `/components`, `/icons`, `/geometry` subpaths are the exception); a second brand package; unpinned (`^`/`~`) Kagaz versions; `kagaz-components` ≠ `kagaz-tokens` version
- `createTheme` outside `theme/registry.ts` or inside a component; `ThemeProvider` rendered outside `providers/index.tsx`; `adaptNavigationTheme` outside `theme/navigationTheme.ts`; branching on brand id or mode to choose colours
- Runtime font loading (`useFonts`, `Font.loadAsync`), font files in `assets/`, `@expo/vector-icons` / icon fonts / PNG icons
- A seventh file in `components/shell/`; a custom tab bar or `BottomNav` inside a navigator; `KAGAZ-GAP` code without a `docs/kagaz-gaps.md` row; relying on a Kagaz English-default label
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
- `t()` inside `components/shell/`; `showToast` called from JSX (data hooks only)
- Data fetching or store access inside `components/**`; navigation calls inside `<Screen>Screen.tsx`
- Nested provider wrappers outside `providers/index.tsx`
- Untyped route params / `as never` navigation casts
- New top-level `src/` folders, new shell primitives, new third-party UI/styling/icon libraries, or any rule bypass without an ADR

## A12. ESLint as architecture enforcement (full inventory)

Base: flat config, `eslint-config-expo`, React Compiler plugin, Prettier integration, `simple-import-sort/{imports,exports}`, `import/no-cycle` (maxDepth ∞), `max-lines-per-function: 200` (skipBlankLines, skipComments), `max-lines: 250` on `src/**/*.tsx`.

**Stock rules in service of the constitution:** `import/no-default-export` (with config-file overrides) • `no-console` • `@typescript-eslint/no-explicit-any` • `@typescript-eslint/ban-ts-comment` (allow `ts-expect-error` with description) • `@typescript-eslint/no-non-null-assertion` • `react-native/no-inline-styles: error` (global) • `i18next/no-literal-string` (JSX scope, **including attribute values** of Kagaz text props) • `no-restricted-imports`:
- `axios` outside `lib/api-client`;
- `react-native` named imports `Text`, `Pressable`, `TouchableOpacity`, `TouchableHighlight`, `TouchableWithoutFeedback`, `FlatList` (data lists), `Image`, `SafeAreaView`, `KeyboardAvoidingView` (each message names the Kagaz/stack replacement);
- `@react-native-async-storage/*`, `@expo/vector-icons`, `expo-font` (outside `app.config.ts`), `react-native-paper`, `tamagui`, `nativewind`, `@gluestack-ui/*`, `native-base`, `styled-components`;
- `@lokal-app/kagaz-tokens`, and `@lokal-app/kagaz-brand-*` **root entries** (subpaths `/components`, `/icons`, `/geometry` allowed) outside `src/theme/**`; any brand subpath inside `src/components/shell/**`, `lib/`, `api/`, `stores/`, `hooks/`, `utils/`;
- **the gateway rule:** `@lokal-app/kagaz-components` (any entry) and `@lokal-app/kagaz-brand-*/{components,icons,geometry}` outside `src/components/ui/**` and `src/theme/**` → error "import Kagaz from @/components/ui (§A7.8)"; `@lokal-app/kagaz-components/navigation` inside `src/theme/**` only in `navigationTheme.ts`;
- `PressableSurface`, `shadowFor`, `blendOver` (Kagaz internals, not public); importNames `ThemeProvider` from `@/theme` outside `src/providers/**`; `createTheme`, `defineThemeOverrides` outside `src/theme/**`; `BottomNav`, `BottomNavItem` from `@/components/ui` inside `src/navigation/**`;
- any `@lokal-app/kagaz-*/src/*` or `@lokal-app/kagaz-*/lib/*` deep path.

`no-restricted-syntax` (non-`src/api/**` files): `ImportSpecifier[imported.name=/^Api(?!Error$)[A-Z]/]` — wire types stay in the API layer. `ApiError` (the normalized error envelope from `lib/api-client`, §A6.2 #2) is app-facing by design and is the one exemption — screen data hooks and `ErrorState` consume it.

**`import/no-restricted-paths` zones** (the §A3 matrix): theme imports nothing from src • lib never imports spine/features/theme • components/** never import api/stores/screens • components/ui imports nothing from src/ except theme/ (adapters only) • components/shell imports only theme/utils/components/ui (+ its wrapped lib) • hooks never import api/stores/screens/components • stores never import screens/components/api/theme • api never imports components/screens/stores • features never import other features or spine stores/screens • only barrels importable from features.

**Token-value lint — two tiers. Default: local rule. Opt-in: Kagaz's token-police.** Exactly one of the two is active; `eslint.config.mjs` switches with one flag.

| Tier | When | Active rules |
|---|---|---|
| **Default** (every new app) | always, unless the developer opts in | `design-system/no-raw-style-values` (local, below) + `no-restricted-imports` bans on Kagaz token source layers |
| **token-police** (opt-in) | only when the developer asks for it (`/enable-token-police`) | `token-police/no-hardcoded-style-value` + `token-police/no-forbidden-token-import`; `design-system/no-raw-style-values` turns **off** so nothing is reported twice |

**token-police** (`@lokal-app/kagaz-token-police`) is the Kagaz maintainers' own ESLint plugin — the one every Kagaz shared and brand-only component must pass (Kagaz `packages/token-police/README.md`). It is **optional for apps** and never blocks a bootstrap: it is not published yet (`private: true` in Kagaz as of `1.0.0-next.2`, §C3), so the bootstrap only *tells* the developer it exists and how to enable it. When enabled:

```js
// eslint.config.mjs (excerpt — ships verbatim; the flag ships `false`)
const USE_TOKEN_POLICE = false; // true only after /enable-token-police
const tokenPolice = USE_TOKEN_POLICE
  ? (await import('@lokal-app/kagaz-token-police/eslint-plugin')).default
  : null;
// …
tokenPolice
  ? {
      files: ['src/**/*.{ts,tsx}'],
      ignores: ['src/theme/overrides.ts', 'src/theme/skins/**'], // the only legal raw values (§A7.2)
      plugins: { 'token-police': tokenPolice },
      rules: {
        'token-police/no-hardcoded-style-value': 'error',
        'token-police/no-forbidden-token-import': 'error',
        'design-system/no-raw-style-values': 'off',
      },
    }
  : {},
```
- `token-police/no-hardcoded-style-value` — a literal for any colour (`color`, `backgroundColor`, `border*Color`, `outlineColor`, `tintColor`, `textDecorationColor`; named colours too), spacing (`padding*`, `margin*`, `gap`, `rowGap`, `columnGap`), radius, border width, typography (`fontSize`, `lineHeight`, `letterSpacing`, `fontWeight`, `fontFamily`), opacity (≠ 0, 1) or shadow (`boxShadow`, `shadow*`, `elevation`) → error, with the token to use. `token-police/no-forbidden-token-import` — importing Kagaz token source layers → error.
- The optional import is exempted for `eslint.config.mjs` only: `'import/no-unresolved': ['error', { ignore: ['^@lokal-app/kagaz-token-police'] }]` (the package is absent until opt-in).
- Use the plugin's **rules**, not its `configs.recommended` object (that also sets `languageOptions.parser`, overriding the app's TypeScript parser). Its Figma check and CLI are Kagaz-repo tools and are not used in apps. Its rules run under the app's ESLint 9 (verified).
- **Install (by the developer, only when opting in):** `@lokal-app/kagaz-token-police@<kagaz-version>` from GitHub Packages once Kagaz publishes it; before that, a git dependency pinned to the Kagaz release commit (`github:lokal-app/kagaz#<release-commit-sha>&path:/packages/token-police`, needs read access to the Kagaz repo — not yet verified with pnpm). Same Kagaz release as `@lokal-app/kagaz-components`.
- **Not opted in = not in effect:** no token-police rule, version check or reviewer check applies. Everything below that mentions token-police applies **only when `USE_TOKEN_POLICE` is `true`**.

**Custom plugin `eslint-plugin-design-system`** (local workspace package, ships with the template) — app architecture, Kagaz usage, i18n, and the default token-value rule:
- `design-system/no-raw-style-values` — **the default token-value rule** (off when token-police is enabled): a literal for any key in the token categories → error, with the fix-it token group, using **the same value table as token-police** so switching tiers changes nothing for valid code: colours (`color`, `backgroundColor`, `border*Color`, `outlineColor`, `tintColor`, `textDecorationColor`, `shadowColor`; any string except `transparent`, named colours included) → `tokens.color.{text|surface|border|icon}.*`; `padding*`/`margin*`/`gap`/`rowGap`/`columnGap` (any number ≠ 0) → `tokens.spacing[n]`; `border*Radius` → `tokens.cornerRadius.*`; `border*Width` → `tokens.borderWidth.*`; `fontSize`/`lineHeight`/`letterSpacing`/`fontWeight`/`fontFamily` → `<Text variant>`; `opacity` (≠ 0, 1) → `tokens.opacity.disabled`; `boxShadow`/`shadow*`/`elevation` → `tokens.component.card.elevation` / `tokens.elevation[1]`. Exempt: `src/theme/overrides.ts`, `src/theme/skins/**`.
- `design-system/no-raw-motion` — literal durations or `Easing.bezier(<literals>)` in Reanimated/animation calls → `tokens.motion.duration.*` / `tokens.motion.easing.*` (neither tier's value table covers motion).
- `design-system/styles-pattern` — every `StyleSheet.create` must sit inside a **module-scoped** `createStyles(tokens[, params])` factory (in-file tail for components, `styles.ts` for screens; `styles.ts` exports `createStyles` only); styles defined anywhere else → error.
- `design-system/kagaz-style-layout-only` — on a JSX element imported from `@/components/ui` whose name is a Kagaz export (`kagaz-exports.json`), the `style` prop (resolved through `styles.<key>` to its `createStyles` entry) may contain only layout keys (`margin*`, `flex*`, `align*`, `justify*`, `position`, `top|right|bottom|left`, `width`, `height`, `min*`, `max*`, `zIndex`, `aspectRatio`, `display`, `overflow`, `transform`; on `Text` also `textAlign`, `textAlignVertical`, `writingDirection`) → anything else is an error.
- `design-system/no-shadowed-kagaz-components` — declaring (outside `src/components/ui/adapters/`) a component/export whose name is in `kagaz-exports.json` (generated by `scripts/kagaz-exports.mjs` from the installed `@lokal-app/kagaz-components` **and** the brand's `/components` and `/icons`) → error.
- `design-system/kagaz-i18n-props` — a Kagaz element (imported from `@/components/ui`) missing a text/a11y prop listed for it in `kagaz-i18n-props.json` (props with English defaults, required when the variant renders them) → error.
- `design-system/locked-folders` — any file under `src/theme/tokens/**`; any file in `src/components/ui/` outside the §A7.8 shape (`kagaz.ts`, `brand.ts`, `navigation.ts`, `index.ts`, `adapters/*.tsx`, `CLAUDE.md`, `README.md`); any file in `src/components/shell/` outside the six (§A7.5); any `src/theme/` file outside the §A7.2 shape → error.
- `design-system/no-layer-root-barrels` — `index.ts` outside the §A5 whitelist, or any `export … from '@lokal-app/kagaz-*'` outside `src/components/ui/` and `src/theme/` → error.
- `design-system/kagaz-gateway-pass-through` — in `src/components/ui/{kagaz,brand,navigation}.ts`: any statement other than `export { … } from '@lokal-app/kagaz-…'`, any `export *` from a Kagaz package, any `as` alias (except the ADR'd `<Brand><Name>`) → error; in `adapters/`: a file without the `// KAGAZ-ADAPTER(<version>)` first line or without its `docs/kagaz-gaps.md` row → error.
- `design-system/kagaz-gap-ledger` — a file whose first line is `// KAGAZ-GAP(<url>)` whose URL is not in `docs/kagaz-gaps.md` → error.

**Repo gate `pnpm kagaz:check`** (`scripts/kagaz-check.mjs`, part of `check-all`): exactly one `@lokal-app/kagaz-brand-*` dependency; it matches `src/theme/brand.ts` and the `app.config.ts` plugin; no other brand's name appears in any `src/` import; `@lokal-app/kagaz-components` pinned exactly and equal to the resolved `@lokal-app/kagaz-tokens` version; the brand version's `peerDependencies` accept them; **exactly one `@lokal-app/kagaz-components` instance in the lockfile** (two copies — e.g. resolved against different `react-native-svg` versions — would give the brand's components a different theme context and crash at runtime); token-value lint active (default rule on, or — if `USE_TOKEN_POLICE` is `true` — `@lokal-app/kagaz-token-police` installed (dev) at the same Kagaz release with both rules at `error` and the default rule off; never both, never neither); `react-native-svg` and `expo-font` installed; `kagaz-exports.json` generated from the installed Kagaz + brand versions; every name re-exported by `components/ui/` exists in the installed Kagaz (a stale gateway fails here, not at runtime); no `@lokal-app/kagaz-*` import outside `components/ui/` and `theme/`; no `patches/@lokal-app*`.

## A13. `App.tsx` bootstrap order (canonical)

**Module-load (before React renders):** first-run check → wipe SecureStore on fresh install (iOS Keychain persistence) → hydrate auth + settings stores from MMKV (sync) → `configureApiAuth({ onSessionExpired: () => useAuthStore.getState().signOut() })` → `setupReactQueryNative()` → build themes (importing `@/theme` runs `createTheme` in `registry.ts` — a bad brand or override throws here, loudly) → register OS-level notification handlers (Android channels + iOS VoIP) → init core analytics adapter.
**Component-mount (inside `App`):** init crash adapter → init push adapter → load remote config (may switch `settings.themeName` to a remote skin) → conditionally init observability (remote-config kill-switch) → request tracking permission → hide bootsplash → render `<Providers><RootNavigator/></Providers>`.
**There is no font-loading step:** brand fonts are embedded at build time by the brand's config plugin, so text is in the brand font on the first frame.

**`providers/index.tsx` composition order (fixed, outermost first):** `GestureHandlerRootView` → `SafeAreaProvider` → `KeyboardProvider` → `QueryClientProvider` → Kagaz `ThemeProvider` (`theme={themes[themeName] ?? themes[DEFAULT_THEME]}` + `mode`/`followSystem` from `settings.colorScheme`, §A7.2 #5) → `BottomSheetModalProvider` → `{children}` + `<FlashMessage MessageComponent={ToastMessage} />` (inside the `ThemeProvider`, so the toast renders with tokens).
*Why this order:* side effects that must observe early app state (push, crash) come first; gated/optional services last so kill-switches work; everything that renders Kagaz sits inside the `ThemeProvider`. Vendor calls live in `lib/<slot>/adapter.ts` — `App.tsx` only calls slot public APIs.

## A14. ADR process

Any deviation from Part A → `docs/adr/NNNN-<slug>.md` from the shipped template (context, decision, consequences, rule(s) overridden). The PR that deviates must link the ADR. AI agents must refuse to produce deviating code without being pointed at an approved ADR.
