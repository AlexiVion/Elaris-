# 02 — Authorization & Scope Record

> Operational record only. This template does not replace any legal, institutional, ethics, cybersecurity or research authorization required by Universidad Siglo 21.

## Session

- Date/time: __________________
- Location: __________________
- Elaris Technical Operator: __________________
- Elaris Session Recorder: __________________
- University session owner/contact: __________________
- University robot operator: __________________

## Authorized asset

- Robot label / asset name: __________________
- Manufacturer: __________________
- Model / variant: __________________
- Serial / asset ID shareable with Elaris: __________________ / NOT SHAREABLE
- Approved physical/network connection method: __________________
- Approved interface/network segment: __________________

## Authorized activities

Mark explicitly:

- [ ] Connect Elaris Linux field host to approved robot/network interface.
- [ ] Run local no-robot/preflight checks.
- [ ] Subscribe read-only to Unitree SDK2/DDS state.
- [ ] Run `inspect-unitree` without writing robot data to disk.
- [ ] Capture a bounded robot-state baseline after separate Go decision.
- [ ] Review captured data locally with authorized personnel.
- [ ] Other: __________________

## Approved data categories

- [ ] joint position
- [ ] joint velocity
- [ ] joint acceleration if reported
- [ ] estimated torque
- [ ] motor temperature
- [ ] motor voltage
- [ ] motor state/status code
- [ ] IMU orientation
- [ ] IMU angular velocity
- [ ] system mode / tick
- [ ] other approved state: __________________

## Explicit exclusions

Unless separately authorized, the session excludes:

- command/control channels;
- `rt/lowcmd`;
- `rt/arm_sdk`;
- wireless-remote bytes;
- camera;
- microphone;
- audio/video;
- unrelated network traffic;
- credentials;
- unrelated personal data;
- automatic cloud upload.

Additional exclusions: __________________

## Capture limits

- Maximum authorized capture duration: __________________
- Maximum requested sampling rate: __________________
- Number of planned capture windows: __________________
- Approved operational state(s): __________________
- University controls all robot motion: YES / NO
- Capture may be stopped immediately by: __________________

## Data handling agreement for this session

- Local encrypted capture permitted: YES / NO
- Data classified SENSITIVE initially: YES / NO
- Automatic cloud transfer permitted: **NO**
- Export approval at end of session: NOT AUTOMATIC
- Required university review before export: __________________
- Retention/deletion condition if specified: __________________

## Authorization record

University contact confirms the above operational scope:

- Name: __________________
- Role: __________________
- Approval method/signature/reference: __________________
- Time: __________________

Elaris acknowledgement:

- Alexi Vion: __________________
- Juan Martín Rossi: __________________
