# lib/analytics — adapter slot

**Contract:** `types.ts` (`AnalyticsAdapter`). **Public API:** `index.ts` — `initAnalytics`,
`trackEvent`, `identifyUser`, `setUserProperties`, `resetAnalytics`. **Ships as:** no-op `adapter.ts`.

**Recommended vendor (pre-approved):** Firebase Analytics — `@react-native-firebase/app` +
`@react-native-firebase/analytics`.

**Wiring steps** (`/add-adapter analytics firebase` → adapter-wirer):
1. User runs `! pnpm exec expo install @react-native-firebase/app @react-native-firebase/analytics`.
2. Add `@react-native-firebase/app` to `app.config.ts` plugins; add `google-services.json` /
   `GoogleService-Info.plist` per env (`android.googleServicesFile`, `ios.googleServicesFile`).
3. Implement `adapter.ts` against `AnalyticsAdapter` (`logEvent`, `setUserId`, `setUserProperties`,
   `resetAnalyticsData`). Do not change `types.ts` or `index.ts`.
4. Bootstrap slot: §A13 module-load step 8 (`initAnalytics()` in `App.tsx`) — already called.
5. Gates: `pnpm lint`, `pnpm type-check`, `pnpm prebuild:development`.

**Gotchas:** event names ≤ 40 chars, snake_case; param values string/number only. Never import
the vendor SDK outside `lib/analytics/`. Screens call `trackEvent` only from data hooks / `useTrack.ts`.
