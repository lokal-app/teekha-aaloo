---
description: Scaffold a screen in the canonical screens/<area>/<screen>/ shape and register
  its route. Use whenever a new screen is needed — never create screen files by hand.
argument-hint: "<area> <screen-name> [navigator: unauthenticated|authenticated|tabs|<feature>]"
allowed-tools: "Read Write Edit Grep Glob Bash"
---
1. Resolve area (kebab-case) and ScreenName (PascalCase). Path: src/screens/<area>/<screen-name>/.
   If the folder exists, stop and report.
2. Create <Name>Screen.tsx: named export, the ONLY component in the file, renders ONE
   <Screen> wrapper (ui primitive) and branches the body on data.status with
   LoadingState/ErrorState/EmptyState, content for 'ready', styles via
   useStyles(createStyles) imported from ./styles, t() strings under '<area>.<screen>.',
   zero data/navigation/analytics logic.
3. Create use<Name>Screen.ts: typed useNavigation inside; returns { status, retry, ...data,
   ...handlers }. Wire the api hooks / store selectors named in the task; if none exist yet,
   stub status: 'ready' with a TODO pointing at /add-api-resource. If the task names ≥2
   analytics events, create useTrack.ts (thin lib/analytics wrapper, base payload once) and
   call it from the data hook's handlers.
4. Create styles.ts exporting createStyles(theme) ONLY (screen constants → constants.ts).
5. Create index.ts barrel exporting the screen only. NEVER touch/create screens/index.ts.
6. Register the typed route in the navigator from $ARGUMENTS (default: authenticated):
   add to that stack's types.ts ParamList + Screen entry importing from the folder barrel.
7. Add translation keys to src/translations/en.json (and sibling locales as TODO).
8. Gate: pnpm lint --fix on created files, pnpm type-check. Fix until clean; never disable rules.
