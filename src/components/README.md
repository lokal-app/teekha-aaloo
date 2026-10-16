# src/components/ — app compositions of Kagaz (presentational only)

| Folder    | Holds                                                                                                            |
| --------- | ---------------------------------------------------------------------------------------------------------------- |
| `ui/`     | **the Kagaz gateway** — pass-through re-exports of every Kagaz component the app uses (§A7.8)                    |
| `shell/`  | the closed six app-shell pieces: Screen, LoadingState, ErrorState, EmptyState, BottomSheet, ToastMessage (§A7.5) |
| `icons/`  | app icons Kagaz doesn't ship (Kagaz `IconProps`)                                                                 |
| `common/` | cross-area BUSINESS components (≥2 areas)                                                                        |
| `<area>/` | components shared by ≥2 screens of one area                                                                      |

**Kagaz first:** if Kagaz (shared, or gaming's `/components`) ships it, import it from `@/components/ui`
and configure it by props — never rebuild, wrap or restyle it. **Does NOT go here:** single-screen
components (→ that screen's `components/`), data fetching, store reads, navigation.
**Ladder:** Kagaz → shell/icons → screen `components/` → `<area>/` → `common/`. Move, never copy.
**Lint:** gateway import ban, `import/no-restricted-paths`, all `design-system/*` rules.
**Scaffold:** `/create-component <Name> [<area>|common|icon]`.
