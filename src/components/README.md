# src/components/ — presentational only

| Folder | Holds |
|---|---|
| `ui/` | design-system primitives — atomic, token-only (§A7.1) |
| `common/` | cross-area BUSINESS components (≥2 areas, not atomic) |
| `<area>/` | components shared by ≥2 screens of one area |

**Does NOT go here:** components used by one screen (→ that screen's `components/`), data
fetching, store reads, navigation — data in via props, events out via callbacks.
**Promotion ladder:** 1 screen → screen `components/`; ≥2 screens same area → `<area>/`;
cross-area business → `common/`; atomic + token-only → `ui/`. Move, never copy.
**Lint:** `import/no-restricted-paths` (never api/stores/screens), all `design-system/*` rules.
**Scaffold:** `/create-component <Name> [ui|<area>|common]`.
