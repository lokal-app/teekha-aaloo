# components/ui — the Kagaz gateway

The only place Kagaz components, primitives, icons, brand-only components and tab-bar helpers are
imported. Every other file imports them from `@/components/ui`. Files: `kagaz.ts` (shared),
`brand.ts` (this app's brand), `navigation.ts` (tab helpers), `index.ts`, and `adapters/` (only via
`/kagaz-upgrade`). Pass-through `export { … } from` lines only — exact Kagaz names, no aliases, no
JSX, no styles. Rules: docs/ARCHITECTURE.md §A7.8. Lint: `design-system/kagaz-gateway-pass-through`.
