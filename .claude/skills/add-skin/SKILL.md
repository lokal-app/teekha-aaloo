---
description: Add a named theme skin (e.g. festival) as Kagaz createTheme overrides layered on
  the app overrides — two files, zero component changes. Use for seasonal/campaign themes or
  remotely switched looks.
argument-hint: "<skin-name> <figma-url-of-the-skin>"
allowed-tools: "Read Write Edit Grep Glob Bash mcp__figma__*"
---
1. Read src/theme/{brand,overrides,registry}.ts and docs/ARCHITECTURE.md §A7.2.
2. From the Figma source list exactly what the skin changes. Classify each change: a brand
   value (preferred: `brand` overrides — follows in both modes) / one semantic token per mode
   (`tokens.light|dark`) / a Kagaz component token (`components`). A change that is not
   expressible as one of these → STOP (it is a component change → Kagaz gap protocol).
3. Write src/theme/skins/<skin-name>.ts: `export const <camel>Overrides =
   defineThemeOverrides({...})`, header comment = Figma URL + node ids + design sign-off; every
   hex value commented with its Figma variable/node. Override paths must exist (createTheme
   throws on unknown paths — that is the gate).
4. Add ONE line to registry.ts (`<camel>: createTheme(brand, mergeOverrides(overrides,
   <camel>Overrides))`). navigationThemes picks it up automatically. Touch nothing else.
5. If the skin is remote-controlled, document the remote-config value (= the ThemeName) in
   the PR; never hardcode a switch in components.
6. Gate: pnpm check-all; app boots with settings.themeName = '<camel>' in light and dark.
