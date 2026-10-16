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
