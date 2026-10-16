<!-- Exported from rn-template-constitution.md (Kagaz edition). The constitution is the source; regenerate, don't hand-edit. -->

# PART B — THE CLAUDE CODE HARNESS

Everything in this part ships inline in the template repo's `.claude/` — the canonical home. The layers and what each is for:

| Layer | Mechanism | Role |
|---|---|---|
| 1. Always-on / scoped context | Root `CLAUDE.md`, scoped `CLAUDE.md` per folder, `.claude/rules/*.md` with `paths:` globs | Tell Claude the rules where the work happens |
| 2. Procedures | Skills (`.claude/skills/<name>/SKILL.md`) | Make following the rules mechanical |
| 3. Specialists | Agents (`.claude/agents/<name>.md`) | Isolated contexts for build/review work; `memory: project` for learners |
| 4. Hard gates | Hooks (`.claude/settings.json` + `.claude/hooks/*`) | Block violations with exit codes — no reasoning involved |
| 5. External knowledge | MCP servers (`.mcp.json`): Figma, Postman. Design-system truth: the installed Kagaz package (`node_modules/@lokal-app/kagaz-components/src/**/*.types.ts` JSDoc) + `.claude/figma/component-map.json` | Design, API-contract and component-API truth on tap |
| 6. Distribution *(optional — TODO, see B9)* | Org plugin + marketplace | One versioned harness for every app — only if cross-app drift becomes a real problem |
| 7. CI backstop | GitHub Action PR review | Enforcement even when code wasn't written in Claude Code |

Determinism comes from the **gates between steps** (lint, type-check, `kagaz:check`, schema validation — exit codes, not reasoning), never from longer prompts. The mega-agent anti-pattern (all rules in one giant description) remains rejected.

**Design-system awareness is wired into every layer:** the root and scoped `CLAUDE.md` files state the Kagaz contract; the styling rule fires on every `.tsx`; every UI-producing skill and agent runs **Kagaz step 0** (§A7.4) before writing a component; `guard-edit.sh` blocks the forbidden folders and Kagaz patching; `guard-bash.sh` blocks dependency and Kagaz-version changes outside `/kagaz-upgrade`; `eslint-plugin-design-system` (with Kagaz's **token-police** when the app opts in) + `kagaz:check` fail the build on any drift; `pr-reviewer` has a dedicated design-system pass. Step 0 always covers **both** Kagaz layers: the shared library and this app's brand package (`/components`, `/icons`).

## B1. File map of the harness

```
rn-template/
├── CLAUDE.md                          root constitution digest (verbatim below)
├── .mcp.json                          Figma + Postman MCP servers (team-shared)
├── .claude/
│   ├── settings.json                  hooks + permissions (verbatim below)
│   ├── settings.local.json            (gitignored) personal overrides
│   ├── rules/
│   │   └── styling.md                 path-glob rule: Kagaz-first + createStyles(tokens) (all *.tsx)
│   ├── hooks/
│   │   ├── guard-bash.sh              destructive-command + dependency/Kagaz-version guard
│   │   ├── guard-edit.sh              blocks writes to forbidden design-system paths + node_modules
│   │   ├── lint-changed.sh            per-file lint after Edit/Write (+ marks src/ dirty)
│   │   ├── stop-type-check.sh         end-of-turn type gate (exit 2 + stderr, loop-guarded)
│   │   └── reminder.txt               one-line decision-tree + Kagaz reminder
│   ├── agents/                        9 agents (B5)
│   ├── skills/                        12 skills (B6)
│   ├── figma/
│   │   ├── component-map.json         Figma component set key → Kagaz export (ships PRE-FILLED, B6)
│   │   ├── screen-map.json            per-app: Figma frame → screens/<area>/<screen>
│   │   ├── design-package.schema.json the stage-1 output contract
│   │   └── validate.mjs               schema gate
│   └── state/                         (gitignored) pipeline scratch space
├── .github/workflows/
│   ├── quality.yml                    lint + type-check + kagaz:check on every PR
│   └── claude-review.yml              Claude PR review (B10)
└── src/**/CLAUDE.md                   scoped rules (B4)
```

There is **no** `token-map.json` and **no** `token-reconciler`: Kagaz owns tokens, and Figma variable names map to token paths by the mechanical rule in §A7.1.

## B2. Root `CLAUDE.md` (ships verbatim, ≤ 120 lines)

```markdown
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
```

## B3. `.claude/rules/styling.md` (path-glob rule — fires on every `.tsx` touch)

```markdown
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
  tokens.motion.duration/easing and useReduceMotion(). No other dynamic-style path exists.
- Every colour/spacing/radius/border/font/opacity/shadow value from `tokens`. No literals.
  Content dimensions from Figma → constants.ts with the Figma node cited.
- Text only via Kagaz <Text>; touchables only Kagaz buttons / Kagaz Pressable; icons only
  Kagaz icons, the brand's /icons, or components/icons (passed to slots as components).
- Raised looks: Kagaz `elevated` prop / tokens.component.card.elevation — never a hand-built shadow.
- Every Kagaz text/a11y prop via t() — including the ones with English defaults.
- Figma shows a value/variant/component Kagaz lacks: STOP — Kagaz gap protocol (§A7.7). Never approximate.
```

*Load-bearing note:* `paths:`-scoped rules have known gaps (they may not be injected on Write, only on Read), so this file is a convenience layer, never the enforcement. The same rules live in the always-loaded root `CLAUDE.md` (B2) and are enforced mechanically by `react-native/no-inline-styles`, `no-restricted-imports` and `design-system/*` (or Kagaz's `token-police/*` once opted in) via the PostToolUse lint hook, and by `guard-edit.sh`.

## B4. Scoped `CLAUDE.md` files (verbatim, one per folder)

Each is deliberately ≤ 25 lines — they load on demand when Claude touches the folder.

**`src/api/CLAUDE.md`**
```markdown
# api/ — server state only
Shape per resource (exactly): types.ts (zod wire schemas + ApiX = z.infer types + clean app
types together), transformer.ts (to<Noun>() — the ONLY wire↔app meeting point, mandatory even
when near-identity), use<Verb><Noun>.ts (one react-query-kit hook per file). No index.ts.
Verbs: Get (single) | List (any collection — paginated uses createInfiniteQuery INSIDE, name
unchanged) | Create | Update | Delete.
Fetcher pipeline (fixed): apiClient → validateResponse(schema, data) [non-prod parse] →
to<Noun>() → return APP type. Cache stores app types ONLY — never raw wire data, never
{raw, transformed} pairs. Hooks return the kit query object unmodified (no {loading, error}
wrappers — screens map to status). Envelope unwrapping + error normalization live in
lib/api-client interceptors, never per-hook. Api* types never leave src/api/**.
Query keys only via the kit; invalidate with hook.getKey(). Mutations invalidate in
onSuccess; optimistic updates need full onMutate/onError/onSettled.
types.ts or transformer.ts over ~200 lines → split the RESOURCE, not the file.
Never import components/screens/stores here. axios only via @/lib/api-client.
Never handle 401s or refresh tokens here — lib/api-client does it once. Login/OTP fetchers pass
{ skipAuth: true } and persist tokens via saveTokens().
Scaffold with /add-api-resource or /api-from-collection (Postman).
```

**`src/screens/CLAUDE.md`**
```markdown
# screens/ — two-level: screens/<area>/<screen>/
Files: <Name>Screen.tsx (render ONLY, exactly ONE component — others go to ./components/;
no queries, stores, navigation, or analytics), use<Name>Screen.ts (ALL wiring; typed
useNavigation inside — screens never take a navigation prop; returns one object incl.
status: loading|error|empty|ready + retry), styles.ts (exports createStyles(tokens) ONLY —
constants go to constants.ts), index.ts, optional useTrack.ts (≥2 analytics events: thin
lib/analytics wrapper, base payload once, called only from the data hook), optional
constants.ts (snap points, Figma content dimensions with node cited), optional components/,
optional variants/ (A/B: presentation-only variants sharing ONE data hook, ONE route, ONE
useTrack; the screen file is the switcher; sibling -v2 screen folders forbidden).
UI = Kagaz, imported ONLY from @/components/ui (shared + brand-only pieces), layout
via VStack/HStack/Box token props, text via Kagaz <Text variant color>, all labels via t().
Wrap in ONE shell <Screen>; branch all four states with shell LoadingState/ErrorState/
EmptyState — never duplicate the layout tree per state. Form inputs are controlled Kagaz
inputs wired to react-hook-form in the data hook (value/onChangeText/error/errorText).
Component promotion: Kagaz ships it → import; 1 screen → ./components/; ≥2 screens same area →
components/<area>/; cross-area business → components/common/. Move, never copy.
NEVER create screens/index.ts (root barrel executes every screen at startup).
Scaffold with /create-screen (or /figma-implement from a Figma frame).
```

**`src/components/CLAUDE.md`**
```markdown
# components/ — app compositions of Kagaz (presentational only)
Kagaz is the design system. ui/ = the Kagaz GATEWAY (own CLAUDE.md): pass-through re-exports,
the only importer of @lokal-app/kagaz-*; everything here imports Kagaz from @/components/ui.
shell/ = the CLOSED six app-shell pieces (own CLAUDE.md). icons/ = app icons Kagaz lacks (own
CLAUDE.md). <area>/ = shared by ≥2 screens of one area. common/ = cross-area business components.
Every component here composes Kagaz (shared components, primitives, and this app's brand
/components) and carries THIS app's business meaning (BookingCard, OrderSummary). Forbidden:
re-creating, wrapping, re-exporting or restyling a Kagaz component (shared or brand); naming a
component like a Kagaz export; components/ui/; a brand-unique design-system component (it belongs
in @lokal-app/kagaz-brand-<brand>/components). Kagaz lacks something → Kagaz gap protocol
(docs/ARCHITECTURE.md §A7.7): // KAGAZ-GAP(<url>) + docs/kagaz-gaps.md row.
NOTHING here fetches data, reads stores, or navigates — data arrives via props, events leave
via callbacks. No screen-specific components here (those live inside the screen folder).
Styling per the absolute pattern: Kagaz props → primitives' token props → createStyles(tokens).
```

**`src/components/ui/CLAUDE.md`**
```markdown
# components/ui/ — the Kagaz gateway (the ONLY place Kagaz components enter the app)
Shape (locked): kagaz.ts (shared re-exports) • brand.ts (this brand's /components /icons
/geometry; `export {};` if none) • navigation.ts (useTabBarOptions, tabItem) • index.ts
(export * from kagaz + navigation, + brand once it has a re-export) • adapters/<Name>.tsx (ONLY via /kagaz-upgrade) • CLAUDE.md.
Rules: only `export { A, type AProps, … } from '@lokal-app/kagaz-…'` statements — explicit
names, never `export *` from a Kagaz package, never an alias, no JSX, no styles, no defaults,
no HOCs. Names stay exactly Kagaz's (docs, JSDoc, component map and lint rules depend on it).
First use of a Kagaz export anywhere = add it here in the same PR (skills do this in step 0).
Adapters exist only to absorb a Kagaz API change: same name, maps the app-facing props onto
the new Kagaz API, first line `// KAGAZ-ADAPTER(<kagaz-version>): <what changed>`, a row in
docs/kagaz-gaps.md "Adapters"; deleted when call sites migrate. Never change looks here —
visual needs go through props, the theme, or the Kagaz gap protocol (§A7.7).
Imports: Kagaz packages only (+ @/theme inside adapters). Nothing else from src/.
```

**`src/components/shell/CLAUDE.md`**
```markdown
# components/shell/ — the app shell Kagaz deliberately leaves to apps (CLOSED list)
Exactly six: Screen, LoadingState, ErrorState, EmptyState, BottomSheet/, ToastMessage + index.ts.
A seventh file fails lint (design-system/locked-folders); extending = ADR proving Kagaz won't own it.
Built ONLY from @/components/ui (Spinner, Text, Button, FloatingSnackbar, VStack…)
+ createStyles(tokens) + the one locked-stack lib each wraps (safe-area-context,
keyboard-controller, @gorhom/bottom-sheet, react-native-flash-message). Imports: theme/,
utils/, @/components/ui, that lib — nothing else (never a brand-only component: shell is brand-neutral). Contract: named export + exported <Name>Props; text
arrives via props (NEVER t() here); no business logic, data, stores or navigation; style prop
layout-only, merged last. Screen owns safe area, page background (surface.page.default), status
bar style (useTheme().mode) and keyboard-aware scrolling (the Kagaz tab bar is solid: no inset).
ToastMessage renders Kagaz FloatingSnackbar for react-native-flash-message (mounted in providers/);
showToast() lives in lib/toast and is called from data hooks only.
```

**`src/components/icons/CLAUDE.md`**
```markdown
# components/icons/ — app icons Kagaz doesn't ship
Check first: Kagaz icons (@lokal-app/kagaz-components) and the brand's icons
(@lokal-app/kagaz-brand-<brand>/icons, e.g. CoinIcon). Only if neither has it: <Name>Icon.tsx here, generated
from the Figma Phosphor component (react-native-svg, viewBox from Figma, single fill={color}),
implementing Kagaz IconProps { color?: string; size: number; testID?: string }, named export,
registered in index.ts. Callers pass a tokens.color.icon.* colour and a tokens.iconSize.* size;
pass icons to Kagaz slots as components (icon={RupeeIcon}) so the slot colours them per state.
No icon fonts, no @expo/vector-icons, no PNG icons. A generic icon many apps need → ask Kagaz.
```

**`src/theme/CLAUDE.md`**
```markdown
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
```

**`src/stores/CLAUDE.md`**
```markdown
# stores/ — Zustand client state
stores/<area>/<name>Store.ts + index.ts barrel. State type + Actions type; actions defined
inside create(); selector-only consumption (useXStore(s => s.field)); getState() only outside
React. persist → MMKV adapter from lib/storage with explicit partialize. NEVER server data
(that's React Query's cache), never at stores/ root, never imported by components/.
Scaffold with /add-store.
```

**`src/lib/CLAUDE.md`**
```markdown
# lib/ — infrastructure ONLY (the cardinal rule)
Integrations and adapters: api-client, logger, storage, i18n, permissions, toast + vendor slots
(analytics, crash, push, remoteConfig, observability, payment). A slot = index.ts (public
API) + types.ts (contract) + adapter.ts (impl; ships as no-op). Swap vendors by replacing
adapter.ts only (/add-adapter). NO business code, NO imports from spine/features/theme, NO
Kagaz and no UI: lib/toast's showToast() renders nothing (shell/ToastMessage does).
If it knows what a "booking" is, it does not belong here.
api-client owns the session: single-flight 401 refresh (session.ts), the one per-app file
authRefresh.ts (refresh protocol), focus/online bindings (reactQueryNative.ts). Session
expiry reaches the app only via configureApiAuth({ onSessionExpired }) — never a store import.
Storage rule: storage (plain MMKV) = THE app storage; secureStorage (expo-secure-store) =
secrets vault ONLY (long-lived credentials/crypto secrets, ≤2KB, keys from the secure.ts
enum). Refresh token → secureStorage; access token → MMKV. Never AsyncStorage.
```

**`src/features/CLAUDE.md`**
```markdown
# features/ — isolated business code (4-of-4 or it's spine)
Admission test (ALL must hold): own domain model • terminal navigator boundary • zero spine
state read/write • deletable in one PR. Shape: api/, components/, screens/, stores?/, hooks?/,
navigator.tsx, types.ts, index.ts (the ONLY public surface). Never import another feature,
never import spine stores/screens. Spine mounts the feature only via its barrel + navigator.
Scaffold with /create-feature (it runs the admission test first).
```

**`src/utils/CLAUDE.md`**
```markdown
# utils/ — pure helpers
No React, no hooks, no side effects, no framework imports, no I/O. Deterministic
input → output. If it needs a hook → src/hooks/. If it touches a vendor/integration → lib/.
```


**`src/navigation/CLAUDE.md`**
```markdown
# navigation/ — locked three-state root, Kagaz chrome
RootNavigator renders NavigationContainer (navigationRef, linking, theme =
navigationThemes[themeName][mode] from @/theme) and switches ONLY on authStore.status:
restoring | unauthenticated | authenticated. Intro slider = initialRouteName of
UnauthenticatedStack when !hasSeenIntro (persisted flag) — NOT a root state. Registration =
Stack.Group, one route per step, cross-step state in stores/registration (reset on completion).
Bottom tabs: React Navigation's own bar styled by Kagaz (helpers from @/components/ui) — screenOptions={{ ...useTabBarOptions(
{ bottomInset: insets.bottom }), headerShown: false }} (solid bar, no blur) and per tab tabItem({ label: t(),
icon, activeIcon, badgeCount, badgeAccessibilityLabel }). Never a custom tabBar, never Kagaz
BottomNav in a navigator. Every navigator owns types.ts; params always typed; `as never`
forbidden. navigationRef is the only out-of-React navigation. Screens never import
navigators — navigation calls live in screen data hooks.
```

**`src/providers/CLAUDE.md`**
```markdown
# providers/ — the single composition root (providers/index.tsx only)
Fixed order, outermost first: GestureHandlerRootView → SafeAreaProvider → KeyboardProvider →
QueryClientProvider → Kagaz ThemeProvider → BottomSheetModalProvider → children +
<FlashMessage MessageComponent={ToastMessage} />. ThemeProvider: theme={themes[themeName] ??
themes[DEFAULT_THEME]}; settings.colorScheme 'system' → followSystem, 'light'|'dark' → mode,
'brand' → neither (brand defaultMode). The ONLY place ThemeProvider is rendered. Nested
providers anywhere else are forbidden (a nested Kagaz ThemeProvider for a one-subtree mode
change needs an ADR).
```

## B5. Agents (`.claude/agents/`, verbatim)

Nine agents. Each has a narrow job, a tool whitelist (`tools:` — the agent frontmatter key; `allowed-tools:` is the *skill* key), and (where learning helps) `memory: project` so it accumulates project-specific knowledge across sessions (project scope — verify at setup where Claude Code stores it and whether to commit it). Every agent that writes or reviews UI runs **Kagaz step 0** (§A7.4) and the **gap protocol** (§A7.7); none may edit `node_modules`, add a token, or touch a Kagaz version.

**`.claude/agents/architecture-guard.md`**
```markdown
---
name: architecture-guard
description: Decide WHERE code belongs and verify a proposed/actual change respects the
  decision tree, Kagaz step 0, canonical shapes, dependency direction, and barrel whitelist.
  Spawn before any non-trivial implementation and before PRs. Read-only.
tools: Read, Grep, Glob, Bash
memory: project
---
You are the architecture guard for a rn-template app. Source of truth: root CLAUDE.md
+ scoped CLAUDE.md files + docs/ARCHITECTURE.md (this repo's constitution; §A7 = Kagaz).
Given a feature/change description, output a PLACEMENT PLAN:
1. Run the decision tree (utils → lib → features 4-of-4 → spine). For features/, evaluate
   each of the 4 criteria explicitly with evidence; one failure = spine.
2. For every UI element in the change run Kagaz step 0: name the Kagaz export that covers it —
   shared (node_modules/@lokal-app/kagaz-components/src/*/*.types.ts) or this app's brand
   (node_modules/@lokal-app/kagaz-brand-<brand>/src/components/*/*.types.ts, /icons), per
   docs/ARCHITECTURE.md §A7.6. Only elements with no Kagaz export get a file, placed by the
   ladder (shell is closed; icons/; screen components/; components/<area>/; components/common/).
   A Kagaz component with different looks → GAP(variant); a brand-unique design-system component
   → GAP(brand-component) for kagaz-brand-<brand> (§A7.7) — never a file.
3. List EVERY file to create/modify with its full path, conforming to the canonical shapes
   (screen, api resource, store, feature, theme). Flag any file that has no legal home.
4. Check dependency direction and Kagaz import zones for each planned import; reject
   violations with the corrected alternative (e.g. "component reads store → move read into the
   screen data hook, pass prop"; "kagaz-tokens import in a component → useTokens from @/theme").
5. Check barrel whitelist; reject any new index.ts outside it or re-exporting Kagaz outside
   components/ui. Reject any @lokal-app/kagaz-* import outside components/ui/ and theme/ (the
   gateway, §A7.8); list the gateway lines (ui/kagaz.ts, ui/brand.ts) the change must add.
Output format: PLACEMENT PLAN (file list) / KAGAZ USAGE (element → Kagaz export) / GAPS /
VIOLATIONS (numbered, each with the rule and the fix) / VERDICT: APPROVE or REVISE.
Never propose rule changes — point to the ADR process.
```

**`.claude/agents/ui-implementer.md`**
```markdown
---
name: ui-implementer
description: Build or modify UI strictly on the Kagaz design system — app compositions in
  components/<area>|common, app icons, the closed shell, and screen presentation layers.
  Delegate ALL component-building work here.
tools: Read, Edit, Write, Grep, Glob, Bash
memory: project
---
You build UI for a rn-template app whose design system is Kagaz. Before writing ANY component:
1. Read docs/ARCHITECTURE.md §A7 in full (tokens, styling channels, ladder, shell, inventory,
   gap protocol) and src/theme/index.ts (the only theme surface: useStyles, useTokens, Tokens).
2. KAGAZ STEP 0: for each element, find the Kagaz export (§A7.6) — first the shared library,
   then this app's brand (@lokal-app/kagaz-brand-<brand>/components, /icons). Read its props in
   node_modules/@lokal-app/kagaz-components/src/<Name>/<Name>.types.ts (brand:
   node_modules/@lokal-app/kagaz-brand-<brand>/src/components/<Name>/<Name>.types.ts); the JSDoc
   maps every prop to its Figma property. Register it in components/ui/kagaz.ts or brand.ts if it
   isn't there (a pass-through `export { … } from` line, exact name), import it from
   @/components/ui, use it with props. Never import @lokal-app/* outside components/ui and theme/.
   Never re-create, wrap, re-export or
   restyle it; never name your component like a Kagaz export. A brand-unique design-system
   component Kagaz lacks is a GAP for the brand package — never app code.
3. Read the existing components/<area>, components/common and components/icons first — reuse
   before creating.
Absolute rules: no inline styles ever; Kagaz props → primitives (VStack/HStack/Box token props,
<Text variant color>) → module-scoped createStyles(tokens) + useStyles (in-file tail for
components, styles.ts for screens); style on a Kagaz element is layout-only; every colour/
spacing/radius/border/font/opacity/shadow/motion value from tokens (Figma path camelCased);
brand-optional tokens via ?. with a semantic fallback; text only via Kagaz <Text>; touchables
only Kagaz buttons / Kagaz Pressable; raised looks via `elevated` / tokens.component.card.elevation;
icons = Kagaz → brand /icons → components/icons (pass as
components to slots); FlashList for lists; expo-image for images; named exports; t() for all
strings and EVERY Kagaz label/a11y prop (never rely on English defaults) — except inside
components/shell, which takes text via props.
If a design requires a value, variant or component Kagaz lacks: STOP and report it as a GAP
(§A7.7) with the Figma node — never approximate, never add a token or override yourself, never
build a look-alike. Only when the task explicitly approves a temporary composition: build it in
components/common/ from Kagaz primitives with the // KAGAZ-GAP(<url>) first line and add the
docs/kagaz-gaps.md row.
components/shell is a closed list of six — never add a seventh.
Check the result renders correctly in light AND dark (no brand/mode branching for colours).
After every file: run pnpm lint on it; fix until clean. Never disable a rule.
```

**`.claude/agents/screen-builder.md`**
```markdown
---
name: screen-builder
description: Create complete screens in the canonical screens/<area>/<screen>/ shape, built
  from Kagaz components + the shell, wiring existing api hooks, stores and forms. Use for
  "build the X screen" tasks after api/stores exist (or alongside /add-api-resource).
tools: Read, Edit, Write, Grep, Glob, Bash
memory: project
---
You build screens for a rn-template app. Canonical shape, no deviations:
<Name>Screen.tsx (render only, exactly ONE component) + use<Name>Screen.ts (ALL wiring) +
styles.ts (createStyles(tokens) ONLY) + index.ts + optional useTrack.ts / constants.ts /
components/ / variants/.
Rules: the data hook owns queries (react-query-kit hooks from api/), store selectors,
derived state, form state (react-hook-form + zod, wired to controlled Kagaz inputs:
value/onChangeText/error/errorText), handlers, typed useNavigation (never a navigation prop),
toasts via lib/toast, and all analytics via useTrack; it returns ONE object including
status: 'loading'|'error'|'empty'|'ready' and retry(), plus every translated string the shell
needs. The screen renders ONE shell <Screen> wrapper and branches only the body on all
four states with shell LoadingState/ErrorState/EmptyState — never duplicate the layout tree.
The body is Kagaz: components from @/components/ui (never @lokal-app/* directly; register a
missing export in components/ui/kagaz.ts or brand.ts first) configured by props (run Kagaz
step 0 — shared, then the app's brand /components — docs/ARCHITECTURE.md §A7.6, for every
element), layout via VStack/HStack/Box token
props, text via <Text variant color>, the rest via styles.ts. Content dimensions from Figma go
to constants.ts with the node cited. Missing Kagaz value/variant/component → STOP, report a
GAP (§A7.7). The screen component contains zero hooks except useStyles / useTranslation and
the data hook. Screens with ≥2 analytics events get useTrack.ts (thin lib/analytics wrapper,
base payload once, never called from JSX). A/B variants are presentation-only files in
variants/ sharing the one data hook; the screen file switches.
Strings via t() with area.screen.key naming — including every Kagaz label/a11y prop.
Register the route ONLY in the navigator the flow-wirer or the task specifies, with typed
params, importing the screen's folder barrel.
Verify: pnpm lint on every touched file + pnpm type-check before reporting done.
```

**`.claude/agents/feature-builder.md`**
```markdown
---
name: feature-builder
description: Scaffold and implement isolated features in features/<name>/ AFTER the 4-of-4
  admission test passes. Handles multi-screen features with navigator, stores, and api.
tools: Read, Edit, Write, Grep, Glob, Bash
---
You build self-contained features. PRECONDITION: architecture-guard has approved 4-of-4
admission (own domain, terminal navigator, no spine state, deletable in one PR). If you have
no approval in context, request it before writing files.
Shape: features/<name>/{api/, components/, screens/, stores?/, hooks?/, navigator.tsx,
types.ts, index.ts}. Internal folders follow the same canonical shapes as the spine.
index.ts is the ONLY public surface — export the navigator + the minimal public API.
Never import other features or spine stores/screens. Mount point: a single screen entry in
AuthenticatedStack (coordinate with navigation/types.ts).
Verify: pnpm lint + pnpm type-check clean; grep for reverse imports (spine deep-importing
your internals) and report them.
```

**`.claude/agents/pr-reviewer.md`**
```markdown
---
name: pr-reviewer
description: Thorough constitution review of staged changes, a branch diff, or a PR —
  including a dedicated Kagaz design-system pass. Spawn before merging anything and as the
  final gate of every pipeline. Read-only.
tools: Read, Grep, Glob, Bash
memory: project
---
You review diffs against the rn-template constitution. Procedure:
1. Collect the diff (git diff --staged, or the range you were given) and the list of files.
2. For each file, check by category: placement (decision tree, canonical shapes, file
   inventory — flag files not in the legal inventory), dependency direction, barrels
   (whitelist only), naming/casing, screen shape (one component per screen file, no
   navigation prop, useTrack not called from JSX, no sibling -v2 variant folders), state
   (selector-only Zustand, no server data in stores, react-query-kit conventions, getKey()
   invalidation, non-prod validateResponse (APP_ENV gate, never __DEV__), transformer-in-
   fetcher, cache holds app types only, Api* types confined to src/api/**, kit object
   returned unmodified), micro-conventions (named exports, t(), logger, FlashList,
   expo-image, any/ts-ignore, a11y, line limits), navigation (typed params, no
   screen→navigator imports, Kagaz tab bar via useTabBarOptions/tabItem).
3. DESIGN-SYSTEM PASS (every .tsx and every src/theme file):
   - Kagaz step 0: any new component/JSX tree that duplicates, wraps, re-exports or restyles
     a Kagaz export, shared or brand (§A7.6) → BLOCKER. Component named like a Kagaz export →
     BLOCKER. A brand-unique design-system component built as app code without a KAGAZ-GAP
     marker + ledger row → BLOCKER. Another brand's subpath, or a brand /components in shell/ → BLOCKER.
   - Styling: inline styles; literals in token categories; createStyles placement/module
     scope; visual keys in a Kagaz element's style; RN Text/Pressable/Touchable; tokens read
     from anywhere but useTokens/useStyles; brand-optional tokens with `!`; branching on brand
     or mode for colours; raw opacity stacked on …disabled tokens; animation literals.
   - Folders: theme/tokens, a 7th shell file, theme files outside §A7.2, components/ui files
     outside §A7.8.
   - Gateway: any @lokal-app/kagaz-* import outside components/ui/ and theme/ → BLOCKER;
     anything but pass-through named re-exports in ui/{kagaz,brand,navigation}.ts (JSX, styles,
     defaults, aliases, export * from Kagaz) → BLOCKER; an adapters/ file outside a
     /kagaz-upgrade PR or without its KAGAZ-ADAPTER marker + ledger row → BLOCKER.
   - Imports: kagaz-tokens/brand root outside theme/; deep Kagaz paths; ThemeProvider outside
     providers/; createTheme outside theme/registry.ts.
   - Theme: every override/skin value cites its Figma node + sign-off; no hex elsewhere.
   - i18n: every Kagaz label/a11y prop the variant renders is passed via t().
   - Gaps: every KAGAZ-GAP marker has a docs/kagaz-gaps.md row; an approximated design value
     without a gap record → BLOCKER.
   - package.json / app.config.ts: Kagaz versions (components, tokens, brand, and token-police if
     opted in) unchanged outside a /kagaz-upgrade PR; one brand; exactly one token-value tier
     active in eslint.config.mjs; no eslint-disable for design-system/* (or token-police/*).
4. Run pnpm lint, pnpm type-check and pnpm kagaz:check; include failures as findings.
Output: findings as `path:line — [RULE] problem → fix`, severity-ordered (BLOCKER/MAJOR/MINOR),
then VERDICT: APPROVE or REQUEST CHANGES. A single BLOCKER (rule violation without a linked
ADR) means REQUEST CHANGES. Do not soften findings; do not propose rule changes.
```

**`.claude/agents/adapter-wirer.md`**
```markdown
---
name: adapter-wirer
description: Replace a lib/<slot>/ no-op adapter with a real vendor implementation
  (analytics, crash, push, remoteConfig, observability, payment).
tools: Read, Edit, Write, Grep, Glob, Bash
---
You wire vendor SDKs into rn-template adapter slots. Procedure:
1. Read lib/<slot>/types.ts — the contract is law; the public API in index.ts must not change.
2. Read the slot README for the recommended vendor + wiring steps and gotchas.
3. Ask the user to install the SDK (`! pnpm add <sdk>` — guard-bash blocks agent-run installs;
   the slot README's recommended vendor is the pre-approved choice), add config-plugin entries to app.config.ts if the vendor
   needs native config, implement adapter.ts against the contract, wire init into the
   canonical App.tsx bootstrap slot (§ bootstrap order — never reorder it).
4. No vendor import may appear outside lib/<slot>/. Grep to verify.
5. pnpm lint + pnpm type-check + pnpm prebuild:development --no-install dry sanity.
Report: files changed, native config added, exactly which bootstrap slot was filled.
```

**`.claude/agents/figma-extractor.md`**
```markdown
---
name: figma-extractor
description: Stage 1 of /figma-implement — read the app's Figma frames via MCP and emit a
  structured design-package.json (component instances, bindings, frames, flows). The ONLY
  agent with Figma MCP access.
tools: Read, Write, Grep, Glob, mcp__figma__*
---
Extract from the given Figma URL via the Figma MCP tools, for the target frames only:
(1) every component INSTANCE: its main component's set name + key, its variant/component
property values, its text overrides, and its node id; (2) every variable binding and text
style on non-instance layers (fills, strokes, spacing, radius, effects) by Figma name — and
every UNBOUND raw value (hex, px) with its layer path; (3) the frames (names, hierarchy,
auto-layout gap/padding as variable names); (4) prototype connections (flows); (5) the brand
mode the file uses (Figma brand collection mode) for the kagaz:check cross-check.
Write .claude/state/design-package.json conforming to .claude/figma/design-package.schema.json.
Resolve component instances through .claude/figma/component-map.json (Figma key → Kagaz
export; shared components AND this brand's `brandComponents`, whose main components live in
the brand's own design-system file) and frames through screen-map.json where mappings exist; list unmapped items in an
`unmapped` array — do NOT guess mappings. No token tables (Kagaz owns tokens), no code
generation. Validate your output against the schema before finishing; the pipeline gate
re-validates.
```

**`.claude/agents/kagaz-resolver.md`**
```markdown
---
name: kagaz-resolver
description: Stage 2 of /figma-implement (and on demand) — resolve design-package.json against
  the installed Kagaz: every instance → a Kagaz export + props, every binding → a token path,
  every miss → a classified gap. Read-only on src/; writes only the resolution report.
tools: Read, Write, Grep, Glob, Bash
---
Inputs: .claude/state/design-package.json, .claude/figma/component-map.json, the installed
Kagaz (node_modules/@lokal-app/kagaz-components/src/*/*.types.ts + package.json version),
src/theme/brand.ts, docs/ARCHITECTURE.md §A7.
For each component instance: map to the Kagaz export; translate every Figma variant/component
property to the Kagaz prop using the JSDoc in <Name>.types.ts (each prop names its Figma
property, e.g. Button `style`→variant, `type`→fill, `size sm (40)`→size="sm"). A variant/
state/property value with no Kagaz prop → GAP(variant).
For each binding on non-instance layers: Figma name → token path by the §A7.1 rule and
verify the path exists in SemanticTokens (node_modules/@lokal-app/kagaz-tokens types). Bound
to `_root`/`brand` or unbound raw value in a token category → GAP(design-bug); unbound width/
height/aspect → CONTENT-DIMENSION (goes to constants.ts with the node id).
Instances of brand-only components resolve exactly like shared ones (component-map.json
`brandComponents[<brand>]`, props from the brand's <Name>.types.ts); an instance of ANOTHER
brand's component → BLOCKER (wrong design file for this app). Instances of components that
are not in Kagaz: generic (lives in the Kagaz Core Components file `SiZy9MpCZuqzJs1yiU8vRh`) →
GAP(component); brand-unique (lives in the brand's design-system file, reusable by any app of
the brand) → GAP(brand-component), filed against kagaz-brand-<brand>; app-specific (app's own
screens file, this app's business meaning) → COMPOSITION (ladder rung 3–5, composed from Kagaz). Check the design's brand mode matches
src/theme/brand.ts → mismatch is a BLOCKER.
Write .claude/state/kagaz-resolution.json + a human report: RESOLVED (instance → export +
props), TOKENS (layer → token path), COMPOSITIONS, CONTENT-DIMENSIONS, GAPS (each with Figma
node, class, and the exact Kagaz issue text to file), BLOCKERS. Never invent a mapping, never
propose a local token or override, never edit src/. Gate: zero GAP(design-bug) and zero
BLOCKERS, and every GAP(variant|component|brand-component) either resolved by the user (use an existing
variant with design's OK, or approve a KAGAZ-GAP composition) or explicitly deferred.
```

**`.claude/agents/flow-wirer.md`**
```markdown
---
name: flow-wirer
description: Stage 5 of /figma-implement (and navigation wiring generally) — register screens
  in the correct navigator with typed params and wire prototype connections as navigation calls.
tools: Read, Edit, Write, Grep, Glob, Bash
---
You wire navigation in the locked three-state structure. Placement rules: pre-auth screens
(intro, login, registration steps) → UnauthenticatedStack (registration steps as the
Stack.Group, one route per step); everything else → AuthenticatedStack (tabs vs pushed vs
modal group per the design); feature routes stay inside the feature's own navigator.
For each screen: add the typed route to the right ParamList, register via the screen's
index.ts barrel, and add navigation calls in the SOURCE screen's data hook (never in the
component). Tabs use Kagaz chrome only: tabItem({ label: t(...), icon, activeIcon, badgeCount,
badgeAccessibilityLabel }) with Kagaz/brand/components/icons icons, inside the
useTabBarOptions screenOptions — never a custom tabBar, never Kagaz BottomNav in a navigator.
No `as never`, no untyped params, no new root states — the root switch reads
authStore.status only. Gate: pnpm type-check + architecture-guard verdict.
```

## B6. Skills (`.claude/skills/`, verbatim)

Twelve skills. Scaffolding skills run inline (cheap, deterministic); heavy ones fork to agents. All are auto-invocable — descriptions tell Claude when to reach for them without being asked — except `/enable-token-police`, which runs only when the developer invokes it. Every UI-producing skill starts with **Kagaz step 0** (§A7.4).

**`.claude/skills/create-screen/SKILL.md`**
```markdown
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
```

**`.claude/skills/add-api-resource/SKILL.md`**
```markdown
---
description: Scaffold api/<resource>/ in the locked 3-file shape (types + transformer +
  react-query-kit hooks). Use for any new backend resource or endpoint group (manual
  variant — prefer /api-from-collection when a Postman collection exists).
argument-hint: "<resource> <operations: get,list,create,update,delete> [--paginated]"
allowed-tools: "Read Write Edit Grep Glob Bash"
---
1. Path src/api/<resource>/ (kebab-case). Create types.ts: one zod schema per wire entity
   (matching the wire EXACTLY — snake_case, nullability faithful), ApiX types via z.infer,
   then the clean app types (camelCase, Date objects, unions). Create transformer.ts:
   to<Noun>(api: ApiX): X per entity; from<Noun>Input() for write bodies.
2. Per requested operation create use<Verb><Noun>.ts via createQuery / createMutation:
   queryKey ['<resource>','<operation>']; fetcher = apiClient → validateResponse(schema, data)
   → to<Noun>() → app type. Paginated list endpoints (--paginated or cursor/page params):
   createInfiniteQuery INSIDE useList<Noun>s — the name does not change; expose flattened
   items + fetchNextPage. Mutations invalidate via sibling hooks' getKey() in onSuccess.
3. Hooks return the kit object unmodified — no wrapper objects. NO index.ts (api/ folders
   have no barrels). axios only via @/lib/api-client. Api* types must not be exported for
   use outside src/api/**.
4. If endpoint shapes are unknown, write the wire schemas from the task description and mark
   each with // TODO(verify-wire) — flagged by pr-reviewer until resolved.
5. Gate: pnpm lint --fix + pnpm type-check.
```

**`.claude/skills/add-store/SKILL.md`**
```markdown
---
description: Create a Zustand store in stores/<area>/ with the locked State/Actions shape.
  Use for any new client state — never hand-roll stores.
argument-hint: "<area> <store-name> [--persist]"
allowed-tools: "Read Write Edit Grep Glob Bash"
---
1. Path src/stores/<area>/<name>Store.ts (+ index.ts barrel created/updated to full re-export).
2. Template: type <Name>State + type <Name>Actions; export const use<Name>Store =
   create<State & Actions>()(...); actions defined inside; initial state as a named const
   so reset() can restore it.
3. --persist: wrap with persist(), storage: zustandStorage from @/lib/storage, explicit
   partialize listing ONLY the fields that must survive restarts, version + migrate stub.
4. Refuse server data fields (anything fetched from the API belongs in React Query) — if the
   task asks for them, explain and point to /add-api-resource.
5. Gate: pnpm lint --fix + pnpm type-check.
```

**`.claude/skills/create-component/SKILL.md`**
```markdown
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
```

**`.claude/skills/create-feature/SKILL.md`**
```markdown
---
description: Run the 4-of-4 features/ admission test and scaffold features/<name>/ if it
  passes (redirect to spine if not). Use whenever someone proposes "a new feature module".
argument-hint: "<feature-name> <one-line description>"
allowed-tools: "Read Write Edit Grep Glob Bash Agent"
---
1. Spawn architecture-guard with the feature description for the 4-of-4 test (own domain •
   terminal navigator • no spine state • deletable in one PR). Show the verdict to the user.
2. FAIL any criterion → do NOT scaffold; output the spine placement plan instead
   (api/<resource>/, screens/<area>/, stores/<area>/) and offer the spine skills.
3. PASS → scaffold features/<name>/: navigator.tsx (terminal stack), types.ts, index.ts
   (exports navigator + minimal API), empty api/ components/ screens/ with .gitkeep.
4. Mount: add one typed route in AuthenticatedStack rendering the feature navigator via the
   barrel. 5. Gate: pnpm lint + pnpm type-check. Hand off detail work to feature-builder.
```

**`.claude/skills/add-adapter/SKILL.md`**
```markdown
---
description: Wire a real vendor SDK into a lib/<slot>/ adapter (analytics, crash, push,
  remoteConfig, observability, payment). Use whenever a vendor integration is requested.
argument-hint: "<slot> <vendor>"
allowed-tools: "Read Grep Glob Agent"
context: fork
agent: adapter-wirer
---
Delegate to adapter-wirer with the slot + vendor. Acceptance: contract in types.ts unchanged,
public API in index.ts unchanged, vendor imports confined to lib/<slot>/ (grep-verified),
bootstrap slot filled per the canonical order, lint + type-check green. Report the diff
summary and any native config (app.config.ts plugins) added.
```

**`.claude/skills/api-from-collection/SKILL.md`**
```markdown
---
description: Generate api/<resource>/ folders from a Postman collection via the Postman MCP —
  DTOs from real response examples. Preferred over /add-api-resource whenever a collection
  or API spec exists.
argument-hint: "<postman collection name or id> [resources to include]"
allowed-tools: "Read Write Edit Grep Glob Bash mcp__postman__*"
context: fork
---
1. Fetch the collection via Postman MCP; list folders/requests; confirm with the user which
   map to which <resource> (one api/ folder per resource, kebab-case).
2. Per request: derive the types.ts zod wire schemas from the SAVED EXAMPLE RESPONSES (exact
   wire shape — nullable/optional faithfully), ApiX types via z.infer; derive request
   param/body schemas the same way; add the clean app types alongside.
3. Generate transformer.ts (to<Noun>/from<Noun>Input) and use<Verb><Noun>.ts hooks per the
   locked react-query-kit conventions (verb from HTTP method + path shape; paginated list
   endpoints → createInfiniteQuery inside useList<Noun>s, name unchanged; fetcher uses
   validateResponse).
4. Endpoints with no saved example → generate with // TODO(verify-wire) and report them —
   never invent response shapes.
5. Gate: pnpm lint --fix + pnpm type-check. Output: resources created, hook inventory,
   unverified endpoints.
```

**`.claude/skills/figma-implement/SKILL.md`**
```markdown
---
description: The gated Figma-to-code pipeline on Kagaz — extract → resolve against Kagaz →
  compositions → screens → wire flows → verify. Use whenever implementing designs from a
  Figma URL.
argument-hint: "<figma-url> [frames/pages to implement]"
allowed-tools: "Read Write Edit Grep Glob Bash Agent"
---
Run stages IN ORDER. Every gate is a command exit code or an explicit zero-count — a failed
gate HALTS the pipeline; report and stop. Never skip a gate, never proceed on red.
0. Preflight: .claude/figma/component-map.json present (ships pre-filled for the installed Kagaz
   version — its `kagazVersion` must equal node_modules/@lokal-app/kagaz-components version,
   else run /kagaz-upgrade's map refresh first; its `brandComponents` holds this app's brand);
   screen-map.json filled for these frames;
   Figma MCP reachable; pnpm kagaz:check green. Missing → prompt the user; stop.
1. EXTRACT — spawn figma-extractor with the URL. Gate: design-package.json validates against
   the schema (node .claude/figma/validate.mjs).
2. RESOLVE AGAINST KAGAZ — spawn kagaz-resolver. Gate: zero GAP(design-bug), zero BLOCKERS
   (brand mismatch), and every GAP(variant|component) resolved or deferred by the user —
   surface the report and the ready-to-file Kagaz issue texts (shared library or brand
   package), then stop until answered.
   There is NO token stage: tokens are Kagaz's and are never edited here.
3. COMPOSITIONS — spawn ui-implementer for each COMPOSITION (app-specific component) and each
   app icon in the resolution report, built only from Kagaz. Gate: pnpm lint (design-system
   plugin) clean.
4. SCREENS — spawn screen-builder per frame, mapping via screen-map.json to
   screens/<area>/<screen>/. Builders may use ONLY Kagaz exports via @/components/ui (with the
   resolved props; new exports registered in the gateway first), the shell, stage-3 compositions
   and tokens. Gate: pnpm lint + pnpm type-check.
5. WIRE FLOWS — spawn flow-wirer with the prototype connections. Gate: pnpm type-check +
   architecture-guard verdict APPROVE.
6. FINAL — pnpm check-all, then spawn pr-reviewer on the full diff. ALL green → summary
   (Kagaz exports used, compositions, screens, routes, gaps filed/deferred). ANY red → report
   and refuse to mark complete.
```

**`.claude/skills/implement-feature/SKILL.md`** — *the master skill: PRD + Figma → plan → build → verify*
```markdown
---
description: End-to-end feature implementation from a PRD (+ optional Figma URL + optional
  Postman collection): plan → approval → api → state → UI → flows → review. Use for any
  "build <feature>" request bigger than one screen.
argument-hint: "<path-to-PRD-or-inline-brief> [figma-url] [postman-collection]"
allowed-tools: "Read Write Edit Grep Glob Bash Agent"
---
PHASE 1 — UNDERSTAND. Read the PRD fully. Extract: user flows, screens, data entities,
API needs, client state, edge cases, analytics events. List ambiguities and ASK the user
now — never guess business logic.
PHASE 2 — PLACEMENT. Spawn architecture-guard with the feature summary → placement plan
(spine vs features/, full file list, KAGAZ USAGE table, GAPS). If a figma-url is given, also
run figma-extractor + kagaz-resolver now so the plan contains the real Kagaz mapping and gaps.
PHASE 3 — PLAN. Write docs/plans/<feature>.md: placement verdict, file-by-file plan, API
hooks (resource/verb/noun table), stores + persisted fields, screens + navigator placement,
Kagaz components per screen, compositions to build, Kagaz gaps (filed / deferred / approved
KAGAZ-GAP compositions), analytics events, open questions. PAUSE for user approval. Do not
write src/ code before approval.
PHASE 4 — BUILD, in this order with gates between each:
  a. API: /api-from-collection if a collection was given, else /add-api-resource per entity.
  b. State: /add-store per client-state concern.
  c. Design: if figma-url given → /figma-implement scoped to this feature's frames (stages
     3–5; stages 1–2 already ran); else /create-component (Kagaz step 0 first) +
     /create-screen per the plan (ui-implementer/screen-builder).
  d. Flows: flow-wirer for navigation + analytics events via lib/analytics.
  Gate after each sub-step: pnpm lint + pnpm type-check.
PHASE 5 — VERIFY. pnpm check-all, then pr-reviewer on the full diff. Fix all BLOCKER/MAJOR
findings and re-run until APPROVE. Output: plan link, file inventory, hook/store/screen/route
summary, Kagaz usage + gaps, analytics events, anything deferred.
```

**`.claude/skills/add-skin/SKILL.md`**
```markdown
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
```

**`.claude/skills/kagaz-upgrade/SKILL.md`**
```markdown
---
description: Upgrade the Kagaz design system (components + tokens + this app's brand package)
  to a new version in its own PR — refresh the generated maps, migrate breaking props, retire
  KAGAZ-GAP compositions. The ONLY sanctioned way to change a Kagaz version.
argument-hint: "<target-version e.g. 1.1.0> [brand-version] [--bootstrap --from <KAGAZ_BASELINE>]"
allowed-tools: "Read Write Edit Grep Glob Bash Agent"
---
1. Preflight: clean working tree on a dedicated branch (kagaz-upgrade-<version>); record the
   current versions from package.json; read the Kagaz CHANGELOGs between current and target
   (github.com/lokal-app/kagaz packages/{components,tokens,brands/<brand>}/CHANGELOG.md via
   `gh api`, or Storybook). List breaking changes (major entries, renamed/removed props,
   token key changes) and new components (shared and brand-only).
   PATTERN GUARD: if any entry changes a pattern this constitution locks — the three token
   layers, `createTheme`/`ThemeProvider`/`useTokens` contract, the brand-package model (one brand,
   root entry + /components /icons /geometry subpaths), component tokens via
   `createTheme({ components })`, token-police's rules, the Figma→token naming rule, or the
   layout-only `style` contract — STOP and report it to the user and the Kagaz maintainers.
   Never adapt the rules silently; a pattern change needs a constitution update (ADR).
   `--bootstrap` mode (used by Part D Phase 4b): current = the `--from` baseline, the packages are
   already installed — skip the branch requirement and step 2, run steps 3–7 against the
   installed versions.
2. Ask the user to install (guard-bash blocks agent installs):
   `! pnpm add -E @lokal-app/kagaz-components@<v> @lokal-app/kagaz-brand-<brand>@<bv>` and
   ONLY if the app opted into token-police: `! pnpm add -D -E @lokal-app/kagaz-token-police@<v>`
   (or its git pin, §A12) at the same Kagaz release
   (exact pins; kagaz-tokens follows components; the brand version must peer-accept them).
   Wait for confirmation.
3. Regenerate: `node scripts/kagaz-exports.mjs` (kagaz-exports.json, shared + brand); refresh
   .claude/figma/component-map.json from the Kagaz repo's packages/components/src/*/figma*.json
   and packages/brands/<brand>/src/components/*/figma*.json at the release tag (set
   kagazVersion + brandVersion); re-run lint (token-police too, if opted in); update the §A7.6 inventory and the §A7.1 token table
   in docs/ARCHITECTURE.md from the installed types; update
   eslint-plugin-design-system/kagaz-i18n-props.json for any new English-default prop.
4. Migrate — in the GATEWAY first: update components/ui/{kagaz,brand,navigation}.ts for renamed/
   moved/removed exports; where a Kagaz API change would ripple into call sites, add an
   adapters/<Name>.tsx (KAGAZ-ADAPTER marker + ledger row) so screens stay untouched, then
   migrate call sites and delete the adapter in the same or a follow-up PR. Then
   pnpm type-check + pnpm lint; fix every break by following the CHANGELOG (prop
   renames, token path changes) — never by pinning back, casting or disabling rules.
5. Retire gaps: for every docs/kagaz-gaps.md row Kagaz now ships (shared library or the
   brand's /components), register the Kagaz export in components/ui, replace the KAGAZ-GAP
   composition's usages with it, delete the file and the row.
6. Fonts: if the brand's fonts.json changed, note in the PR that a new native build is required
   (fonts are embedded at build time — not shippable over the air); run pnpm prebuild:development.
7. Gate: pnpm check-all (incl. kagaz:check) + pr-reviewer APPROVE. PR contains ONLY the
   upgrade, map/doc refresh, migrations and gap retirements.
```

**`.claude/skills/enable-token-police/SKILL.md`** — *opt-in only: run it when the developer asks*
```markdown
---
description: Opt this app into Kagaz's own token lint (token-police). Use ONLY when the developer
  explicitly asks to enable token-police; never on your own initiative.
argument-hint: "[registry|git]"
allowed-tools: "Read Write Edit Grep Glob Bash"
disable-model-invocation: true
---
1. Read the installed @lokal-app/kagaz-components version (KAGAZ_VERSION).
2. Find the install source: `@lokal-app/kagaz-token-police@<KAGAZ_VERSION>` on GitHub Packages
   (`npm view`); if not published, the git pin to the commit of tag
   `@lokal-app/kagaz-components@<KAGAZ_VERSION>`:
   `github:lokal-app/kagaz#<sha>&path:/packages/token-police`. Unavailable → tell the developer
   and stop; the default tier stays active (nothing breaks).
3. Ask the developer to install it (guard-bash blocks agent installs):
   `! pnpm add -D -E <source>`. Wait for confirmation.
4. Set `USE_TOKEN_POLICE = true` in eslint.config.mjs (that turns design-system/no-raw-style-values
   off). Change nothing else.
5. Run pnpm lint; fix every token-police finding with the token it names — never disable a rule.
6. Record in docs/DESIGN_SYSTEM.md: token-police enabled, version and source. From now on
   kagaz:check, pr-reviewer and /kagaz-upgrade also check and move it with Kagaz.
7. Gate: pnpm check-all.
```

### B6.1 `.claude/figma/component-map.json` (ships pre-filled, verbatim — regenerated by `/kagaz-upgrade`)

Source: each Kagaz component's `figma.json` at the pinned release — shared components from the Core Components file `SiZy9MpCZuqzJs1yiU8vRh`, brand-only components (`brandComponents`) from each brand's own design-system file (Gaming: `vHX6yu564DbkTCKLgjGQFI`). `figma-extractor` resolves instances by `key` (stable across renames); `kagaz-resolver` reads the export's `.types.ts` JSDoc for the prop mapping.

```json
{
  "kagazVersion": "1.0.0-next.2",
  "figmaFileKey": "SiZy9MpCZuqzJs1yiU8vRh",
  "components": [
    {"key": "003145f8c6c07826ebb34e61eb7d7128b5ca7ab7", "figma": "Button", "nodeId": "620:44746", "export": "Button"},
    {"key": "a7a8ce3c6945acd43b19bea7bf3c3f8e2c482713", "figma": "Icon Button", "nodeId": "439:33618", "export": "IconButton"},
    {"key": "c6b08afd1603c549b73e459ef4bb1fa532794764", "figma": "Timer Button", "nodeId": "597:37788", "export": "TimerButton"},
    {"key": "077c34cd1e6d67fba292cf019992dcf1cc8519d0", "figma": "Text Input", "nodeId": "407:45428", "export": "TextInput"},
    {"key": "0f7d6bd5fda0c6e7e4e4b0816291a68fa6bd4a4f", "figma": "Text Area Input", "nodeId": "429:13769", "export": "TextArea"},
    {"key": "bb5c31a8bfc8b7e02a1971102428bc37fe4621e4", "figma": "Search Input", "nodeId": "587:23986", "export": "SearchInput"},
    {"key": "19ff054d9ff9d9a9ff760a297dcc7ffc0cf17e7f", "figma": "Dropdown Input", "nodeId": "430:27546", "export": "DropdownInput"},
    {"key": "17e03f9a4278b728d70fc4c8d94069b3d057d8b0", "figma": "OTP Input", "nodeId": "428:8570", "export": "OtpInput"},
    {"key": "2bd2060b08c5f1d5bdf7d5997ca5665a001366a4", "figma": "Checkbox / Checkbox-base", "nodeId": "393:9220", "export": "Checkbox"},
    {"key": "27074249cddea52c4d0b34d7df50a73ccab37d25", "figma": "Radio / Radio-base", "nodeId": "458:33839", "export": "Radio"},
    {"key": "d2203600d2b2b945921c77507e94e1ab7e2a27dc", "figma": "Toggle / Toggle-base", "nodeId": "569:14389", "export": "Toggle"},
    {"key": "bd66f67456b911883a1a8bbfd03696a35654e44f", "figma": "chips", "nodeId": "635:61987", "export": "Chip"},
    {"key": "294bd6f8a827f82939eca80ce36b2d273e76e3c9", "figma": "Chips / Timer-chip", "nodeId": "688:13259", "export": "TimerChip"},
    {"key": "12770430f961db46bc00422e86fd305474c68dac", "figma": "Tabs/Tab", "nodeId": "636:62099", "export": "SegmentedControl"},
    {"key": "02fe64d0d684936a2b04a81e61f8cf09e2ab729d", "figma": "tabs/tab-base", "nodeId": "633:61530", "export": "SegmentedControlItem"},
    {"key": "0022f49c9653112bd1d4193ab54269f46f0aeb28", "figma": "carousel-pointers", "nodeId": "818:16365", "export": "CarouselPointers"},
    {"key": "9173c323a6a4429afef1c5f64f4a966591d4a0a5", "figma": "Bottom Nav / nav", "nodeId": "627:60078", "export": "useTabBarOptions", "note": "in a navigator: React Navigation tabs + useTabBarOptions; BottomNav only standalone"},
    {"key": "628677de31b7b5c07bd940828a0eb24206cf3097", "figma": "nav-item-base", "nodeId": "627:59848", "export": "tabItem", "note": "standalone: BottomNavItem"},
    {"key": "330739c06e7370c45ddfee6785c1082c4227b54a", "figma": "Avatar / avatar", "nodeId": "135:1081", "export": "Avatar"},
    {"key": "f6166af66d6b350297ba60e971b0be04df75bc44", "figma": "Badge", "nodeId": "358:9733", "export": "Badge"},
    {"key": "7daf30717db8ebc42e8bdd8b1d0659a6fe196e27", "figma": "Divider", "nodeId": "276:31823", "export": "Divider"},
    {"key": "65ddb0dfafd210d339215adccd569e20e2c15680", "figma": "Tooltips", "nodeId": "295:32545", "export": "Tooltip"},
    {"key": "3e2f6e18bfa4acda217f4fe3c877b6e33a365b24", "figma": "Floating-Snackbar", "nodeId": "534:12081", "export": "FloatingSnackbar"},
    {"key": "d2d63dc6c690ca00f34cd80519da22652f78c838", "figma": "System Snackbar", "nodeId": "667:66763", "export": "SystemSnackbar"},
    {"key": "097589b3cdf0f1c089251835a03b713981f58381", "figma": "Language selector", "nodeId": "624:51671", "export": "LanguageSelector"}
  ],
  "withLabelSets": [
    {"figma": "Checkbox / Checkbox-with-label", "nodeId": "393:8916", "export": "Checkbox", "note": "pass label/helperText"},
    {"figma": "Radio / Radio-with-label", "nodeId": "456:30961", "export": "Radio", "note": "pass label/helperText"},
    {"figma": "Toggle / Toggle-with-label", "nodeId": "350:5505", "export": "Toggle", "note": "pass label/helperText"}
  ],
  "brandComponents": {
    "_comment": "Per brand: components that live in @lokal-app/kagaz-brand-<brand>/components (Kagaz ADR-0007), keyed by the brand's own design-system Figma file. An app reads ONLY its brand's entry; an instance from another brand's entry is a BLOCKER.",
    "gaming": {
      "brandVersion": "1.0.0-next.1",
      "import": "@lokal-app/kagaz-brand-gaming/components",
      "figmaFileKey": "vHX6yu564DbkTCKLgjGQFI",
      "components": [
        {"key": "055d0337e9b7a064128e102d4d22bb5d132c1fb4", "figma": "Gm_Play-card", "nodeId": "2040:6417", "export": "PlayCard"},
        {"key": "68e40c78d74b51fc8361ff0c448422a47fd5eb5a", "figma": "_gm_pipe", "nodeId": "2065:25867", "export": "Pipe"},
        {"key": "cb4a165e935c6d928c95b6244b2348dbbfb7369b", "figma": "gm_Progress-bar", "nodeId": "2012:1984", "export": "ProgressBar"},
        {"key": "8eda078bfd5bd36182b28aebd478cce6d4ecb1e5", "figma": "_gm_progress-bar-base", "nodeId": "2012:1953", "export": "ProgressBar", "note": "internal segment of ProgressBar"}
      ]
    },
    "dostt": {"brandVersion": "1.0.0-next.2", "components": []},
    "eaze": {"brandVersion": "1.0.0-next.1", "components": []},
    "bhakti": {"brandVersion": "1.0.0-next.1", "components": []}
  }
}
```

## B7. Hooks (`.claude/settings.json`, verbatim)

```json
{
  "$schema": "https://json.schemastore.org/claude-code-settings.json",
  "plansDirectory": "docs/plans",
  "permissions": {
    "allow": [
      "Bash(pnpm lint:*)", "Bash(pnpm lint)", "Bash(pnpm type-check)",
      "Bash(pnpm check-all)", "Bash(pnpm kagaz:check)", "Bash(pnpm test:*)",
      "Bash(node scripts/kagaz-exports.mjs)", "Bash(git status)",
      "Bash(git diff:*)", "Bash(git log:*)"
    ],
    "deny": [
      "Read(./.env*)",
      "Edit(./node_modules/**)",
      "Write(./node_modules/**)",
      "Bash(git push --force:*)",
      "Bash(rm -rf:*)"
    ]
  },
  "hooks": {
    "UserPromptSubmit": [
      { "hooks": [ { "type": "command",
          "command": "jq -n --rawfile r .claude/hooks/reminder.txt '{hookSpecificOutput: {hookEventName: \"UserPromptSubmit\", additionalContext: $r}}'" } ] }
    ],
    "PreToolUse": [
      { "matcher": "Bash",
        "hooks": [ { "type": "command", "command": "bash .claude/hooks/guard-bash.sh" } ] },
      { "matcher": "Edit|Write|MultiEdit",
        "hooks": [ { "type": "command", "command": "bash .claude/hooks/guard-edit.sh" } ] }
    ],
    "PostToolUse": [
      { "matcher": "Edit|Write|MultiEdit",
        "hooks": [ { "type": "command", "command": "bash .claude/hooks/lint-changed.sh" } ] }
    ],
    "Stop": [
      { "hooks": [ { "type": "command", "command": "bash .claude/hooks/stop-type-check.sh", "timeout": 180 } ] }
    ]
  }
}
```

**`.claude/hooks/reminder.txt`** (injected every turn as `additionalContext` JSON — not plain stdout, which has known reliability issues on UserPromptSubmit — keeps the tree and the design system top-of-mind):
```
RULES: utils=pure | lib=infra-only | features=4-of-4 | else spine. UI = Kagaz: step 0 = does @lokal-app/kagaz-components, then the app's @lokal-app/kagaz-brand-<brand>/components, ship it? → register in components/ui (pass-through) + import from @/components/ui + props, never @lokal-app/* outside ui/ & theme/, never rebuild/wrap/restyle; brand-unique component missing = Kagaz gap for the brand package, never app code (§A7.7). Token values: design-system/no-raw-style-values (token-police only if opted in). No inline styles — Kagaz props → VStack/HStack/Box/Text token props → createStyles(tokens)+useStyles. Tokens only via @/theme. shell = closed 6. react-query-kit + getKey(). Zustand selectors only. Named exports. t() strings incl. Kagaz labels. Scaffold via skills.
```

**`.claude/hooks/guard-bash.sh`** — reads the tool-call JSON on stdin, exits **2** (blocks, stderr fed back to Claude) on destructive commands (any recursive `rm`, however the flags are spelled; hard reset; force push; `git clean -f`), on **any dependency change** (`pnpm add/remove/update`, `pnpm install <pkg>`, `expo install`, npm/yarn/bun installs) — "new dependency = ADR" (§A0) and "Kagaz version = `/kagaz-upgrade`" are enforced here, not by trust — and on **any attempt to patch Kagaz** (`pnpm patch`, `patch-package`, or shell writes into `node_modules/@lokal-app`). Plain `pnpm install` / `--frozen-lockfile` stays allowed. Approved installs are run by the user (`! pnpm add …`):
```bash
#!/usr/bin/env bash
cmd=$(jq -r '.tool_input.command // empty')
sep='(^|[;&|(`[:space:]])'
destructive="${sep}rm[[:space:]]+(-[[:alnum:]-]+[[:space:]]+)*(-[[:alpha:]]*[rR]|--recursive)|git[[:space:]]+reset[[:space:]]+--hard|git[[:space:]]+push([[:space:]].*)?[[:space:]](--force|--force-with-lease|-f)([[:space:]]|=|$)|git[[:space:]]+clean[[:space:]]+-[[:alpha:]]*f"
deps="${sep}pnpm[[:space:]]+(add|remove|rm|uninstall|un|update|up|upgrade)([[:space:]]|$)|${sep}pnpm[[:space:]]+(install|i)[[:space:]]+[^-[:space:]]|expo[[:space:]]+install|${sep}(npm|yarn|bun)[[:space:]]+(add|install|i|remove|uninstall)([[:space:]]|$)"
kagaz="${sep}pnpm[[:space:]]+patch(-commit)?([[:space:]]|$)|patch-package|node_modules/@lokal-app"
if echo "$cmd" | grep -qE "$destructive"; then
  echo "BLOCKED by guard-bash: '$cmd' is destructive. Explain intent and ask the user." >&2
  exit 2
fi
if echo "$cmd" | grep -qE "$deps"; then
  echo "BLOCKED by guard-bash: '$cmd' changes dependencies. New/removed/upgraded deps need an ADR (§A0); Kagaz versions change only via /kagaz-upgrade. Ask the user to run it themselves (\`! <command>\`) once approved." >&2
  exit 2
fi
if echo "$cmd" | grep -qE "$kagaz"; then
  echo "BLOCKED by guard-bash: '$cmd' touches or patches the Kagaz package. Kagaz is consumed, never modified: use the Kagaz gap protocol (docs/ARCHITECTURE.md §A7.7)." >&2
  exit 2
fi
exit 0
```

**`.claude/hooks/guard-edit.sh`** — PreToolUse on `Edit|Write|MultiEdit`: blocks (exit **2**) writes that would create a local design-system layer or modify Kagaz, *before* they land. Allowed shapes are the §A7.2 theme shape and the §A7.5 closed shell list; Kagaz versions in `package.json` change only through the user's install in `/kagaz-upgrade`:
```bash
#!/usr/bin/env bash
input=$(cat)
file=$(echo "$input" | jq -r '.tool_input.file_path // empty')
[ -n "$file" ] || exit 0
case "$file" in /*) ;; *) file="/$file" ;; esac
block() { echo "BLOCKED by guard-edit: $file — $1 (docs/ARCHITECTURE.md §A7)." >&2; exit 2; }
case "$file" in
  */node_modules/*)                 block "Kagaz and other packages are never edited; use the Kagaz gap protocol (§A7.7)" ;;
  */patches/*lokal-app*)            block "Kagaz is never patched" ;;
  */src/components/ui/*)
    case "${file##*/src/components/ui/}" in
      kagaz.ts|brand.ts|navigation.ts|index.ts|CLAUDE.md|README.md|adapters/*.tsx) ;;
      *) block "components/ui is the Kagaz gateway with a locked shape: kagaz.ts, brand.ts, navigation.ts, index.ts, adapters/ (§A7.8)" ;;
    esac ;;
  */src/theme/tokens/*)             block "there are no local tokens — Kagaz owns every token (§A7.1)" ;;
  */src/components/shell/*)
    case "${file##*/src/components/shell/}" in
      Screen.tsx|LoadingState.tsx|ErrorState.tsx|EmptyState.tsx|ToastMessage.tsx|index.ts|CLAUDE.md|README.md|BottomSheet/*) ;;
      *) block "components/shell is a closed list of six — extending it needs an ADR (§A7.5)" ;;
    esac ;;
  */src/theme/*)
    case "${file##*/src/theme/}" in
      brand.ts|overrides.ts|mergeOverrides.ts|registry.ts|navigationTheme.ts|useStyles.ts|index.ts|CLAUDE.md|README.md|skins/*.ts) ;;
      *) block "src/theme has a locked shape (§A7.2)" ;;
    esac ;;
  */package.json)
    if echo "$input" | jq -r '[.tool_input.old_string, .tool_input.new_string, .tool_input.content] | map(. // "") | join("\n")' \
         | grep -q '@lokal-app/kagaz'; then
      block "Kagaz versions/packages change only via /kagaz-upgrade (the user runs the install)"
    fi ;;
esac
exit 0
```

**`.claude/hooks/lint-changed.sh`** — lints exactly the touched file and marks the turn as having edited `src/`. PostToolUse cannot undo the edit (it has already landed); exit **2** feeds the violations back to Claude as a must-fix:
```bash
#!/usr/bin/env bash
file=$(jq -r '.tool_input.file_path // empty')
case "$file" in
  */src/*.ts|*/src/*.tsx)
    mkdir -p .claude/state && touch .claude/state/src-dirty
    pnpm exec eslint --max-warnings=0 "$file" >&2 || exit 2 ;;
esac
exit 0
```

**`.claude/hooks/stop-type-check.sh`** — the end-of-turn type gate:
```bash
#!/usr/bin/env bash
# Stop gate. Only exit 2 blocks a Stop, and only stderr reaches Claude.
input=$(cat)
state=.claude/state
[ -f "$state/src-dirty" ] || exit 0                 # no src/ edit this turn → skip
if [ "$(echo "$input" | jq -r '.stop_hook_active // false')" != "true" ]; then
  rm -f "$state/stop-attempts"                      # fresh stop, reset the counter
fi
if out=$(pnpm -s type-check 2>&1); then
  rm -f "$state/src-dirty" "$state/stop-attempts"; exit 0
fi
n=$(( $(cat "$state/stop-attempts" 2>/dev/null || echo 0) + 1 ))
if [ "$n" -gt 3 ]; then                             # loop guard: hand back to the user
  rm -f "$state/stop-attempts"; exit 0
fi
echo "$n" > "$state/stop-attempts"
printf '%s\n' "$out" | tail -n 60 >&2
echo "BLOCKED: pnpm type-check failed (attempt $n/3). Fix the errors above before finishing." >&2
exit 2
```

Why it is shaped this way: Claude Code blocks a Stop **only on exit 2**, and only **stderr** reaches Claude — a bare `pnpm type-check` (tsc exits 1 and prints to stdout) would neither block nor tell Claude what broke. The `src-dirty` marker skips the gate on turns that touched no `src/` file (no 2-minute tax on Q&A turns). The attempt counter + `stop_hook_active` is the loop guard: after 3 failed fix rounds the hook lets Claude stop so it can report the remaining errors to the user instead of spinning. (Heavy on huge repos — `settings.local.json` may relax it per-developer, never in the committed file.)

`guard-edit.sh` is the pre-write half of the design-system enforcement (it stops the file from existing); `design-system/locked-folders` in the lint is the post-write half that also catches files created outside Claude Code.

## B8. MCP servers (`.mcp.json`, project scope, committed)

```json
{
  "mcpServers": {
    "figma": {
      "type": "http",
      "url": "https://mcp.figma.com/mcp"
    },
    "postman": {
      "type": "http",
      "url": "https://mcp.postman.com/mcp",
      "headers": { "Authorization": "Bearer ${POSTMAN_API_KEY}" }
    }
  }
}
```

- **Figma**: remote Dev Mode MCP shown; teams using the desktop-app local server swap the URL for `http://127.0.0.1:3845/mcp`. Tool names are prefixed `mcp__figma__*` — only `figma-extractor` (and `/add-skin`) whitelist them. The same Figma account must be able to read the Kagaz Core Components file (`SiZy9MpCZuqzJs1yiU8vRh`) **and the app's brand design-system file** (e.g. Gaming `vHX6yu564DbkTCKLgjGQFI`) so instances resolve to their main components. *(Verify exact server URL/auth at setup; Figma has been iterating on this surface.)*
- **Postman**: HTTP MCP with an API key from the team workspace; only `/api-from-collection` uses it. *(Same caveat — verify URL at setup.)*
- **No Kagaz MCP is needed:** the design-system API is the installed package (typed, JSDoc'd, version-pinned) plus `component-map.json`; Storybook (`https://kagaz-storybook.internal.getlokalapp.com/`) is the human reference.
- Scoping rule: downstream agents consume structured JSON (`design-package.json`, `kagaz-resolution.json`, generated `types.ts` wire schemas) — they never get MCP access. Swapping design/API tools touches stage 1 only.

## B9. Plugin packaging & org marketplace — OPTIONAL (TODO, not currently planned)

**Decision: the harness's canonical home is the template repo's inline `.claude/`**, copied into each app at bootstrap (Part D). The plugin/marketplace route below is **not being implemented now** — it's recorded as the documented upgrade path if/when cross-app drift becomes a real maintenance problem (multiple apps live, harness fixes needing to fan out). Nothing in Parts A–D depends on it.

```
github.com/<org>/claude-plugins        (private repo = the marketplace)
├── .claude-plugin/marketplace.json              { "name": "<org>", "plugins": [ { "name": "rn-template", "source": "./plugins/rn-template", … } ] }
└── plugins/rn-template/
    ├── .claude-plugin/plugin.json               { "name": "rn-template", "version": "1.0.0", … }
    ├── skills/                                  the 12 skills (B6)
    ├── agents/                                  the 9 agents (B5)
    ├── hooks/hooks.json                         the B7 hooks
    └── README.md
```

- Apps install: `/plugin marketplace add <org>/claude-plugins` → `/plugin install rn-template@<org>`. Skills become `/rn-template:create-screen` etc.
- **Stays in each app repo** (per-app by nature): root + scoped `CLAUDE.md`, `.claude/rules/styling.md`, `.claude/figma/*` maps, `.mcp.json`, `settings.json` permissions, the ESLint plugin.
- **Versioning policy (if adopted):** plugin changes ship by semver; apps pin via the marketplace; a harness change is a plugin PR — never an in-app fork of a skill.
- **Until then:** the template repo's inline `.claude/` is the single source of truth; harness improvements land in the template repo and are ported to live apps manually (or by re-running the relevant Part D phase against the app).

## B10. CI PR review (`.github/workflows/`)

**`quality.yml`** — the dumb gates, every PR: `pnpm install --frozen-lockfile && pnpm lint --max-warnings=0 && pnpm type-check && pnpm kagaz:check`. The install step needs registry access to `@lokal-app` on GitHub Packages: the job sets `GITHUB_PACKAGES_TOKEN` from the repo secret (a token with `read:packages`; the org's `GITHUB_TOKEN` works only if the Kagaz packages grant this repo access) — the same secret EAS builds use.

**`claude-review.yml`** — the constitution review even when the code wasn't written in Claude Code:

```yaml
name: claude-review
on:
  pull_request:
    types: [opened, synchronize]
jobs:
  review:
    runs-on: ubuntu-latest
    permissions: { contents: read, pull-requests: write, id-token: write }
    steps:
      - uses: actions/checkout@v4
        with: { fetch-depth: 0 }
      - uses: anthropics/claude-code-action@v1   # verify latest major at setup
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
          prompt: >
            Act as the pr-reviewer agent defined in .claude/agents/pr-reviewer.md.
            Review this PR's diff against the constitution in CLAUDE.md and the scoped
            CLAUDE.md files. Post findings as inline review comments in the
            `path:line — [RULE] problem → fix` format; finish with APPROVE or
            REQUEST CHANGES and the blocker list.
```

## B11. Memory strategy (what lives where, so any session is instantly up to speed)

| Memory | Mechanism | Content |
|---|---|---|
| Constitution | Root `CLAUDE.md` (always loaded) | The rules digest (B2) |
| Layer rules | Scoped `CLAUDE.md` (on-demand) + `.claude/rules/` (path-glob) | Folder-specific law |
| Design-system API | Installed Kagaz (`node_modules/@lokal-app/kagaz-components/src/**/*.types.ts`), `docs/ARCHITECTURE.md` §A7.6, `.claude/figma/component-map.json` | What exists and how its props map to Figma — version-pinned, refreshed only by `/kagaz-upgrade` |
| Design-system debt | `docs/kagaz-gaps.md` | Every open Kagaz gap: issue URL, temporary composition, owner |
| Decisions | `docs/adr/NNNN-*.md` | Every deviation/extension, permanent |
| Plans | `docs/plans/<feature>.md` (`plansDirectory`) | Per-feature implementation plans from /implement-feature — the cross-session handoff document |
| Agent experience | `memory: project` on architecture-guard, ui-implementer, screen-builder, pr-reviewer | Project-specific learnings (recurring violations, this app's areas/resources, Kagaz usage patterns) accumulated across sessions |
| Personal scratch | `CLAUDE.local.md`, `settings.local.json` (gitignored) | Sandbox URLs, per-dev tweaks — never rules |

Rule of placement: **rules** → CLAUDE.md/rules; **decisions** → ADRs; **design-system debt** → kagaz-gaps; **work-in-flight** → plans; **observations** → agent memory. Nothing important lives only in a chat transcript.
