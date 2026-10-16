# theme/ — this app's binding to Kagaz (the ONLY folder that touches tokens/brand packages)

Shape (locked): brand.ts (the ONE brand import) • overrides.ts (createTheme overrides, ships {}) •
skins/<name>.ts (optional named overrides) • mergeOverrides.ts • registry.ts (themes built ONCE
at module scope: createTheme(brand, overrides[⊕skin]) + ThemeName + DEFAULT_THEME) •
navigationTheme.ts (adaptNavigationTheme per theme) • useStyles.ts • index.ts. Nothing else —
no tokens/, no palette, no local token objects. Imports nothing from src/.
index.ts exports exactly: useTokens, useTheme, useStyles, Tokens, Mode, themes, ThemeName,
DEFAULT_THEME, navigationThemes, brand, ThemeProvider (providers/ only). Never re-export Kagaz
components — that is components/ui's job.
Overrides: prefer `brand` level (follows in both modes) → `tokens.{light,dark}` → `components`
(card, button, iconButton, chip, languageSelector, coinChip, tag, snackbar, bottomNav — layered
over the brand's own components(tokens); createTheme rejects bad paths/types).
Raw hex is legal ONLY in overrides.ts/skins/*, each value citing its Figma node + design
sign-off. An override more than one app needs = a Kagaz change, not an override.
New skin = skins/<name>.ts + one registry.ts line (/add-skin) — no component changes.
Brand ↔ app.config.ts plugin ↔ package.json must agree (pnpm kagaz:check). Kagaz version
changes only through /kagaz-upgrade.
