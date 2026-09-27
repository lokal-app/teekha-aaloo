---
description: Scaffold api/<resource>/ in the locked 3-file shape (types + transformer +
  react-query-kit hooks). Use for any new backend resource or endpoint group (manual
  variant — prefer /api-from-collection when a Postman collection exists).
argument-hint: "<resource> <operations: get,list,create,update,delete> [--paginated]"
allowed-tools: "Read Write Edit Grep Glob Bash"
---
1. Path src/api/<resource>/ (kebab-case). Create types.ts: one zod schema per wire entity
   (matching the wire EXACTLY — snake_case, nullability faithful), ApiX types via z.infer,
   then the clean app types (camelCase, Date objects, unions). Create transformer.ts:
   to<Noun>(api: ApiX): X per entity; from<Noun>Input() for write bodies.
2. Per requested operation create use<Verb><Noun>.ts via createQuery / createMutation:
   queryKey ['<resource>','<operation>']; fetcher = apiClient → validateResponse(schema, data)
   → to<Noun>() → app type. Paginated list endpoints (--paginated or cursor/page params):
   createInfiniteQuery INSIDE useList<Noun>s — the name does not change; expose flattened
   items + fetchNextPage. Mutations invalidate via sibling hooks' getKey() in onSuccess.
3. Hooks return the kit object unmodified — no wrapper objects. NO index.ts (api/ folders
   have no barrels). axios only via @/lib/api-client. Api* types must not be exported for
   use outside src/api/**.
4. If endpoint shapes are unknown, write the wire schemas from the task description and mark
   each with // TODO(verify-wire) — flagged by pr-reviewer until resolved.
5. Gate: pnpm lint --fix + pnpm type-check.
