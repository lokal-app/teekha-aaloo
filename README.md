# Teekha Aaloo

React Native app (Expo CNG + Dev Client + EAS), generated from **rn-template**.

> **Read [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) first.** It is the Constitution —
> absolute rules for where code goes, naming, styling, state and API patterns. Deviations
> require an ADR in `docs/adr/`.

## Quickstart
```bash
pnpm install                 # pnpm only (enforced)
pnpm prebuild:development    # generate android/ + ios/ (gitignored, CNG)
pnpm ios                     # or: pnpm android — builds + runs the dev client
pnpm start                   # metro for an installed dev client
```
Environments: `APP_ENV=development|staging|production`, values in `.env.<APP_ENV>`,
validated by `env.ts` (zod). Scripts: `start[:staging|:production]`, `prebuild[…]`,
`android[…]`, `ios[…]`, `build:<env>:<platform>` (EAS), `publish:appdist:…`.

## Quality gates
```bash
pnpm check-all   # lint (--max-warnings=0 in CI) + type-check
pnpm doctor      # expo-doctor
```

## Claude Code harness
Everything lives in `.claude/`. Scaffold through skills rather than by hand.

### Skills (`/<name>`)
| Skill | Use it to |
| --- | --- |
| `/implement-feature` | Build a whole feature from a PRD (+ optional Figma URL / Postman collection): plan → approval → api → state → UI → flows → review |
| `/figma-implement` | Turn Figma designs into code through gated stages: extract → tokens → primitives → screens → flows → verify |
| `/create-screen` | Scaffold `screens/<area>/<screen>/` in the canonical shape and register the route |
| `/create-component` | Add a component at the right level (`ui` primitive, area, or `common`), styled with tokens only |
| `/add-api-resource` | Scaffold `api/<resource>/` by hand (types + transformer + react-query-kit hooks) |
| `/api-from-collection` | Generate `api/<resource>/` from a Postman collection (preferred when one exists) |
| `/add-store` | Create a Zustand store in `stores/<area>/` with the State/Actions shape |
| `/create-feature` | Run the 4-of-4 admission test, then scaffold `features/<name>/` (or send it to the spine) |
| `/add-adapter` | Wire a real vendor SDK into a `lib/<slot>/` adapter (analytics, crash, push, …) |

### Agents
| Agent | Role |
| --- | --- |
| `architecture-guard` | Decides where code goes and checks changes against the Constitution (read-only) |
| `pr-reviewer` | Final gate: reviews a diff or PR against the Constitution (read-only) |
| `ui-implementer` | Builds all UI (primitives, components, screen layouts) within the design system |
| `screen-builder` | Builds complete screens that use existing api hooks, stores, and ui primitives |
| `feature-builder` | Implements isolated `features/<name>/` modules once they pass the 4-of-4 test |
| `adapter-wirer` | Replaces a `lib/<slot>/` no-op adapter with a real vendor implementation |
| `figma-extractor` | Figma stage 1: reads the file through MCP → `design-package.json` |
| `token-reconciler` | Figma stage 2: compares design tokens with `src/theme/tokens/*` (the only agent that edits tokens) |
| `flow-wirer` | Figma stage 5 / navigation: registers screens with typed params and wires the flows |

### Hooks
- **UserPromptSubmit** adds a short rules reminder to each prompt.
- **PreToolUse (Bash)**: `guard-bash.sh` blocks destructive commands (`rm -r`, `git reset --hard`, force-push, `git clean -f`) and dependency changes, which need an ADR.
- **PostToolUse (Edit/Write)**: `lint-changed.sh` lints the files you changed.
- **Stop**: `stop-type-check.sh` runs a type-check before the turn ends.

## Docs
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — the Constitution (Part A)
- [`docs/CLAUDE_CODE_SETUP.md`](docs/CLAUDE_CODE_SETUP.md) — the Claude Code harness (Part B)
- [`docs/FIGMA_PIPELINE.md`](docs/FIGMA_PIPELINE.md) — `/figma-implement` playbook
- [`docs/BOOTSTRAP_ORDER.md`](docs/BOOTSTRAP_ORDER.md) — `App.tsx` bootstrap slots
- [`docs/ADR-template.md`](docs/ADR-template.md) • `docs/adr/` • `docs/plans/`
