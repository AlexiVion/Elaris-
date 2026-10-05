# 12 — Export Authorization Record

Export approval is a separate decision from capture.

A technically valid capture remains **NOT_APPROVED** until this record/process is completed according to the agreed institutional rules.

## Capture

- CAP-ID: __________________
- Date: __________________
- Robot/session: __________________
- Local review completed: YES / NO
- Local reviewer: __________________

## Proposed export purpose

Describe exactly why data would leave the local capture boundary:

____________________________________________________________

## Proposed destination

- Elaris analysis environment / approved researcher / other: __________________
- Storage location: __________________
- Access limited to: __________________
- Intended retention period: __________________
- Further sharing allowed: YES / NO / CONDITIONS

## Data included

- raw encrypted frames: YES / NO
- normalized telemetry: YES / NO
- robot identifiers: YES / NO
- exact serial/asset ID: YES / NO
- execution context: YES / NO
- derived summaries only: YES / NO
- other: __________________

## Sanitization / restrictions

- identifiers removed/pseudonymized: __________________
- fields excluded: __________________
- publication restriction: __________________
- deletion date/condition: __________________

## Decision

- [ ] APPROVED for stated purpose.
- [ ] APPROVED WITH CONDITIONS.
- [ ] NOT APPROVED — keep local.
- [ ] DELETE / do not retain.
- [ ] PENDING further review.

Conditions / reason:

____________________________________________________________

## Authorized reviewer

- Name: __________________
- Role/authority: __________________
- Organization: __________________
- Decision reference/signature: __________________
- Time: __________________

## Local Elaris action

Only if approved according to the agreed process:

~~~bash
pnpm edge approve-export captures/<CAP-ID>   --reviewer '<authorized-reviewer>'   --reason '<approved-purpose>'
~~~

Record command result: __________________

This marks the local Elaris record. It does not itself upload or transmit anything.
