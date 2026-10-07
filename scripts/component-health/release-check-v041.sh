#!/usr/bin/env bash
set -euo pipefail

ROOT="$(git rev-parse --show-toplevel 2>/dev/null || true)"
if [[ -z "$ROOT" ]]; then
  echo "ERROR: not inside a Git working tree." >&2
  exit 1
fi
cd "$ROOT"

echo "=== COMPONENT HEALTH V0.4.1 INTERNAL STABLE RELEASE GATE ==="
echo "repo=$ROOT"
echo "branch=$(git branch --show-current)"
echo "commit=$(git rev-parse HEAD)"

if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "ERROR: tracked working tree changes detected. Commit or stash them before release validation." >&2
  git status --short
  exit 1
fi

export ELARIS_COMPONENT_HEALTH_V03_ROOT="${ELARIS_COMPONENT_HEALTH_V03_ROOT:-$HOME/elaris-private}"
export NEXT_TELEMETRY_DISABLED=1
unset ELARIS_COMPONENT_HEALTH_V03_REPORT

REPORT_COUNT="$(find "$ELARIS_COMPONENT_HEALTH_V03_ROOT" -type f -name "field-evidence-v03.json" 2>/dev/null | wc -l | tr -d ' ')"
if [[ "$REPORT_COUNT" -lt 1 ]]; then
  echo "ERROR: no private field-evidence-v03.json found under $ELARIS_COMPONENT_HEALTH_V03_ROOT" >&2
  exit 1
fi

echo "private_v03_reports=$REPORT_COUNT"

echo
echo "=== DATABASE MIGRATION ==="
pnpm exec prisma migrate deploy

echo
echo "=== PRISMA CLIENT ==="
pnpm exec prisma generate

echo
echo "=== TYPECHECK ==="
pnpm typecheck

echo
echo "=== COMPONENT HEALTH TESTS ==="
pnpm test:component-health

echo
echo "=== PRODUCTION BUILD ==="
pnpm build

echo
echo "=== PLAYWRIGHT AGAINST PREBUILT PRODUCTION ==="
export ELARIS_E2E_USE_PREBUILT=1
pnpm exec playwright test tests/e2e/component-health.spec.ts --reporter=line

echo
echo "=== FINAL GIT CHECK ==="
git status --short

echo
echo "COMPONENT HEALTH V0.4.1 RELEASE GATE: PASS"
echo "validated_commit=$(git rev-parse HEAD)"
echo "candidate_tag=component-health-v0.4.1-stable"
