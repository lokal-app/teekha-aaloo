# lib/ — infrastructure ONLY (the cardinal rule)
Integrations and adapters: api-client, logger, storage, i18n, permissions + vendor slots
(analytics, crash, push, remoteConfig, observability, payment). A slot = index.ts (public
API) + types.ts (contract) + adapter.ts (impl; ships as no-op). Swap vendors by replacing
adapter.ts only (/add-adapter). NO business code, NO imports from spine/features/theme.
If it knows what a "booking" is, it does not belong here.
api-client owns the session: single-flight 401 refresh (session.ts), the one per-app file
authRefresh.ts (refresh protocol), focus/online bindings (reactQueryNative.ts). Session
expiry reaches the app only via configureApiAuth({ onSessionExpired }) — never a store import.
Storage rule: storage (plain MMKV) = THE app storage; secureStorage (expo-secure-store) =
secrets vault ONLY (long-lived credentials/crypto secrets, ≤2KB, keys from the secure.ts
enum). Refresh token → secureStorage; access token → MMKV. Never AsyncStorage.
