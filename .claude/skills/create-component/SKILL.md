---
description: Create an app component on the Kagaz design system at the correct ladder level
  (screen-local, area, common, icon) — after proving Kagaz doesn't already ship it. Use for
  ANY new component.
argument-hint: "<ComponentName> [<area>|common|icon|screen:<area>/<screen>]"
allowed-tools: "Read Write Edit Grep Glob Bash"
context: fork
agent: ui-implementer
---
0. KAGAZ STEP 0 (mandatory, reported): search docs/ARCHITECTURE.md §A7.6 and the Kagaz exports
   (eslint-plugin-design-system/kagaz-exports.json — shared + this brand's /components and
   /icons). If Kagaz ships it → STOP and answer "use <KagazExport> from @/components/ui with
   props …" — create nothing except, if missing, its pass-through line in
   components/ui/kagaz.ts or brand.ts. If the request is a Kagaz component with different looks/variant → STOP:
   GAP(variant). If it is a brand-unique design-system component (defined in the brand's Figma
   file, reusable by any app of the brand) → STOP: GAP(brand-component) for
   @lokal-app/kagaz-brand-<brand>/components (§A7.7).
   If the name equals a Kagaz export → pick a business name (BookingCard, not Card/Button).
1. Placement via the ladder: icon Kagaz lacks → components/icons/<Name>Icon.tsx (+ index.ts);
   used by exactly one screen → that screen's components/; shared in one area →
   components/<area>/; cross-area business → components/common/. components/shell/ is CLOSED —
   never create there (ADR).
2. Scaffold: named export function, type Props, composed ONLY of Kagaz components/primitives
   imported from @/components/ui (never @lokal-app/*);
   layout via VStack/HStack/Box token props; text via <Text variant color>; remaining styles in a
   module-scoped createStyles(tokens) tail with useStyles; touchables = Kagaz buttons/Pressable;
   icons passed to slots as components; style?: StyleProp<ViewStyle> merged last (layout-only);
   t() for every string and Kagaz label/a11y prop; no data, stores or navigation (props in,
   callbacks out). Icons: react-native-svg from the Figma Phosphor node, Kagaz IconProps,
   single fill={color}.
3. Temporary KAGAZ-GAP composition only when the task explicitly approves it: first line
   // KAGAZ-GAP(<issue-url>): delete when Kagaz ships <Name>, plus a docs/kagaz-gaps.md row.
4. Gate: pnpm lint --fix on the file; report the Kagaz check result, the chosen ladder level
   and why.
