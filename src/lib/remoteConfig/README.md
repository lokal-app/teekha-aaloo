# lib/remoteConfig — adapter slot

**Contract:** `types.ts` (`RemoteConfigAdapter`). **Public API:** `index.ts` — `loadRemoteConfig`,
`getFlag`, `getRemoteString`, `getRemoteNumber`. **Ships as:** no-op `adapter.ts` (fallbacks only).

**Recommended vendor (pre-approved):** Firebase Remote Config — `@react-native-firebase/remote-config`.

**Wiring steps** (`/add-adapter remoteConfig firebase` → adapter-wirer):
1. User runs `! pnpm exec expo install @react-native-firebase/app @react-native-firebase/remote-config`.
2. Config plugin + Firebase config files per env in `app.config.ts`.
3. Implement `adapter.ts`: `setDefaults`, `fetchAndActivate` with a short timeout, typed getters.
4. Bootstrap slot: §A13 component-mount step 12 (`loadRemoteConfig()`) — already called; step 13
   gates observability on `getFlag('observability_enabled', false)`.
5. Uses: A/B `variants/` switch flags (exposed via screen data hooks), remote theme skins
   (`themeName` → `stores/settings`, applied by spine code — never from lib/).

**Gotchas:** keep keys snake_case; every read site passes an explicit fallback.
