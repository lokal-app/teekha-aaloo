# src/api/ — server state (React Query via react-query-kit)

**Purpose:** one folder per backend resource; the only home of wire types and fetchers.
**Goes here:** `api/<resource>/{types.ts, transformer.ts, use<Verb><Noun>.ts}` (§A6.2).
**Does NOT go here:** client/UI state (→ `stores/<area>/`), axios setup, tokens, 401 handling
(→ `lib/api-client`), mapping to screen `status` (→ the screen data hook).
**Shape:** `types.ts` = zod wire schemas + `Api*` types (`z.infer`) + clean app types;
`transformer.ts` = `to<Noun>()` / `from<Noun>Input()`; one kit hook per file. **No index.ts.**
Fetcher: `apiClient` → `validateResponse(schema, data)` → `to<Noun>()` → app type.
**Lint:** `no-restricted-syntax` (Api* never leave src/api), `no-restricted-imports` (axios),
`import/no-restricted-paths` (never components/screens/stores), `no-layer-root-barrels`.
**Scaffold:** `/add-api-resource` or `/api-from-collection`.
