#!/usr/bin/env bash
file=$(jq -r '.tool_input.file_path // empty')
case "$file" in
  */src/*.ts|*/src/*.tsx)
    mkdir -p .claude/state && touch .claude/state/src-dirty
    pnpm exec eslint --max-warnings=0 "$file" >&2 || exit 2 ;;
esac
exit 0
