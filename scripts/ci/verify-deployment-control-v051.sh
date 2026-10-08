#!/usr/bin/env bash
# Deployment Control V0.5.1 — non-destructive local verification.
# Uses only prisma/v051-gate.db, previously migrated and seeded by the
# dedicated gate setup. Does not reset / overwrite prisma/dev.db.
set -Eeuo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$repo_root"

if [[ ! -s prisma/v051-gate.db ]]; then
  echo "ERROR: Missing temporary gate DB at prisma/v051-gate.db." >&2
  echo "Create/migrate/seed it with the V0.5.1 setup before running verification." >&2
  exit 2
fi

export DATABASE_URL="file:./v051-gate.db"
export ELARIS_TEST_SEEDED_DB="prisma/v051-gate.db"
export NEXT_TELEMETRY_DISABLED=1
export ELARIS_E2E_USE_PREBUILT=1
export ELARIS_E2E_PORT="${ELARIS_E2E_PORT:-3127}"

trap 'status=$?; echo "DC V0.5.1 GATE FAILED (exit $status)"; exit "$status"' ERR

echo "=== PRISMA CLIENT ==="
pnpm exec prisma generate

echo "=== MIGRATION STATUS ==="
pnpm exec prisma migrate status

echo "=== LINT ==="
pnpm lint

echo "=== TYPECHECK ==="
pnpm typecheck

echo "=== DEPLOYMENT CONTROL TESTS ==="
pnpm test:deployment-control

echo "=== FULL TEST SUITE ==="
pnpm test

echo "=== PRODUCTION BUILD ==="
pnpm build

echo "=== PLATFORM E2E: fresh port ${ELARIS_E2E_PORT} / prebuilt / 2 workers ==="
pnpm exec playwright test tests/e2e/platform.spec.ts --workers=2

echo "=== DC V0.5.1 GATE PASS ==="
echo "Verified against temporary DB: $repo_root/prisma/v051-gate.db"
