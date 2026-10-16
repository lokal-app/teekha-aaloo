# Design system — Kagaz in Teekha Aaloo

Teekha Aaloo's UI is built on **Kagaz**, Lokal's design system. The full contract is
[ARCHITECTURE.md §A7](ARCHITECTURE.md); this page is the app-specific record.

|               |                                                                                                                                             |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Brand         | **gaming** (`@lokal-app/kagaz-brand-gaming`) — Kanit + Plus Jakarta Sans, fonts embedded at build time                                      |
| Kagaz         | `@lokal-app/kagaz-components` + `@lokal-app/kagaz-tokens` `1.0.0-next.2` (exact pins)                                                       |
| Brand package | `1.0.0-next.1` — ships `/components` (PlayCard, Pipe, ProgressBar), `/icons` (CoinIcon, PlayIcon, LockIcon), `/geometry`                    |
| Token lint    | default: `design-system/no-raw-style-values`. token-police: **not enabled** (opt-in via `/enable-token-police`; not yet published by Kagaz) |
| Storybook     | https://kagaz-storybook.internal.getlokalapp.com/                                                                                           |

## The two gateways

- **`src/components/ui/`** — the only place Kagaz components, primitives, icons, brand components and
  tab helpers are imported (`kagaz.ts`, `brand.ts`, `navigation.ts`). Everything else imports
  `@/components/ui`. Register an export there the first time you use it.
- **`src/theme/`** — the brand binding: `brand.ts`, `overrides.ts` (empty), `registry.ts`,
  `navigationTheme.ts`, `useStyles.ts`. Everything else imports `@/theme`.

## Bootstrapped on

|                               |                                                                                                                  |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Migrated                      | 2026-10-16, from the pre-Kagaz template (own tokens + `components/ui`) to the Kagaz constitution                 |
| KAGAZ_BASELINE (constitution) | `1.0.0-next.2`                                                                                                   |
| Installed                     | components/tokens `1.0.0-next.2`, kagaz-brand-gaming `1.0.0-next.1` — newest on the `next` tag (no `latest` yet) |
| CHANGELOG delta absorbed      | none (installed = baseline)                                                                                      |
| Pattern guard                 | passed                                                                                                           |
| token-police                  | not published at `1.0.0-next.2` — opt-in available later                                                         |

## Day to day

- New UI: Kagaz step 0 (shared, then gaming's `/components`) → `/create-component` or `/create-screen`.
- Missing value/variant/component: the gap protocol (ARCHITECTURE.md §A7.7) → [kagaz-gaps.md](kagaz-gaps.md).
- Upgrading Kagaz: `/kagaz-upgrade <version>` in its own PR (the developer runs the install).
- Local installs need `export GITHUB_PACKAGES_TOKEN=$(gh auth token)` (a token with `read:packages`).
