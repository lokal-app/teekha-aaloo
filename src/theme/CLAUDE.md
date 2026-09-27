# theme/ — bottom of the stack
Imports NOTHING from src/. Two layers: tokens/ (scheme-agnostic primitives — INTERNAL to
theme/, nothing outside src/theme/ may import them) and themes/ (skins — the only place
scheme-ness exists). Raw hex lives only in tokens/palette.ts (names mirror Figma variables,
append-only). Semantic color keys, spacing keys, typography variants, radius and shadow
keys are FIXED by the constitution — extending a key set requires an ADR.
themes/default.ts is the complete base spec and MUST define every semantic key for BOTH
light and dark. Custom skins = createTheme(defaultTheme, overrides) in themes/<name>.ts +
one registry.ts line — nothing else changes, no component is touched. Overrides may touch
any token group; single-scheme skins assign one map to both schemes explicitly; override
color values must reference palette, never hardcode hex.
Values come from Figma via /figma-implement stage 2 (token-reconciler) — never invented.
Active theme = registry[themeName] × colorScheme, resolved in ThemeProvider from
stores/settings (themeName may be remote-config driven).
