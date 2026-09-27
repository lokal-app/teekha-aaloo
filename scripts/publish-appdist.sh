#!/usr/bin/env bash
# Build locally with EAS and upload the artifact to Firebase App Distribution.
# Usage: scripts/publish-appdist.sh <staging|production> <ios|android>
# TODO(appdist): set FIREBASE_APP_ID_<PLATFORM> and FIREBASE_TESTER_GROUPS in CI secrets
# (or your shell) before first use. Requires a logged-in Firebase CLI (firebase-tools).
set -euo pipefail

profile="${1:?profile required (staging|production)}"
platform="${2:?platform required (ios|android)}"

case "$platform" in
  ios) ext=ipa; app_id="${FIREBASE_APP_ID_IOS:?FIREBASE_APP_ID_IOS not set}" ;;
  android) ext=apk; app_id="${FIREBASE_APP_ID_ANDROID:?FIREBASE_APP_ID_ANDROID not set}" ;;
  *) echo "unknown platform: $platform" >&2; exit 1 ;;
esac

artifact="dist/${profile}-${platform}.${ext}"
mkdir -p dist
APP_ENV="$profile" npx eas-cli@latest build --local --non-interactive \
  --profile "$profile" --platform "$platform" --output "$artifact"

npx firebase-tools appdistribution:distribute "$artifact" \
  --app "$app_id" \
  --groups "${FIREBASE_TESTER_GROUPS:?FIREBASE_TESTER_GROUPS not set}"
