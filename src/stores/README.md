# src/stores/ — Zustand client state

**Goes here:** `stores/<area>/<name>Store.ts` + `index.ts` barrel (§A6.3). Shipped: `auth/`
(`status`, `hasSeenIntro`, persisted), `settings/` (`themeName`, `colorScheme`, `language`, persisted).
**Does NOT:** server data (→ React Query cache via `api/`), stores at `stores/` root, stores in `lib/`.
**Shape:** `type <Name>State` + `type <Name>Actions`; actions inside `create()`; `initialState`
const; `persist` via `zustandStorage` from `@/lib/storage` with explicit `partialize`.
**Consumption:** selectors only (`useAuthStore((s) => s.status)`); `getState()` outside React.
Never imported by `components/` or `hooks/`.
**Lint:** `import/no-restricted-paths` (never screens/components/api). **Scaffold:** `/add-store`.
