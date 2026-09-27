# PART B — THE CLAUDE CODE HARNESS

Everything in this part ships inline in the template repo's `.claude/` — the canonical home. The layers and what each is for:

| Layer | Mechanism | Role |
|---|---|---|
| 1. Always-on / scoped context | Root `CLAUDE.md`, scoped `CLAUDE.md` per folder, `.claude/rules/*.md` with `paths:` globs | Tell Claude the rules where the work happens |
| 2. Procedures | Skills (`.claude/skills/<name>/SKILL.md`) | Make following the rules mechanical |
| 3. Specialists | Agents (`.claude/agents/<name>.md`) | Isolated contexts for build/review work; `memory: project` for learners |
| 4. Hard gates | Hooks (`.claude/settings.json` + `.claude/hooks/*`) | Block violations with exit codes — no reasoning involved |
| 5. External knowledge | MCP servers (`.mcp.json`): Figma, Postman | Design truth and API-contract truth on tap |
| 6. Distribution *(optional — TODO, see B9)* | Org plugin + marketplace | One versioned harness for every app — only if cross-app drift becomes a real problem |
| 7. CI backstop | GitHub Action PR review | Enforcement even when code wasn't written in Claude Code |

Determinism comes from the **gates between steps** (lint, type-check, schema validation — exit codes, not reasoning), never from longer prompts. The mega-agent anti-pattern (all rules in one giant description) remains rejected.

## B1. File map of the harness

```
rn-template/
├── CLAUDE.md                          root constitution digest (verbatim below)
├── .mcp.json                          Figma + Postman MCP servers (team-shared)
├── .claude/
│   ├── settings.json                  hooks + permissions (verbatim below)
│   ├── settings.local.json            (gitignored) personal overrides
│   ├── rules/
│   │   └── styling.md                 path-glob rule: no-inline-styles + createStyles (all *.tsx)
│   ├── hooks/
│   │   ├── guard-bash.sh              destructive-command + dependency-change guard
│   │   ├── lint-changed.sh            per-file lint after Edit/Write (+ marks src/ dirty)
│   │   ├── stop-type-check.sh         end-of-turn type gate (exit 2 + stderr, loop-guarded)
│   │   └── reminder.txt               one-line decision-tree reminder
│   ├── agents/                        9 agents (B5)
│   ├── skills/                        9 skills (B6)
│   ├── figma/                         per-app maps: token-map.json, component-map.json, screen-map.json
│   └── state/                         (gitignored) pipeline scratch space
├── .github/workflows/
│   ├── quality.yml                    lint + type-check on every PR
│   └── claude-review.yml              Claude PR review (B10)
└── src/**/CLAUDE.md                   scoped rules (B4)
```

## B2. Root `CLAUDE.md` (ships verbatim, ≤ 120 lines)

```markdown
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
```

## B3. `.claude/rules/styling.md` (path-glob rule — fires on every `.tsx` touch)

```markdown
---
paths:
  - "src/**/*.tsx"
---
# Styling rules (absolute, every component and screen)
- NO inline styles. `style={{…}}` is forbidden — no exceptions, not even "temporary".
- The only legal pattern: `const styles = useStyles(createStyles)` +
  `const createStyles = (theme: Theme) => StyleSheet.create({…})`.
  Placement by file type: components → in-file last declaration; screens → the screen
  folder's styles.ts (which exports createStyles and NOTHING else).
- Conditional styles: arrays — `[styles.root, isActive && styles.active]`.
- Runtime values (insets, measured layout, API-sourced colors): `createStyles(theme, params)` +
  `useStyles(createStyles, params)` with a small flat params object. Animations:
  `[styles.x, animatedStyle]` from `useAnimatedStyle`. No other dynamic-style path exists.
- Every value from `theme` tokens. No raw hex/rgb, no off-scale numbers, no raw fontSize.
- Text only via `<Typography variant="…">`.
- If Figma shows a value with no token: stop and flag it to design. Never approximate.
```

*Load-bearing note:* `paths:`-scoped rules have known gaps (they may not be injected on Write, only on Read), so this file is a convenience layer, never the enforcement. The same rules live in the always-loaded root `CLAUDE.md` (B2) and are enforced mechanically by `react-native/no-inline-styles` + `design-system/*` via the PostToolUse lint hook.

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
status: loading|error|empty|ready + retry), styles.ts (exports createStyles(theme) ONLY —
constants go to constants.ts), index.ts, optional useTrack.ts (≥2 analytics events: thin
lib/analytics wrapper, base payload once, called only from the data hook), optional
constants.ts, optional components/, optional variants/ (A/B: presentation-only variants
sharing ONE data hook, ONE route, ONE useTrack; the screen file is the switcher; sibling
-v2 screen folders forbidden).
Branch all four states inside one <Screen> wrapper with LoadingState/ErrorState/EmptyState —
never duplicate the layout tree per state.
Component promotion: 1 screen → ./components/; ≥2 screens same area → components/<area>/;
cross-area business → components/common/; atomic token-only → components/ui/. Move, never copy.
NEVER create screens/index.ts (root barrel executes every screen at startup).
Scaffold with /create-screen.
```

**`src/components/CLAUDE.md`**
```markdown
# components/ — presentational only
ui/ = atomic design-system primitives (own CLAUDE.md). <area>/ = shared by ≥2 screens of one
area. common/ = cross-area business components. NOTHING here fetches data, reads stores, or
navigates — data arrives via props, events leave via callbacks. No screen-specific components
here (those live inside the screen folder). Styling per the absolute createStyles pattern.
```

**`src/components/ui/CLAUDE.md`**
```markdown
# components/ui/ — the design system
The ONLY place raw building blocks (RN built-ins + locked-stack libs) get wrapped and
token-bound. Atomic: no business logic, no API calls, no store reads, no navigation, no t()
EVER (text arrives via props). Contract per primitive: named export + <Name>Props exported;
variant/size as the standardized prop names, token-derived unions; SEMANTIC tokens only —
theme/tokens/* is theme-internal (palette legal only inside theme/themes/*); a11y defaults built in
(accessibilityRole/State, 44pt targets); style?: StyleProp<ViewStyle> merged last =
LAYOUT-ONLY (placement; any visual property in it is a violation — that's variants' job);
may compose sibling primitives, imports only theme/ + utils/ (NEVER theme/tokens/* —
theme-internal); createStyles tail in-file; flat <Name>.tsx until a 2nd file is needed,
then <Name>/ folder.
No Spacer/Box/Row primitives — sibling spacing via gap in createStyles.
Wrapping a NEW third-party UI kit = ADR. Text rendering exists ONLY here (Typography).
New primitive = /create-component + register in this folder's index.ts (the one curated
barrel). Toast: showToast() lives in lib/toast (imperative, renders nothing); ToastMessage.tsx renders here and
is mounted as the host in providers/index.tsx.
```

**`src/theme/CLAUDE.md`**
```markdown
# theme/ — bottom of the stack
Imports NOTHING from src/. Two layers: tokens/ (scheme-agnostic primitives — INTERNAL to
theme/, nothing outside src/theme/ may import them) and themes/ (skins — the only place
scheme-ness exists). Raw hex lives only in tokens/palette.ts (names mirror Figma variables,
append-only). Semantic color keys, spacing keys, typography variants, radius and shadow
keys are FIXED by the constitution — extending a key set requires an ADR.
themes/default.ts is the complete base spec and MUST define every semantic key for BOTH
light and dark. Custom skins = createTheme(defaultTheme, overrides) in themes/<name>.ts +
one registry.ts line — nothing else changes, no component is touched. Overrides may touch
any token group; single-scheme skins assign one map to both schemes explicitly; override
color values must reference palette, never hardcode hex.
Values come from Figma via /figma-implement stage 2 (token-reconciler) — never invented.
Active theme = registry[themeName] × colorScheme, resolved in ThemeProvider from
stores/settings (themeName may be remote-config driven).
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
Integrations and adapters: api-client, logger, storage, i18n, permissions + vendor slots
(analytics, crash, push, remoteConfig, observability, payment). A slot = index.ts (public
API) + types.ts (contract) + adapter.ts (impl; ships as no-op). Swap vendors by replacing
adapter.ts only (/add-adapter). NO business code, NO imports from spine/features/theme.
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
# navigation/ — locked three-state root
RootNavigator switches ONLY on authStore.status: restoring | unauthenticated | authenticated.
Intro slider = initialRouteName of UnauthenticatedStack when !hasSeenIntro (persisted flag) —
NOT a root state. Registration = Stack.Group, one route per step, cross-step state in
stores/registration (reset on completion). Every navigator owns types.ts; params always typed;
`as never` forbidden. navigationRef is the only out-of-React navigation. Screens never import
navigators — navigation calls live in screen data hooks.
```

## B5. Agents (`.claude/agents/`, verbatim)

Nine agents. Each has a narrow job, a tool whitelist (`tools:` — the agent frontmatter key; `allowed-tools:` is the *skill* key), and (where learning helps) `memory: project` so it accumulates project-specific knowledge across sessions (project scope — verify at setup where Claude Code stores it and whether to commit it).

**`.claude/agents/architecture-guard.md`**
```markdown
---
name: architecture-guard
description: Decide WHERE code belongs and verify a proposed/actual change respects the
  decision tree, canonical shapes, dependency direction, and barrel whitelist. Spawn before
  any non-trivial implementation and before PRs. Read-only.
tools: Read, Grep, Glob, Bash
memory: project
---
You are the architecture guard for a rn-template app. Source of truth: root CLAUDE.md
+ scoped CLAUDE.md files + docs/ARCHITECTURE (this repo's constitution).
Given a feature/change description, output a PLACEMENT PLAN:
1. Run the decision tree (utils → lib → features 4-of-4 → spine). For features/, evaluate
   each of the 4 criteria explicitly with evidence; one failure = spine.
2. List EVERY file to create/modify with its full path, conforming to the canonical shapes
   (screen, api resource, store, feature). Flag any file that has no legal home.
3. Check dependency direction for each planned import; reject violations with the corrected
   alternative (e.g. "component reads store → move read into the screen data hook, pass prop").
4. Check barrel whitelist; reject any new index.ts outside it.
Output format: PLACEMENT PLAN (file list) / VIOLATIONS (numbered, each with the rule and the
fix) / VERDICT: APPROVE or REVISE. Never propose rule changes — point to the ADR process.
```

**`.claude/agents/ui-implementer.md`**
```markdown
---
name: ui-implementer
description: Build or modify UI strictly within the design system — primitives in
  components/ui, area/common components, and screen presentation layers. Delegate ALL
  component-building work here.
tools: Read, Edit, Write, Grep, Glob, Bash
memory: project
---
You build UI for a rn-template app. Before writing ANY component:
1. Read src/theme/types.ts (SemanticColors + Theme shape) and src/theme/themes/default.ts in
   full — you may only use values the `theme` object exposes. NEVER read palette/tokens as a
   menu of values to use: theme/tokens/* is theme-internal and unimportable outside src/theme/.
2. Read src/components/ui/index.ts — reuse existing primitives before creating new ones.
Absolute rules: no inline styles ever; the createStyles(theme) + useStyles pattern
(in-file tail for components, styles.ts for screens); <Typography variant> for all text;
FlashList for lists; expo-image for images; named exports; t() for all strings EXCEPT
inside components/ui (text via props there); accessibilityRole on touchables;
variants/sizes as token-derived typed unions; SEMANTIC tokens only via the theme object
(theme/tokens/* is theme-internal — never import it); primitive style props are
layout-only — never visual overrides;
sibling spacing via gap (no Spacer components); never introduce a new third-party UI kit
without an ADR.
If a design requires a value with no matching token: STOP and report the missing token —
never approximate with a raw value, never extend token files yourself (that is the
token-reconciler's job, gated by design sign-off).
components/ui primitives are atomic: no business logic, no data, no navigation. Anything
business-flavored goes to components/<area>/ or common/ per the promotion ladder.
After every file: run pnpm lint on it; fix until clean. Never disable a rule.
```

**`.claude/agents/screen-builder.md`**
```markdown
---
name: screen-builder
description: Create complete screens in the canonical screens/<area>/<screen>/ shape, wiring
  existing api hooks, stores, and ui primitives. Use for "build the X screen" tasks after
  api/stores exist (or alongside /add-api-resource).
tools: Read, Edit, Write, Grep, Glob, Bash
memory: project
---
You build screens for a rn-template app. Canonical shape, no deviations:
<Name>Screen.tsx (render only, exactly ONE component) + use<Name>Screen.ts (ALL wiring) +
styles.ts (createStyles(theme) ONLY) + index.ts + optional useTrack.ts / constants.ts /
components/ / variants/.
Rules: the data hook owns queries (react-query-kit hooks from api/), store selectors,
derived state, handlers, typed useNavigation (never a navigation prop), and all analytics
via useTrack; it returns ONE object including status: 'loading'|'error'|'empty'|'ready'
and retry(). The screen renders ONE <Screen> wrapper and branches only the body on all
four states with LoadingState/ErrorState/EmptyState from components/ui — never duplicate
the layout tree per state. The screen component contains zero hooks except useStyles /
useTranslation and the data hook. Screens with ≥2 analytics events get useTrack.ts (thin
lib/analytics wrapper, base payload once, never called from JSX). A/B variants are
presentation-only files in variants/ sharing the one data hook; the screen file switches.
Strings via t() with area.screen.key naming. Register the route ONLY in the navigator the
flow-wirer or the task specifies, with typed params, importing the screen's folder barrel.
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
description: Thorough constitution review of staged changes, a branch diff, or a PR. Spawn
  before merging anything and as the final gate of every pipeline. Read-only.
tools: Read, Grep, Glob, Bash
memory: project
---
You review diffs against the rn-template constitution. Procedure:
1. Collect the diff (git diff --staged, or the range you were given) and the list of files.
2. For each file, check by category: placement (decision tree, canonical shapes, file
   inventory — flag files not in the legal inventory), dependency direction, barrels
   (whitelist only), naming/casing, styling (inline styles, raw values, createStyles
   placement — styles.ts for screens / in-file tail for components, Typography), screen
   shape (one component per screen file, no navigation prop, useTrack not called from JSX,
   no sibling -v2 variant folders), state (selector-only Zustand, no server data in stores, react-query-kit
   conventions, getKey() invalidation, non-prod validateResponse (APP_ENV gate, never __DEV__), transformer-in-fetcher,
   cache holds app types only, Api* types confined to src/api/**, kit object returned
   unmodified),
   micro-conventions (named exports, t(), logger, FlashList, expo-image, any/ts-ignore,
   a11y, line limits), navigation (typed params, no screen→navigator imports).
3. Run pnpm lint and pnpm type-check; include failures as findings.
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
description: Stage 1 of /figma-implement — read the Figma file via MCP and emit a structured
  design-package.json. The ONLY agent with Figma MCP access.
tools: Read, Write, Grep, Glob, mcp__figma__*
---
Extract from the given Figma URL via the Figma MCP tools: (1) all variables/styles → tokens
(colors with light/dark modes, spacing, typography text styles, radii, effects), (2) the
component set (names, variants, states), (3) the target frames/screens (names, hierarchy),
(4) prototype connections (flows). Write .claude/state/design-package.json conforming to
.claude/figma/design-package.schema.json. Resolve names through .claude/figma/token-map.json
and component-map.json where mappings exist; list unmapped items in an `unmapped` array —
do NOT guess mappings. No code generation here. Validate your output against the schema
before finishing; the pipeline gate re-validates.
```

**`.claude/agents/token-reconciler.md`**
```markdown
---
name: token-reconciler
description: Stage 2 of /figma-implement — diff design-package.json tokens against
  src/theme/tokens/* and apply additions/value updates. The only agent allowed to edit
  token files.
tools: Read, Edit, Write, Grep, Glob, Bash
---
Diff design-package.json tokens vs src/theme/tokens/* and src/theme/themes/default.ts.
Rules: palette is append-only and names mirror Figma variables; semantic/spacing/typography/
radius/shadow KEY SETS are fixed by the constitution — if Figma demands a new key, STOP and
report (ADR + design sign-off required); value changes to existing keys are applied with a
comment citing the Figma version/date; in themes/default.ts every semantic color must be
defined for BOTH light and dark (a missing dark value is a blocker, not a guess). Custom
theme files (themes/<name>.ts) are edited ONLY when the task explicitly targets that skin —
overrides reference palette, never hardcoded hex; single-scheme skins assign one map to
both schemes. Never delete or rename existing tokens (deprecate via JSDoc @deprecated
instead). Output a reconciliation report: added / updated / deprecated / blocked-needs-design.
Gate: pnpm lint + pnpm type-check must pass.
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
component). No `as never`, no untyped params, no new root states — the root switch reads
authStore.status only. Gate: pnpm type-check + architecture-guard verdict.
```

## B6. Skills (`.claude/skills/`, verbatim)

Nine skills. Scaffolding skills run inline (cheap, deterministic); heavy ones fork to agents. All are also auto-invocable — descriptions tell Claude when to reach for them without being asked.

**`.claude/skills/create-screen/SKILL.md`**
```markdown
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
description: The gated Figma-to-code pipeline — extract → reconcile tokens → primitives →
  screens → wire flows → verify. Use whenever implementing designs from a Figma URL.
argument-hint: "<figma-url> [frames/pages to implement]"
allowed-tools: "Read Write Edit Grep Glob Bash Agent"
---
Run stages IN ORDER. Every gate is a command exit code — a failed gate HALTS the pipeline;
report and stop. Never skip a gate, never proceed on red.
0. Preflight: .claude/figma/{token-map,component-map,screen-map}.json exist and are populated
   for this app; Figma MCP reachable. Missing → prompt the user to fill them; stop.
1. EXTRACT — spawn figma-extractor with the URL. Gate: design-package.json validates against
   the schema (node .claude/figma/validate.mjs).
2. RECONCILE TOKENS — spawn token-reconciler. Gate: pnpm lint + pnpm type-check; zero
   blocked-needs-design items (else stop and surface them to the user/design).
3. PRIMITIVES — spawn ui-implementer for each design-package component lacking an RN
   primitive (consult component-map.json). Gate: pnpm lint (design-system plugin) clean.
4. SCREENS — spawn screen-builder per frame, mapping via screen-map.json to
   screens/<area>/<screen>/. Builders may use ONLY stage-3 primitives + tokens.
   Gate: pnpm lint + pnpm type-check.
5. WIRE FLOWS — spawn flow-wirer with the prototype connections. Gate: pnpm type-check +
   architecture-guard verdict APPROVE.
6. FINAL — pnpm check-all, then spawn pr-reviewer on the full diff. ALL green → summary
   (tokens added, primitives, screens, routes). ANY red → report and refuse to mark complete.
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
(spine vs features/, full file list). 
PHASE 3 — PLAN. Write docs/plans/<feature>.md: placement verdict, file-by-file plan, API
hooks (resource/verb/noun table), stores + persisted fields, screens + navigator placement,
analytics events, open questions. PAUSE for user approval. Do not write src/ code before
approval.
PHASE 4 — BUILD, in this order with gates between each:
  a. API: /api-from-collection if a collection was given, else /add-api-resource per entity.
  b. State: /add-store per client-state concern.
  c. Design: if figma-url given → /figma-implement scoped to this feature's frames;
     else /create-component + /create-screen per the plan (ui-implementer/screen-builder).
  d. Flows: flow-wirer for navigation + analytics events via lib/analytics.
  Gate after each sub-step: pnpm lint + pnpm type-check.
PHASE 5 — VERIFY. pnpm check-all, then pr-reviewer on the full diff. Fix all BLOCKER/MAJOR
findings and re-run until APPROVE. Output: plan link, file inventory, hook/store/screen/route
summary, analytics events, anything deferred.
```

## B7. Hooks (`.claude/settings.json`, verbatim)

```json
{
  "$schema": "https://json.schemastore.org/claude-code-settings.json",
  "plansDirectory": "docs/plans",
  "permissions": {
    "allow": [
      "Bash(pnpm lint:*)", "Bash(pnpm lint)", "Bash(pnpm type-check)",
      "Bash(pnpm check-all)", "Bash(pnpm test:*)", "Bash(git status)",
      "Bash(git diff:*)", "Bash(git log:*)"
    ],
    "deny": [
      "Read(./.env*)",
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
        "hooks": [ { "type": "command", "command": "bash .claude/hooks/guard-bash.sh" } ] }
    ],
    "PostToolUse": [
      { "matcher": "Edit|Write",
        "hooks": [ { "type": "command", "command": "bash .claude/hooks/lint-changed.sh" } ] }
    ],
    "Stop": [
      { "hooks": [ { "type": "command", "command": "bash .claude/hooks/stop-type-check.sh", "timeout": 180 } ] }
    ]
  }
}
```

**`.claude/hooks/reminder.txt`** (injected every turn as `additionalContext` JSON — not plain stdout, which has known reliability issues on UserPromptSubmit — one line, keeps the tree top-of-mind):
```
RULES: utils=pure | lib=infra-only | features=4-of-4 | else spine. No inline styles — createStyles(theme)+useStyles. Tokens from theme only. react-query-kit + getKey(). Zustand selectors only. Named exports. t() strings. Scaffold via skills.
```

**`.claude/hooks/guard-bash.sh`** — reads the tool-call JSON on stdin, exits **2** (blocks, stderr fed back to Claude) on destructive commands (any recursive `rm`, however the flags are spelled; hard reset; force push; `git clean -f`) and on **any dependency change** (`pnpm add/remove/update`, `pnpm install <pkg>`, `expo install`, npm/yarn/bun installs) — "new dependency = ADR" (§A0) is enforced here, not by trust. Plain `pnpm install` / `--frozen-lockfile` stays allowed. Approved installs are run by the user (`! pnpm add …`):
```bash
#!/usr/bin/env bash
cmd=$(jq -r '.tool_input.command // empty')
sep='(^|[;&|(`[:space:]])'
destructive="${sep}rm[[:space:]]+(-[[:alnum:]-]+[[:space:]]+)*(-[[:alpha:]]*[rR]|--recursive)|git[[:space:]]+reset[[:space:]]+--hard|git[[:space:]]+push([[:space:]].*)?[[:space:]](--force|--force-with-lease|-f)([[:space:]]|=|$)|git[[:space:]]+clean[[:space:]]+-[[:alpha:]]*f"
deps="${sep}pnpm[[:space:]]+(add|remove|rm|uninstall|un|update|up|upgrade)([[:space:]]|$)|${sep}pnpm[[:space:]]+(install|i)[[:space:]]+[^-[:space:]]|expo[[:space:]]+install|${sep}(npm|yarn|bun)[[:space:]]+(add|install|i|remove|uninstall)([[:space:]]|$)"
if echo "$cmd" | grep -qE "$destructive"; then
  echo "BLOCKED by guard-bash: '$cmd' is destructive. Explain intent and ask the user." >&2
  exit 2
fi
if echo "$cmd" | grep -qE "$deps"; then
  echo "BLOCKED by guard-bash: '$cmd' changes dependencies. New/removed/upgraded deps need an ADR (§A0); ask the user to run it themselves (\`! <command>\`) once approved." >&2
  exit 2
fi
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

- **Figma**: remote Dev Mode MCP shown; teams using the desktop-app local server swap the URL for `http://127.0.0.1:3845/mcp`. Tool names are prefixed `mcp__figma__*` — only `figma-extractor` whitelists them. *(Verify exact server URL/auth at setup; Figma has been iterating on this surface.)*
- **Postman**: HTTP MCP with an API key from the team workspace; only `/api-from-collection` uses it. *(Same caveat — verify URL at setup.)*
- Scoping rule: downstream agents consume structured JSON (`design-package.json`, generated `types.ts` wire schemas) — they never get MCP access. Swapping design/API tools touches stage 1 only.

## B9. Plugin packaging & org marketplace — OPTIONAL (TODO, not currently planned)

**Decision: the harness's canonical home is the template repo's inline `.claude/`**, copied into each app at bootstrap (Part D). The plugin/marketplace route below is **not being implemented now** — it's recorded as the documented upgrade path if/when cross-app drift becomes a real maintenance problem (multiple apps live, harness fixes needing to fan out). Nothing in Parts A–D depends on it.

```
github.com/<org>/claude-plugins        (private repo = the marketplace)
├── .claude-plugin/marketplace.json              { "name": "<org>", "plugins": [ { "name": "rn-template", "source": "./plugins/rn-template", … } ] }
└── plugins/rn-template/
    ├── .claude-plugin/plugin.json               { "name": "rn-template", "version": "1.0.0", … }
    ├── skills/                                  the 9 skills (B6)
    ├── agents/                                  the 9 agents (B5)
    ├── hooks/hooks.json                         the B7 hooks
    └── README.md
```

- Apps install: `/plugin marketplace add <org>/claude-plugins` → `/plugin install rn-template@<org>`. Skills become `/rn-template:create-screen` etc.
- **Stays in each app repo** (per-app by nature): root + scoped `CLAUDE.md`, `.claude/rules/styling.md`, `.claude/figma/*` maps, `.mcp.json`, `settings.json` permissions, the ESLint plugin.
- **Versioning policy (if adopted):** plugin changes ship by semver; apps pin via the marketplace; a harness change is a plugin PR — never an in-app fork of a skill.
- **Until then:** the template repo's inline `.claude/` is the single source of truth; harness improvements land in the template repo and are ported to live apps manually (or by re-running the relevant Part D phase against the app).

## B10. CI PR review (`.github/workflows/`)

**`quality.yml`** — the dumb gates, every PR: `pnpm install --frozen-lockfile && pnpm lint --max-warnings=0 && pnpm type-check`.

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
| Decisions | `docs/adr/NNNN-*.md` | Every deviation/extension, permanent |
| Plans | `docs/plans/<feature>.md` (`plansDirectory`) | Per-feature implementation plans from /implement-feature — the cross-session handoff document |
| Agent experience | `memory: project` on architecture-guard, ui-implementer, screen-builder, pr-reviewer | Project-specific learnings (recurring violations, this app's areas/resources) accumulated across sessions |
| Personal scratch | `CLAUDE.local.md`, `settings.local.json` (gitignored) | Sandbox URLs, per-dev tweaks — never rules |

Rule of placement: **rules** → CLAUDE.md/rules; **decisions** → ADRs; **work-in-flight** → plans; **observations** → agent memory. Nothing important lives only in a chat transcript.

