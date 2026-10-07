# Component Health V0.4.1 — Known Limitations

These limitations are accepted for the **internal stable** release and do not mean the release is broken.

## Evidence interpretation

### Right wrist yaw / OEM slot 28

The slot remains `UNRESOLVED`.

Observed all-zero physical channels and the OEM state value are not sufficient to determine whether this represents:

- an unsupported or non-applicable channel;
- an OEM mapping difference;
- an instrumentation condition;
- or a physical hardware condition.

The stable release keeps the slot unknown instead of creating a health/failure claim.

### OEM semantics

Some motor fields remain `OEM_SEMANTICS_UNCONFIRMED` or `OEM_ENUM_UNCONFIRMED`.

V0.4.1 does not use those fields to produce health diagnoses.

### Capture timing

Dataset #002 contains a human-declared phase end after the last observed telemetry frame.

The platform preserves declared and observed windows separately.

This is an evidence-quality/recovery condition, not a claim that the robot physically stopped operating at the last recorded frame.

### Duplicate timestamps

Duplicate signal timestamps can exist in source telemetry.

Coverage is based on unique timestamps so duplicates do not inflate coverage.

The exact upstream source behavior remains follow-up engineering work.

### Constant-zero signals

A constant zero is not automatically interpreted as:

- a true physical zero;
- a healthy value;
- an error;
- or an unavailable sensor.

It remains an evidence-quality/semantics question.

## Product limitations

V0.4.1 is:

- local;
- single-environment;
- artifact-backed;
- read-only with respect to evidence;
- writable only for review workflow state.

It does not yet provide:

- authenticated reviewer identity;
- organization isolation or multi-tenancy;
- external data approval workflow;
- client-facing export;
- complete OEM semantic registry;
- validated diagnostic rules;
- prognostics or remaining useful life;
- automated maintenance decisions.

## Release interpretation

These limitations block stronger external/product claims, **not** the internal stable release itself.

The release is considered stable because its supported workflow behaves reproducibly, fails closed on important evidence-integrity conditions, persists review workflow correctly, and labels unsupported conclusions explicitly.
