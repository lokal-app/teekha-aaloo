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
