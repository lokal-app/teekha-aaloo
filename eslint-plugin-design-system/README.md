# eslint-plugin-design-system

Local workspace package implementing the Constitution §A12 custom rules. Wired in
`eslint.config.mjs`; all rules are `error` for `src/**`.

| Rule | Enforces |
|---|---|
| `design-system/no-raw-colors` | hex/rgb/hsl only in `src/theme/tokens/palette.ts`; suggests the nearest palette value |
| `design-system/spacing-scale-only` | numeric padding/margin/gap/inset values must be on the spacing scale (`tokens/spacing.ts`) |
| `design-system/typography-component-only` | no `<Text fontSize…>`, no `Text` import outside `ui/Typography.tsx`, no raw font values |
| `design-system/styles-pattern` | `StyleSheet.create` only inside `createStyles(theme[, params])`; last declaration in components; screens use `styles.ts` (createStyles only) |
| `design-system/tokens-only` | color/spacing/typography/radius/shadow constants imported only from `@/theme` |
| `design-system/no-tokens-outside-theme` | `theme/tokens/*` never imported outside `src/theme/` |
| `design-system/no-layer-root-barrels` | `index.ts` only at the §A5 whitelist |

Changing a rule's behaviour is a Constitution change → ADR (`docs/adr/`).
