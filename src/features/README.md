# src/features/ — isolated features (4-of-4 or it's spine)

**Admission (ALL must hold):** own domain model • terminal navigator boundary • no spine state
read/write • deletable in one PR (§A1). Otherwise the code belongs in the spine.
**Shape:** `features/<name>/{api/, components/, screens/, stores?/, hooks?/, navigator.tsx,
types.ts, utils.ts?, index.ts}` (§A6.4). `index.ts` is the ONLY public surface.
**Rules:** never import another feature; never import spine `stores/`/`screens/`; spine imports
only `@/features/<name>` (no deep imports); mounted as one route in AuthenticatedStack.
**Lint:** `no-restricted-imports` (feature patterns), `import/no-restricted-paths` (features zone).
**Scaffold:** `/create-feature` (runs the admission test first). Ships empty.
