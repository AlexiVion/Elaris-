#!/usr/bin/env bash
# ELARIS Evidence Pack V0.1 — isolated, non-destructive local verification.
# This is a code-quality/build gate, NOT a real-client/insurance evidence gate.
# Never runs seed/reset against a pre-existing development database.
set -Eeuo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$repo_root"

if [[ ! -d prisma/migrations ]]; then
  echo "ERROR: prisma/migrations is missing" >&2
  exit 2
fi
if [[ ! -f examples/evidence-pack/synthetic-insurance-intake.json ]]; then
  echo "ERROR: Synthetic example input is missing" >&2
  exit 2
fi

# mktemp creates a UNIQUE DB path inside prisma/ so file:./ remains relative
# to schema.prisma. The path is not present in git; .gitignore ignores *.db.
tmp_db="$(mktemp "$repo_root/prisma/.evidence-pack-gate-XXXXXXXX.db")"
case "$tmp_db" in
  "$repo_root"/prisma/.evidence-pack-gate-*.db) ;;
  *) echo "ERROR: Unexpected gate DB path" >&2; exit 2 ;;
esac
export DATABASE_URL="file:./$(basename "$tmp_db")"
export NEXT_TELEMETRY_DISABLED=1
# Integration tests use the freshly seeded temporary DB, not prisma/dev.db.
export ELARIS_TEST_SEEDED_DB="$tmp_db"
export ELARIS_TEST_ACTIONS_DB_NAME="$(basename "${tmp_db%.db}-actions.db")"

cleanup() {
  status=$?
  trap - EXIT
  # Only these specifically generated, unique temp files are touched.
  rm -f -- "$tmp_db" "$tmp_db-journal" "$tmp_db-wal" "$tmp_db-shm"
  # Integration tests create a dedicated copy with the same unique prefix.
  for extra in "$repo_root/prisma/$ELARIS_TEST_ACTIONS_DB_NAME" "$repo_root/prisma/$ELARIS_TEST_ACTIONS_DB_NAME-journal" "$repo_root/prisma/$ELARIS_TEST_ACTIONS_DB_NAME-wal" "$repo_root/prisma/$ELARIS_TEST_ACTIONS_DB_NAME-shm"; do
    if [[ -f "$extra" ]]; then unlink -- "$extra"; fi
  done
  if (( status == 0 )); then
    echo "=== EVIDENCE PACK V0.1 FULL LOCAL GATE PASS ==="
  else
    echo "=== EVIDENCE PACK V0.1 FULL LOCAL GATE FAILED (exit $status) ===" >&2
  fi
  exit "$status"
}
trap cleanup EXIT

echo "=== DB ISOLATION: temporary SQLite ONLY ==="
echo "DB: $tmp_db (auto-cleanup on exit)"
echo "=== PRISMA CLIENT / MIGRATIONS ==="
pnpm exec prisma generate
pnpm exec prisma migrate deploy
pnpm exec prisma migrate status

echo "=== DEMO FIXTURE SEED (TEMP DB ONLY) ==="
pnpm db:seed

echo "=== EVIDENCE PACK COMPONENT TESTS ==="
node --test tests/evidence-pack/pack.test.mjs

echo "=== LINT / TYPECHECK ==="
pnpm lint
pnpm typecheck

echo "=== FULL VITEST SUITE ==="
pnpm test

echo "=== FULL NEXT.JS BUILD WITH INITIALIZED TEMP DB ==="
pnpm build
