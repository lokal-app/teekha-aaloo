# lib/crash — adapter slot

**Contract:** `types.ts` (`CrashAdapter`). **Public API:** `index.ts` — `initCrash`, `recordError`,
`crashLog`, `setCrashUser`. **Ships as:** no-op `adapter.ts`.

**Recommended vendor (pre-approved):** Firebase Crashlytics — `@react-native-firebase/crashlytics`
(shares `@react-native-firebase/app` with analytics).

**Wiring steps** (`/add-adapter crash crashlytics` → adapter-wirer):
1. User runs `! pnpm exec expo install @react-native-firebase/app @react-native-firebase/crashlytics`.
2. Add both config plugins to `app.config.ts`; Firebase config files per env.
3. Implement `adapter.ts` (`recordError`, `log`, `setUserId`, `setCrashlyticsCollectionEnabled`).
4. Bootstrap slot: §A13 component-mount step 10 (`initCrash()` in `App.tsx`) — already called.
   Also forward `providers/` ErrorBoundary `onError` → `recordError`.
5. Gates: `pnpm lint`, `pnpm type-check`, `pnpm prebuild:development`.

**Gotchas:** disable collection in `development`; upload dSYMs / mapping files in EAS builds.
