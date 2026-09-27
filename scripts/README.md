# scripts/ — build & release scripts

| Script | Purpose |
|---|---|
| `publish-appdist.sh <profile> <ios\|android>` | Local EAS build → Firebase App Distribution. TODO(appdist): configure `FIREBASE_APP_ID_*` + `FIREBASE_TESTER_GROUPS`. |

**Rules:** scripts are invoked via the `package.json` script matrix, never ad hoc in CI YAML.
Bash with `set -euo pipefail`; no secrets in the repo (read from env).
