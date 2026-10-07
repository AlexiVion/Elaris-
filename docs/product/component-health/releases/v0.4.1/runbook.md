# Component Health V0.4.1 — Internal Stable Runbook

## 1. Start from a clean machine/session

From Windows PowerShell:

```powershell
wsl --cd /mnt/c/Users/alexi/Documents/Elaris-field-evidence-v0
```

Inside Ubuntu, if the release branch does not exist locally yet:

```bash
cd /mnt/c/Users/alexi/Documents/Elaris-field-evidence-v0
git fetch alexi release/component-health-v0.4.1
git switch -c release/component-health-v0.4.1 \
  --track alexi/release/component-health-v0.4.1
```

If it already exists:

```bash
git switch release/component-health-v0.4.1
git fetch alexi release/component-health-v0.4.1
git merge --ff-only alexi/release/component-health-v0.4.1
```

## 2. Private evidence

V0.4.1 does not put raw evidence inside Git.

Configure the private catalogue:

```bash
export ELARIS_COMPONENT_HEALTH_V03_ROOT="$HOME/elaris-private"
unset ELARIS_COMPONENT_HEALTH_V03_REPORT
unset ELARIS_COMPONENT_HEALTH_ACTIVE_ANALYSIS_ID
export NEXT_TELEMETRY_DISABLED=1
```

Check only filenames/locations, not secret contents:

```bash
find "$ELARIS_COMPONENT_HEALTH_V03_ROOT" \
  -type f \
  -name "field-evidence-v03.json" \
  -print
```

## 3. Database upgrade

Apply forward migrations. **Do not reset the DB.**

```bash
pnpm exec prisma migrate deploy
pnpm exec prisma generate
```

The V0.4.1 migration creates the local persisted review workflow.

## 4. Run the product

```bash
node ./node_modules/next/dist/bin/next \
  dev \
  --hostname 127.0.0.1 \
  --port 3005
```

Open:

```text
http://localhost:3005/platform/component-health
```

Main surfaces:

- `/platform/component-health/sessions`
- `/platform/component-health/components`
- `/platform/component-health/phases`
- `/platform/component-health/quality`
- `/platform/component-health/review`
- `/platform/component-health/reports/draft`

This release is intended to run on loopback.

## 5. Review workflow

The operator is **not** expected to diagnose the robot.

The Review page answers:

- what evidence is available;
- what evidence limitations remain;
- what follow-up action is recommended;
- what review state and notes have been persisted.

Allowed review states:

```text
AWAITING_TECHNICAL_REVIEW
IN_REVIEW
REVIEWED_FOR_COMPLETENESS
BLOCKED
```

Allowed item dispositions:

```text
OPEN
ACKNOWLEDGED
NEEDS_FOLLOWUP
DATA_LIMITATION
```

`REVIEWED_FOR_COMPLETENESS` is not a health, safety, certification, RTS or data-release approval.

## 6. Stable release verification

Run exactly:

```bash
bash scripts/component-health/release-check-v041.sh
```

Expected high-level result:

```text
Prisma migration        PASS
Prisma generate         PASS
TypeScript              PASS
Component Health tests  PASS
Production build        PASS
Playwright              PASS
RELEASE GATE            PASS
```

## 7. Stop

For a dev server running in the foreground:

```text
Ctrl+C
```

## 8. Data boundary

Never:

- commit `$HOME/elaris-private`;
- commit passphrases or keys;
- copy raw field telemetry into the repository;
- present QA findings as component failures;
- distribute Dataset #002 externally while export remains `NOT_APPROVED`.
