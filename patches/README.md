# patches/ — pnpm patches

**What goes here:** `pnpm patch <pkg>` / `pnpm patch-commit` output for upstream bugs we
cannot wait on. pnpm records each in `package.json` → `pnpm.patchedDependencies`.
**Rules:** every patch links the upstream issue/PR in its commit message and is removed in the
batch upgrade PR that picks up the fix (§A0 "Versions"). Never patch to change behaviour the
Constitution governs — that is an ADR.
