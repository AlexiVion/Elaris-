# Roadmap maestro de Component Health — por alcances y gates

**Versión del plan:** R0 · 2026-10-06
**Estado:** `DRAFT — NO AUTORIZA CONSTRUCCIÓN AUTOMÁTICA`
**Regla:** los estados vigentes de cada versión se mantienen en [version-registry.md](version-registry.md). Este archivo define *qué construir y bajo qué condiciones*, no aprueba/releases por sí mismo.

## 1. Principios de orden

La meta próxima es un **Field Evidence Audit pagable y repetible**, no «mantenimiento predictivo» inmediato. Cada siguiente alcance debe producir evidencia, decisiones o trabajo operativo nuevo que efectivamente justifique la implementación. El roadmap es **condicional**, no una fecha contractual ni una obligación de implementar todas las versiones.

**Modelo de madurez por evidencia:**

```text
M0  SPEC / synthetic scenario
M1  REAL OBSERVED telemetry, readonly capture
M2  REPRODUCIBLE phase/component evidence pack
M3  HUMAN-REVIEWED deliverable, approved export
M4  REPEATED AUDITS, comparable sessions, stable owner/budget
M5  VALIDATED deterministic signal → named decision → real outcome
M6  OUTCOME-LABELED cohorts → evaluated prognostics (optional)
```

Ninguna capacidad M5/M6 se anuncia usando sólo evidencia M1/M2.

## 2. Resumen de versiones

| Versión | Alcance | Propuesta de resultado | Estado inicial | Gate de avance |
|---|---|---|---|---|
| V0 sintética | Hipótesis/descubrimiento | Flujo visual conceptual Humandroid | `DEPRECATED_LEGACY` | Conservar en historia, no vender como real |
| V0.1 | Baseline + Field Evidence | Captura real y reporte técnico | `VERIFIED_LOCAL` (scope limitado) | Procedencia formal/QA pendientes |
| V0.2 | Demo real-data-derived | Navegación/Phase Explorer/fingerprints | `VERIFIED_LOCAL` | Tests y build del snapshot aportados |
| **V0.2.1** | **Cierre correctivo** | Sin alertas inventadas, provenance fuente/derivada y quality metadata | `IMPLEMENTED_PENDING_VERIFICATION` | Tests+build+E2E+rerun real+data gate |
| V0.3 | **Evidence Engine confiable** | Normalización de reportes privados y referencia intra-sesión como contrato | `DRAFT` | Reproducibilidad real 2× + seguridad |
| V0.4 | **Audit Workbench** | Sesiones, fases, componentes, quality review y notas humanas navegables, persistencia mínima | `DRAFT` | Un operador completa audit sin scripts ad hoc |
| V0.5 | **Delivery & Export** | Paquete aprobado, export versionado y handoff al cliente | `DRAFT` | Aprobación legal/datos + entrega verificable |
| V0.6 | **Comparable Sessions** | Historial de sesiones sobre mismo robot/componente/config | `PROPOSED` | 2+ capturas comparables y caso real de comparación |
| V0.7 | **Field Audit Operations** | intake, checklist, costos, reejecución, observaciones, PR/runbook | `PROPOSED` | 2 auditorías operadas repetidamente |
| V0.8 | **Human Review & Findings** | hallazgos/rules de calidad, inspección humana, decisiones registradas | `PROPOSED` | Necesidad de decisión real confirmada |
| V0.9 | **Secure Partner Pilot** | autorización por organización, storage privado, roles, retención, auditoría | `PROPOSED` | 1–2 clientes con requisitos reales definidos |
| **V1.0** | **Repeatable Paid Field Audit** | Producto operado de extremo a extremo para un ICP | `VISION` | ≥1 pago, repetibilidad, soporte y límites claros |
| V1.5 | Multi-robot/Multi-OEM | Segundo adapter probado en campo, normalización por capacidades | `VISION` | Segundo OEM o variante con demanda y dato real |
| V2.0 | Component Evidence Operations | Reglas validadas, flujo de ingeniería/servicio y vinculación con Deployment Control | `VISION` | Findings→action→outcome medido |
| V2.5 | Fleet & Reliability Knowledge | Cohortes comparables, tendencias robustas, análisis cross-site | `VISION` | N suficiente y consentimiento/tenencia |
| V3.0 | Optional Prognostic Intelligence | Modelos probabilísticos calibrados, revisión humana, model governance | `RESEARCH_ONLY` | Fallos etiquetados, backtesting y validación independiente |

**La prioridad NO es la numeración más alta:** si una versión no supera su gate, se marca `BLOCKED/DEFERRED/CANCELLED` y se redefine el alcance.

## 3. Alcance A — lo que se puede hacer AHORA, sin otro robot

### V0.2.1: cerrar deuda directa del snapshot V0.2

**Trabajo:** PR #15 y `v0.2.1-closeout.md`.
**Resultado:** eliminar falsas alertas y navegación sintética; fuente y derivada con verificación separada; calidad de cobertura y ventana observada registradas; límites de publicación visibles; tests E2E actualizados.
**No se considera aprobado** hasta reproducir con Dataset #002 en máquina del operador y revisar cualquier diferencia.

### V0.3: motor de evidencia reproducible y semánticamente correcto

**Se puede ejecutar offline hoy:** sí, con Dataset #001/#002 ya preservados.

Entregables:
1. Contrato tipado `RobotCapture / SourceEvidence / WorkingCopy / PhaseWindow / SignalSummary / QualityFinding / EvidenceReference / AnalysisRun` independiente de UI.
2. Ejecutar análisis original y rekey con procedencia dual; baseline source→derivative separado; inputs versionados por hash. Generar `AnalysisRun` determinista con versiones de analyzer/adapter, inputs, timestamp UTC, flags y runner; reejecución produce mismas estadísticas bajo mismas entradas.
3. Misma sesión `IDLE_BASELINE` como referencia **primaria** en motor; Dataset #001 como contexto **histórico secundario**, no degradación.
4. Estándar único de intervalos `[start, end)`, coverage basado en frames únicos, gaps, duplicados, timestamp quality, drift, partial capture, missing signals.
5. Reportar rango real de observación y periodo declarado por fase; `RECOVERY_IDLE` no se extiende ficticiamente.
6. La tabla de unidades y semánticas OEM G1 se valida o señala `UNCONFIRMED`; códigos OEM numéricos no mapeados quedan sin interpretación.
7. Derivación de **29×8** resúmenes completos si los datos contienen señal disponible; no fabricar valores ausentes; incluir null/unknown y motivo.
8. Tests golden sintéticos + fixture mínimo saneado + regresión sobre hashes de salida **privados**.
9. Export interno `analysis-run.json` + `field-evidence.json` + `quality.json` + Markdown + checksums.
10. Límite de memoria/tiempo medido en Dataset #002 (streaming y métricas de ejecución).

**Gate V0.3:** misma salida estadística en dos re-runs verificables, coverage ≤100%, lineage fuente/derivada explícito, no datos SENSITIVE en repo, auditor técnico aprueba interpretaciones, E2E básico verde.

### V0.4: Workbench operacional real, sin «plataforma enterprise» aún

**Se puede desarrollar mayormente offline:** sí, con datos de campo existentes.

Entidades mínimas:
- `RobotRecord` que enlace al `Robot` compartido de Elaris si hay identidad validada;
- `CaptureSession`, `EvidenceSource` y `AnalysisRun`;
- `PhaseAnnotation` con autores/versiones y declarado vs observado;
- `ComponentMapping` por robot/configuración/versión de adapter;
- `ComponentSignalSummary` / `OperationalFingerprint`;
- `QualityFinding` / `ReviewNote` / `AuditStatus`.

Pantallas:
- **Sessions**: estado captura, integridad, configuración declarada, semántica de export, timeline.
- **Component Explorer**: 29 componentes con filtros por grupo/calidad/observaciones; drilldown de todas las 8 fases con min/max, p05/p50/p95/absP95 y cobertura.
- **Phase Explorer**: selección de fase, componentes, señales y referencia comparable; matriz y charts con unidades reales, no barras de ratio ambiguas.
- **Evidence Review**: qué proviene de fuente, qué de anotación humana, qué es computado y qué sigue desconocido.
- **Run History**: versiones, parámetros, checksums, resultados, comparaciones entre runs.
- **Draft Report**: generar vista previa interna; aún sin habilitar compartir externos sin Gate de datos.

**Gate V0.4:** un operador genera/inspecciona informe a partir de un capture privado aprobado para procesamiento **sin editar archivos TS ni ejecutar scripts temporales ad hoc**. Persistencia mínima local/privada, jamás secretos en el cliente.

### V0.5: entrega externa real, con proceso aprobado

- Registro de autorización por archivo/derivado/destinatario/finalidad/plazo, human-in-the-loop y revocación; la exportación no equivale a hacer pública la fuente.
- Informe comercial con objetivos/operación/metodología, componente, fase, indicadores, límites, observaciones unresolved, firmado por revisor.
- JSON versionado para ingeniería, PDF opcional para comprador, verificaciones hash controladas, link expirado/descarga autenticada.
- Trial operativo documentado: intake→captura→QA→revisión→entrega→aceptación.
- Política de sensibilidad, minimización, rotación de claves, conservación/expurgo según acuerdos y derecho institucional.

**Gate V0.5:** material que el titular de los datos **autoriza explícitamente** para el destinatario, reporte no reproduce secretos, entrega verificable, costos y tiempo real medidos.

## 4. Alcance B — requiere una NUEVA sesión o cliente

### V0.6: sesiones comparables
- ≥2 sesiones similares de mismo robot/configuración/modo, con referencias de fase, tarea y entorno.
- Comparación *like-for-like* con incertidumbre, advertencia de no comparabilidad y changelog de software.
- Trend = comportamiento medido en el tiempo; **no** inferir degradación sin validación.

### V0.7: operaciones de auditoría de campo
- Checklist de autorización, integración, disponibilidad de robot, capturas fallidas/salvage, quality gates, reintento controlado.
- Jobs de proceso idempotentes con reejecución y resultados auditables.
- Report SLA realista basado en experiencia y no sólo promesa de 48 h.

### V0.8: decisiones humanas y outcomes
- Cuando cliente muestre inspecciones reales: `Finding` → `Review` → `Disposition` (continuar, observar, inspeccionar, no concluyente) → `Evidence` → `Outcome`.
- Nunca reemplazar criterio OEM/técnico/certificador.
- Posible vínculo con CMMS/servicio del cliente, **no** construir CMMS completo.

### V0.9 y V1: piloto seguro y repetible
- multi-organización sólo si el primer ICP lo exige; aislamiento efectivo, roles, auth, logging, backup y retención.
- contrato legal/protección de datos, consentimiento e instalación soporte.
- prioridad comercial: 10 reuniones con ICP; objetivo ≥3 pedidos de piloto, ≥1 pago; repetir 2 o 3 entregas para medir margen, feedback y reuso.
- Versión **V1.0** sólo cuando existe ciclo de cliente repetible que resuelve una tarea real, no sólo un build exitoso.

## 5. Alcance C — expansión estratégica condicional (12–36 meses orientativos, NO compromiso)

### V1.5 — segundo robot/OEM
Nuevo adapter únicamente si hay robot, contrato de datos y demanda: motor mapping por configuración, capacidad declarada, no forzar 29 slots a otra familia. Pruebas de incompatibilidades, clocks, units y restricciones.

### V2.0 — evidencia operacional + decisiones
Rules deterministas revisadas, ventanas comparables, trazabilidad cambios/firmware/policy, tareas de inspección, incidentes/retests. La plataforma comparte objetos con Deployment Control, Operational Readiness, Safety Change Control y Evidence Review **sin duplicar hechos**.

### V2.5 — fiabilidad longitudinal
Cohortes por robot, modelo, versión y tipo de trabajo; tendencias, distribución de cargas y evidencia de mantenimiento con contexto y biases. Solo métricas válidas en cohortes suficientes. Dashboard fleet para evidencia, no sustituto de los OEM monitors.

### V3.0 — modelos y predicción (sólo SI los datos lo justifican)
- dataset con fallos/reparaciones reales, right-censoring, exposición/duty cycles, cambios de configuración y etiquetas revisadas;
- protocolo de evaluación temporal/out-of-device, calibration, false alarms, precision/recall, costo de errores y drift;
- auditoría de modelos, explicabilidad vinculada a evidencia, revisión humana y opción de apagar modelos;
- retener alternativa no-ML: reglas/quality + revisiones humanas pueden ser producto final adecuado.

**Ningún roadmap convierte automáticamente una correlación en diagnóstico, ni una probabilidad en certificación.**

## 6. Ramas paralelas permitidas, con puertas

| Línea | Se puede investigar en paralelo | No se implementa sin gate |
|---|---|---|
| Cosmos / World Models | simulación separada `SIMULATED` con provenance distinto | nunca mezclar simulación con OBSERVED de robot |
| Robot Adapter | contrato extensible y pruebas de replay | no declarar soporte OEM2 sin robot real |
| Platform UX | diseño, charts, navegación y accesibilidad | no persistir entidades por capricho |
| Risk / Insurance | qué evidencia necesitan reusar compradores y aseguradoras | no inferir compliance, seguros o riesgo asegurado |
| Componente inteligente | hipótesis tracking vs desired, protocolos de inspección | no health score ni RUL sin labels |

## 7. Sistema de decisiones GO / MODIFY / PAUSE / KILL

Cada gate genera nota en `decision-log.md` y actualiza `version-registry.md`.
- **GO**: problema/dato/autoridad/entrega y señal de pago recurrente claros.
- **MODIFY**: el problema real es commissioning, QA, acceptance o service evidence distinto al naming actual.
- **PAUSE**: datos faltantes, permisos, derechos o integración bloquean.
- **KILL/MERGE**: OEM tool resuelve integralmente o Elaris aporta sólo un componente de Deployment Control.

Una versión ideal puede existir en documento sin obligar a desarrollar su funcionalidad.

## 8. Primera secuencia ejecutable recomendada

```text
PR #15 (V0.2.1) — local revalidation + integrity/source + publication gate
     ↓
CH-030 / Evidence Engine V0.3 (source→derivative→analysis, same-session idle)
     ↓
CH-040 / Workbench V0.4 (sessions/components/phases/quality)
     ↓
CH-050 / Client Delivery V0.5 (human approval/export)
     ↓
10 conversations → first paid pilot (commercial validation)
     ↓
solo después: repeated sessions / service workflow / second OEM
```

En paralelo **sin esperar V0.4**: entrevistas y demostración **interna o expresamente autorizada**, sin distribuir datos del tercero mientras `NOT_APPROVED`.
