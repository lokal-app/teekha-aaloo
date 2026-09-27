# Figma pipeline — `/figma-implement` playbook

The design team's Figma file is the **source of truth** for token values and screens (§A7).
Token *keys* are fixed by the Constitution; only *values* flow in from Figma.

## One-time setup per app
1. **Figma MCP** — `.mcp.json` ships the remote Dev Mode server (`https://mcp.figma.com/mcp`).
   Teams using the desktop app's local server swap the URL for `http://127.0.0.1:3845/mcp`.
   Authenticate on first use (`/mcp` in Claude Code).
2. **Fill the maps** in `.claude/figma/`:
   - `token-map.json` — Figma variable name → constitution token key
     (e.g. `"color/brand/500": "palette.blue500"`, `"semantic/bg": "colors.background"`).
   - `component-map.json` — Figma component → `components/ui` primitive (+ variant mapping).
   - `screen-map.json` — Figma frame → `screens/<area>/<screen>/` + navigator.
3. The pipeline preflight (stage 0) refuses to run while any map still contains only its
   template placeholder.

## Running it
```
/figma-implement <figma-url> [frames/pages]
```
| Stage | Agent | Gate (exit code) |
|---|---|---|
| 1 Extract | figma-extractor → `.claude/state/design-package.json` | `node .claude/figma/validate.mjs` |
| 2 Reconcile tokens | token-reconciler | `pnpm lint` + `pnpm type-check`, zero blocked-needs-design |
| 3 Primitives | ui-implementer | `pnpm lint` (design-system plugin) |
| 4 Screens | screen-builder | `pnpm lint` + `pnpm type-check` |
| 5 Wire flows | flow-wirer | `pnpm type-check` + architecture-guard APPROVE |
| 6 Final | pr-reviewer | `pnpm check-all` + APPROVE |

A failed gate halts the pipeline. Nothing proceeds on red.

## First token sync (replacing placeholders)
Every value in `src/theme/tokens/*` and `src/theme/themes/default.ts` ships marked
`// PLACEHOLDER — replace via /figma-implement token sync`. The first run's stage 2 replaces
them. `themes/default.ts` must end with **both** light and dark defined for every semantic key —
a missing dark value is a blocker, never a guess.

## Troubleshooting
| Symptom | Cause → fix |
|---|---|
| Stage 1 gate fails schema validation | Extractor guessed a mapping. Add it to `token-map.json`/`component-map.json`; re-run. Unmapped items belong in `unmapped`. |
| Stage 2 reports "needs new key" | Figma uses a value/role with no constitution key. Raise with design; a new key needs an ADR. Never hardcode the nearest value. |
| `design-system/spacing-scale-only` fires after sync | Design used an off-scale spacing value. Flag to design (4-pt grid expected). |
| `design-system/no-raw-colors` fires | A hex slipped outside `palette.ts`. Add it to the palette (append-only) and reference it from `themes/`. |
| MCP tools not visible to the extractor | `/mcp` → re-authenticate Figma; tool names must be `mcp__figma__*`. |
