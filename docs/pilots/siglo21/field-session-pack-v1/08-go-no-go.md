# 08 — Human Go / No-Go Record

This gate separates **inspection** from **capture**.

No capture begins because a script says the host is ready. A human decision is required.

## Preconditions

- [ ] Authorization & Scope Record completed.
- [ ] Correct physical robot identified.
- [ ] Correct approved network/interface identified.
- [ ] Technical preflight passed.
- [ ] `inspect-unitree` completed.
- [ ] At least one real state frame received.
- [ ] No unexpected robot movement caused by Elaris.
- [ ] No command/control behavior observed.
- [ ] No out-of-scope data observed.
- [ ] Proposed capture data still matches approved categories.
- [ ] Proposed duration/rate remain inside approved limits.
- [ ] University operator remains in control of all robot motion.
- [ ] Stop authority is present.

## Proposed capture

- Robot ID: __________________
- Purpose: component-health-baseline / __________________
- Duration: __________________ seconds
- Sampling cap: __________________ Hz
- Operational condition: __________________
- Configuration ID if known: __________________ / unknown
- Local storage location: __________________
- Classification: SENSITIVE
- Initial export state: NOT_APPROVED

## Decision

- [ ] **GO** — bounded read-only capture may proceed.
- [ ] **NO-GO** — do not capture.
- [ ] **PAUSE** — issue must be resolved/re-authorized first.

Reason / conditions:

____________________________________________________________

## Human acknowledgement

University contact / authorized session owner:
- Name: __________________
- Decision/time: __________________

University robot operator:
- Name: __________________
- Ready to control/stop robot: YES / NO

Elaris:
- Alexi Vion: __________________
- Juan Martín Rossi: __________________

Technical Operator final confirmation:
- Command publisher added/enabled: **NO**
- Cloud upload enabled: **NO**
- Capture GO: YES / NO
