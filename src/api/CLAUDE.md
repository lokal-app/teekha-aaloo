# api/ — server state only
Shape per resource (exactly): types.ts (zod wire schemas + ApiX = z.infer types + clean app
types together), transformer.ts (to<Noun>() — the ONLY wire↔app meeting point, mandatory even
when near-identity), use<Verb><Noun>.ts (one react-query-kit hook per file). No index.ts.
Verbs: Get (single) | List (any collection — paginated uses createInfiniteQuery INSIDE, name
unchanged) | Create | Update | Delete.
Fetcher pipeline (fixed): apiClient → validateResponse(schema, data) [non-prod parse] →
to<Noun>() → return APP type. Cache stores app types ONLY — never raw wire data, never
{raw, transformed} pairs. Hooks return the kit query object unmodified (no {loading, error}
wrappers — screens map to status). Envelope unwrapping + error normalization live in
lib/api-client interceptors, never per-hook. Api* types never leave src/api/**.
Query keys only via the kit; invalidate with hook.getKey(). Mutations invalidate in
onSuccess; optimistic updates need full onMutate/onError/onSettled.
types.ts or transformer.ts over ~200 lines → split the RESOURCE, not the file.
Never import components/screens/stores here. axios only via @/lib/api-client.
Never handle 401s or refresh tokens here — lib/api-client does it once. Login/OTP fetchers pass
{ skipAuth: true } and persist tokens via saveTokens().
Scaffold with /add-api-resource or /api-from-collection (Postman).
