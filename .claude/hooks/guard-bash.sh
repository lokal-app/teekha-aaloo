#!/usr/bin/env bash
cmd=$(jq -r '.tool_input.command // empty')
sep='(^|[;&|(`[:space:]])'
destructive="${sep}rm[[:space:]]+(-[[:alnum:]-]+[[:space:]]+)*(-[[:alpha:]]*[rR]|--recursive)|git[[:space:]]+reset[[:space:]]+--hard|git[[:space:]]+push([[:space:]].*)?[[:space:]](--force|--force-with-lease|-f)([[:space:]]|=|$)|git[[:space:]]+clean[[:space:]]+-[[:alpha:]]*f"
deps="${sep}pnpm[[:space:]]+(add|remove|rm|uninstall|un|update|up|upgrade)([[:space:]]|$)|${sep}pnpm[[:space:]]+(install|i)[[:space:]]+[^-[:space:]]|expo[[:space:]]+install|${sep}(npm|yarn|bun)[[:space:]]+(add|install|i|remove|uninstall)([[:space:]]|$)"
if echo "$cmd" | grep -qE "$destructive"; then
  echo "BLOCKED by guard-bash: '$cmd' is destructive. Explain intent and ask the user." >&2
  exit 2
fi
if echo "$cmd" | grep -qE "$deps"; then
  echo "BLOCKED by guard-bash: '$cmd' changes dependencies. New/removed/upgraded deps need an ADR (§A0); ask the user to run it themselves (\`! <command>\`) once approved." >&2
  exit 2
fi
exit 0
