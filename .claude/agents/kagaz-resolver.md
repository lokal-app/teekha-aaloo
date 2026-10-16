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
