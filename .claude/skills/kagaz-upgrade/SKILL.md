---
description: Upgrade the Kagaz design system (components + tokens + this app's brand package)
  to a new version in its own PR — refresh the generated maps, migrate breaking props, retire
  KAGAZ-GAP compositions. The ONLY sanctioned way to change a Kagaz version.
argument-hint: '<target-version e.g. 1.1.0> [brand-version] [--bootstrap --from <KAGAZ_BASELINE>]'
allowed-tools: 'Read Write Edit Grep Glob Bash Agent'
---

1. Preflight: clean working tree on a dedicated branch (kagaz-upgrade-<version>); record the
   current versions from package.json; read the Kagaz CHANGELOGs between current and target
   (github.com/lokal-app/kagaz packages/{components,tokens,brands/<brand>}/CHANGELOG.md via
   `gh api`, or Storybook). List breaking changes (major entries, renamed/removed props,
   token key changes) and new components (shared and brand-only).
   PATTERN GUARD: if any entry changes a pattern this constitution locks — the three token
   layers, `createTheme`/`ThemeProvider`/`useTokens` contract, the brand-package model (one brand,
   root entry + /components /icons /geometry subpaths), component tokens via
   `createTheme({ components })`, token-police's rules, the Figma→token naming rule, or the
   layout-only `style` contract — STOP and report it to the user and the Kagaz maintainers.
   Never adapt the rules silently; a pattern change needs a constitution update (ADR).
   `--bootstrap` mode (used by Part D Phase 4b): current = the `--from` baseline, the packages are
   already installed — skip the branch requirement and step 2, run steps 3–7 against the
   installed versions.
2. Ask the user to install (guard-bash blocks agent installs):
   `! pnpm add -E @lokal-app/kagaz-components@<v> @lokal-app/kagaz-brand-<brand>@<bv>` and
   ONLY if the app opted into token-police: `! pnpm add -D -E @lokal-app/kagaz-token-police@<v>`
   (or its git pin, §A12) at the same Kagaz release
   (exact pins; kagaz-tokens follows components; the brand version must peer-accept them).
   Wait for confirmation.
3. Regenerate: `node scripts/kagaz-exports.mjs` (kagaz-exports.json, shared + brand); refresh
   .claude/figma/component-map.json from the Kagaz repo's packages/components/src/_/figma_.json
   and packages/brands/<brand>/src/components/_/figma_.json at the release tag (set
   kagazVersion + brandVersion); re-run lint (token-police too, if opted in); update the §A7.6 inventory and the §A7.1 token table
   in docs/ARCHITECTURE.md from the installed types; update
   eslint-plugin-design-system/kagaz-i18n-props.json for any new English-default prop.
4. Migrate — in the GATEWAY first: update components/ui/{kagaz,brand,navigation}.ts for renamed/
   moved/removed exports; where a Kagaz API change would ripple into call sites, add an
   adapters/<Name>.tsx (KAGAZ-ADAPTER marker + ledger row) so screens stay untouched, then
   migrate call sites and delete the adapter in the same or a follow-up PR. Then
   pnpm type-check + pnpm lint; fix every break by following the CHANGELOG (prop
   renames, token path changes) — never by pinning back, casting or disabling rules.
5. Retire gaps: for every docs/kagaz-gaps.md row Kagaz now ships (shared library or the
   brand's /components), register the Kagaz export in components/ui, replace the KAGAZ-GAP
   composition's usages with it, delete the file and the row.
6. Fonts: if the brand's fonts.json changed, note in the PR that a new native build is required
   (fonts are embedded at build time — not shippable over the air); run pnpm prebuild:development.
7. Gate: pnpm check-all (incl. kagaz:check) + pr-reviewer APPROVE. PR contains ONLY the
   upgrade, map/doc refresh, migrations and gap retirements.
