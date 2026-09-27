# App bootstrap order (§A13, expanded)

`src/App.tsx` is the canonical bootstrap. The order is load-bearing — **never reorder it**;
fill slots in place. Vendor calls live in `src/lib/<slot>/adapter.ts`; `App.tsx` only calls
slot public APIs.

## Phase 1 — module load (before React renders)

| # | Step | Where | Status in template |
|---|---|---|---|
| 1 | First-run check | `lib/storage` (`isFirstRun()` MMKV flag) | ✅ shipped |
| 2 | Wipe SecureStore on fresh install (iOS Keychain survives reinstall) | `secureStorage.wipeOnFirstRun()` | ✅ shipped |
| 3 | Hydrate auth + settings stores from MMKV (sync) | `stores/auth`, `stores/settings` (persist + MMKV = synchronous rehydrate on import) | ✅ shipped |
| 4 | `configureApiAuth({ onSessionExpired: () => useAuthStore.getState().signOut() })` | `lib/api-client` | ✅ shipped |
| 5 | `setupReactQueryNative()` — focusManager ↔ AppState, onlineManager ↔ expo-network | `lib/api-client` | ✅ shipped |
| 6 | Resolve initial theme scheme | `ThemeProvider` reads `stores/settings` synchronously | ✅ shipped |
| 7 | Register OS-level notification handlers (Android channels + iOS VoIP) | `lib/push` `registerNotificationHandlers()` | ⏳ no-op adapter |
| 8 | Init core analytics adapter | `lib/analytics` `initAnalytics()` | ⏳ no-op adapter |

Why module load: the root navigator must render the correct auth state on the **first frame**
(no `restoring` flicker), and the API client must be able to expire a session before any
component mounts.

## Phase 2 — component mount (inside `App`, `useAppBootstrap` effect)

| # | Step | Where | Status |
|---|---|---|---|
| 9 | Load fonts | `TODO(fonts)` — add families to `assets/fonts/` + token-sync typography | ⏳ TODO |
| 10 | Init crash adapter | `lib/crash` `initCrash()` | ⏳ no-op |
| 11 | Init push adapter | `lib/push` `initPush()` | ⏳ no-op |
| 12 | Load remote config | `lib/remoteConfig` `loadRemoteConfig()` | ⏳ no-op |
| 13 | Conditionally init observability (remote-config kill-switch) | `lib/observability` `initObservability()` gated by `getFlag('observability_enabled')` | ⏳ no-op |
| 14 | Request tracking permission (iOS ATT) | `lib/permissions` `requestTrackingPermission()` | ⏳ TODO (no ATT dep yet) |
| 15 | Hide bootsplash | `TODO(bootsplash)` — requires expo-splash-screen (ADR/§A0 approval) | ⏳ TODO |
| 16 | Render `<Providers><RootNavigator/></Providers>` | `providers/index.tsx` + `navigation/RootNavigator.tsx` | ✅ shipped |

Why this order: side effects that must observe early app state (push, crash) come first;
gated/optional services last so remote kill-switches work.

## Filling a slot
1. `/add-adapter <slot> <vendor>` (adapter-wirer) — replaces `adapter.ts` only; contract and
   public API unchanged.
2. The slot's call site already exists in `App.tsx` — it starts doing real work, no reordering.
3. Native config → a config-plugin entry in `app.config.ts`, then `pnpm prebuild:development`.
