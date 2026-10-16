# src/utils/ — pure helpers

**Goes here:** deterministic input → output helpers and constants with no React, no hooks, no
side effects, no I/O. Never design values — those are Kagaz tokens (touch targets: `tokens.touchTarget`).
**Does NOT:** hooks (→ `hooks/`), vendor/integration code (→ `lib/`), business logic tied to a
resource (→ `api/<resource>/transformer.ts`). No `index.ts`.
**Imports:** nothing from `src/` except types (`@typescript-eslint/no-restricted-imports`).
