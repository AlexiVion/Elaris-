# Field Session Pack V1 — Siglo 21 / Unitree G1

## Status

**READY FOR DRY RUN · READY FOR INSTITUTIONAL REVIEW · LIVE ROBOT EXECUTION PENDING AUTHORIZATION**

This pack is the operating system for Elaris' first authorized physical robot session at Universidad Siglo 21.

It is designed so that Alexi Vion and Juan Martín Rossi can arrive with a complete, auditable procedure rather than improvise around a live robot.

## Primary outcome

A successful first session should produce:

**Dataset #001 + corrected robot/configuration facts + an auditable record of what was authorized, observed, captured and reviewed.**

Dataset #001 means one short, encrypted, read-only normal-operation capture. It does not mean predictive maintenance has been validated.

## Hard boundary

Elaris V0 is read-only.

The session must not:
- publish robot commands;
- publish to `rt/lowcmd`;
- publish to `rt/arm_sdk`;
- operate locomotion, arms or hands;
- alter robot configuration;
- collect camera/audio;
- inspect unrelated network traffic;
- upload capture data automatically.

Robot movement, if any, remains under the university operator.

## Pack contents

1. [Session Brief](01-session-brief.md)
2. [Authorization & Scope](02-authorization-scope.md)
3. [Robot Identification](03-robot-identification.md)
4. [Equipment Checklist](04-equipment-checklist.md)
5. [Technical Preflight](05-technical-preflight.md)
6. [Command Sheet](06-command-sheet.md)
7. [Inspect Record](07-inspect-record.md)
8. [Go / No-Go](08-go-no-go.md)
9. [Capture Record](09-capture-record.md)
10. [Stop Conditions](10-stop-conditions.md)
11. [Local Data Review](11-local-data-review.md)
12. [Export Authorization](12-export-authorization.md)
13. [Field Notes](13-field-notes.md)
14. [Post-Session Report](14-post-session-report.md)
15. [Component Health Validation](15-component-health-validation.md)
16. [Dry Run Record](16-dry-run-record.md)

Operational helper:
- `scripts/field-kit/run_field_session_dry_run.sh`

## Session flow

~~~text
Institutional authorization
        ↓
Session scope recorded
        ↓
Robot identified
        ↓
Equipment check
        ↓
Linux field-host preflight
        ↓
inspect-unitree
        ↓
Inspect Record
        ↓
Human Go / No-Go
        ↓
short encrypted capture
        ↓
capture finalization
        ↓
local review
        ↓
export remains NOT_APPROVED
        ↓
separate export decision
        ↓
post-session + product validation report
~~~

## Roles

### Elaris
- **Alexi Vion**
- **Juan Martín Rossi**

One person should be named **Technical Operator** for the command execution.
The other should act as **Session Recorder / Observer** whenever possible.

### Universidad Siglo 21
Before the session, identify:
- session owner/contact;
- robot operator;
- person authorized to approve or stop the data-acquisition activity;
- any institutional data/security reviewer required by the university.

## Data handling

GitHub may contain:
- blank templates;
- sanitized session metadata;
- sanitized findings;
- protocol updates;
- post-session conclusions.

GitHub must not contain:
- real raw telemetry;
- encrypted capture artifacts;
- passphrases;
- credentials;
- university secrets;
- restricted identifiers not approved for publication.

Real capture data remains local encrypted storage until an explicit export decision.

## Definition of done

The pack is successfully executed when:

- authorization/scope is recorded;
- exact robot facts are improved;
- preflight passes on the actual robot-facing host/interface;
- `inspect-unitree` receives a real state frame without issuing a command;
- a human explicitly approves or declines capture;
- if approved, one bounded encrypted capture finalizes successfully;
- local review confirms expected scope;
- export remains NOT_APPROVED unless separately authorized;
- unknowns and deviations are documented;
- Component Health implications are recorded without overclaiming.

## Related documents

- `../field-runbook-v0.md`
- `../field-kit-v0.md`
- `../edge-capture-protocol-v0.md`
- `../robotics-integration-v0-record.md`
- `../../../architecture/robot-adapter-v0.md`
- `../../../architecture/edge-collector-v0.md`
