# 11 — Local Data Review Record

Review only after capture has stopped/finalized.

## Capture

- CAP-ID: __________________
- Capture directory: __________________
- Reviewer(s): __________________
- Review time: __________________

## Command

~~~bash
pnpm edge review captures/<CAP-ID> --sample 5
~~~

## Required state

Record actual values:

- State: __________________
- Classification: __________________
- Export approval: __________________
- Purpose: __________________
- Robot ID: __________________
- Adapter: __________________
- Transport: __________________
- Frames: __________________
- Normalized events: __________________

Expected immediately after capture:

~~~text
State: FINALIZED
Classification: SENSITIVE
Export approval: NOT_APPROVED
~~~

## Scope review

From the decrypted sample:

- expected robot-state signals only: YES / NO
- wireless remote bytes absent: YES / NO / NOT DETERMINED
- camera/video absent: YES / NO
- microphone/audio absent: YES / NO
- command messages absent: YES / NO
- unrelated network data absent: YES / NO
- unexpected identifiers/data: __________________
- execution-context fields present: YES / NO
- if present, provenance credible: YES / NO / NEEDS REVIEW

## Data quality observations

- timestamps plausible: YES / NO
- motor values populated: __________________
- IMU populated: __________________
- temperatures populated: __________________
- torque populated: __________________
- obvious missing/constant fields: __________________
- sampling continuity concern: __________________

## Decision after local review

- [ ] Keep local / NOT_APPROVED.
- [ ] Request university/authorized export review.
- [ ] Quarantine pending scope/security review.
- [ ] Delete according to agreed policy.
- [ ] Other: __________________

**Do not infer export authorization from a successful technical review.**

Reviewer: __________________
