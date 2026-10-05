# Elaris × NVIDIA Cosmos — Execution Backlog V0

**Estado general:** PLANNED  
**Fecha:** 2026-10-05  
**Gestión:** GitHub repository as source of truth  
**Spec:** `spec-v0.md`  
**Plan:** `implementation-plan-v0.md`

> Nota operativa: el repositorio fuente `AlexiVion/Elaris-` tiene Issues deshabilitados y la integración actual no tiene permiso para crear Issues en `Juanmarossi/Elaris-`. Hasta que Juanma habilite/cree los Issues canónicos, este archivo funciona como backlog ejecutable y versionado.

---

## Estados permitidos

- `BLOCKED`
- `READY`
- `IN_PROGRESS`
- `REVIEW`
- `VALIDATED`
- `DONE`
- `KILLED`

---

## Backlog

| ID | Fase | Estado | Dependencia | Branch sugerida |
|---|---|---|---|---|
| COSMOS-000 | Epic / programa | READY | — | — |
| COSMOS-001 | Dataset #001 Siglo 21 | BLOCKED | autorización / robot real | `field/siglo21-dataset-001` |
| COSMOS-002 | Scenario Domain Contract | REVIEW | spec | `feat/scenario-domain-v0` |
| COSMOS-003 | Runtime + WorldModelProvider | BLOCKED | hosted Cosmos API unavailable; self-hosted runtime required for live gate | `feat/world-model-provider-v0` |
| COSMOS-004 | Cosmos Reasoner V0 | BLOCKED | COSMOS-003 | `feat/cosmos-reasoner-v0` |
| COSMOS-005 | Scenario Evidence Pack V0 | BLOCKED | COSMOS-002 + COSMOS-004 | `feat/scenario-evidence-pack-v0` |
| COSMOS-006 | Cosmos Generator / Action experiment | BLOCKED | COSMOS-005 | `exp/cosmos-generator-v0` |
| COSMOS-007 | Isaac Sim bridge experiment | BLOCKED | COSMOS-002 | `exp/isaac-scenario-bridge-v0` |
| COSMOS-008 | Product System integration | BLOCKED | COSMOS-005 + decisions 006/007 | `feat/scenario-product-views-v0` |
| COSMOS-009 | Humandroid + insurance validation | BLOCKED | COSMOS-005/008 | no code branch required |
| COSMOS-010 | Productization decision | BLOCKED | COSMOS-009 | docs/decision only |

---

# COSMOS-000 — Epic / programa

## Objective

Ejecutar Elaris × NVIDIA Cosmos V0 y terminar con una decisión explícita:

- PRODUCTIZE
- SERVICE CAPABILITY
- MERGE INTO EXISTING PRODUCT
- KILL

## Done

- COSMOS-001..010 resueltos o explícitamente descartados;
- field + user evidence registrada;
- decisión final versionada.

---

# COSMOS-001 — Capture and approve Siglo 21 Dataset #001

**Estado:** BLOCKED  
**Bloqueador:** acceso autorizado al Unitree G1 real.

## Objective

Obtener el primer baseline real read-only usando Robot Adapter + Edge Collector + Field Kit.

## Deliverables

- field preflight;
- inspect-unitree;
- encrypted capture;
- manifest;
- checksums;
- normalization sample;
- session report;
- export approval.

## Acceptance criteria

- variante/DOF/channels observados donde sea posible;
- `rt/lowstate` real o fallo documentado;
- zero robot commands;
- no ChannelPublisher;
- data local/encrypted hasta aprobación;
- Dataset #001 aprobado para experimento o bloqueo explícito.

---

# COSMOS-002 — Scenario Domain Contract V0

**Estado:** REVIEW

## Objective

Crear dominio de scenarios independiente de NVIDIA.

## Deliverables

`lib/scenarios/`:

- types;
- schema;
- compiler;
- provenance;
- evidence-class;
- templates;
- hash.

## Tests

- deterministic hash;
- missing critical refs fail;
- observed/synthetic boundary;
- provenance roundtrip;
- golden scenario.

## Acceptance criteria

Funciona sin NVIDIA SDKs.

## Execution evidence — 2026-10-05

- Implementation head verificado: `87c61f056526adc7100c8386ef728d2af33b7b0c`.
- GitHub Actions verification run: `37343725674` sobre un commit temporal que difiere del implementation head únicamente por el trigger de CI.
- `pnpm db:reset` — PASS.
- `pnpm lint` — PASS.
- `pnpm typecheck` — PASS.
- `pnpm test` — PASS: 107/107 tests, 16/16 test files.
- `pnpm build` — PASS.
- `pnpm test:e2e` — PASS: 15/15 Playwright tests.
- El Scenario Domain no importa NVIDIA SDKs ni depende de un runtime Cosmos.
- El golden scenario sigue explícitamente clasificado como replay/synthetic + hypothesis; no constituye field validation.
- Dataset #001 continúa BLOCKED por acceso/autorización al Unitree G1 real.
- Warning no bloqueante observado en GitHub Actions: acciones basadas en Node.js 20 están siendo forzadas por el runner a Node.js 24.

---

# COSMOS-003 — Runtime + WorldModelProvider

**Estado:** BLOCKED
**Bloqueador:** el hosted NVIDIA API autentica y lista modelos, pero los Cosmos Reasoner probados no están actualmente invocables por API; el live inference gate requiere un runtime self-hosted/controlado o que NVIDIA reactive el servicio.

## Objective

Desacoplar Elaris de Cosmos y elegir runtime V0.

## Deliverables

`lib/world-models/`:

- provider contract;
- registry;
- mock;
- capabilities;
- health.

ADR:

`docs/architecture/adr-cosmos-runtime-v0.md`.

## Runtime comparison

- NVIDIA hosted;
- NIM;
- GPU cloud;
- local NIM;
- Cosmos Framework.

## Acceptance criteria

- non-sensitive smoke call;
- provider/model/runtime metadata visible;
- no secrets logged;
- fallback definido.

## Execution evidence — 2026-10-05

- Implementation head verificado: `48f3d204759497f623581a894de30cfefe16e26e`.
- GitHub Actions verification run: `37345320307` sobre branch temporal de verificación que agrega únicamente el trigger necesario para ejecutar CI.
- `pnpm db:reset` — PASS.
- `pnpm lint` — PASS.
- `pnpm typecheck` — PASS.
- `pnpm test` — PASS: **118/118 tests, 18/18 test files**.
- `pnpm build` — PASS.
- `pnpm test:e2e` — PASS: **15/15 Playwright tests**.
- `WorldModelProvider`, registry, mock provider, capability boundaries, provenance preservation, secret-like metadata rejection y external data boundary están cubiertos por tests.
- ADR de runtime creado en `docs/architecture/adr-cosmos-runtime-v0.md`.
- Runtime V0 seleccionado para spike: NVIDIA hosted `nvidia/cosmos3-nano-reasoner`, sólo con payload sintético/no sensible.
- Fallback definido: Cosmos3 Reasoner NIM en infraestructura GPU controlada para datos sensibles cuando exista aprobación.
- Credencial NVIDIA disponible para el operador fuera del repositorio; **no se almacena ni se registra en GitHub**.
- Hosted API preflight ejecutado por el operador desde Windows/PowerShell con una NVIDIA Build API key fuera del repositorio:
  - `GET https://integrate.api.nvidia.com/v1/models` — SUCCESS;
  - credencial válida para el hosted API;
  - `nvidia/cosmos3-nano-reasoner` — **NOT VISIBLE** para la cuenta/endpoint actual;
  - `nvidia/cosmos-reason2-8b` — visible en el catálogo devuelto;
  - no se envió field data ni información sensible.
- Segunda prueba hosted ejecutada con `nvidia/cosmos-reason2-8b`:
  - target visible en `GET /v1/models` — YES;
  - `POST /v1/chat/completions` — HTTP 404;
  - no se envió field data ni información sensible.
- NVIDIA Developer Forums documenta el mismo patrón para Cosmos Reason2 (modelo visible en `/v1/models` + 404 de inference) y un representante de NVIDIA informó que el API/video upload del modelo fue deshabilitado por razones de seguridad; el modelo queda utilizable vía web experience o self-hosted deployment.
- `nvidia/cosmos3-nano-reasoner` permanece publicado como Free Endpoint en Build, pero no aparece en el catálogo autenticado de esta cuenta y su invocación directa también devolvió 404. No se afirma la causa exacta de esa discrepancia.
- Conclusión operativa: hosted NVIDIA API **no satisface actualmente el live Cosmos inference gate** para Elaris. COSMOS-003 pasa a `BLOCKED` por dependencia externa/runtime.
- Próximo camino ejecutable: NIM/self-hosted OpenAI-compatible runtime en infraestructura GPU controlada cuando exista una opción de coste/infraestructura aceptada, o reintentar hosted sólo si NVIDIA reactiva/exhibe un Cosmos Reasoner invocable.
- Dataset #001 continúa separado y BLOCKED por acceso/autorización al Unitree G1 real; ningún fixture sintético se reclasifica como evidencia observada.

---

# COSMOS-004 — Cosmos Reasoner V0

**Estado:** BLOCKED por COSMOS-003

## Objective

ScenarioSpec → Cosmos Reasoner → ScenarioFinding.

## Acceptance criteria

- end-to-end request;
- result = INFERRED;
- source refs preserved;
- model/version recorded;
- timeout/auth/error paths tested;
- CI uses mocks and needs no live credentials.

---

# COSMOS-005 — Scenario Evidence Pack V0

**Estado:** BLOCKED

## Objective

Crear el primer deliverable trazable.

## Sections

1. Scope
2. System Snapshot
3. Configuration/Baseline
4. Observed Evidence
5. Scenario Matrix
6. Runs
7. Findings
8. Assumptions
9. Model Provenance
10. Evaluations
11. Open Questions
12. Limitations
13. Human Review

## Acceptance criteria

Observed / Simulated / Inferred son inequívocos.

---

# COSMOS-006 — Cosmos Generator / Action Experiment

**Estado:** BLOCKED

## Objective

Evaluar world generation y action modes sin asumir compatibilidad Unitree.

## Acceptance criteria

- domain/action contract comprobado antes de mapping;
- unsupported G1 action path fails closed;
- seed/version/hashes registrados;
- outputs SIMULATED;
- decisión KEEP / MODIFY / DO NOT USE.

---

# COSMOS-007 — Isaac Sim Bridge Experiment

**Estado:** BLOCKED

## Objective

Materializar un ScenarioSpec como escenario físico.

## Acceptance criteria

- robot/joints/config mapeados;
- missing geometry/config explícito;
- ScenarioSpec hash preservado;
- output SIMULATED;
- decisión KEEP / MODIFY / DO NOT USE.

---

# COSMOS-008 — Product System Integration

**Estado:** BLOCKED

## Candidate surfaces

### Deployment Control
Scenario Retest Suggestions.

### Component Health
Component Scenario Review.

### Placement / Risk Record
Physical AI Scenario Stress Test.

### Incident Reconstruction
Counterfactual Scenario Set.

## Acceptance criteria

Cada integración tiene:

- actor;
- decisión;
- evidence boundary;
- human authority;
- no unsupported claim.

---

# COSMOS-009 — Humandroid + insurance validation

**Estado:** BLOCKED

## Humandroid

Mostrar:

- real baseline cuando exista;
- 3–5 scenario preview;
- provenance;
- limitations.

Capturar:

- useful/noise;
- missing scenarios;
- changed decision;
- owner;
- willingness to pay.

## Risk / insurance actor

Mostrar el mismo technical truth como Scenario Stress Test.

## Acceptance criteria

Real review documentada o bloqueo explícito.

---

# COSMOS-010 — Productization decision

**Estado:** BLOCKED

## Inputs

- field evidence;
- repeated workflow;
- actor feedback;
- willingness to pay;
- runtime cost;
- trust/provenance;
- Generator decision;
- Isaac decision.

## Output

Uno de:

- PRODUCTIZE;
- KEEP AS SERVICE;
- MERGE INTO PRODUCT;
- KILL.

No continuar por inercia.

---

# Operating procedure

Al empezar un ticket:

1. cambiar estado a `IN_PROGRESS`;
2. crear branch sugerida;
3. registrar decisiones importantes en el mismo ticket/backlog o ADR;
4. implementar;
5. ejecutar verification;
6. abrir PR;
7. pasar a `REVIEW`;
8. merge;
9. adjuntar evidencia/commit/PR;
10. pasar a `DONE` o `VALIDATED`.

Cuando Issues estén disponibles en el repositorio canónico, crear un Issue por cada `COSMOS-00X` usando esta sección como body y reemplazar este backlog por links a los Issues sin perder el historial.
