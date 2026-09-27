# src/components/common/ — cross-area business components

**Goes here:** components with business meaning used in ≥2 areas (e.g. a `UserAvatarRow`).
**Does NOT:** atomic token-only pieces (→ `ui/`), single-area components (→ `components/<area>/`),
single-screen components (→ the screen's `components/`). No data fetching, no stores — props only.
**Shape:** `<Name>.tsx`, named export, in-file `createStyles` tail, composed from `ui/` primitives.
No `index.ts` here (only `ui/` has the curated barrel). Scaffold with `/create-component <Name> common`.
