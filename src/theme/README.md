# src/theme/ — tokens + themes (bottom of the stack)

**Imports nothing from `src/`.** `tokens/` = scheme-agnostic primitives, INTERNAL to theme/
(palette, spacing, typography, radius, shadows). `themes/` = skins (`default.ts` light+dark,
`createTheme.ts`, `registry.ts`). Public surface: `index.ts` only — `ThemeProvider`, `useTheme`,
`useStyles`, `toNavigationTheme`, registry, types.
**Values:** every token value is a PLACEHOLDER until the first `/figma-implement` token sync.
Key sets are fixed by the Constitution (§A7) — a new key = ADR.
**New skin:** `themes/<name>.ts` = `createTheme(defaultTheme, overrides)` + one `registry.ts` line.
**Lint:** `design-system/no-tokens-outside-theme`, `tokens-only`, `no-raw-colors` (hex only in palette.ts).
