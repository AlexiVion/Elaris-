# Elaris × NVIDIA Cosmos — Plan completo de implementación V0

**Estado:** READY FOR EXECUTION  
**Fecha:** 2026-10-05  
**Gestión:** GitHub only  
**Especificación:** `docs/integrations/nvidia-cosmos/spec-v0.md`

---

## 1. Objetivo del plan

Convertir la especificación Elaris × NVIDIA Cosmos en un programa de ejecución cerrado.

Después de esta planificación, el trabajo debe reducirse a:

~~~text
issue
→ branch
→ implementation
→ tests
→ evidence
→ PR
→ review
→ merge
→ issue closed
~~~

No usar Notion, ClickUp ni documentación paralela para este track.

GitHub será:

- roadmap;
- backlog;
- execution log;
- evidence log;
- review surface;
- source of truth.

---

## 2. Principios de ejecución

1. No implementar antes del gate correspondiente.
2. No mezclar real y synthetic evidence.
3. No agregar control capability al robot.
4. No agregar shared persistent schema solo por conveniencia de demo.
5. Cada fase termina con tests y evidencia.
6. Cada PR debe poder revertirse sin romper el core.
7. Cosmos se integra detrás de una provider abstraction.
8. Isaac es opcional y se agrega solo donde la física lo justifica.
9. Dataset #001 es prerequisito de validación real, no de scaffolding.
10. No afirmar failure probability / RUL sin datos que lo soporten.

---

# 3. Roadmap general

~~~text
P0 — Planning & Governance
        ↓
P1 — Dataset #001 / Real Input Gate
        ↓
P2 — Scenario Domain Contract
        ↓
P3 — Runtime & Provider Spike
        ↓
P4 — Cosmos Reasoner V0
        ↓
P5 — Scenario Evidence Pack V0
        ↓
P6 — Cosmos Generator / Action Experiment
        ↓
P7 — Isaac Sim Bridge Experiment
        ↓
P8 — Product System Integration
        ↓
P9 — Field + Commercial Validation
        ↓
P10 — Productization Decision
~~~

P6 y P7 pueden ejecutarse parcialmente en paralelo después de P5 si los resultados justifican ambos.

---

# 4. P0 — Planning & Governance

## Objetivo

Cerrar arquitectura, boundaries, roadmap y gestión antes de escribir runtime code.

## Entregables

- `spec-v0.md`;
- este implementation plan;
- Epic GitHub;
- Issues por fase;
- Definition of Done;
- naming inicial;
- decision log.

## Gate de salida

- [ ] documentación mergeada en canonical repo;
- [ ] Issues creados;
- [ ] owners definidos;
- [ ] no existe código Cosmos implementado accidentalmente antes del plan.

## Definition of Done

P0 termina cuando Juanma y Alexi pueden entrar a GitHub y entender:

- qué se va a construir;
- qué no;
- en qué orden;
- cómo se valida;
- qué dependencia bloquea cada fase.

---

# 5. P1 — Dataset #001 / Real Input Gate

## Objetivo

Obtener el primer baseline real del Unitree G1 de Siglo 21 usando la infraestructura ya creada.

## No forma parte

No implementar Cosmos en esta fase.

## Secuencia

~~~text
authorization
→ connect approved network
→ Linux field preflight
→ inspect-unitree
→ human go/no-go
→ short read-only capture
→ finalize
→ local review
→ export remains NOT_APPROVED
→ explicit approval
→ sanitized approved Dataset #001
~~~

## Verificar

- exact G1/G1 EDU variant;
- active DOF;
- hand/end-effector configuration;
- firmware/software observable;
- network interface;
- DDS;
- `rt/lowstate`;
- component mapping;
- timestamps;
- capture integrity.

## Tests/evidence

- field preflight output;
- capture manifest;
- checksums;
- normalization sample;
- command count = 0;
- no ChannelPublisher;
- export approval record;
- field session report.

## Gate de salida

**Dataset #001 approved for scenario experimentation.**

Si no se puede obtener:

- registrar por qué;
- usar replay para engineering;
- marcar toda evaluación como SYNTHETIC;
- no venderla como validación real.

---

# 6. P2 — Scenario Domain Contract

## Objetivo

Crear la capa de dominio Elaris que describe escenarios sin depender de Cosmos.

## Implementación propuesta

Nueva carpeta:

~~~text
lib/scenarios/
├── types.ts
├── schema.ts
├── compiler.ts
├── provenance.ts
├── evidence-class.ts
├── templates.ts
└── hash.ts
~~~

Tests:

~~~text
tests/scenarios/
├── schema.test.ts
├── compiler.test.ts
├── provenance.test.ts
└── golden-scenario.test.ts
~~~

## Tipos mínimos

- ScenarioSpec
- ScenarioRun
- ScenarioArtifact
- ScenarioFinding
- ScenarioEvaluation
- EvidenceClass
- ScenarioCapability

## Scenario Compiler V0

Debe aceptar refs del core Elaris y producir un ScenarioSpec.

Input:

~~~text
robot
configuration
baseline
deployment
task
environment
observed evidence
assumptions
disturbance/failure hypothesis
~~~

Output:

~~~text
canonical ScenarioSpec
+ canonical hash
+ provenance refs
~~~

## Golden Scenario

Primera fixture:

~~~text
Robot: Unitree G1
Component: left knee
Task: representative deployment task
Observed evidence: Dataset #001 or replay equivalent
Hypothesis: reduced actuator performance
Disturbance: task/environment variation
~~~

Antes de Dataset #001 debe estar claramente etiquetada como synthetic fixture.

## Tests obligatorios

- same input → same scenario hash;
- missing critical refs → explicit failure;
- OBSERVED cannot be created from unapproved synthetic input;
- HYPOTHESIS stays hypothesis;
- no model output can mutate observed evidence;
- serialization roundtrip;
- source refs preserved.

## Gate

El Scenario Domain debe funcionar sin instalar NVIDIA SDKs.

---

# 7. P3 — Runtime & Provider Spike

## Objetivo

Decidir cómo Elaris llamará Cosmos realmente.

## Tarea 1 — Provider contract

Crear:

~~~text
lib/world-models/
├── types.ts
├── provider.ts
├── mock-provider.ts
└── registry.ts
~~~

Contrato:

~~~text
capabilities()
health()
reason()
generate()
forwardDynamics?()
inverseDynamics?()
policy?()
~~~

## Tarea 2 — Runtime evaluation

Comparar:

- hosted NVIDIA endpoint disponible;
- Cosmos 3 NIM;
- GPU cloud con NIM;
- local NIM;
- Cosmos Framework.

Registrar:

- auth;
- GPU requirement;
- latency;
- cost;
- data handling;
- API stability;
- supported capabilities;
- model/version observability.

## Regla

No elegir runtime por comodidad.

Elegir por:

1. seguridad de datos;
2. capability necesaria;
3. coste;
4. reproducibilidad;
5. setup operativo.

## Spike técnico mínimo

Ejecutar una request no sensible contra Reasoner.

Registrar:

- health;
- model;
- response;
- request/response format;
- runtime metadata.

## Gate

Architecture Decision Record:

`docs/architecture/adr-cosmos-runtime-v0.md`

con una opción elegida para V0 y fallback.

---

# 8. P4 — Cosmos Reasoner V0

## Objetivo

Integrar la primera capacidad Cosmos útil de bajo acoplamiento.

## Por qué Reasoner primero

Reasoner permite:

- world/situation understanding;
- physical reasoning;
- temporal reasoning;
- action interpretation;

sin exigir todavía un full simulation stack.

## Implementación

~~~text
lib/world-models/cosmos/
├── cosmos-provider.ts
├── reasoner-client.ts
├── mapper.ts
├── runtime-metadata.ts
└── errors.ts
~~~

## Input V0

ScenarioSpec + opcionalmente imagen/video autorizado.

## Output

ScenarioFinding[] con:

- raw model output ref;
- normalized finding;
- input evidence refs;
- limitations;
- evidenceClass = INFERRED;
- provider/model/version.

## Seguridad

Nunca permitir que el Reasoner output cambie:

- observed evidence;
- baseline;
- configuration truth.

## Tests

- mocked provider contract;
- timeout;
- auth failure;
- malformed response;
- model metadata missing;
- evidence-class enforcement;
- source hashes preserved;
- retry policy;
- no secrets logged.

## Integration test

1 canonical ScenarioSpec
→ Cosmos Reasoner
→ normalized ScenarioRun
→ persisted/local artifact
→ human review surface.

## Gate

Una ejecución Reasoner reproducible y auditable.

---

# 9. P5 — Scenario Evidence Pack V0

## Objetivo

Transformar scenario work en un deliverable real.

## Implementación

Primero generar desde filesystem/structured artifacts.

No introducir DB nueva si no es necesaria.

Propuesta:

~~~text
lib/scenario-reports/
├── build-pack.ts
├── sections.ts
└── validation.ts
~~~

Salida inicial:

- JSON canonical;
- printable HTML/report;
- optional PDF later.

## Secciones

1. Scope
2. System Snapshot
3. Configuration/Baseline
4. Observed Evidence
5. Scenario Matrix
6. Scenario Runs
7. Findings
8. Assumptions
9. Model Provenance
10. Evaluations
11. Open Questions
12. Limitations
13. Human Review

## Guardrails de copy

Nunca escribir automáticamente:

- safe;
- certified;
- compliant;
- probable failure X%;
- insurer should accept;
- legal cause.

## Preview commercial

Support:

- 3–5 scenario preview;
- full pack separate.

## Tests

- no unsupported claims;
- every finding has provenance;
- every simulated result is labeled;
- pack can reconstruct model and input refs;
- deterministic ordering;
- missing data surfaced, not hidden.

## Gate

Un reviewer puede distinguir inequívocamente:

**qué pasó realmente vs qué fue simulado/inferido.**

---

# 10. P6 — Cosmos Generator / Action Experiment

## Objetivo

Determinar dónde world generation/action modeling agrega valor real.

No productizar todavía.

## Subfase A — Text/Image/Video generation

Casos:

- environment variation;
- task variation;
- human/obstacle variation;
- long-tail scenario visualization.

## Subfase B — Action capabilities

Evaluar:

- forward dynamics;
- inverse dynamics;
- policy.

## Gate crítico

Antes de usar action mode con G1:

- verificar model/domain compatible;
- documentar action dimensions;
- documentar mapping;
- no inventar un mapping de 29 DOF si el model contract no lo soporta.

Si no existe domain compatible:

**STOP.**

Usar Isaac/otros workflows en vez de fingir compatibilidad.

## Tests

- deterministic metadata capture;
- seed stored;
- input/output hashes;
- generated media stored as SIMULATED;
- unsupported action mode fails closed.

## Gate

Lista explícita:

- KEEP;
- MODIFY;
- DO NOT USE.

---

# 11. P7 — Isaac Sim Bridge Experiment

## Objetivo

Probar si el ScenarioSpec Elaris puede materializarse como un escenario físico controlable.

## Scope V0

Un solo robot y una sola task.

## Trabajo

- obtener/validar Unitree-compatible model asset;
- mapear configuration;
- mapear relevant joints/components;
- crear environment mínimo;
- parametrizar disturbance;
- ejecutar simulation;
- devolver artifact/evidence a Elaris.

## Contrato propuesto

~~~text
PhysicsSimulationProvider
├── materializeScenario()
├── run()
├── collectArtifacts()
└── metadata()
~~~

Primera implementación:

`IsaacSimulationProvider`.

## Importante

No hacer a Cosmos dependiente de Isaac ni viceversa.

Elaris orquesta ambos mediante interfaces.

## Tests

- scenario → physics config mapping;
- known joints preserved;
- missing geometry fails explicitly;
- output refs preserve ScenarioSpec hash;
- physics output labeled SIMULATED.

## Gate

Un scenario Elaris puede:

~~~text
materialize → run → produce trace → return to Elaris
~~~

sin alterar observed truth.

---

# 12. P8 — Product System Integration

## Objetivo

Exponer scenario evidence en los productos donde realmente agrega valor.

No crear nuevos productos por default.

## Deployment Control

Agregar concepto:

**Scenario Retest Suggestions**

Origen:

- Change Impact;
- Scenario templates;
- prior runs.

Debe seguir siendo review humano.

## Component Health

Agregar:

**Component Scenario Review**

Mostrar:

- observed signal;
- historical context;
- selected scenarios;
- simulated implications;
- technician decision.

No failure prediction claim.

## Placement / Risk Record

Agregar:

**Physical AI Scenario Stress Test**

Vinculado a:

- technical truth;
- scenario matrix;
- findings;
- limitations.

## Incident Reconstruction

Agregar:

**Counterfactual Scenario Set**

Separar:

- reconstruction facts;
- hypothesis;
- counterfactual simulation.

## Gate

No integrar una vista si un usuario real no entiende qué decisión mejora.

---

# 13. P9 — Field + Commercial Validation

## Objetivo

Validar valor, no solo funcionamiento técnico.

## Humandroid

Mostrar primero:

- Dataset #001;
- Component Health baseline;
- 3–5 scenario preview;
- provenance;
- one actionable review question.

Preguntas:

- ¿esto mejora una decisión real?
- ¿qué scenario falta?
- ¿qué está de más?
- ¿qué harían distinto?
- ¿pagarían por el análisis completo?
- ¿quién es owner/buyer?

## Broker / Risk Advisor

Mostrar:

- same technical truth;
- Scenario Stress Test preview;
- no insurance recommendation.

Preguntas:

- ¿esto mejora una submission?
- ¿qué información es útil?
- ¿qué resultado es ruido?
- ¿qué preguntaría un underwriter?
- ¿pagarían por preparar/actualizar este pack?

## Success evidence

- real workflow changed;
- repeat request;
- real case supplied;
- willingness to pay;
- paid engagement;
- same scenario evidence reused across 2+ actors.

---

# 14. P10 — Productization Decision

## Decisiones posibles

### A. Productize

Si existe:

- repeated workflow;
- reusable scenario schema;
- repeated buyer;
- useful outputs;
- sustainable runtime cost.

### B. Keep as service capability

Si agrega mucho valor pero requiere trabajo experto por caso.

### C. Merge into existing Product System

Ejemplo:

- Component Health feature;
- Deployment Control analysis;
- Risk Record deliverable.

### D. Kill

Si:

- no cambia decisiones;
- output no es confiable;
- cost demasiado alto;
- OEM/Isaac ya resuelve el workflow;
- provenance no compensa la complejidad.

---

# 15. Estrategia de branches y PRs

No hacer un mega-PR.

Una branch por issue.

Naming:

~~~text
feat/scenario-domain-v0
feat/world-model-provider-v0
feat/cosmos-reasoner-v0
feat/scenario-evidence-pack-v0
exp/cosmos-generator-v0
exp/isaac-scenario-bridge-v0
feat/component-scenario-review-v0
feat/risk-scenario-stress-test-v0
~~~

Docs:

~~~text
docs/cosmos-*
docs/scenario-*
~~~

Fixes:

~~~text
fix/cosmos-*
fix/scenario-*
~~~

---

# 16. PR template específica del track

Cada PR debe incluir:

## Goal

Qué capability exacta agrega.

## Source issue

`Closes #...`

## Scope

Qué está incluido.

## Explicit non-goals

Qué no está incluido.

## Evidence class impact

Qué nuevos tipos de observed/simulated/inferred artifacts aparecen.

## Safety boundary

Confirmar:

- no robot control;
- no command publisher;
- no silent data upload.

## Verification

Comandos ejecutados y resultados.

## Artifacts

Paths/hashes/screenshots/logs relevantes.

## Limitations

Qué sigue sin estar demostrado.

---

# 17. Test strategy global

## Unit

- schema;
- normalization;
- compiler;
- hashing;
- provenance;
- classification.

## Contract

- WorldModelProvider;
- CosmosProvider;
- PhysicsSimulationProvider.

## Integration

- ScenarioSpec → provider → ScenarioRun;
- ScenarioRun → Evidence Pack;
- real/replay data → scenario.

## Security

- secrets not logged;
- SENSITIVE data policy;
- export approval required;
- command channels remain blocked.

## Regression

El track Cosmos no puede romper:

- Deployment Control;
- Robot Adapter;
- Edge Collector;
- Component Health demo;
- existing E2E.

## E2E

Al menos un flow:

~~~text
baseline
→ scenario
→ provider
→ finding
→ evidence pack
→ product view
~~~

---

# 18. CI gates

Cada implementation PR debe pasar:

~~~text
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
~~~

Más suites específicas del track.

Si Cosmos/Isaac real no puede ejecutarse en GitHub CI:

- usar provider mocks en CI;
- guardar integration test real como manual/authorized verification;
- registrar run evidence en issue/PR;
- nunca marcar un capability como validado solo por mock.

---

# 19. GitHub operating model

## Canonical repo

`Juanmarossi/Elaris-`

## Source-of-truth objects

### Markdown

Arquitectura estable, specs, ADRs, runbooks.

### Issues

Trabajo ejecutable.

### Pull Requests

Cambios + verification evidence.

### Comments

Logs de ejecución relevantes y decisiones de campo.

### Git history

Registro técnico final.

## Issue status

Usar labels si existen:

- `status:blocked`
- `status:ready`
- `status:in-progress`
- `status:review`
- `status:validated`
- `type:architecture`
- `type:experiment`
- `type:feature`
- `area:cosmos`
- `area:robotics`
- `area:component-health`
- `area:insurance`

Si no existen labels, no bloquear ejecución por crearlos.

## Issue body mínimo

- Objective
- Why now
- Inputs
- Deliverables
- Non-goals
- Dependencies
- Acceptance criteria
- Verification
- Evidence
- Follow-ups

---

# 20. Dependency graph

~~~text
P0
│
└── P1 Dataset #001
    │
    ├── P2 Scenario Domain
    │   │
    │   └── P3 Provider Runtime
    │       │
    │       └── P4 Reasoner
    │           │
    │           └── P5 Evidence Pack
    │               │
    │               ├── P6 Generator/Action
    │               └── P7 Isaac
    │                   │
    │                   └── P8 Product Views
    │                       │
    │                       └── P9 Market Validation
    │                           │
    │                           └── P10 Decision
~~~

Engineering P2/P3 puede avanzar con replay antes de P1, pero ninguna conclusión de field validation puede declararse hasta Dataset #001.

---

# 21. First execution sequence

Cuando se autorice empezar:

### Sprint 1

1. cerrar Dataset #001 logistics;
2. crear Scenario domain;
3. crear provider abstraction;
4. mock provider;
5. golden scenario;
6. CI green.

### Sprint 2

1. runtime spike;
2. ADR;
3. Cosmos Reasoner client;
4. one end-to-end run;
5. provenance;
6. human review.

### Sprint 3

1. Evidence Pack;
2. 10–20 scenario matrix;
3. Humandroid preview;
4. record feedback.

### Sprint 4

Elegir según feedback:

- Generator;
- Isaac;
- Component Health;
- Risk/Placement;
- incident workflow.

No ejecutar Sprint 4 por inercia.

---

# 22. Definition of Done — Cosmos Integration V0

V0 termina cuando:

- [ ] Dataset #001 existe o se documenta explícitamente la imposibilidad;
- [ ] Scenario Domain está implementado;
- [ ] provider abstraction está implementada;
- [ ] CosmosProvider funciona con un runtime decidido;
- [ ] Reasoner end-to-end funciona;
- [ ] provenance/model version/input hashes quedan registrados;
- [ ] observed/simulated/inferred están separados;
- [ ] 10–20 scenarios estructurados fueron evaluados;
- [ ] Scenario Evidence Pack existe;
- [ ] al menos un Humandroid reviewer lo revisó;
- [ ] al menos un actor insurance/risk lo revisó o se documentó por qué aún no;
- [ ] ninguna capability de robot control fue agregada;
- [ ] test suite completa sigue verde;
- [ ] existe decisión KEEP / MODIFY / KILL para Generator;
- [ ] existe decisión KEEP / MODIFY / KILL para Isaac;
- [ ] existe decisión PRODUCT / SERVICE / FEATURE / KILL para el workflow.

---

# 23. Regla final

No medir éxito por cantidad de integración construida.

Medirlo por:

> **¿Elaris puede tomar un sistema real, conservar su verdad técnica, explorar escenarios con modelos externos y devolver evidencia trazable que mejore una decisión real?**

Si la respuesta es sí, profundizar.

Si no, simplificar.
