---
paths:
  - "src/**/*.tsx"
---
# Styling & design-system rules (absolute, every component and screen)
- KAGAZ FIRST. Before writing any JSX element that looks like a control, input, chip, tag, avatar,
  badge, snackbar, tooltip, divider, tab, toggle, pointer or icon: it exists in
  @lokal-app/kagaz-components — or, for brand-only pieces (e.g. Gaming PlayCard/ProgressBar), in
  @lokal-app/kagaz-brand-<brand>/components (docs/ARCHITECTURE.md §A7.6). Import it from
  `@/components/ui` (never from @lokal-app/*); configure by props. Never rebuild, wrap or restyle
  it. A brand-unique piece Kagaz lacks is a Kagaz gap.
- NO inline styles. `style={{…}}` is forbidden — no exceptions, not even "temporary".
- Layout + type with Kagaz primitives and token names: VStack/HStack/Box (gap, padding*,
  background, borderColor, borderWidth, radius, align, justify) and <Text variant color>
  (variant = short Figma style name, e.g. "label1P"; Text style = layout + textAlign only).
- Everything else: `const styles = useStyles(createStyles)` + module-scoped
  `const createStyles = (tokens: Tokens) => StyleSheet.create({…})` (import useStyles, Tokens
  from '@/theme'). Components → in-file last declaration; screens → styles.ts (createStyles ONLY).
- `style` on a Kagaz component/primitive = layout only (margin, flex, align, size, position).
- Conditional styles: arrays — `[styles.root, isActive && styles.active]`.
- Runtime values (insets, measured layout, API colours): `createStyles(tokens, params)` +
  `useStyles(createStyles, params)`. Animations: `[styles.x, animatedStyle]` with
  tokens.motion.duration/easing, respecting reduce-motion. No other dynamic-style path exists.
- Every colour/spacing/radius/border/font/opacity/shadow value from `tokens`. No literals.
  Content dimensions from Figma → constants.ts with the Figma node cited.
- Text only via Kagaz <Text>; touchables only Kagaz buttons / Kagaz Pressable; icons only
  Kagaz icons, the brand's /icons, or components/icons (passed to slots as components).
- Raised looks: Kagaz `elevated` prop / tokens.component.card.elevation — never a hand-built shadow.
- Every Kagaz text/a11y prop via t() — including the ones with English defaults.
- Figma shows a value/variant/component Kagaz lacks: STOP — Kagaz gap protocol (§A7.7). Never approximate.
