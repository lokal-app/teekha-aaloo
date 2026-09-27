# src/lib/ — infrastructure ONLY

| Folder | Kind |
|---|---|
| `api-client/` | axios instance, session refresh, React Query client + native bindings (§A6.2.1) |
| `storage/` | MMKV `storage`, `secureStorage`, `zustandStorage` (§A6.5) |
| `logger/`, `toast/`, `i18n/`, `permissions/` | concrete infra |
| `env.ts` | the `@env` shim (client env from app.config `extra`) |
| `analytics/`, `crash/`, `push/`, `remoteConfig/`, `observability/`, `payment/` | adapter slots — ship as no-op |

**Slot shape:** `index.ts` (public API) + `types.ts` (contract) + `adapter.ts` (impl) + README.
Swap vendors by replacing `adapter.ts` only (`/add-adapter`).
**Does NOT:** business code, imports from spine/features/theme, React components.
**Lint:** `import/no-restricted-paths` (lib zone), `no-restricted-imports` (axios only in api-client).
