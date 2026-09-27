# modules/ — local Expo native modules

**What goes here:** app-specific native code written with the Expo Modules API
(`npx create-expo-module@latest --local`), one folder per module, autolinked.
**What does NOT:** JS-only code (→ `src/`), vendor SDK wrappers (→ `src/lib/<slot>/adapter.ts`),
native config tweaks (→ a config plugin in `plugins/`).
**Shape:** `modules/<module-name>/{expo-module.config.json, index.ts, src/, ios/, android/}`.
**Import:** via the `@modules/*` alias, and only from `src/lib/` (a module is infrastructure).
**Rules:** a new native module is a new dependency surface → ADR (§A0/§A14).
