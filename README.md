# Teekha Aaloo

The org's **reference app for the rn-template constitution**: a React Native app (Expo CNG +
Dev Client + EAS) built on **Kagaz**, Lokal's design system. It exists to show, in working code, how
an app generated from the constitution is structured and kept design-system aligned. Every new app
follows the same shape — only the brand and the product code change. (This reference app uses the
`gaming` brand as its example.)

> **Read [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) first.** It is the Constitution —
> absolute rules for where code goes, naming, styling, state, API patterns and the design system
> (§A7). Deviations require an ADR in `docs/adr/`.

## Quickstart

Kagaz is installed from GitHub Packages. One-time setup — no token to copy, paste or store:

```bash
gh auth refresh -h github.com -s read:packages                                  # once (authorize SSO if asked)
echo 'export GITHUB_PACKAGES_TOKEN=$(gh auth token 2>/dev/null)' >> ~/.zshenv   # once — a command, not a secret

pnpm install                 # pnpm only (enforced); open a new terminal after the step above
pnpm prebuild:development    # generate android/ + ios/ (gitignored, CNG) — embeds the brand's fonts
pnpm android                 # or: pnpm ios — builds + runs the dev client
pnpm start                   # metro for an installed dev client
```

Environments: `APP_ENV=development|staging|production`, values in `.env.<APP_ENV>`,
validated by `env.ts` (zod). Scripts: `start[:staging|:production]`, `prebuild[…]`,
`android[…]`, `ios[…]`, `build:<env>:<platform>` (EAS), `publish:appdist:…`.
CI needs a `KAGAZ_PACKAGES_TOKEN` repo/org secret and EAS builds a `GITHUB_PACKAGES_TOKEN` EAS secret —
both a **classic** token with `read:packages` (fine-grained tokens don't work with the npm registry;
GitHub secret names can't start with `GITHUB_`, hence the different CI name).

## Design system — Kagaz

Every app built from the constitution uses Kagaz plus **exactly one brand**, chosen at bootstrap:

|                       | Every app                                                                                                                                                | This reference app (example)                                                   |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Packages              | `@lokal-app/kagaz-components` + one `@lokal-app/kagaz-brand-<brand>` (`dostt`, `eaze`, `gaming` or `bhakti`), exact pins, newest release at bootstrap    | `kagaz-components` `1.0.0-next.2` + `kagaz-brand-gaming` `1.0.0-next.1`        |
| Brand values + fonts  | From the brand package; fonts embedded at build time by its config plugin; light and dark always available, default mode set by design                   | Gaming: Kanit + Plus Jakarta Sans, dark by default                             |
| Brand-only components | Whatever the brand package ships under `/components`, `/icons`, `/geometry` (many brands ship none yet)                                                  | Gaming: `PlayCard`, `Pipe`, `ProgressBar` + `CoinIcon`, `PlayIcon`, `LockIcon` |
| Docs                  | [Storybook](https://kagaz-storybook.internal.getlokalapp.com/) • [`docs/DESIGN_SYSTEM.md`](docs/DESIGN_SYSTEM.md) (the app's own brand + version record) | —                                                                              |

**Two gateways — the only places Kagaz enters any app:**

- `src/components/ui/` — re-exports every Kagaz component, primitive, icon, brand-only component and
  tab-bar helper the app uses (`kagaz.ts` for shared Kagaz, `brand.ts` for the app's brand,
  `navigation.ts` for tab helpers). Everything else imports `@/components/ui`, never `@lokal-app/*`.
  Register an export there the first time you use it. When Kagaz changes, this folder is the one
  place to update.
- `src/theme/` — binds the app's brand (`brand.ts`, `overrides.ts`, `registry.ts`, `useStyles.ts`).
  Everything else imports `@/theme`.

**Kagaz step 0:** before building any UI, check whether shared Kagaz — or the app's brand package
(`/components`) — already ships it. If it does, import it and configure it by props; never rebuild,
wrap or restyle it. A component unique to the brand that Kagaz lacks belongs in the brand package,
not in the app. For anything missing, follow the gap protocol (ARCHITECTURE.md §A7.7) and log it in
[`docs/kagaz-gaps.md`](docs/kagaz-gaps.md).

## Quality gates

```bash
pnpm check-all     # lint (--max-warnings=0 in CI) + type-check + kagaz:check
pnpm kagaz:check   # one brand, exact pins, single Kagaz instance, gateway intact, generated files fresh
pnpm kagaz:exports # regenerate eslint-plugin-design-system/kagaz-exports.json after a Kagaz change
pnpm doctor        # expo-doctor
```

Lint includes the local `eslint-plugin-design-system` (10 rules: token values, motion, the styling
pattern, layout-only `style` on Kagaz elements, no shadowed Kagaz names, translated Kagaz labels,
locked folders, barrels, the gap ledger, and the pass-through gateway).

## Claude Code harness

Everything lives in `.claude/`. Scaffold through skills rather than by hand.

### Skills (`/<name>`)

| Skill                  | Use it to                                                                                                                         |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `/implement-feature`   | Build a whole feature from a PRD (+ optional Figma URL / Postman collection): plan → approval → api → state → UI → flows → review |
| `/figma-implement`     | Turn Figma designs into code through gated stages: extract → resolve against Kagaz → compositions → screens → flows → verify      |
| `/create-screen`       | Scaffold `screens/<area>/<screen>/` in the canonical shape from Kagaz + the shell, and register the route                         |
| `/create-component`    | Add an app component (screen-local, area, `common` or icon) — only after Kagaz step 0 proves Kagaz doesn't ship it                |
| `/add-api-resource`    | Scaffold `api/<resource>/` by hand (types + transformer + react-query-kit hooks)                                                  |
| `/api-from-collection` | Generate `api/<resource>/` from a Postman collection (preferred when one exists)                                                  |
| `/add-store`           | Create a Zustand store in `stores/<area>/` with the State/Actions shape                                                           |
| `/create-feature`      | Run the 4-of-4 admission test, then scaffold `features/<name>/` (or send it to the spine)                                         |
| `/add-adapter`         | Wire a real vendor SDK into a `lib/<slot>/` adapter (analytics, crash, push, …)                                                   |
| `/add-skin`            | **New.** Add a named theme skin (e.g. festival) as Kagaz overrides — two files, no component changes                              |
| `/kagaz-upgrade`       | **New.** Upgrade Kagaz in its own PR: refresh generated files, migrate breaking props in the gateway, retire gaps                 |

### Agents

| Agent                | Role                                                                                                                                                    |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `architecture-guard` | Decides where code goes and checks changes against the Constitution, including Kagaz step 0 and the gateway (read-only)                                 |
| `pr-reviewer`        | Final gate: reviews a diff or PR against the Constitution, with a dedicated design-system pass (read-only)                                              |
| `ui-implementer`     | Builds app UI on Kagaz (compositions, icons, screen layouts) — Kagaz step 0 first, imports via `@/components/ui`                                        |
| `screen-builder`     | Builds complete screens from Kagaz (via `@/components/ui`), the shell, api hooks and stores                                                             |
| `feature-builder`    | Implements isolated `features/<name>/` modules once they pass the 4-of-4 test                                                                           |
| `adapter-wirer`      | Replaces a `lib/<slot>/` no-op adapter with a real vendor implementation                                                                                |
| `figma-extractor`    | Figma stage 1: reads the file through MCP → `design-package.json`                                                                                       |
| `kagaz-resolver`     | **New** (replaces `token-reconciler`). Figma stage 2: maps every Figma instance to a Kagaz export + props and every binding to a token; classifies gaps |
| `flow-wirer`         | Figma stage 5 / navigation: registers screens with typed params and wires the flows; tabs via Kagaz `tabItem`                                           |

### Hooks

- **UserPromptSubmit** adds a short rules reminder (incl. Kagaz step 0) to each prompt.
- **PreToolUse (Bash)**: `guard-bash.sh` blocks destructive commands (`rm -r`, `git reset --hard`, force-push, `git clean -f`), dependency changes (ADR; Kagaz only via `/kagaz-upgrade`) and any Kagaz patching.
- **PreToolUse (Edit/Write)**: `guard-edit.sh` (**new**) blocks `node_modules`, `theme/tokens/`, files outside the locked `components/ui`, `components/shell` and `theme` shapes, and Kagaz version edits.
- **PostToolUse (Edit/Write)**: `lint-changed.sh` lints the files you changed.
- **Stop**: `stop-type-check.sh` runs a type-check before the turn ends.

## Opt-in items (off by default — add only when you need them)

| Item                                               | What it gives you                                                                                                                            | How to enable                                                                                                                                                                                                |
| -------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **token-police** (`@lokal-app/kagaz-token-police`) | Kagaz's own token lint — the exact rules Kagaz components pass — instead of the local `design-system/no-raw-style-values` (same value table) | Run `/enable-token-police`. It finds the install source, asks you to install it, and flips `USE_TOKEN_POLICE` in `eslint.config.mjs`. Not yet published by Kagaz; until then it installs from the Kagaz repo |
| **expo-system-ui**                                 | Makes the "follow system" light/dark setting (`settings.colorScheme: 'system'`) work on Android — without it Android stays light             | `npx expo install expo-system-ui`, then `pnpm prebuild:development`. Only needed if the app offers "follow system"; `'brand'`, `'light'` and `'dark'` work without it                                        |

## Docs

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — the Constitution (Part A), incl. the Kagaz contract (§A7)
- [`docs/CLAUDE_CODE_SETUP.md`](docs/CLAUDE_CODE_SETUP.md) — the Claude Code harness (Part B)
- [`docs/DESIGN_SYSTEM.md`](docs/DESIGN_SYSTEM.md) — Kagaz in this app: brand, versions, gateways, upgrade record
- [`docs/kagaz-gaps.md`](docs/kagaz-gaps.md) — the Kagaz gap and adapter ledger
- [`docs/FIGMA_PIPELINE.md`](docs/FIGMA_PIPELINE.md) — `/figma-implement` playbook
- [`docs/BOOTSTRAP_ORDER.md`](docs/BOOTSTRAP_ORDER.md) — `App.tsx` bootstrap slots
- [`docs/ADR-template.md`](docs/ADR-template.md) • `docs/adr/` • `docs/plans/`
