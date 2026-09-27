---
description: Wire a real vendor SDK into a lib/<slot>/ adapter (analytics, crash, push,
  remoteConfig, observability, payment). Use whenever a vendor integration is requested.
argument-hint: "<slot> <vendor>"
allowed-tools: "Read Grep Glob Agent"
context: fork
agent: adapter-wirer
---
Delegate to adapter-wirer with the slot + vendor. Acceptance: contract in types.ts unchanged,
public API in index.ts unchanged, vendor imports confined to lib/<slot>/ (grep-verified),
bootstrap slot filled per the canonical order, lint + type-check green. Report the diff
summary and any native config (app.config.ts plugins) added.
