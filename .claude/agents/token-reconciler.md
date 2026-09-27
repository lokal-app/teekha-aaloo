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
