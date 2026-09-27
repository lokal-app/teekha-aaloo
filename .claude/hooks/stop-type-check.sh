#!/usr/bin/env bash
# Stop gate. Only exit 2 blocks a Stop, and only stderr reaches Claude.
input=$(cat)
state=.claude/state
[ -f "$state/src-dirty" ] || exit 0                 # no src/ edit this turn → skip
if [ "$(echo "$input" | jq -r '.stop_hook_active // false')" != "true" ]; then
  rm -f "$state/stop-attempts"                      # fresh stop, reset the counter
fi
if out=$(pnpm -s type-check 2>&1); then
  rm -f "$state/src-dirty" "$state/stop-attempts"; exit 0
fi
n=$(( $(cat "$state/stop-attempts" 2>/dev/null || echo 0) + 1 ))
if [ "$n" -gt 3 ]; then                             # loop guard: hand back to the user
  rm -f "$state/stop-attempts"; exit 0
fi
echo "$n" > "$state/stop-attempts"
printf '%s\n' "$out" | tail -n 60 >&2
echo "BLOCKED: pnpm type-check failed (attempt $n/3). Fix the errors above before finishing." >&2
exit 2
