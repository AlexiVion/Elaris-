# 16 — Dry Run Record

## Purpose

Complete the operational sequence before relying on a university appointment.

The dry run uses synthetic replay and host checks. It must not pretend a robot was connected.

## Dry-run command

With a strong local test passphrase set in the shell:

~~~bash
cd ~/elaris-field
source .field-kit/env.sh
export ELARIS_EDGE_PASSPHRASE='<local-dry-run-secret>'
bash scripts/field-kit/run_field_session_dry_run.sh <active-multicast-interface>
~~~

The helper must:
1. run the Linux live-host preflight;
2. create a synthetic replay capture under `.field-kit/field-session-dry-run/`;
3. review the new capture;
4. confirm it remains NOT_APPROVED;
5. never call `inspect-unitree`;
6. never call `capture-unitree`;
7. never approve export.

## Record

- Date/time: __________________
- Operator: __________________
- Recorder: __________________
- Host/VM: __________________
- Interface used for host preflight: __________________
- Git commit: __________________

## Results

- Linux preflight: PASS / FAIL
- doctor: PASS / FAIL
- synthetic replay: PASS / FAIL
- synthetic CAP-ID: __________________
- finalize: PASS / FAIL
- local review/decrypt: PASS / FAIL
- classification SENSITIVE: YES / NO
- export NOT_APPROVED: YES / NO
- raw audio/video absent by design: YES / NO
- no live robot connection attempted: YES / NO

## Timing

- VM boot: __________________
- environment setup: __________________
- preflight: __________________
- replay capture: __________________
- review: __________________
- total operator time: __________________

## Friction / mistakes

1. __________________
2. __________________
3. __________________

## Changes required before field visit

- documentation: __________________
- scripts: __________________
- VM/network: __________________
- equipment: __________________
- training/rehearsal: __________________

## Final rehearsal gate

- [ ] Ready for a real authorized inspect session.
- [ ] Repeat dry run after fixes.

Signed:
- Alexi Vion: __________________
- Juan Martín Rossi: __________________
