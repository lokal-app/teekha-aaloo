# src/theme/ — the app's Kagaz binding (brand: gaming)

**Imports nothing from `src/`.** The only folder that imports the brand package's root entry and the
theme API of `@lokal-app/kagaz-components`. Locked shape (§A7.2): `brand.ts` (the ONE brand import),
`overrides.ts` (createTheme overrides — ships empty; every value cites its Figma node), `skins/<name>.ts`,
`mergeOverrides.ts`, `registry.ts` (themes built once), `navigationTheme.ts`, `useStyles.ts`, `index.ts`.
**No local tokens** — Kagaz owns every value. Public surface: `useTokens`, `useTheme`, `useStyles`, `Tokens`,
`Mode`, `themes`, `ThemeName`, `DEFAULT_THEME`, `navigationThemes`, `brand`, `ThemeProvider` (providers/ only).
**New skin:** `/add-skin` (skins/<name>.ts + one registry line). **Lint:** `design-system/locked-folders`.
