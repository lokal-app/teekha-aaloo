---
description: Create a Zustand store in stores/<area>/ with the locked State/Actions shape.
  Use for any new client state — never hand-roll stores.
argument-hint: "<area> <store-name> [--persist]"
allowed-tools: "Read Write Edit Grep Glob Bash"
---
1. Path src/stores/<area>/<name>Store.ts (+ index.ts barrel created/updated to full re-export).
2. Template: type <Name>State + type <Name>Actions; export const use<Name>Store =
   create<State & Actions>()(...); actions defined inside; initial state as a named const
   so reset() can restore it.
3. --persist: wrap with persist(), storage: zustandStorage from @/lib/storage, explicit
   partialize listing ONLY the fields that must survive restarts, version + migrate stub.
4. Refuse server data fields (anything fetched from the API belongs in React Query) — if the
   task asks for them, explain and point to /add-api-resource.
5. Gate: pnpm lint --fix + pnpm type-check.
