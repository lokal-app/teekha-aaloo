# Figma pipeline (Kagaz edition)

`/figma-implement <figma-url> [frames]` — stages, in order, each gated by an exit code:

0. Preflight — `.claude/figma/component-map.json` matches the installed Kagaz (`kagazVersion`) and holds
   gaming's `brandComponents`; `screen-map.json` filled for the frames; Figma MCP reachable; `pnpm kagaz:check` green.
1. Extract (`figma-extractor`) → `.claude/state/design-package.json` (instances, bindings, frames, flows, brand mode).
2. Resolve against Kagaz (`kagaz-resolver`) → every instance = a Kagaz export + props, every binding = a
   token path, every miss = a classified gap. **No token stage** — Kagaz owns tokens.
3. Compositions (`ui-implementer`) — app-specific components built from `@/components/ui` only.
4. Screens (`screen-builder`) — canonical screen folders; new Kagaz exports registered in the gateway first.
5. Flows (`flow-wirer`) — typed routes; tabs via `tabItem`.
6. Final — `pnpm check-all` + `pr-reviewer`.

The Figma account must read the Kagaz Core Components file (`SiZy9MpCZuqzJs1yiU8vRh`) and the gaming
design-system file (`vHX6yu564DbkTCKLgjGQFI`). Full rules: ARCHITECTURE.md §A7, CLAUDE_CODE_SETUP.md B6.
