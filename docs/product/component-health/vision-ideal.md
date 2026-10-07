# Component Health — visión ideal de producto (V3+)

**Estado:** `VISION / NO_APROBADA`
**Horizonte:** estratégico; no sustituye el backlog ejecutable ni implica compromiso de construir ML, infraestructura enterprise o integraciones sin demanda real.

## 1. Qué debería ser el producto ideal

> **Elaris Component Health es el registro verificable de cómo se comportan los componentes de un robot en un contexto operacional dado, cómo cambia ese comportamiento en sesiones comparables, qué evidencia permite hacer una afirmación y qué decisión/resultado registra un humano responsable.**

La propuesta ideal **NO** es reemplazar paneles OEM en vivo, un CMMS, un simulador, PLM o una empresa certificadora. Es infraestructura de *evidencia del comportamiento, calidad, comparación, revisión y reuso*.

Un cliente debería poder responder y demostrar:
1. ¿Cuál es el robot exacto, su variante, hardware, firmware, control mode y policy?
2. ¿Qué componentes y señales existen realmente y con qué calidad/cobertura?
3. ¿Qué tarea/operación ocurrió en la sesión y quién confirmó los límites/contexto?
4. ¿Qué pasó en ese componente durante esa fase, comparado con una referencia comparable?
5. ¿Qué faltó observar y cómo afecta el nivel de confianza interpretativo?
6. ¿Cuáles son las diferencias entre sesiones/configuraciones sin confundir condiciones?
7. ¿Qué hallazgo requiere atención de ingeniería, y **por qué**?
8. ¿Quién evaluó, qué hizo y con qué outcome?
9. ¿Qué evidencia puede compartirse legal y técnicamente, con quién y por cuánto tiempo?
10. ¿Qué afirmaciones derivadas (incluido cualquier modelo) están validadas y cuáles no?

## 2. Arquitectura conceptual final — separaciones innegociables

```text
                    EXTERNAL ROBOTS / OEM TOOLS
                        ├─ DDS / Unitree
                        ├─ ROS2 / controller logs (future)
                        ├─ OEM export files (future)
                        └─ consented partner uploads
                                      │
                       ROBOT ADAPTER BOUNDARY
                         READ_ONLY · OEM CAPS
                                      │
                                 EDGE / IMPORT
                        authz · policy · encryption
                        timestamps · chunks · resumability
                                      │
                      PRIVATE EVIDENCE STORAGE (WORM*)
                        raw/source metadata, hashes, custody
                        *inmutabilidad según capacidad real
                                      │
                    NORMALIZATION / QUALITY PIPELINE
                   identity / units / clock / schema/version
                   quality / missingness / ambiguous motor slots
                                      │
                           PHASE & CONTEXT MODEL
                    human labels / control mode / robot task
                    declared vs observed bounds / provenance
                                      │
                          DESCRIPTIVE EVIDENCE
                     distributions, fingerprints, comparisons
                     known limitations, confidence about data
                                      │
                       VALIDATED ENGINEERING RULES
                       optional · per model/config/context
                       rules as versioned, reviewable hypotheses
                                      │
                            HUMAN REVIEW / ACTION
                    note → inspection → outcome → next evidence
                                      │
                         APPROVED EVIDENCE PACKS
                 recipients · scope · retention · revocation
                                      │
                  ELARIS SHARED TECHNICAL TRUTH
 Robot ↔ Config ↔ Deployment ↔ Component ↔ Capture ↔ Evidence ↔ Change
                                      │
             Actor views: integrator, lab, operator, service,
             safety/review, buyer, broker/insurance (opt-in)
```

La estadística es determinista donde corresponde; un LLM puede asistir a redactar/extraer, pero jamás «firmar» un estado técnico. Un modelo de fallo predictivo es una **capa opcional posterior**, no el corazón del sistema.

## 3. Modelo de dominio ideal

### 3.1 Identidad/historia

- `Robot`: identidad estable, OEM/modelo/variante, serie cuando está autorizada, owner, jurisdicción.
- `RobotConfigurationSnapshot`: firmware, controller/policy versión, hardware/firmware, payload/setting relevantes, evidencia de quién hizo el cambio.
- `ComponentInstance`: instancias con parte, lote, serie, ubicación física, fecha de instalación/reemplazo cuando **conocidas**; jamás asumir que un «slot OEM» equivale a un motor serial identificado.
- `ComponentType` / `OEMMapping`: ID estable, índice real por versión/variante, capacidad/uncertainty de soporte.
- `DeploymentContext`: task/site/mode/operator/configuración al momento de medición.

### 3.2 Captura/evidencia

- `EvidenceSource`: origen, owner, cadena de custodia, clasificación y autorización.
- `CaptureSession`: sesiones originales `OPEN/FINALIZED/ABORTED` y disposition separada.
- `WorkingCopy`: relación source→derivative, transformación/versiones/hashes, indicación explícita si equivalencia de plaintext no probada.
- `SignalSchema`: señal + unidad + semántica OEM + signo/eje + actual/desired.
- `TelemetryChunk`: almacenamiento privado chunked con manifest verificable, sin copiar raw a base relacional.
- `PhaseAnnotation`: fase, timestamps declarados, timestamps realmente observados, autor y evidencia humana.
- `AnalysisRun`: versión del código/adapter, parámetros, input refs, resultado, reproducibilidad y QA.
- `SignalSummary`: distribuciones, cobertura, gaps, QualityFinding, intervalo de confianza descriptivo cuando corresponde.
- `EvidenceArtifact`: report, manifest, derivado, hash y sensibilidad.

### 3.3 Interpretación/decisión

- `ComparisonSet`: pares comparables, criterios, razones de exclusión.
- `EngineeringRule`: umbral por modelo/config/operación con versión, evidencia de validación y vigencia.
- `Finding`: hipótesis/observación con evidencia citada, grado de resolución y estado, sin diagnóstico automático.
- `InspectionCase`: responsable, contexto, decisión, procedimiento y resultado humano.
- `ComponentEvent`: servicio/reemplazo/calibración (si ocurrió), vínculo con nueva configuración y evidencia.
- `ModelAssessment` (opcional): dataset/protocolo/calibración/explicabilidad, versión de modelo, control de falsos positivos.
- `DataReleaseDecision`: owner, revisor autorizado, destinatario, alcance, propósito, fecha, expiración, decisión, revocación, auditoría.

**Todos los links a evidencia deben ser reproducibles, con referencias versionadas.** Los IDs de captura y hashes sensibles se muestran según permisos; una URL pública no es prueba de autorización.

## 4. Producto ideal — mapa de pantallas

```text
COMPONENT HEALTH
├── Home / Operational Evidence Cockpit
│   ├── últimas auditorías y calidad de datos
│   ├── trabajos pendientes de revisión humana
│   └── coberturas de análisis (no health score inventado)
├── Robots & Configurations
│   ├── Robot 360 / versiones / capacidades OEM
│   ├── Components registry: slot vs componente físico
│   └── Session history por configuración
├── Sessions
│   ├── Capture timeline / observación real vs declarada
│   ├── Data lineage / integrity / classification
│   └── Ingest errors / QA / re-run
├── Components
│   ├── ficha, identities, source coverage, OEM mapping
│   ├── signal explorer: position, velocity, torque, temp, voltage
│   ├── distribuciones y trazas autorizadas
│   └── histograma/intervalos/variación por fase/sesión
├── Phase Explorer
│   ├── filtro robot/config/session/phase
│   ├── filtros signal/quality/body group
│   ├── heatmap, bars, ranked tables
│   └── compare idle, like-for-like y estado desconocido
├── Comparative Analysis
│   ├── session A vs B / same context
│   ├── exclusions, uncertainty y timeline de cambios
│   └── comparisons derivadas reproducibles
├── Findings & Engineering Review
│   ├── findings descriptivos y reglas versionadas (opt-in)
│   ├── revisión humana + evidencias
│   └── decisiones y tareas vinculadas
├── Inspection & Outcomes (cuando exista caso real)
│   ├── inspección y registros de reemplazo/calibración
│   ├── vinculación al sistema de mantenimiento externo
│   └── comprobaciones post-service firmadas por humanos
├── Evidence Packs & Reports
│   ├── borrador → revisión → aprobación
│   ├── PDF/JSON/export de alcance mínimo
│   └── shares restringidos, caducables y auditables
├── Ingestion & Connections
│   ├── adaptadores/OEM caps / preflight
│   ├── autorización/protocolo del sitio
│   └── import privado / replay / QA
└── Governance
    ├── organizaciones/roles/permissions
    ├── classification & retention
    ├── analysis/model version registry
    └── audit logs / reviewer signatures
```

## 5. Experiencias ideales por tipo de usuario

| Actor | Pregunta prioritaria | Entrega clave |
|---|---|---|
| Integrador / commissioning | «¿Qué vimos realmente en la aceptación?» | Audit por fase, baseline comparable, evidencias de pruebas y excepciones |
| Laboratorio R&D | «¿Qué cambió entre experimentos?» | Versión config/policy + reproducibilidad + señales y parámetros |
| Operador | «¿Qué comportamiento observado tengo y cuándo revisarlo?» | Session evidence, quality gates, hallazgos de ingeniería |
| Mantenimiento / service | «¿Qué hay que inspeccionar y qué evidencia tengo?» | Findings ligados a contexto + decisión/outcome humano |
| Safety / EHS | «¿Qué evidencia se revisó antes del cambio?» | Evidencia versionada, trazabilidad, límites y revalidación humana |
| Enterprise buyer | «¿Qué se verificó en el despliegue?» | Paquete acotado de evidencia de acceptance |
| Broker / underwriter / claims | «¿Qué evidencia histórica verificable existe?» | Exportes con permisos, trazables; nunca scoring asegurador automático |

El primer usuario real debe validar qué pantalla aporta valor; no desarrollar todos estos espacios a la vez.

## 6. Qué indicadores serían válidos (y cuáles no)

**M1/M2:**
- porcentaje de señales/frames observados con significado conocido;
- alcance/quality por componente/fase;
- distribuciones absP95 y rangos observados;
- comparación con idle **comparable**;
- tiempos y costos para reconstruir evidencia;
- cobertura/retención/procedencia.

**Con validación M4/M5:**
- reproducibilidad sesión A/B y varianza de condiciones;
- acuerdos entre evaluadores; hallazgos confirmados/descartados;
- tiempos de inspección y resultados;
- tasa de falsa alarma de reglas si existe ground truth.

**Sólo M6, opcional:**
- probabilidades calibradas de fallos con intervalos y definición de evento;
- sensibilidad/especificidad y costos reales de predicción;
- estimación RUL bajo protocolo de supervivencia/validación por cohortes.

No convertir ratio ×27.10 vs idle en «27× de daño», «27× probabilidad de fallo», «failure risk» o «wear» sin evidencia adicional.

## 7. Inteligencia artificial ideal: rol y validación

### 7.1 Capacidades que pueden ayudar temprano
- extraer notas de servicio y asociarlas a componentes con confirmación;
- traducir estados/taxonomías OEM **sólo** con documentación validada;
- generar borradores de reportes citando eventos agregados verificables;
- proponer controles de calidad, nunca publicar sin revisión.

### 7.2 Algoritmos futuros, sólo bajo condiciones
- reglas deterministas configuradas por ingeniero;
- detección de cambios en señales bajo workloads comparables;
- modelos de anomalía contextual validados con eventos reales;
- failure prediction/RUL con datos longitudinales, censura y etiquetas suficientes.

**Cosmos/Isaac/simulaciones:** útiles para construir *escenarios simulados* y coverage experimental, pero todo output debe conservar clase `SIMULATED` y no elevarse automáticamente a `OBSERVED`. Ninguna dependencia de GPU/servicio pago para el camino comercial V1.

## 8. Arquitectura técnica de referencia (no decisión final de stack)

- **Edge agents:** mínimos, read-only, adapters por capacidades, mTLS opcional/según cliente, encrypt-before-transfer.
- **Control plane:** catálogo de robots/configs, trabajo de analistas, roles, permisos y policy; tomar prestados IDs existentes de la plataforma Elaris cuando sea verificable.
- **Data plane:** almacén privado de objetos por sesión/organización, raw cifrado inmutable, snapshots/manifests/versiones y derivaciones.
- **Compute plane:** colas/jobs versionados, transformaciones streaming, idempotencia, backfill y métricas de calidad.
- **Serving plane:** API tipada para agregados y evidencia aprobada, paginación, niveles de acceso, caché de resúmenes.
- **Audit plane:** eventos append-only, decisiones humanas, firmas verificables según necesidad, separación de auditor técnico y owner de datos.
- **Observabilidad:** del **pipeline de Elaris** (jobs, transfer, errores), no reemplazo de OEM fleet monitoring.

**Persistencia sugerida como candidata**: DB transaccional para metadatos + object store cifrado para raw + almacén orientado a columnas para series/agregados cuando el volumen lo justifique. No migrar hoy SQLite por ideología; decidir cuando la carga y el cliente lo exijan.

## 9. Seguridad, control de evidencia y trazabilidad

- `SENSITIVE/NOT_APPROVED` es prohibición de export al público, incluso si el dato fue «resumido» o «anonimizado» sin decisión de titular.
- Distinguir **original evidence**, **working derivative**, **analysis result**, **approved excerpt**, **simulation**, **human-confirmed annotation** y **model inference**.
- Hashes no sustituyen firmas, acuerdos, access control, data classification, legal ownership ni proof-of-plaintext-equivalence.
- Cambiar copy/UI para que no invente aprobaciones, diagnósticos, inspecciones pasadas, horas de robot, errores OEM o reemplazos.
- Acceso por tenant y finalidad; mínimo privilegio; evidencia en repositorios privados/autorizados; secrets fuera de Git y de chat.
- Retención/expurgo contractual, derecho del sitio a revocar, auditoría de export por receptor y propósito.
- Si un source ya apareció en git público, tratarlo como incidente de exposición a evaluar, no asumir que borrarlo en el último commit elimina clones previos.

## 10. Modelo comercial ideal

**Entrada:** `Field Evidence Audit` de una sesión/robot (precio piloto USD 350 como hipótesis, no tarifa final validada).
**Continuidad:** `Recurring Field Evidence` para la misma configuración/robot, bajo sesiones comparables, revisión por ingeniero y outputs trazables.
**Escala:** cuentas por organización/familia, cobro por auditoría/robot/sesión/volumen/export y servicios de integración según valor y costo real.
**Extensión:** evidencia reutilizada por Deployment Control, Acceptance, mantenimiento, safety, incidentes y socios con permisos; la misma captura no debe facturarse como datos irreconciliables.

Indicadores comerciales:
- horas del usuario ahorradas por reconstrucción;
- tiempo de generación y revisión por audit;
- costo de integración por OEM;
- porcentaje de señales útiles con contexto;
- aceptación/repetición del reporte;
- tasa de cierre de piloto pago y disposición a renovar;
- margen por sesión y soporte.

## 11. Ideal ≠ backlog actual

La visión corresponde a un producto que **puede** llegar a tener historial multirobot y modelos validados; sus tres condiciones son: evidencia y permisos, workflow repetido y disposición a pagar.

El roadmap ejecutable está en [roadmap.md](roadmap.md). Ningún equipo debería implementar la visión entera mientras la validación comercial de la oferta inicial esté pendiente.
