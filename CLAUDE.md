# RN App — Constitution (always in force)

You are working in an app generated from rn-template. These rules are absolute.
A violation requires an approved ADR in docs/adr/ — never a silent bypass. Deep rules
live in scoped CLAUDE.md files (loaded automatically when you touch those folders).
Full text: docs/ARCHITECTURE.md (§A7 = the design-system contract).

## Design system = Kagaz (read before ANY UI work)
- UI comes from @lokal-app/kagaz-components + this app's ONE brand (src/theme/brand.ts).
  Kagaz owns every token, component, icon, font and the tab-bar/navigation look.
- GATEWAY: Kagaz enters the app in exactly two folders — src/components/ui/ (components,
  primitives, icons, brand components, tab helpers; 1:1 named re-exports) and src/theme/ (tokens,
  ThemeProvider). Everything else imports `@/components/ui` and `@/theme`, NEVER @lokal-app/*.
- STEP 0 for every UI need, in order: (a) shared Kagaz ships it? (b) this app's brand ships it
  (@lokal-app/kagaz-brand-<brand>/components, /icons)? Check docs/ARCHITECTURE.md §A7.6 and the
  <Name>.types.ts JSDoc in node_modules. If yes: register it in components/ui/kagaz.ts (or
  brand.ts) if missing, import it from @/components/ui and configure it by props. Never
  re-create, wrap, re-export, restyle or patch a Kagaz component (shared or brand); never name a
  component like a Kagaz export.
- A component unique to this BRAND (from the brand's design-system Figma) is never app code: it
  belongs in kagaz-brand-<brand>/components (Kagaz ADR-0007) → Kagaz gap. Only components with
  THIS app's business meaning live in the app.
- Kagaz lacks a value/variant/component → the Kagaz gap protocol (§A7.7): flag design / open a
  Kagaz issue; a temporary composition only with a // KAGAZ-GAP(<url>) marker + docs/kagaz-gaps.md row.
  NEVER a hardcoded lookalike, never a local token, never a new UI kit.
- components/ui/ = pass-through re-exports ONLY (kagaz.ts, brand.ts, navigation.ts, index.ts;
  adapters/ only via /kagaz-upgrade) — never restyle, alias or fork there. No theme/tokens/, no
  palette. components/shell/ is a CLOSED list of six: Screen, LoadingState, ErrorState,
  EmptyState, BottomSheet, ToastMessage (shell never uses brand-only components).
- Theme hooks + ThemeProvider come from @/theme (ThemeProvider only in providers/).
  createTheme only in theme/registry.ts.
- Token values are linted by design-system/no-raw-style-values. Kagaz's own token-police
  (@lokal-app/kagaz-token-police) is OPT-IN: only when the developer asks, via /enable-token-police.

## Where new code goes
- Pure helper (no React, no side effects)        → src/utils/
- Infrastructure / integration (no business)     → src/lib/
- Isolated feature (4-of-4: own domain, terminal navigator, no spine state,
  deletable in one PR)                            → src/features/<name>/
- Otherwise (the common case) → spine: api/<resource>/ • components/<area|common|shell|icons>/ •
  screens/<area>/<screen>/ • stores/<area>/ • hooks/use<Name>.ts (hooks/ is the ONE flat folder)
- New top-level src/ folder, new shell primitive, new dependency, Kagaz version change → STOP, ADR
  (Kagaz upgrades only via /kagaz-upgrade).

## Dependency direction (one-way)
theme → Kagaz only • components/ui → Kagaz only (the gateway) • utils → nothing • lib → utils
only (never Kagaz) • hooks → lib+utils+theme • components/shell → ui+theme+utils •
components/* → ui+shell+icons+theme+utils+hooks (NEVER api/stores/screens, NEVER @lokal-app/*) •
stores → lib+utils • api → lib+utils • screens → all of the above (Kagaz via ui only) •
features → leaf (never other features, never spine stores/screens). Components never fetch or
read stores — data arrives via props.

## Canonical shapes (scaffold with the skills, never by hand)
- Screen: screens/<area>/<screen>/{<Name>Screen.tsx, use<Name>Screen.ts, styles.ts,
  index.ts, useTrack.ts?, constants.ts?, components/?, variants/?}. Screen file = render
  only, exactly ONE component, built from Kagaz components + shell; the data hook owns
  queries, stores, handlers, typed useNavigation (screens never take a navigation prop) and
  calls useTrack (all analytics — never from JSX). styles.ts exports createStyles(tokens) ONLY.
  Data screens expose status: loading|error|empty|ready and branch ALL FOUR inside one
  shell <Screen> using shell LoadingState/ErrorState/EmptyState. A/B: variants/ share one data
  hook + one route; the screen file is the switcher. Never a screens/index.ts root barrel.
- API resource: api/<resource>/{types.ts (Api*-prefixed wire types via zod + clean app types),
  transformer.ts (to<Noun> — the only wire↔app meeting point), use<Verb><Noun>.ts}.
  Verbs: Get|List|Create|Update|Delete (List covers paginated — createInfiniteQuery inside,
  name unchanged). react-query-kit only; fetcher = apiClient → validateResponse (non-prod
  parse, APP_ENV gate) → to<Noun>; cache holds APP types only; hooks return the kit object
  unmodified; invalidate via hook.getKey(); axios only inside lib/api-client; Api* types never
  leave src/api/.
- Store: stores/<area>/<name>Store.ts — State & Actions types, actions inside the store,
  selector-only consumption, persist via MMKV adapter, NO server data ever.
- Feature: features/<name>/{api,components,screens,stores?,hooks?,navigator.tsx,types.ts,index.ts}.

## Styling (absolute)
Three channels, no fourth: (1) Kagaz component props (variant/fill/size/state…) are the ONLY
way to change a Kagaz component's look; (2) Kagaz primitives with token-named props —
<VStack gap={16} padding={16} background="surface.page.default">, <Text variant="label1P"
color="text.neutral.intense"> (short Figma style name); (3) `const styles = useStyles(createStyles)` + module-scoped
`const createStyles = (tokens: Tokens) => StyleSheet.create({…})` — components: last
declaration in-file; screens: styles.ts. NEVER an inline style. style on a Kagaz component =
layout only. Every colour/spacing/radius/border/font/opacity/shadow/motion value from `tokens`
(names: Figma path camelCased — text/on-accent/default → tokens.color.text.onAccent.default).
Text ONLY via Kagaz <Text>; touchables = Kagaz buttons or Kagaz Pressable. Runtime values →
createStyles(tokens, params); animations → [styles.x, useAnimatedStyle(...)] with tokens.motion.
Brand-optional tokens (accent02-04, highlighter, effects) and nullable component tokens via
?. / ?? never !. Raised surfaces: tokens.component.card.elevation; Kagaz components: elevated prop. Raw hex only in
theme/overrides.ts + theme/skins/* with a Figma citation. Check light AND dark.

## Naming
Folders kebab-case • components PascalCase (screens end in Screen; never a Kagaz export name) •
icons <Name>Icon • other files camelCase • named exports only • api hooks
use<Get|List|Create|Update|Delete><Noun> • stores use<Name>Store • translation keys
area.scope.key • analytics events area_object_action.

## Barrels — boundary only
index.ts allowed ONLY at: features/<x>/, lib/<slot>/, theme/, components/ui/ (the Kagaz
gateway), components/shell/, components/icons/, screens/<area>/<screen>/, stores/<area>/. Never
at layer roots, never cascading, never partial; only components/ui re-exports Kagaz components.

## Always
t() for every user-facing string INCLUDING Kagaz label/accessibility props (never rely on
Kagaz's English defaults) • lib/logger not console • FlashList not FlatList • expo-image not
Image • dayjs • zod • no any/ts-ignore/non-null on optional tokens.

## Workflow
Scaffold via skills: /create-screen /create-component /add-api-resource /add-store
/create-feature /add-adapter /api-from-collection /figma-implement /implement-feature
/add-skin /kagaz-upgrade (+ /enable-token-police, only when the developer asks). Delegate UI work to ui-implementer, Figma→Kagaz mapping to
kagaz-resolver, reviews to pr-reviewer, placement questions to architecture-guard.
After edits, hooks run lint on changed files and type-check at Stop — fix failures before
finishing; never disable a rule to pass. pnpm check-all = lint + type-check + kagaz:check.
