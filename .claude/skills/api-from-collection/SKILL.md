---
description: Generate api/<resource>/ folders from a Postman collection via the Postman MCP —
  DTOs from real response examples. Preferred over /add-api-resource whenever a collection
  or API spec exists.
argument-hint: "<postman collection name or id> [resources to include]"
allowed-tools: "Read Write Edit Grep Glob Bash mcp__postman__*"
context: fork
---
1. Fetch the collection via Postman MCP; list folders/requests; confirm with the user which
   map to which <resource> (one api/ folder per resource, kebab-case).
2. Per request: derive the types.ts zod wire schemas from the SAVED EXAMPLE RESPONSES (exact
   wire shape — nullable/optional faithfully), ApiX types via z.infer; derive request
   param/body schemas the same way; add the clean app types alongside.
3. Generate transformer.ts (to<Noun>/from<Noun>Input) and use<Verb><Noun>.ts hooks per the
   locked react-query-kit conventions (verb from HTTP method + path shape; paginated list
   endpoints → createInfiniteQuery inside useList<Noun>s, name unchanged; fetcher uses
   validateResponse).
4. Endpoints with no saved example → generate with // TODO(verify-wire) and report them —
   never invent response shapes.
5. Gate: pnpm lint --fix + pnpm type-check. Output: resources created, hook inventory,
   unverified endpoints.
