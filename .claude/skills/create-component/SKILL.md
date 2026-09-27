---
description: Create a component at the correct ladder level (ui primitive, area, or common)
  with token-only styling. Use for ANY new component.
argument-hint: "<ComponentName> [ui|<area>|common]"
allowed-tools: "Read Write Edit Grep Glob Bash"
context: fork
agent: ui-implementer
---
1. Decide placement via the ladder: atomic + token-only + no business meaning → components/ui/
   (must be added to ui/index.ts barrel); shared in one area → components/<area>/; cross-area
   business → components/common/; used by exactly one screen → that screen's components/
   (and say so — do not put it in components/).
2. Read theme tokens + existing ui/index.ts first; reuse before creating.
3. Scaffold: named export function, type Props (export <Name>Props only for ui/), variants/
   sizes as token-derived unions using the standardized prop names variant/size,
   createStyles(theme) tail, <Typography> for text, a11y defaults built in
   (accessibilityRole/State), t() for strings (ui primitives take text via props instead),
   semantic tokens only, style?: StyleProp<ViewStyle> merged last (layout-only), gap for
   sibling spacing. ui/ primitives: flat <Name>.tsx until a 2nd file is needed.
4. Gate: pnpm lint --fix on the file; report the chosen ladder level and why.
