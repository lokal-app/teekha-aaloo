# plugins/ — local Expo config plugins

**What goes here:** config plugins (`withAndroidManifest`, `withInfoPlist`, …) that express
native configuration for Continuous Native Generation. `android/` and `ios/` are generated and
gitignored — never edit them by hand.
**Shape:** `plugins/with<Thing>.js` (CommonJS, default export allowed — config file), registered
in `app.config.ts` → `plugins`.
**What does NOT:** runtime code (→ `src/`), native modules (→ `modules/`).
**Verify:** `pnpm prebuild:development` after any change.
