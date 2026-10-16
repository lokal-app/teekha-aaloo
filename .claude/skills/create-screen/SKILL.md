---
description: Scaffold a screen in the canonical screens/<area>/<screen>/ shape, built from
  Kagaz components + the shell, and register its route. Use whenever a new screen is needed —
  never create screen files by hand.
argument-hint: "<area> <screen-name> [navigator: unauthenticated|authenticated|tabs|<feature>]"
allowed-tools: "Read Write Edit Grep Glob Bash"
---
1. Resolve area (kebab-case) and ScreenName (PascalCase). Path: src/screens/<area>/<screen-name>/.
   If the folder exists, stop and report.
2. Kagaz step 0: list the screen's UI elements and the Kagaz export for each — shared, then the
   app's brand /components and /icons (docs/ARCHITECTURE.md §A7.6; props from the <Name>.types.ts
   JSDoc under node_modules/@lokal-app/kagaz-components or kagaz-brand-<brand>).
   Elements with no export → ladder (§A7.4) or GAP (§A7.7) — report gaps before writing.
   Add any Kagaz export not yet in components/ui/kagaz.ts|brand.ts (pass-through line).
3. Create <Name>Screen.tsx: named export, the ONLY component in the file, renders ONE shell
   <Screen> (from @/components/shell) and branches the body on data.status with shell
   LoadingState/ErrorState/EmptyState (strings from the data hook), content for 'ready' built
   from Kagaz components imported from @/components/ui + VStack/HStack/Box token props +
   <Text variant color>, remaining
   styles via useStyles(createStyles) imported from ./styles, t() strings under
   '<area>.<screen>.' for every Kagaz label/a11y prop, zero data/navigation/analytics logic.
4. Create use<Name>Screen.ts: typed useNavigation inside; returns { status, retry, ...data,
   ...handlers, ...strings }. Wire the api hooks / store selectors named in the task; forms
   via react-hook-form + zodResolver feeding the controlled Kagaz inputs; if no api exists yet,
   stub status: 'ready' with a TODO pointing at /add-api-resource. If the task names ≥2
   analytics events, create useTrack.ts (thin lib/analytics wrapper, base payload once) and
   call it from the data hook's handlers.
5. Create styles.ts exporting createStyles(tokens: Tokens) ONLY (screen constants and Figma
   content dimensions → constants.ts, node id cited).
6. Create index.ts barrel exporting the screen only. NEVER touch/create screens/index.ts.
7. Register the typed route in the navigator from $ARGUMENTS (default: authenticated):
   add to that stack's types.ts ParamList + Screen entry importing from the folder barrel
   (tabs: tabItem({ label: t(...), icon, activeIcon }) per §A8).
8. Add translation keys to src/translations/en.json (and sibling locales as TODO).
9. Gate: pnpm lint --fix on created files, pnpm type-check. Fix until clean; never disable rules.
