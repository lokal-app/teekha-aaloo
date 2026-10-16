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
