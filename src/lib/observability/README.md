# lib/observability — adapter slot

**Contract:** `types.ts` (`ObservabilityAdapter`, `Trace`). **Public API:** `index.ts` —
`initObservability`, `startTrace`. **Ships as:** no-op `adapter.ts`.

**Recommended vendor (pre-approved):** Firebase Performance Monitoring — `@react-native-firebase/perf`.

**Wiring steps** (`/add-adapter observability firebase-perf` → adapter-wirer):
1. User runs `! pnpm exec expo install @react-native-firebase/app @react-native-firebase/perf`.
2. Config plugins in `app.config.ts` (perf requires its Gradle plugin via the config plugin).
3. Implement `adapter.ts`: `startTrace` → `perf().startTrace(name)` mapped to the `Trace` contract.
4. Bootstrap slot: §A13 component-mount step 13 — `initObservability()` runs only when
   `getFlag('observability_enabled', false)` (remote kill-switch). Already wired in `App.tsx`.

**Gotchas:** traces are cheap but not free on low-end devices — keep them to key flows.
