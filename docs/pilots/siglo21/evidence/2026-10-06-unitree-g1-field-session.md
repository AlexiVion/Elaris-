# Siglo 21 — Registro de campo Unitree G1 — 2026-10-06

## Estado del registro

- Fecha de sesión: 2026-10-06.
- Host de campo: `elaris@elaris-unitree`.
- Workspace local: `/home/elaris/elaris-field`.
- Interfaz robot: `enp0s8`.
- Robot ID Elaris: `unitree-g1-siglo21-001`.
- Familia: Unitree G1.
- Transporte de captura: Unitree SDK2 / DDS.
- Canal de captura: `rt/lowstate`.
- Elaris Edge Collector: READ ONLY.
- Cloud upload durante captura: DISABLED.
- Raw audio/video: DISABLED.
- Clasificación de datasets: SENSITIVE.
- Export approval: NOT_APPROVED salvo cambio explícito posterior.
- Las passphrases y secretos quedan deliberadamente fuera de Git/GitHub.

Este documento registra evidencia operativa y ubicaciones locales. **No contiene el dataset bruto ni sustituye el manifest/checksums cifrados de cada capture session.**

---

## 1. Inventario de datasets / sesiones

### Dataset #001 — baseline real

| Campo | Valor |
|---|---|
| Logical dataset | Dataset #001 |
| Capture session | `CAP-20261006-C7A52F` |
| Local directory | `/home/elaris/elaris-field/captures/CAP-20261006-C7A52F` |
| Purpose | `component-health-baseline` |
| Requested capture | 60 s @ <= 20 Hz |
| State | FINALIZED |
| Classification | SENSITIVE |
| Export approval | NOT_APPROVED |
| Frames | 1,031 |
| Normalized events | 248,471 |
| Baseline analyzer | PASS |
| Mapped joint slots | 29 |
| Usable observed components | 28 |
| Unresolved motor slots | 1 |

Archivos esperados dentro de la capture session según el formato Elaris:

- `session.public.json`
- `manifest.enc.json`
- `raw.ndjson.enc`
- `telemetry.ndjson.enc`
- `checksums.sha256`
- `export-approval.enc.json` sólo si hubiera aprobación explícita.

Dataset #001 fue usado para validar el primer `Component Health — OBSERVED BASELINE`.

Hallazgos estructurales ya incorporados al código:

- `joint.acceleration / ddq` resultó `CONSTANT_ZERO` durante la sesión y se conserva como evidencia observada sin asumir que sea una medición físicamente informativa;
- slot OEM 28 / `Right wrist yaw` presentó señales físicas constantes en cero con state code no-cero y se clasifica como `OBSERVED_UNRESOLVED_SLOT`, no como componente activo/sano;
- no se genera diagnosis, health score, failure probability ni RUL.

### Capture abortada — NO CANÓNICA

| Campo | Valor |
|---|---|
| Capture session | `CAP-20261006-0D2999` |
| Local directory original | `/home/elaris/elaris-field/captures/CAP-20261006-0D2999` |
| Requested capture | 2700 s @ <= 20 Hz |
| Purpose | `component-health-full-field-sweep` |
| Disposition | ABORTED / DELETED LOCALLY |
| Reason | storage-risk correction before canonical sweep |

La sesión fue detenida tempranamente y eliminada con:

~~~bash
rm -rf captures/CAP-20261006-0D2999
~~~

No debe contarse como dataset canónico ni como evidencia finalizada.

### Dataset #002 — controlled sweep master

| Campo | Valor |
|---|---|
| Logical dataset | Dataset #002 master |
| Capture session | `CAP-20261006-3A6982` |
| Local directory | `/home/elaris/elaris-field/captures/CAP-20261006-3A6982` |
| Purpose | `component-health-controlled-sweep-v1` |
| Requested capture | 2400 s @ <= 12 Hz |
| State at salvage | OPEN (collector interrupted after robot power-off) |
| Disposition | SALVAGED PARTIAL CAPTURE / INTEGRITY VERIFIED |
| Classification | SENSITIVE |
| Export approval | NOT_APPROVED |
| Frames preserved | 15,000 |
| Normalized events preserved | 3,615,000 |
| Final local size | ~1.9 GiB |
| Robot power-off / connection loss marker | 2026-10-06T15:53:49+00:00 |
| Salvage timestamp | 2026-10-06T15:53:58+00:00 |
| Free disk after salvage | ~4.6 GiB |

Capture command:

~~~bash
pnpm edge capture-unitree \
  --interface enp0s8 \
  --robot-id unitree-g1-siglo21-001 \
  --purpose component-health-controlled-sweep-v1 \
  --duration 2400 \
  --hz 12
~~~

**Important:** the marker `DATASET-002 END` at 15:44:44 UTC was premature. The robot later powered off and the connection was lost at 15:53:49 UTC. The collector was interrupted manually and therefore never reached normal `Capture FINALIZED` state. Dataset #002 remains `OPEN` in `session.public.json`, but all files present at salvage time were flushed, hashed and verified successfully. The canonical physical-session end is the robot power-off marker at 15:53:49 UTC.

---

## 2. Marker file

The corrected phase markers were preserved at:

~~~text
/home/elaris/elaris-field/captures/component-health-field-markers-corrected-20261006-152241.tsv
~~~

A copy was also preserved in the Dataset #002 salvage metadata directory:

~~~text
/home/elaris/elaris-field/captures/CAP-20261006-3A6982-salvage-meta/operator-markers.tsv
~~~

Marker format:

~~~text
<ISO-8601 timestamp>\t<label>
~~~

### Raw marker chronology observed

~~~text
2026-10-06T15:22:41+00:00  DATASET-002 START controlled-sweep-v1
2026-10-06T15:22:41+00:00  PHASE IDLE_BASELINE START
2026-10-06T15:23:48+00:00  PHASE IDLE_BASELINE END
2026-10-06T15:23:48+00:00  PHASE WAIST_YAW START
2026-10-06T15:24:54+00:00  PHASE IDLE_BASELINE END
2026-10-06T15:24:54+00:00  PHASE WAIST_YAW START
2026-10-06T15:25:00+00:00  NOTE marker at 15:23:48 WAIST_YAW START was premature; robot remained idle
2026-10-06T15:25:00+00:00  PHASE WAIST_YAW START ACTUAL
2026-10-06T15:35:05+00:00  PHASE WAIST_YAW END
2026-10-06T15:35:05+00:00  PHASE LEFT_SHOULDER_ROLL START
2026-10-06T15:37:19+00:00  PHASE LEFT_SHOULDER_ROLL END
2026-10-06T15:37:19+00:00  PHASE LEFT_SHOULDER_PITCH START
2026-10-06T15:39:41+00:00  PHASE LEFT_SHOULDER_PITCH END
2026-10-06T15:39:41+00:00  PHASE LOCOMOTION_FORWARD_BACK START
2026-10-06T15:41:10+00:00  PHASE LOCOMOTION_FORWARD_BACK END
2026-10-06T15:41:11+00:00  PHASE TURNING START
2026-10-06T15:42:40+00:00  PHASE TURNING END
2026-10-06T15:42:41+00:00  PHASE MIXED_OPERATION START
2026-10-06T15:44:31+00:00  PHASE MIXED_OPERATION END
2026-10-06T15:44:31+00:00  PHASE RECOVERY_IDLE START
2026-10-06T15:44:44+00:00  PHASE RECOVERY_IDLE END
2026-10-06T15:44:44+00:00  DATASET-002 END controlled-sweep-v1
2026-10-06T15:53:49+00:00  ROBOT POWER OFF / CONNECTION LOST — UNPLANNED SESSION END
2026-10-06T15:53:49+00:00  DATASET-002 PHYSICAL SESSION END ACTUAL — ROBOT OFF
~~~

### Canonical interpretation for later segmentation

The duplicate early `IDLE_BASELINE END` / `WAIST_YAW START` markers are superseded by the explicit `WAIST_YAW START ACTUAL` marker.

| Logical phase | Canonical start | Canonical end | Notes |
|---|---|---|---|
| IDLE_BASELINE | 15:22:41 | 15:25:00 | early end/start markers superseded |
| WAIST_YAW | 15:25:00 | 15:35:05 | operator-marked actual start |
| LEFT_SHOULDER_ROLL | 15:35:05 | 15:37:19 | 8-cycle actuation probe recorded |
| LEFT_SHOULDER_PITCH | 15:37:19 | 15:39:41 | 8-cycle actuation probe recorded |
| LOCOMOTION_FORWARD_BACK | 15:39:41 | 15:41:10 | 6 forward/back cycles |
| TURNING | 15:41:11 | 15:42:40 | 8 left/right cycles |
| MIXED_OPERATION | 15:42:41 | 15:44:31 | 4 mixed cycles |
| RECOVERY_IDLE | 15:44:31 | 15:53:49 | 15:44:44 end marker is premature; physical session ended on robot power-off |

All timestamps above are UTC offsets as produced by `date -Is`.

---

## 3. Controlled actuation evidence captured during Dataset #002

### Boundary clarification

The **Elaris Edge Collector remained READ ONLY** throughout Dataset #002 and continued subscribing only to robot state.

Authorized movement was performed by separate Unitree SDK processes for controlled field testing. These actuation processes are not part of the Elaris read-only transport abstraction and must not be confused with the collector itself.

No new actuation capability is added to the product by this record.

### Left Shoulder Roll — OEM index 16

Invocation parameters:

~~~text
joint=16
amplitude=+0.15 rad
cycles=8
move=2.5 s
hold=1 s
rest=2 s
FSM expected=501
~~~

Observed execution summary:

~~~text
FSM: 501 code: 0
Stop locomotion code: 0
Origin: 0.2167 rad
Commanded target: 0.3667 rad
Observed target samples across 8 cycles: approximately 0.3113–0.3124 rad
Final: 0.2149 rad
Final error: -0.0019 rad
DONE
~~~

Interpretation boundary:

- proves repeatable response under this bounded test;
- does not prove full commanded target tracking;
- does not establish health status or OEM tolerance.

### Left Shoulder Pitch — OEM index 15

Invocation parameters:

~~~text
joint=15
amplitude=+0.12 rad
cycles=8
move=2.5 s
hold=1 s
rest=2 s
FSM expected=501
~~~

Observed execution summary:

~~~text
FSM: 501 code: 0
Stop locomotion code: 0
Origin: 0.2869 rad
Commanded target: 0.4069 rad
Observed target samples across 8 cycles: approximately 0.3566–0.3570 rad
Final: 0.2849 rad
Final error: -0.0020 rad
DONE
~~~

Interpretation boundary is the same as for Shoulder Roll.

### Waist Yaw — OEM index 12

Dataset #002 contains an operator-marked `WAIST_YAW` phase from 15:25:00 to 15:35:05 UTC.

The detailed execution stdout for this phase is not included in the current GitHub evidence record. Do not infer exact cycle count or extrema from the marker alone.

Earlier same-day bounded WaistYaw testing had already established responsive actuation, but this record keeps Dataset #002 facts separate from earlier tests.

---

## 4. Locomotion evidence during Dataset #002

All locomotion tests checked:

~~~text
FSM 501
GetFsmId code 0
~~~

and issued stop commands before/after bounded motion sequences.

### Forward / backward phase

Parameters:

~~~text
forward vx = +0.10
backward vx = -0.10
yaw = 0
command duration = 1.5 s
cycles = 6
~~~

Observed result:

- 6/6 forward calls returned code 0;
- 6/6 backward calls returned code 0;
- stop calls returned code 0;
- sequence ended with `DONE`.

### Turning phase

Parameters:

~~~text
vx = 0
vy = 0
left yaw = +0.15
right yaw = -0.15
command duration = 2.0 s
cycles = 8
~~~

Observed result:

- 8/8 left turn calls returned code 0;
- 8/8 right turn calls returned code 0;
- stop calls returned code 0;
- sequence ended with `DONE`.

### Mixed operation phase

Each mixed cycle attempted:

~~~text
forward  (+0.10, 0, 0)
turn     (0, 0, +0.15)
backward (-0.10, 0, 0)
turn     (0, 0, -0.15)
~~~

Observed:

- cycles 1–3: all recorded calls returned code 0;
- cycle 4 forward call returned **code 3104**;
- subsequent cycle-4 left turn, backward and right turn calls returned code 0;
- sequence ended with `DONE`.

**Code 3104 is recorded as an unresolved execution anomaly.**
No failure meaning, root cause or robot-health conclusion is assigned without OEM/API verification and corresponding state evidence.

---

## 5. Storage evidence

Before Dataset #002 canonical capture:

~~~text
Filesystem size: 14G
Used: 6.9G
Available: 6.4G
Use: 52%
Dataset #001 size: ~131M
~~~

Dataset #002 observed growth:

~~~text
15:35:05  ~1021M
15:37:19  ~1.2G
15:39:41  ~1.4G
15:41:10  ~1.5G
15:42:40  ~1.6G
15:44:31  ~1.8G
~~~

At 15:44:31:

~~~text
Available disk: ~4.7G
Filesystem use: ~65–66%
~~~

After robot power-off and salvage:

~~~text
Dataset #001: ~131M
Dataset #002: ~1.9G
Dataset #002 salvage metadata: ~28K
Available disk: ~4.6G
Filesystem use: ~66%
~~~

The capture was intentionally reduced from the aborted 45 min @ 20 Hz plan to 40 min @ 12 Hz to preserve local disk margin. The robot powered off before the requested collector duration elapsed.

---

## 6. Component Health software validation before Dataset #002

Branch:

~~~text
feat/component-health-real-baseline-v0
~~~

PR:

~~~text
AlexiVion/Elaris- PR #12
Add observed Component Health baseline analysis
~~~

Validated local head before Dataset #002:

~~~text
0ab377d fix: keep Component Health test cases at suite scope
~~~

Validation result:

~~~text
tests/component-health-baseline.test.ts
2 tests PASS

pnpm typecheck
PASS

Dataset #001 health-baseline
PASS
~~~

Dataset #001 analyzer result:

~~~text
Evidence class: OBSERVED
Assessment: BASELINE_ONLY
Frames: 1031
Normalized events: 248471
Mapped joint slots observed: 29
Usable observed components: 28
Unresolved motor slots: 1
~~~

---

## 7. Local custody map

The field machine is the authoritative custody location until an explicit export decision.

~~~text
/home/elaris/elaris-field/
├── captures/
│   ├── CAP-20261006-C7A52F/          # Dataset #001 — FINALIZED
│   ├── CAP-20261006-3A6982/          # Dataset #002 — OPEN, salvaged partial capture
│   ├── CAP-20261006-3A6982-salvage-meta/
│   │   ├── files.txt
│   │   ├── marker-source.txt
│   │   ├── operator-markers.tsv
│   │   ├── salvaged-at.txt
│   │   ├── session.public.snapshot.json
│   │   └── sha256.txt
│   ├── component-health-field-markers-corrected-20261006-152241.tsv
│   └── 2026-10-06-field-file-inventory.txt
├── apps/edge-collector/
├── lib/edge-collector/
├── lib/component-health/
└── .field-kit/vendor/unitree_sdk2_python/
~~~

Temporary local test helper used during the controlled actuation sweep:

~~~text
/tmp/elaris_component_probe.py
~~~

This temporary helper is **not** part of the canonical Elaris product runtime and is not treated as a supported product command.

---

## 8. Data that must NOT be committed while NOT_APPROVED

Do not commit/upload:

- `raw.ndjson.enc`;
- `telemetry.ndjson.enc`;
- decrypted telemetry;
- manifest contents containing sensitive operational detail beyond approved metadata;
- passphrases;
- credentials;
- local secrets;
- any derived report that institutional review classifies as sensitive.

GitHub stores only this non-secret evidence registry and product code until export is explicitly approved.

---

## 9. Dataset #002 salvage and integrity verification

The collector was interrupted after the robot powered off. Normal Elaris finalization did not occur; therefore no collector-generated `checksums.sha256` or `FINALIZED` state exists for Dataset #002.

The following files were present and preserved:

| File | Size at salvage |
|---|---:|
| `manifest.enc.json` | 1,360 bytes |
| `raw.ndjson.enc` | 91,110,071 bytes |
| `session.public.json` | 376 bytes |
| `telemetry.ndjson.enc` | 1,898,796,463 bytes |

The public session snapshot at salvage recorded:

~~~text
sessionId: CAP-20261006-3A6982
classification: SENSITIVE
state: OPEN
createdAt: 2026-10-06T15:22:33.535Z
frameCount: 15000
eventCount: 3615000
exportApproval: NOT_APPROVED
mode: READ_ONLY
crypto: AES-256-GCM / scrypt
~~~

A separate salvage hash registry was created at:

~~~text
/home/elaris/elaris-field/captures/CAP-20261006-3A6982-salvage-meta/sha256.txt
~~~

Recorded SHA-256 values:

~~~text
manifest.enc.json
6e22c846034c6e5c6bd17fe643c350ca49eb46a4f47c97c8e730edd4e3a3bf5c

raw.ndjson.enc
4e403b4b96f1d07212a911a15a6c3f034aa7666cb251dd2571a73f12fb5f05d2

session.public.json
db7bf92ade57571d43e8b3048ecbc4267955f6ca426f120de6d91a183e764719

telemetry.ndjson.enc
e9e14dcf01c18156c818a87a3c6225da152a92c0736219b115653680571eb3ba
~~~

Verification result after `sync`:

~~~text
manifest.enc.json: OK
raw.ndjson.enc: OK
session.public.json: OK
telemetry.ndjson.enc: OK
~~~

The local field-file inventory was also preserved at:

~~~text
/home/elaris/elaris-field/captures/2026-10-06-field-file-inventory.txt
~~~

Dataset #002 must therefore be described as:

> **salvaged partial capture with verified file integrity**

and not as `FINALIZED`.

---

## 10. Evidence semantics

Current truthful claim:

> Elaris preserved one finalized real encrypted Unitree G1 baseline and one integrity-verified salvaged multi-phase capture containing synchronized operator markers and 3,615,000 normalized events, sufficient for post-session per-component and per-phase descriptive analysis subject to the known interruption boundary.

Not yet supported:

- diagnosis;
- predictive maintenance;
- failure probability;
- remaining useful life;
- OEM safety-limit compliance;
- causal attribution of code 3104;
- treating Dataset #002 as normally FINALIZED;
- assuming telemetry continued after the robot power-off boundary.
