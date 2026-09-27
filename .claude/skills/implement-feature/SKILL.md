---
description: End-to-end feature implementation from a PRD (+ optional Figma URL + optional
  Postman collection): plan → approval → api → state → UI → flows → review. Use for any
  "build <feature>" request bigger than one screen.
argument-hint: "<path-to-PRD-or-inline-brief> [figma-url] [postman-collection]"
allowed-tools: "Read Write Edit Grep Glob Bash Agent"
---
PHASE 1 — UNDERSTAND. Read the PRD fully. Extract: user flows, screens, data entities,
API needs, client state, edge cases, analytics events. List ambiguities and ASK the user
now — never guess business logic.
PHASE 2 — PLACEMENT. Spawn architecture-guard with the feature summary → placement plan
(spine vs features/, full file list). 
PHASE 3 — PLAN. Write docs/plans/<feature>.md: placement verdict, file-by-file plan, API
hooks (resource/verb/noun table), stores + persisted fields, screens + navigator placement,
analytics events, open questions. PAUSE for user approval. Do not write src/ code before
approval.
PHASE 4 — BUILD, in this order with gates between each:
  a. API: /api-from-collection if a collection was given, else /add-api-resource per entity.
  b. State: /add-store per client-state concern.
  c. Design: if figma-url given → /figma-implement scoped to this feature's frames;
     else /create-component + /create-screen per the plan (ui-implementer/screen-builder).
  d. Flows: flow-wirer for navigation + analytics events via lib/analytics.
  Gate after each sub-step: pnpm lint + pnpm type-check.
PHASE 5 — VERIFY. pnpm check-all, then pr-reviewer on the full diff. Fix all BLOCKER/MAJOR
findings and re-run until APPROVE. Output: plan link, file inventory, hook/store/screen/route
summary, analytics events, anything deferred.
