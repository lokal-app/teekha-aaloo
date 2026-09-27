# src/hooks/ — the ONE flat layer folder

**Goes here:** cross-area UI/infra hooks, one per file at the root: `use<Name>.ts`
(`useAppState`, `useDebounce`, `useKeyboardVisible`, …) (§A1).
**Does NOT:** anything importing `api/` or `stores/` (that composition happens only in screen
data hooks), screen data hooks (→ the screen folder), store selectors (→ `stores/<area>/`).
**Imports allowed:** `lib/`, `utils/`, `theme/` only. **No index.ts.**
**Lint:** `import/no-restricted-paths` (hooks zone), `max-lines` 150.
