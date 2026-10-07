# Backlog ejecutable Component Health — GitHub-first

**Estado:** `DRAFT`.
**Uso:** cada ID representa trabajo evaluable en un único PR preferentemente; si es demasiado grande, subdividir sin perder ID padre. Antes de implementarlo: registrar `APPROVED_FOR_IMPLEMENTATION` en [version-registry.md](version-registry.md) y definir responsable.

En el repo de Alexi la creación de GitHub Issues puede estar deshabilitada y en el repo de Juanma el usuario actual no tiene permiso de escritura. **Por eso este archivo es el backlog durable actual**. No inventar URLs de Issues. El día que se habiliten, migrar estos IDs a Issues mediante PR de reconciliación.

## Estados de tarea

`BACKLOG` → `SPEC_READY` → `APPROVED` → `IN_PROGRESS` → `CODE_READY` → `TESTED` → `MERGED` → `CLOSED`. Alternativas: `BLOCKED`, `DEFERRED`, `CANCELLED`.

El `owner` permanece `UNASSIGNED` hasta aceptación explícita.

## P0 — cierre de release / protección de datos

| ID | Entregable / criterio verificable | Depende | Estado |
|---|---|---|---|
| CH-021-01 | Ejecutar typecheck, tests Component Health y build sobre el head exacto del PR #15; adjuntar resultado | PR #15 | CODE_READY / TEST_PENDING |
| CH-021-02 | E2E Playwright real (Phase Explorer, componentes, synthetic redirects), navegador Chromium y captura | CH-021-01 | CODE_READY / TEST_PENDING |
| CH-021-03 | Rerun real con `--source-dir`, `--source-salvage-hashes`, `--derivative-hashes`; registrar nueva salida en storage SENSITIVE, sin Git | CH-021-01 y captures locales | CODE_READY / REAL_RUN_PENDING |
| CH-021-04 | Auditoría de bytes publicados en GitHub; decisión de titular sobre datos derivados ya expuestos; plan de remediación proporcional | data owner + socios | BLOCKED / HUMAN_APPROVAL |
| CH-021-05 | Checklist de revisión externa por destinatario, tipo de extracto, fin/uso, clasificación, firma y revocación | CH-021-04 | BACKLOG |
| CH-021-06 | Verificar que legacy synthetic routes no exponen datos ficticios; documentar URL de nueva demo y scope interno | CH-021-02 | TEST_PENDING |
| CH-021-07 | Sincronizar estado de versión y evidencia con resultado real, nunca elevar a `APPROVED` automáticamente | CH-021-01..06 | BACKLOG |

## P1 — V0.3 Evidence Engine reproducible (offline viable)

**Ejecución autorizada:** Alexi, 2026-10-07; PR #17 abierto en draft. `CODE_READY` significa código escrito, **no** typecheck/build/captura verificados. Las tareas de performance, equivalencia plaintext y semánticas OEM validadas siguen abiertas. Ver [V0.3 Evidence Engine](../../product/component-health/v0.3-evidence-engine.md) una vez que se integre PR #17.

| ID | Entregable / criterio verificable | Depende | Estado |
|---|---|---|---|
| CH-030-01 | Domain contract versionado Capture/WorkingCopy/AnalysisRun/Phase/Signal/Quality sin tabla UI | cierre V0.2.1 | TESTED / V0.3 PASS |
| CH-030-02 | Encadenar source hash→working copy hash→analysis run ID con test de alteración de cada archivo y separación `NOT_INDEPENDENTLY_VERIFIED` | CH-030-01 | TESTED / V0.3 PASS |
| CH-030-03 | Demostrar equivalencia plaintext fuente↔derivada por procedimiento local controlado, si las claves originales siguen disponibles/autorizadas; si no, declarar no comprobable | CH-030-02 y custodia | DRAFT / CONDITIONAL |
| CH-030-04 | Incorporar procedencia source/derivative del **baseline** en motor y report | CH-030-02 | TESTED / REAL LINEAGE PASS |
| CH-030-05 | Implementar `IDLE_BASELINE` intra-sesión como referencia primaria con comparabilidad explícita; dejar histórico Dataset #001 secundario | CH-030-01 | TESTED / SAME-SESSION IDLE PASS |
| CH-030-06 | Coverage por timestamps únicos; gaps, duplicados, phase [start,end), observedStart/End; golden tests de límites | CH-030-01 | TESTED / REAL DATA PASS |
| CH-030-07 | Validación de señales OEM, mapping por variante, unidades, códigos state y flags `UNCONFIRMED`; no diagnosis | metadata OEM aprobada | PARTIAL CODE_READY / OEM VALIDATION BLOCKED |
| CH-030-08 | Export estructurado de TODOS los slots y fases con valores medidos / null + quality reason, no solo top 6 | CH-030-05/07 | TESTED / REAL 8×29 PASS |
| CH-030-09 | Benchmark memoria/CPU Dataset #002; streaming y bounded memory cuando corresponda | CH-030-08 | BENCHMARK COMPLETE / ~514–521 MB RSS; bounded-memory DEFERRED |
| CH-030-10 | Versionado report schema y análisis determinista; rerun 2× + hashes de artefactos privados y diff razonado | CH-030-02..09 | TESTED / 2× DETERMINISM PASS |
| CH-030-11 | CLI reproducible con error states, inputs inmutables, fail-closed y documentación de un solo comando | CH-030-10 | TESTED / REAL CLI PASS |

## P1 — V0.4 Workbench (sólo después del motor)

**Ejecución autorizada:** Alexi, 2026-10-07; PR #18 draft. Primer slice: artifact-backed/read-only para validar el workflow antes de congelar tablas o mutaciones humanas.

| ID | Entregable / criterio verificable | Depende | Estado |
|---|---|---|---|
| CH-040-01 | Data dictionary y entidades persistentes mínimas, no duplicar `Robot/Config/Deployment` compartidos | CH-030-01 + caso real | DEFERRED UNTIL READ-ONLY WORKFLOW VALIDATION |
| CH-040-02 | Import local de report privado vía backend/autorizado con validación de schema/hash, sin exposición en bundle público | CH-030-10 | TESTED / REAL DATASET PASS |
| CH-040-03 | Vista Sessions: capture original/working copy, errores, salvage, phases, data quality | CH-040-02 | TESTED / REAL DATASET PASS |
| CH-040-04 | Vista Component 360 con señales *observadas* en todas las fases y estado de mapping | CH-040-02 | TESTED / REAL DATASET PASS |
| CH-040-05 | Phase Explorer con señal seleccionable, comparabilidad y 29×8 disponible, no solo top rows hardcoded | CH-040-02 | PARTIAL CODE_READY / TORQUE FIRST; SIGNAL SELECTOR PENDING |
| CH-040-06 | Quality Review: notas autor/fecha, missingness, unresolved, interpretación separada del dato | CH-040-03..05 | PARTIAL CODE_READY / QA GROUPING DONE; HUMAN NOTES PENDING |
| CH-040-07 | Historial de AnalysisRuns con versión, inputs, re-ejecución, error handling | CH-040-02 | CODE_READY / FILESYSTEM CATALOGUE; PERSISTENT RUN INDEX PENDING DECISION |
| CH-040-08 | Acceptance E2E: importar dataset de prueba → revisar componentes/fases → generar borrador | CH-040-03..07 | TESTED / E2E + REAL UI PASS |

## P1 — V0.5 entrega aprobada a tercero

| ID | Entregable / criterio verificable | Depende | Estado |
|---|---|---|---|
| CH-050-01 | Clasificación/custodia/dueños del dato por captura/derivado; default NOT_APPROVED | CH-021-04 | DRAFT |
| CH-050-02 | Human Review Gate con versiones/firmas y control de claims | CH-040-06 | DRAFT |
| CH-050-03 | Export mínimo y verificado, destinatario/plazo/finalidad, PDF/JSON opcionales y hash de entregable | CH-050-01..02 | DRAFT |
| CH-050-04 | Acceso protegido/expirable/revocable, auditoría de descargas; no URL pública por defecto | CH-050-03 | DRAFT |
| CH-050-05 | Report comercial: metodología, limitaciones, QA, fases, comparaciones y revisión técnica | CH-050-03 | DRAFT |
| CH-050-06 | Runbook de field audit con custodia, autorización, captura, QA, revisión, tiempos y costos | CH-040-08 | DRAFT |
| CH-050-07 | Piloto end-to-end con destinatario autorizado y aceptación del reporte | CH-050-01..06 | DRAFT |

## P2 — V0.6 a V1.0 (futura demanda real)

| ID | Resultado verificable | Trigger real | Estado |
|---|---|---|---|
| CH-060-01 | Capturar ≥2 sesiones comparables del mismo robot; conservar configs/modes/tasks | acceso y autorización | PROPOSED |
| CH-060-02 | Comparación A/B contextual con exclusión de pares no comparables | CH-060-01 | PROPOSED |
| CH-070-01 | Checklist automatizado y reintento salvage, job idempotente | ≥2 audits | PROPOSED |
| CH-070-02 | Costo/horas por auditoría y SLA medido; actualizar oferta | ≥2 audits | PROPOSED |
| CH-080-01 | Findings→Review→Decision con dueño humano y evidence refs | cliente muestra caso real | PROPOSED |
| CH-080-02 | Inspection/replacement outcome asociado a nueva config, no CMMS propio | CH-080-01 | PROPOSED |
| CH-090-01 | Auth/roles/tenancy y storage privado/audit logs | necesidad real multiorg | PROPOSED |
| CH-090-02 | Backup/restore, encryption/key governance, retención/expurgo según acuerdo | piloto externo | PROPOSED |
| CH-100-01 | Medir 10 entrevistas; ≥3 piden piloto, ≥1 paga (primer gate) | oferta validada | PROPOSED |
| CH-100-02 | Repetición del trabajo y margen/soporte; decidir GO/MODIFY/PAUSE/KILL | CH-100-01 | PROPOSED |

## P3 — largo plazo, NO APPROVED

| ID | Resultado potencial | Evidencia para habilitar | Estado |
|---|---|---|---|
| CH-150-01 | Segundo OEM/robot con tests reales por capacidades | segundo cliente/robot | VISION |
| CH-200-01 | Integración Versioned Component Evidence con Deployment Control | workflow compartido repetido | VISION |
| CH-200-02 | Engine de reglas OEM/ingeniería revisadas con outcomes | suficientes decisiones reales | VISION |
| CH-250-01 | Cohortes comparables y tendencias | muestras suficientes y consentidas | VISION |
| CH-300-01 | Evaluación de modelos sobre fallos reales: time split, calibration, falsas alarmas y revisión | eventos etiquetados + protocolo | RESEARCH_ONLY |

## Política de PRs

Cada PR debe incluir: `CH-ID`, problema real, dato de soporte, alcance/no-alcance, contratos afectados, riesgos, pruebas, procedimiento de rollback, reviewer, clasificaciones y aprobaciones. Para trabajos sobre señales derivadas de terceros, **no adjuntar raw/logs sensibles al PR público**.

**Criterio de completitud de una tarea:** outcome verificable demostrado, tests proporcionales, límites comunicados, decisiones humanas tomadas cuando corresponda y estatus del registro actualizado. «Implementado» no significa «released».
