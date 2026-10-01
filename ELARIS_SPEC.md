# Elaris — Especificación de construcción para Claude Code

> **MVP: Elaris Deployment & Change Evidence.** Prototipo funcional, single-tenant, con datos de demostración, para validar con un integrador y mostrar a inversores. Lo opera una sola persona, corre local y no depende de servicios pagos.

---

## 0. Cómo quiero que trabajes

1. Leé este archivo completo y mirá las cuatro imágenes de `design/` antes de escribir código.
2. Tu primera respuesta es un **plan, no código**: estructura de carpetas, `schema.prisma` propuesto, lista de rutas, cómo vas a testear el motor de impacto y tus dudas de dominio. Esperá mi aprobación.
3. Trabajá por las fases de la sección 12. Al cerrar cada fase: `pnpm lint`, `pnpm typecheck` y `pnpm test`; commit con mensaje claro; resumen de 5 líneas con qué quedó y qué falta.
4. No avances de fase con tests rotos.
5. Si una regla de dominio es ambigua, preguntame. No agregues funcionalidades fuera del alcance (sección 2).
6. Creá un `CLAUDE.md` en la raíz con: comandos, arquitectura, reglas de vocabulario (1.3), dónde vive la lógica central y el escenario de oro (9.3). Mantenelo actualizado.
7. Las imágenes son referencia visual y de información. **Los números que aparecen en ellas no se copian:** todo indicador se calcula desde los datos.

---

## 1. Qué es Elaris

Elaris conecta la configuración real de un sistema de Physical AI con la evidencia y las aprobaciones que autorizan su deployment, y mantiene esa relación válida cuando el sistema cambia.

Responde dos preguntas:

1. ¿Qué sistema estaba desplegado, para qué tarea, bajo qué configuración y con qué evidencia y aprobaciones?
2. Si algo cambia, ¿qué pruebas, documentos o aprobaciones quedan afectados y quién debe revisarlos?

### 1.1 Principios de producto

- **Capa encima, no reemplazo.** Elaris no es PLM, ni fleet management, ni observability. No hay telemetría, batería ni estado online/offline.
- **Referencia, no copia.** La evidencia se guarda como metadatos + enlace (URI) + hash SHA-256 opcional. El documento vive en el sistema del cliente.
- **Determinístico.** Impacto, readiness y coverage son funciones puras basadas en reglas y testeadas. Nada de LLM en esos cálculos.
- **Elaris no aprueba ni certifica.** Las aprobaciones las registran personas con nombre y rol. Elaris sólo señala qué requiere revisión.
- **Nada se borra.** Todo cambio queda en un log de auditoría append-only; los registros se archivan, no se eliminan.

### 1.2 Usuarios del MVP

| Persona | Qué hace |
| --- | --- |
| Ingeniero del integrador | Carga configuración y evidencia, registra cambios, resuelve ítems |
| Safety Lead | Revisa ítems de impacto y aprueba cambios |
| Ingeniero del cliente | Aprueba requisitos del cliente |
| Actor externo | Ve un reporte por link de solo lectura (cliente, safety, aseguradora) |

### 1.3 Vocabulario obligatorio

| Usar | Nunca usar |
| --- | --- |
| Ready, Review required, Missing, Not requested, Pending, In review | Compliant, Certified, Safe |
| Approved by \<nombre\>, \<rol\>, \<fecha\> | Approved by Elaris |
| Evidence coverage | Compliance % |
| Readiness | Compliance score, risk score |

La interfaz va en inglés, como el diseño. Dejá los textos centralizados en un solo módulo para poder traducir después.

---

## 2. Alcance

### Dentro del MVP

- Robots y su configuración por *slots*.
- Snapshots de configuración versionados con hash.
- Deployments con cliente, sitio, tarea, entorno, modo de operación y exposición humana.
- Baselines congelados e inmutables.
- Evidencia y requisitos con alcance (*scope*) declarado y criticidad.
- Aprobaciones de personas.
- Cambios con diff Before/After y motor de impacto.
- Readiness y evidence coverage calculados.
- Incidentes simples, registrados a mano y ligados al baseline vigente.
- Reportes imprimibles: System Passport, Deployment Readiness Pack, Change Impact Report.
- Share View: link de solo lectura con token, expiración y revocación.
- Log de auditoría.
- Selector "Viewing as" con personas semilla (sin autenticación real).

### Fuera del MVP (no construir; dejar puntos de extensión)

- Assistant con IA: el ítem del menú aparece deshabilitado con el texto "Coming soon".
- Módulo Insurance Readiness completo. Sólo existen la categoría Insurance en readiness y el tipo de evidencia `INSURANCE_APPENDIX`.
- Agente de snapshot en el robot (ROS 2) e integraciones con Git, Drive o plataformas de flota.
- Telemetría, batería, online/offline, mantenimiento operativo, analytics.
- Multi-tenant, SSO, facturación.
- Risk score, pricing, datos para aseguradoras.

---

## 3. Diseño de referencia

| Archivo | Pantalla | Uso |
| --- | --- | --- |
| `design/01-home.jpg` | Home | Replicar layout y widgets |
| `design/02-deployment-overview.jpg` | Deployment Overview | Replicar |
| `design/03-change-impact.jpg` | Change Impact | Replicar. Es la pantalla más importante del producto |
| `design/04-concepto-anterior.jpg` | Concepto anterior | Sólo inspiración para Robot profile e Incident detail. Ignorar batería, Online/Offline, "Compliance %", "87% compliant" e Insurance Readiness |

### 3.1 Sistema visual

- Sidebar azul marino oscuro (aprox. `#131C2B`), texto claro, ítem activo resaltado.
- Contenido sobre gris muy claro (aprox. `#F5F7FA`), tarjetas blancas con borde de 1px (aprox. `#E5E7EB`), radio 12px, sombras mínimas.
- Primario azul (aprox. `#2563EB`) sólo para la acción principal de cada pantalla.
- Tipografía Inter. Título de página 28–32px semibold; título de tarjeta 16–18px semibold; cuerpo 14px.
- Íconos: lucide-react.
- Pills de estado **siempre con texto** (el color nunca va solo):
  - verde: Ready, Approved, Live, Resolved
  - ámbar: Review required, Pending, Medium
  - rojo: Missing, High
  - azul: In review, Limited, Investigating
  - gris: Not started, Not requested, Low, Closed, Test
- Contraste AA, navegación por teclado, foco visible.
- Banner discreto "Demo data" mientras la base sea la semilla.

### 3.2 Correcciones al diseño que tenés que aplicar

- Los datos de las imágenes no son coherentes entre sí (versiones de firmware, años 2025 y 2026, conteos de impacto). La única fuente de verdad es la semilla de la sección 9.
- En Change Impact, los contadores salen del cálculo. En el escenario de oro son 3 evidencias, 3 requisitos, 2 aprobaciones y 1 deployment.
- Coverage siempre calculado con redondeo estándar ("12 of 18" es 67%, no 68%).
- Escribir "Unitree" correctamente.
- No usar empresas reales como clientes en la demo. Usar los clientes ficticios de la sección 9.

---

## 4. Stack

- Next.js (App Router, última versión estable) + TypeScript en modo strict.
- Tailwind CSS + shadcn/ui + lucide-react; fuente Inter.
- Prisma + SQLite en archivo local. El modelo tiene que poder migrar a Postgres sin cambios.
- Zod para validar toda entrada; Server Actions para mutaciones.
- Vitest para la lógica de dominio; Playwright para 2–3 smoke tests en la última fase.
- pnpm y Node LTS.
- Reportes: rutas HTML con estilos de impresión (`@media print`, A4) para exportar a PDF desde el navegador, más export JSON.
- Sin servicios externos obligatorios: todo corre con `pnpm dev`.

### Estructura sugerida

```
app/                  rutas: (dashboard), deployments, changes, robots, evidence,
                      requirements, incidents, reports, share/[token]
components/ui/        shadcn
components/elaris/    StatusPill, KpiCard, ReadinessBar, ReadinessDonut,
                      SnapshotTable, BeforeAfterPanel, ImpactTable, AuditTimeline
lib/domain/           tipos y enums
lib/engine/           hash.ts, diff.ts, rules.ts, impact.ts, readiness.ts,
                      coverage.ts  (funciones puras, sin acceso a base)
lib/db/               consultas Prisma
lib/copy/             textos de la UI
prisma/               schema.prisma, seed.ts
tests/                engine/*.test.ts, e2e/*.spec.ts
design/               imágenes de referencia
```

Scripts: `dev`, `build`, `lint`, `typecheck`, `test`, `test:e2e`, `db:reset` (migra y siembra), `db:seed`.

---

## 5. Modelo de datos

Ids internos `cuid` + códigos legibles para humanos (C004, DEP-0017, INT-042).

**Organization** — `name`. Una sola en el MVP: Humandroid.

**Person** — `name`, `email`, `role` (`ENGINEER | SAFETY_LEAD | CUSTOMER_ENGINEER | VIEWER`), `organizationName`.

**Customer** — `name`, `country`.

**Site** — `customerId`, `name`, `city`, `country`, `environmentType` (`INDOOR_INDUSTRIAL | GAS_FACILITY | WAREHOUSE | PUBLIC_SPACE | LAB`).

**Robot** — `code` ("G1 #017"), `model` ("Unitree G1"), `serialNumber`, `status` (`ACTIVE | INACTIVE`).

**Slot** (enum) — `CHASSIS, HANDS, FIRMWARE, CONTROL_STACK, SKILL, AI_MODEL, NETWORK_PROFILE, TASK_PARAMETERS, SAFETY_ZONE, OPERATING_LIMITS`.

**ConfigurationSnapshot** — `code` ("C004"), `robotId`, `parentSnapshotId?`, `hash`, `createdAt`, `createdById`, `note`.

**ConfigItem** — `snapshotId`, `slot`, `value`, `vendor?`, `version?`.

**Task** — `name`, `description`, `parameters` (JSON).

**Deployment** — `code`, `name`, `customerId`, `siteId`, robots (muchos a muchos), `taskId`, `lifecycle` (`TEST | PILOT | LIMITED | PRODUCTION`), `operationalState` (`PLANNED | LIVE | PAUSED | ENDED`), `operatingMode` (`SUPERVISED | AUTONOMOUS_ZONED | TELEOPERATED`), `humanExposure` (`NONE | SEPARATED | SHARED_AREA`), `description`, `activeBaselineId?`.

**Baseline** — `code`, `deploymentId`, `snapshotId`, `taskSnapshot` (JSON), `environmentSnapshot` (JSON), `evidenceState` (JSON congelado: ids + estados), `approvalState` (JSON congelado), `hash`, `frozenAt`, `frozenById`. Inmutable.

**EvidenceItem** — `code`, `title`, `category` (`EVIDENCE | REQUIREMENT`), `kind`, `readinessCategory`, `source` (`INTERNAL | CUSTOMER | REGULATION | INSURER`), `deploymentId`, `scopeSlots` (Slot[]), `criticality` (`HIGH | MEDIUM | LOW`), `status`, `required` (bool), `applicable` (bool), `ownerPersonId`, `uri?`, `fileSha256?`, `dueDate?`, `updatedAt`, `archivedAt?`.

- `kind`: `TEST, CALIBRATION, RISK_ASSESSMENT, TECHNICAL_DOSSIER, INSURANCE_APPENDIX, OPERATING_LIMIT, CERTIFICATE, PROCEDURE, MAINTENANCE_PLAN, OTHER`.
- `readinessCategory`: `SYSTEM_IDENTITY, CONFIGURATION, SAFETY_EVIDENCE, CUSTOMER_REQUIREMENTS, INSURANCE, MAINTENANCE`.
- `status`: `VALID, REVIEW_REQUIRED, IN_REVIEW, PENDING, MISSING, NOT_STARTED`.

**Approval** — `title`, `deploymentId`, `readinessCategory`, `approverPersonId`, `role`, `scopeSlots`, `status` (`APPROVED | PENDING | REQUIRED | NOT_STARTED | REVOKED`), `decidedAt?`, `baselineId?`, `justification?`. Una aprobación afectada por un cambio no se modifica: se crea una nueva en `REQUIRED` y la anterior queda en el historial.

**Change** — `code` ("CHG-0005"), `deploymentId`, `robotId`, `beforeSnapshotId`, `afterSnapshotId`, `diff` (JSON), `authorId`, `createdAt`, `status` (`DRAFT | REVIEW_REQUIRED | APPROVED | REJECTED`), `approvedById?`, `approvedAt?`.

**ImpactItem** — `changeId`, `targetType` (`EVIDENCE | REQUIREMENT | APPROVAL | CHECK`), `targetId?`, `title`, `reason`, `suggestedAction` (`RE_RUN | REVIEW | UPDATE | CONFIRM | RE_APPROVE`), `severity` (`HIGH | MEDIUM | LOW`), `status` (`PENDING | IN_REVIEW | RESOLVED | WAIVED`), `assigneeId?`, `resolutionNote?`, `resolvedById?`, `resolvedAt?`, `newEvidenceId?`.

**Incident** — `code`, `occurredAt`, `deploymentId`, `robotId`, `description`, `severity`, `status` (`OPEN | INVESTIGATING | CLOSED`), `baselineIdAtTime`, `snapshotIdAtTime` (se completan solos con lo vigente en ese momento), `timeline` (JSON manual).

**ShareLink** — `tokenHash`, `view` (`SYSTEM_PASSPORT | READINESS_PACK | CHANGE_IMPACT`), `targetId`, `audienceLabel`, `createdById`, `expiresAt`, `revokedAt?`.

**AuditEvent** — `at`, `actorId`, `action`, `entityType`, `entityId`, `before` (JSON), `after` (JSON). Append-only.

---

## 6. Lógica central (`lib/engine/`, funciones puras)

### 6.1 Hash de snapshot

SHA-256 del JSON canónico de los ConfigItems (claves ordenadas, ítems ordenados por slot). Mismos ítems → mismo hash; cambiar un valor → otro hash. El baseline también tiene hash, calculado sobre su contenido congelado.

### 6.2 Diff

`diff(before, after)` → lista de `{ slot, before, after, type: ADDED | REMOVED | CHANGED }`. Los slots iguales no aparecen.

### 6.3 Motor de impacto

Entrada: diff + evidencia y requisitos aplicables del deployment + aprobaciones + `humanExposure`. Salida: `ImpactItem[]`.

1. `changedSlots` = slots del diff.
2. Por cada EvidenceItem aplicable y no archivado con `scopeSlots ∩ changedSlots ≠ ∅`: un ImpactItem con acción según la tabla, severidad = `criticality` del ítem, razón según plantilla.
3. Por cada Approval `APPROVED` con `scopeSlots ∩ changedSlots ≠ ∅`: un ImpactItem `RE_APPROVE`, severidad HIGH si el rol es `SAFETY_LEAD` y MEDIUM si es `CUSTOMER_ENGINEER`.
4. Reglas globales (ítems `CHECK`):
   - Cambia `FIRMWARE`, `CONTROL_STACK` o `NETWORK_PROFILE` → "Confirm no cyber impact", LOW.
   - Cambia `HANDS`, `OPERATING_LIMITS` o `SAFETY_ZONE` y `humanExposure = SHARED_AREA` → todo `RISK_ASSESSMENT` afectado sube a HIGH.
5. Orden: severidad (HIGH → LOW) y luego código.

| Kind | Acción sugerida |
| --- | --- |
| TEST | Re-run |
| CALIBRATION | Re-run |
| RISK_ASSESSMENT | Review |
| TECHNICAL_DOSSIER | Update |
| INSURANCE_APPENDIX | Review |
| OPERATING_LIMIT | Confirm |
| CERTIFICATE | Review |
| PROCEDURE | Update |
| MAINTENANCE_PLAN | Review |
| OTHER | Review |

Plantillas de razón por `(kind, slot)`, en `rules.ts`. Ejemplos: `(TEST, HANDS)` → "Hand interface changed"; `(RISK_ASSESSMENT, HANDS)` → "New hand requires safety assessment update"; `(TECHNICAL_DOSSIER, HANDS)` → "Hardware change affects technical specification"; `(INSURANCE_APPENDIX, HANDS)` → "Hardware change may affect insurance terms"; `(CALIBRATION, HANDS)` → "New hand requires calibration record"; `(OPERATING_LIMIT, HANDS)` → "Grasp characteristics may affect operating limits". Sin plantilla: "\<Slot\> changed: \<before\> → \<after\>".

Al confirmar un cambio: se crea el snapshot nuevo, el Change queda `REVIEW_REQUIRED` y cada EvidenceItem afectado pasa a `REVIEW_REQUIRED`. Cada aprobación afectada genera un ImpactItem `RE_APPROVE` que referencia la decisión original. La decisión original no se reescribe: el re-review sólo puede resolverlo la persona nombrada en esa aprobación. El Change no puede aprobarse mientras exista un ImpactItem de aprobación abierto.

### 6.4 Aprobación de un cambio

- Sólo una persona con rol `SAFETY_LEAD` puede aprobar.
- Bloqueado mientras haya ImpactItems HIGH en `PENDING` o `IN_REVIEW`. Un ítem se puede dar por *waived* sólo con justificación escrita, que queda en auditoría.
- Resolver un `RE_RUN` exige vincular una evidencia nueva o indicar la fecha y el resultado del nuevo test.
- Al aprobar: se crea un Baseline nuevo con el snapshot *after*, la evidencia vigente y las aprobaciones; el anterior queda en el historial. El registro dice "Approved by \<nombre\>, \<rol\>, \<fecha\>".
- El botón explica por qué está deshabilitado cuando no se puede aprobar.

### 6.5 Readiness

Seis categorías por deployment: System identity, Configuration, Safety evidence, Customer requirements, Insurance, Maintenance.

Estado de cada categoría (prioridad de arriba hacia abajo):

1. **N Missing**: hay ítems requeridos en `MISSING`.
2. **Review required**: hay ítems requeridos en `REVIEW_REQUIRED`, `IN_REVIEW`, `PENDING` o `NOT_STARTED`, o aprobaciones de la categoría sin decidir.
3. **Ready**: todos los ítems requeridos están `VALID` y las aprobaciones de la categoría `APPROVED`.

Cuentan como requeridas todas las aprobaciones no revocadas del deployment; cada una suma a su `readinessCategory` (en la semilla, Safety approval → Safety evidence; las del cliente → Customer requirements).
4. **Not requested**: la categoría no tiene ítems requeridos (típico de Insurance en un piloto).

System identity y Configuration también salen de datos: Ready si el robot tiene número de serie y el hash del snapshot activo coincide con el del baseline vigente; Review required si hay un snapshot más nuevo sin baseline aprobado.

**Readiness %** = ítems y aprobaciones requeridos y aplicables en estado `VALID`/`APPROVED` ÷ total requeridos y aplicables. Redondeo a entero. Cada categoría muestra una descripción corta ("Required safety evidence under review", "2 requirements missing").

### 6.6 Evidence coverage

Coverage = ítems de categoría `EVIDENCE` aplicables con `uri` y estado `VALID` ÷ ítems `EVIDENCE` aplicables. Se muestra como "X of Y applicable evidence items linked" con números reales.

### 6.7 Métricas del Home

- **Active deployments**: `operationalState` distinto de `PLANNED` y `ENDED`.
- **Robots**: robots `ACTIVE`.
- **Open gaps**: ítems requeridos en `MISSING`.
- **Review required**: ítems en `REVIEW_REQUIRED` + cambios en `REVIEW_REQUIRED`.
- **Delta "vs last 30 days"**: reconstruido desde los AuditEvents. Si no se puede reconstruir, el delta no se muestra. Nunca se inventa.

### 6.8 Auditoría

Toda mutación crea un AuditEvent con actor, acción y estado antes/después. Se ve en la pestaña History de deployments, robots y cambios.

---

## 7. Pantallas

### 7.1 Shell

- Sidebar: logo Elaris con el subtítulo "Deployment & Change Evidence"; Home, Robots, Deployments, Evidence, Requirements, Changes, Incidents, Reports; Assistant deshabilitado con "Coming soon".
- Top bar: búsqueda global (robots, deployments, evidencia y cambios por código o título), organización fija (Humandroid), campana con el conteo de Attention Required, avatar con el selector "Viewing as".

### 7.2 Home (`01-home.jpg`)

- Cuatro KPI cards (6.7).
- Attention Required: cambios en Review required, aprobaciones pendientes, ítems a revisar tras un cambio; lo más reciente primero, cada uno enlaza a su detalle.
- Active Deployments: nombre, cliente y sitio, pill de estado, barra de readiness.
- Recent Changes: asset, cambio, fecha, impacto máximo.
- Missing Evidence: ítem, relacionado a, tipo.
- Upcoming Reviews: ítem, relacionado a, fecha límite, estado.
- Incidents: fecha, asset, descripción, severidad, estado.
- Cada "View all (n)" con `n` calculado.

### 7.3 Deployment Overview (`02-deployment-overview.jpg`)

- Breadcrumb, título, pill de estado, menú "…", Share View, Generate Report.
- Tira de KPIs: Robot, Configuration (código del snapshot activo), Task, Environment, Status, Readiness (dona con %).
- Overview: descripción editable, Customer, Site, Operating mode, Human exposure, Owner, Reference.
- Readiness Status: las seis categorías de 6.5.
- Configuration Snapshot: slot → valor; cada fila abre el historial de ese slot.
- Evidence Coverage: documentos, tests, aprobaciones y requisitos vinculados, barra de coverage.
- Requirements & Approvals: ítem, owner, estado.
- Recent Changes y Related Incidents.
- Pestaña History: baselines (con hash) y audit log del deployment.

### 7.4 Change Impact (`03-change-impact.jpg`) — la pantalla clave

- Título "\<valor antes\> → \<valor después\>" del slot principal; Deployment, Robot, Status, Created.
- Before y After lado a lado. Los slots cambiados se resaltan (rojo tenue antes, verde tenue después) y llevan el texto "changed".
- Potential Impact: cuatro contadores calculados (evidencias, requisitos, aprobaciones, deployments).
- Affected Items: código y título, categoría, razón, acción sugerida, impacto, estado. Acciones por fila: poner en revisión, resolver (nota o evidencia nueva), waiver con justificación, asignar.
- Recommended Actions: checklist derivada de los ImpactItems y checks; tildar resuelve el ítem (pidiendo lo que exige 6.4).
- Approvals Potentially Affected: aprobación, persona, rol, razón, estado.
- Botones: Approve Change (reglas 6.4), Assign Review, Export Impact Report.
- **Crear un cambio:** "New change" desde el deployment o el robot → formulario que parte del snapshot activo y permite editar slots → **preview del diff y del impacto antes de confirmar** → al confirmar se crean el snapshot, el Change y los ImpactItems.

### 7.5 Robots

- Lista: código, modelo, serial, deployment actual, snapshot activo, último cambio.
- Perfil: identidad, snapshot activo por slots, historial de snapshots con diff, deployments, evidencia vinculada, incidentes. Sin batería ni online/offline.

### 7.6 Evidence y Requirements

- Tablas filtrables por deployment, tipo, estado y criticidad.
- Formulario de alta y edición: código, título, categoría, tipo, fuente, alcance (multi-select de slots), criticidad, responsable, URI, requerido y aplicable, fecha límite.
- Hash opcional: si el usuario elige un archivo local, se calcula el SHA-256 en el navegador y **no se sube el archivo**.

### 7.7 Changes e Incidents

- Changes: lista con estado, autor, fecha e impacto máximo.
- Incidents: formulario simple; al guardar se ligan solos el baseline y el snapshot vigentes. El detalle tiene una línea de tiempo cargada a mano (inspirada en el Incident View de `04`).

### 7.8 Reports y Share View

- **System Passport**: robot, snapshot activo con hash, historial de cambios, deployments.
- **Deployment Readiness Pack**: overview, readiness, evidencia, aprobaciones, hash del baseline vigente.
- **Change Impact Report**: diff, ítems afectados, acciones, aprobaciones afectadas, estado de cada una.
- Cada reporte tiene versión imprimible (A4) y export JSON. Pie en todos: "Generated by Elaris on \<date\>. Elaris does not certify or approve; approvals are recorded by the named persons."
- **Share View**: crear un link de solo lectura a un reporte, con etiqueta de audiencia, expiración y revocación. La vista compartida no muestra la navegación interna ni permite editar. El token se guarda hasheado.

---

## 8. Flujos que tienen que funcionar de punta a punta

- **A. Registrar un cambio:** en G1 #017, mano BrainCo Revo2 → Inspire RH56DFX y control stack Humandroid Control v2.3 → v2.4 → preview → confirmar → aparece en Attention Required y en el Home.
- **B. Resolver y aprobar:** re-run de INT-042 vinculando evidencia nueva, revisión de SAF-017, actualización de CTD-009, confirmación de ciberseguridad y el resto → aprobar como Safety Lead → baseline nuevo → readiness y coverage recalculados.
- **C. Reportes:** generar los tres e imprimirlos.
- **D. Compartir:** crear un link del Readiness Pack, abrirlo en una ventana privada, revocarlo y comprobar que deja de funcionar.
- **E. Incidente:** registrar uno y verificar que quedó ligado al baseline y snapshot vigentes.

---

## 9. Datos semilla (`prisma/seed.ts`)

Coherentes entre sí, fechas en 2026, clientes ficticios. La base queda marcada como demo.

### 9.1 Entidades

- **Organización:** Humandroid (integrador).
- **Personas (ficticias):** Juan D. (Engineer), Mira K. (Engineer), Sarah Chen (Safety Lead), James Patel (Customer Engineer, Northgas Energy).
- **Clientes (ficticios):** Northgas Energy (planta de gas), Autoline Motors (planta automotriz). Además, el laboratorio propio de Humandroid.
- **Robots:** seis Unitree G1, de G1 #012 a G1 #017, con al menos uno inactivo.
- **Deployments:**
  1. **Valve Inspection Pilot** (DEP-0017): Northgas Energy, sitio "North gas facility", G1 #017, tarea Valve manipulation, `PILOT` / `LIVE`, `SUPERVISED`, `SHARED_AREA`.
  2. **Assembly Line Pilot** (DEP-0021): Autoline Motors, `LIMITED` / `LIVE`.
  3. **Warehouse Manipulation Demo** (DEP-0009): laboratorio Humandroid, `TEST` / `LIVE`.

### 9.2 Snapshot C004 de G1 #017

| Slot | Valor |
| --- | --- |
| CHASSIS | Unitree G1 |
| HANDS | BrainCo Revo2 |
| FIRMWARE | 1.4.2 |
| CONTROL_STACK | Humandroid Control v2.3 |
| SKILL | Valve Manipulation v4 |
| AI_MODEL | VLA-HM-12 |
| NETWORK_PROFILE | Plant Profile A |
| OPERATING_LIMITS | Max speed 0.5 m/s in shared zone |

Baseline B-0017-01 congelado sobre C004.

### 9.3 Evidencia, requisitos y aprobaciones de DEP-0017 (escenario de oro)

| Código | Título | Categoría | Kind | Readiness | Scope | Criticidad | Requerido | Estado |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| INT-042 | Integration test | EVIDENCE | TEST | SAFETY_EVIDENCE | HANDS, CONTROL_STACK | HIGH | sí | VALID |
| SAF-017 | Safety assessment | REQUIREMENT | RISK_ASSESSMENT | SAFETY_EVIDENCE | HANDS, SKILL, OPERATING_LIMITS | HIGH | sí | VALID |
| CTD-009 | Customer technical dossier | EVIDENCE | TECHNICAL_DOSSIER | CUSTOMER_REQUIREMENTS | HANDS, FIRMWARE, CONTROL_STACK | MEDIUM | sí | VALID |
| INS-003 | Insurance appendix | REQUIREMENT | INSURANCE_APPENDIX | INSURANCE | HANDS | MEDIUM | no | VALID |
| CAL-021 | Calibration record | EVIDENCE | CALIBRATION | SAFETY_EVIDENCE | HANDS | LOW | sí | VALID |
| SZL-004 | Shared-zone operating limits | REQUIREMENT | OPERATING_LIMIT | SAFETY_EVIDENCE | HANDS, OPERATING_LIMITS | LOW | sí | VALID |
| ESV-001 | Emergency stop validation | EVIDENCE | TEST | SAFETY_EVIDENCE | CHASSIS, FIRMWARE | HIGH | sí | VALID |
| SZR-002 | Shared-zone risk assessment | REQUIREMENT | RISK_ASSESSMENT | SAFETY_EVIDENCE | SAFETY_ZONE, TASK_PARAMETERS | MEDIUM | sí | IN_REVIEW |
| NET-002 | Network access review | REQUIREMENT | PROCEDURE | CONFIGURATION | NETWORK_PROFILE | MEDIUM | sí | NOT_STARTED |
| OPT-005 | Operator training record | REQUIREMENT | PROCEDURE | CUSTOMER_REQUIREMENTS | TASK_PARAMETERS | MEDIUM | sí | MISSING |
| SAT-006 | Site acceptance test | REQUIREMENT | TEST | CUSTOMER_REQUIREMENTS | SAFETY_ZONE | MEDIUM | sí | MISSING |
| MNT-001 | Maintenance plan | EVIDENCE | MAINTENANCE_PLAN | MAINTENANCE | CHASSIS | LOW | sí | VALID |

| Aprobación | Persona | Rol | Scope | Estado |
| --- | --- | --- | --- | --- |
| Safety approval | Sarah Chen | SAFETY_LEAD | HANDS, SKILL, OPERATING_LIMITS | APPROVED |
| Customer engineering approval | James Patel | CUSTOMER_ENGINEER | HANDS, CHASSIS | APPROVED |
| Customer technical approval | James Patel | CUSTOMER_ENGINEER | TASK_PARAMETERS, SAFETY_ZONE | PENDING |

**Cambio de oro CHG-0005** (crea el snapshot C005): HANDS BrainCo Revo2 → Inspire RH56DFX; CONTROL_STACK Humandroid Control v2.3 → v2.4. Se precarga en `REVIEW_REQUIRED` para la demo, y un test lo recrea desde cero.

Resultado esperado del motor (`changedSlots = {HANDS, CONTROL_STACK}`):

| Ítem | Tipo | Acción | Severidad |
| --- | --- | --- | --- |
| INT-042 | Evidence | Re-run | HIGH |
| SAF-017 | Requirement | Review | HIGH |
| Safety approval | Approval | Re-approve | HIGH |
| CTD-009 | Evidence | Update | MEDIUM |
| INS-003 | Requirement | Review | MEDIUM |
| Customer engineering approval | Approval | Re-approve | MEDIUM |
| CAL-021 | Evidence | Re-run | LOW |
| SZL-004 | Requirement | Confirm | LOW |
| Confirm no cyber impact | Check | Confirm | LOW |

No afectados: ESV-001, SZR-002, NET-002, OPT-005, SAT-006, MNT-001 y Customer technical approval.

Contadores de Potential Impact: **3 evidencias, 3 requisitos, 2 aprobaciones, 1 deployment.**

### 9.4 Historia de fondo

- Cambios anteriores ya aprobados en 2026 (por ejemplo, firmware 1.4.1 → 1.4.2) con sus baselines, para que History tenga contenido.
- Incidente en DEP-0017: "Near miss: person entered restricted area", MEDIUM, `INVESTIGATING`.
- Incidente en DEP-0009: "Grasp failure during picking sequence", LOW, `CLOSED`.
- DEP-0021 y DEP-0009 con menos ítems, pero coherentes, para que el Home muestre readiness distintos.

---

## 10. Criterios de aceptación

- [ ] `pnpm install && pnpm db:reset && pnpm dev` levanta la app con la semilla, sin servicios externos.
- [ ] Test de oro: el motor de impacto sobre 9.3 devuelve exactamente los ítems, acciones y severidades de la tabla esperada, y los contadores 3 / 3 / 2 / 1.
- [ ] Mismo snapshot → mismo hash; cambiar un slot cambia el hash.
- [ ] Readiness y coverage se recalculan al resolver ítems. Ningún número de la UI está hardcodeado.
- [ ] No se puede aprobar un cambio con ítems HIGH pendientes; el waiver exige justificación.
- [ ] Aprobar crea un baseline nuevo y el anterior sigue visible en History.
- [ ] Toda mutación genera un AuditEvent.
- [ ] Los tres reportes se imprimen bien en A4 y exportan JSON.
- [ ] El link compartido funciona sin sesión, es de solo lectura, expira y se puede revocar.
- [ ] Ninguna pantalla usa "compliant", "certified" ni "approved by Elaris".
- [ ] Pills con texto, contraste AA, navegación completa con teclado.
- [ ] Tests de casos borde del motor: diff vacío, slot agregado o eliminado, evidencia sin scope, evidencia archivada, aprobación revocada, deployment sin exposición humana.

---

## 11. Fases posteriores (no construir ahora)

- Agente de snapshot en Python para ROS 2: lee versiones de firmware, paquetes, hashes de modelos y archivos de parámetros, y envía un snapshot firmado a la API.
- Conectores de solo lectura: Git (versiones de software) y carpetas de documentos (evidencia por enlace).
- Assistant: preguntas en lenguaje natural sobre el grafo de evidencia, citando ítems. Nunca cambia estados.
- Librería de reglas por norma y packs por industria.
- Anexo de seguros completo y registro de incidentes ligado a eventos del robot.
- Multi-tenant, autenticación real, organizaciones externas, Postgres y despliegue en servidor propio para datos sensibles.

---

## 12. Fases de construcción

1. **Base:** scaffold, Tailwind y shadcn, shell (sidebar y top bar), `schema.prisma`, seed, `CLAUDE.md`.
2. **Motores:** hash, diff, impact, readiness y coverage como funciones puras, con tests de Vitest (incluido el test de oro). Sin UI.
3. **Pantallas de lectura:** Home, Deployment Overview y Change Impact con la semilla.
4. **Escrituras:** crear cambio con preview, resolver, waiver y asignar ítems, aprobar cambio, altas y ediciones de evidencia y requisitos, incidentes, audit log.
5. **Resto:** Robots, listas de Evidence, Requirements, Changes e Incidents, reportes imprimibles con JSON, Share View.
6. **Pulido:** estados vacíos, búsqueda global, accesibilidad, smoke tests con Playwright y un README con cómo correr la demo.
