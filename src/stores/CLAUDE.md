# stores/ — Zustand client state
stores/<area>/<name>Store.ts + index.ts barrel. State type + Actions type; actions defined
inside create(); selector-only consumption (useXStore(s => s.field)); getState() only outside
React. persist → MMKV adapter from lib/storage with explicit partialize. NEVER server data
(that's React Query's cache), never at stores/ root, never imported by components/.
Scaffold with /add-store.
