---
description: Opt this app into Kagaz's own token lint (token-police). Use ONLY when the developer
  explicitly asks to enable token-police; never on your own initiative.
argument-hint: "[registry|git]"
allowed-tools: "Read Write Edit Grep Glob Bash"
disable-model-invocation: true
---
1. Read the installed @lokal-app/kagaz-components version (KAGAZ_VERSION).
2. Find the install source: `@lokal-app/kagaz-token-police@<KAGAZ_VERSION>` on GitHub Packages
   (`npm view`); if not published, the git pin to the commit of tag
   `@lokal-app/kagaz-components@<KAGAZ_VERSION>`:
   `github:lokal-app/kagaz#<sha>&path:/packages/token-police`. Unavailable → tell the developer
   and stop; the default tier stays active (nothing breaks).
3. Ask the developer to install it (guard-bash blocks agent installs):
   `! pnpm add -D -E <source>`. Wait for confirmation.
4. Set `USE_TOKEN_POLICE = true` in eslint.config.mjs (that turns design-system/no-raw-style-values
   off). Change nothing else.
5. Run pnpm lint; fix every token-police finding with the token it names — never disable a rule.
6. Record in docs/DESIGN_SYSTEM.md: token-police enabled, version and source. From now on
   kagaz:check, pr-reviewer and /kagaz-upgrade also check and move it with Kagaz.
7. Gate: pnpm check-all.
