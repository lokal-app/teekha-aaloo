# lib/storage — the layered persistence pattern (§A6.5)

| Export | Backing | Use for |
|---|---|---|
| `storage` | the single plain MMKV instance (`mmkv.ts`) | THE app storage — everything that is not a secret |
| `secureStorage` | expo-secure-store (`secure.ts`) | long-lived credentials / crypto secrets ONLY (≤2KB, async) |
| `zustandStorage` | MMKV (`zustandAdapter.ts`) | `persist()` in `stores/<area>/` via `createJSONStorage(() => zustandStorage)` |
| `isFirstRun` / `markLaunched` | MMKV flag | §A13 first-run check → `secureStorage.wipeAll()` (Keychain survives reinstall) |

**Decision rule:** refresh token, PIN, encryption key → `secureStorage`. Everything else → `storage`.
Access token → MMKV (read synchronously by the axios interceptor). Tokens are written only via
`saveTokens()` / `clearTokens()` from `@/lib/api-client`.

**Rules:** new SecureStore keys go in the `SecureKey` enum — never ad-hoc strings. Never
AsyncStorage. App state never goes in SecureStore (2KB vault, not a database).

**Upgrade path (ADR-gated):** if PII must persist encrypted at rest, add an encrypted MMKV
instance whose key is generated once and kept in `secureStorage` (`SecureKey.MmkvEncryptionKey`):
a `keyManager.ts` here reads/creates the key on boot and passes `encryptionKey` to
`createMMKV({ id: 'secure-app-storage', encryptionKey })`. Requires an ADR (§A14).
