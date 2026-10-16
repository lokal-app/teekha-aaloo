# components/ui/ — the Kagaz gateway (the ONLY place Kagaz components enter the app)
Shape (locked): kagaz.ts (shared re-exports) • brand.ts (this brand's /components /icons
/geometry; `export {};` if none) • navigation.ts (useTabBarOptions, tabItem) • index.ts
(export * from kagaz + navigation, + brand once it has a re-export) • adapters/<Name>.tsx (ONLY via /kagaz-upgrade) • CLAUDE.md.
Rules: only `export { A, type AProps, … } from '@lokal-app/kagaz-…'` statements — explicit
names, never `export *` from a Kagaz package, never an alias, no JSX, no styles, no defaults,
no HOCs. Names stay exactly Kagaz's (docs, JSDoc, component map and lint rules depend on it).
First use of a Kagaz export anywhere = add it here in the same PR (skills do this in step 0).
Adapters exist only to absorb a Kagaz API change: same name, maps the app-facing props onto
the new Kagaz API, first line `// KAGAZ-ADAPTER(<kagaz-version>): <what changed>`, a row in
docs/kagaz-gaps.md "Adapters"; deleted when call sites migrate. Never change looks here —
visual needs go through props, the theme, or the Kagaz gap protocol (§A7.7).
Imports: Kagaz packages only (+ @/theme inside adapters). Nothing else from src/.
