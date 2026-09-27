# RN App — Constitution (always in force)

You are working in an app generated from rn-template. These rules are absolute.
A violation requires an approved ADR in docs/adr/ — never a silent bypass. Deep rules
live in scoped CLAUDE.md files (loaded automatically when you touch those folders).

## Where new code goes
- Pure helper (no React, no side effects)        → src/utils/
- Infrastructure / integration (no business)     → src/lib/
- Isolated feature (4-of-4: own domain, terminal navigator, no spine state,
  deletable in one PR)                            → src/features/<name>/
- Otherwise (the common case) → spine: api/<resource>/ • components/<area|common|ui>/ •
  screens/<area>/<screen>/ • stores/<area>/ • hooks/use<Name>.ts (hooks/ is the ONE flat folder)
- New top-level src/ folder, new token key, new dependency → STOP, ask for an ADR.

## Dependency direction (one-way)
theme → nothing • utils → nothing • lib → utils only • hooks → lib+utils+theme (NEVER api/stores) •
components/ui → theme+utils •
components/* → ui+theme+utils+hooks (NEVER api/stores/screens) • stores → lib+utils •
api → lib+utils • screens → all of the above • features → leaf (never other features,
never spine stores/screens). Components never fetch or read stores — data arrives via props.

## Canonical shapes (scaffold with the skills, never by hand)
- Screen: screens/<area>/<screen>/{<Name>Screen.tsx, use<Name>Screen.ts, styles.ts,
  index.ts, useTrack.ts?, constants.ts?, components/?, variants/?}. Screen file = render
  only, exactly ONE component; the data hook owns queries, stores, handlers, typed
  useNavigation (screens never take a navigation prop) and calls useTrack (all analytics —
  never from JSX). styles.ts exports createStyles(theme) ONLY. Data screens expose
  status: loading|error|empty|ready and branch ALL FOUR inside one <Screen> wrapper using
  ui LoadingState/ErrorState/EmptyState. A/B: variants/ share one data hook + one route;
  the screen file is the switcher. Never a screens/index.ts root barrel.
- API resource: api/<resource>/{types.ts (Api*-prefixed wire types via zod + clean app types),
  transformer.ts (to<Noun> — the only wire↔app meeting point), use<Verb><Noun>.ts}.
  Verbs: Get|List|Create|Update|Delete (List covers paginated — createInfiniteQuery inside,
  name unchanged). react-query-kit only; fetcher = apiClient → validateResponse (non-prod
  parse, APP_ENV gate) → to<Noun>; cache holds APP types only (never raw / {raw,transformed}); hooks return
  the kit object unmodified; invalidate via hook.getKey(); axios only inside lib/api-client;
  Api* types never leave src/api/.
- Store: stores/<area>/<name>Store.ts — State & Actions types, actions inside the store,
  selector-only consumption, persist via MMKV adapter, NO server data ever.
- Feature: features/<name>/{api,components,screens,stores?,hooks?,navigator.tsx,types.ts,index.ts}.

## Styling (absolute)
NEVER write an inline style (style={{…}}) anywhere. The only pattern:
`const styles = useStyles(createStyles)` in the component + `const createStyles =
(theme: Theme) => StyleSheet.create({…})` — components: last declaration in-file;
screens: the screen folder's styles.ts (createStyles ONLY).
Runtime values (insets, measured layout, API colors) → createStyles(theme, params) +
useStyles(createStyles, params); animations → [styles.x, useAnimatedStyle(...)]. Nothing else.
All values from theme tokens. Raw hex only in theme/tokens/palette.ts. Text only via
<Typography variant>. Token values come from the design team's Figma — if a design value
has no token, flag it; NEVER hardcode a lookalike number.

## Naming
Folders kebab-case • components PascalCase (screens end in Screen) • other files camelCase •
named exports only (no default exports) • api hooks use<Get|List|Create|Update|Delete><Noun> •
stores use<Name>Store • translation keys area.scope.key • analytics events area_object_action.

## Barrels — boundary only
index.ts allowed ONLY at: features/<x>/, lib/<slot>/, theme/, components/ui/,
screens/<area>/<screen>/, stores/<area>/. Never at layer roots, never cascading, never partial.

## Always
t() for every user-facing string • lib/logger not console • FlashList not FlatList •
expo-image not Image • dayjs • zod • accessibilityRole on touchables • no any/ts-ignore.

## Workflow
Scaffold via skills: /create-screen /add-api-resource /add-store /create-component
/create-feature /add-adapter /api-from-collection /figma-implement /implement-feature.
Delegate UI work to ui-implementer, reviews to pr-reviewer, placement questions to
architecture-guard. After edits, hooks run lint on changed files and type-check at Stop —
fix failures before finishing; never disable a rule to pass.
