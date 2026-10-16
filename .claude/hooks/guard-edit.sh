#!/usr/bin/env bash
input=$(cat)
file=$(echo "$input" | jq -r '.tool_input.file_path // empty')
[ -n "$file" ] || exit 0
case "$file" in /*) ;; *) file="/$file" ;; esac
block() { echo "BLOCKED by guard-edit: $file — $1 (docs/ARCHITECTURE.md §A7)." >&2; exit 2; }
case "$file" in
  */node_modules/*)                 block "Kagaz and other packages are never edited; use the Kagaz gap protocol (§A7.7)" ;;
  */patches/*lokal-app*)            block "Kagaz is never patched" ;;
  */src/components/ui/*)
    case "${file##*/src/components/ui/}" in
      kagaz.ts|brand.ts|navigation.ts|index.ts|CLAUDE.md|README.md|adapters/*.tsx) ;;
      *) block "components/ui is the Kagaz gateway with a locked shape: kagaz.ts, brand.ts, navigation.ts, index.ts, adapters/ (§A7.8)" ;;
    esac ;;
  */src/theme/tokens/*)             block "there are no local tokens — Kagaz owns every token (§A7.1)" ;;
  */src/components/shell/*)
    case "${file##*/src/components/shell/}" in
      Screen.tsx|LoadingState.tsx|ErrorState.tsx|EmptyState.tsx|ToastMessage.tsx|index.ts|CLAUDE.md|README.md|BottomSheet/*) ;;
      *) block "components/shell is a closed list of six — extending it needs an ADR (§A7.5)" ;;
    esac ;;
  */src/theme/*)
    case "${file##*/src/theme/}" in
      brand.ts|overrides.ts|mergeOverrides.ts|registry.ts|navigationTheme.ts|useStyles.ts|index.ts|CLAUDE.md|README.md|skins/*.ts) ;;
      *) block "src/theme has a locked shape (§A7.2)" ;;
    esac ;;
  */package.json)
    if echo "$input" | jq -r '[.tool_input.old_string, .tool_input.new_string, .tool_input.content] | map(. // "") | join("\n")' \
         | grep -q '@lokal-app/kagaz'; then
      block "Kagaz versions/packages change only via /kagaz-upgrade (the user runs the install)"
    fi ;;
esac
exit 0
