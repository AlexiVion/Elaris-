# 06 — Field Command Sheet

Use this as the concise operational sequence. Replace placeholders deliberately.

## 0. Enter repository

~~~bash
cd ~/elaris-field
source .field-kit/env.sh
~~~

Confirm branch/commit:

~~~bash
git status
git rev-parse --short HEAD
~~~

## 1. Identify interfaces

~~~bash
ip -brief link
ip -brief addr
~~~

Choose only the university-approved robot-facing interface.

~~~bash
export ELARIS_FIELD_IFACE='<iface>'
~~~

## 2. No-robot field preflight

~~~bash
bash scripts/field-kit/preflight_live_linux.sh "$ELARIS_FIELD_IFACE"
~~~

Do not continue if required checks fail.

## 3. Inspect only

This connects to the authorized SDK2/DDS state path, waits for a state frame and does not write robot data to disk.

~~~bash
pnpm edge inspect-unitree   --interface "$ELARIS_FIELD_IFACE"   --hz 20
~~~

Expected ending:

~~~text
No robot command was sent. No data was written to disk.
~~~

Complete:
- `07-inspect-record.md`
- `08-go-no-go.md`

## 4. STOP unless explicit capture GO

Do not set the real capture passphrase or start capture until the human Go / No-Go record is complete.

## 5. Prepare local capture

Set the passphrase interactively in the shell; do not place the secret in this file or GitHub.

~~~bash
read -s -p "Elaris capture passphrase: " ELARIS_EDGE_PASSPHRASE
echo
export ELARIS_EDGE_PASSPHRASE
~~~

Set approved identifiers:

~~~bash
export ELARIS_ROBOT_ID='<approved-id>'
export ELARIS_CONFIGURATION_ID='<config-id-if-known>'
~~~

If configuration ID is not established, omit the `--configuration` flag rather than inventing one.

## 6A. Capture with known configuration ID

~~~bash
pnpm edge capture-unitree   --interface "$ELARIS_FIELD_IFACE"   --robot-id "$ELARIS_ROBOT_ID"   --purpose component-health-baseline   --duration 60   --hz 20   --configuration "$ELARIS_CONFIGURATION_ID"
~~~

## 6B. Capture without configuration ID

~~~bash
pnpm edge capture-unitree   --interface "$ELARIS_FIELD_IFACE"   --robot-id "$ELARIS_ROBOT_ID"   --purpose component-health-baseline   --duration 60   --hz 20
~~~

Expected ending:

~~~text
Capture FINALIZED.
Frames: ...
Normalized events: ...
Export approval: NOT_APPROVED
~~~

Copy the capture directory / CAP-ID into `09-capture-record.md`.

## 7. Local review

~~~bash
pnpm edge review captures/<CAP-ID> --sample 5
~~~

Verify:

~~~text
State: FINALIZED
Classification: SENSITIVE
Export approval: NOT_APPROVED
Collection policy:
  READ ONLY
  cloud upload disabled during capture
  raw audio/video disabled
~~~

Complete `11-local-data-review.md`.

## 8. Export decision

**Do not run approval automatically.**

Only if the agreed review/authorization process explicitly approves export:

~~~bash
pnpm edge approve-export captures/<CAP-ID>   --reviewer '<authorized-reviewer>'   --reason '<approved-purpose>'
~~~

This command marks the local record approved. It still does not transmit or upload the data.

## 9. End of session

Clear passphrase from the shell environment:

~~~bash
unset ELARIS_EDGE_PASSPHRASE
~~~

Do not commit `captures/` or `.field-kit/`.
