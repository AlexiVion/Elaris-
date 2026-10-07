# Component Health — Field Evidence Report V0

> **NOTA DE VIGENCIA:** este documento registra la implementación original V0. Para analizar una derivada recifrada después del cierre V0.2.1 es obligatorio distinguir el hash registry del capture **original** del registry de la **derivada**. No reutilizar `--salvage-hashes` con checksums de la derivada como si verificasen la fuente. Ver [cierre V0.2.1](component-health/v0.2.1-closeout.md), [auditoría](component-health/audit-2026-10-06.md) y [registro de estados](component-health/version-registry.md). En V0.2.1 el código aún requiere revalidación local.

## 1. Producto vendible

Elaris Component Health — Field Evidence Report V0 convierte una captura read-only de un robot físico en un paquete de evidencia técnica reproducible por componente y por fase operacional.

No se vende como predictive maintenance.

Se vende como:

> baseline + evidencia operacional + comparación de comportamiento + trazabilidad

El producto responde preguntas concretas:

- qué componentes fueron observados;
- qué señales son realmente informativas;
- cómo cambia cada componente entre baseline y una fase operacional;
- qué torque, velocidad, temperatura, voltaje y state codes se observaron;
- si aparecieron códigos de estado nuevos;
- qué datos tienen problemas de calidad;
- si un tercero puede reproducir exactamente el análisis;
- qué parte de la evidencia es OBSERVED y qué parte depende de contexto HUMAN_CONFIRMED.

## 2. Cliente inicial

El primer ICP no es el fabricante OEM. Es:

- integrador de robots;
- laboratorio o universidad con robots físicos;
- operador de flota pequeña;
- empresa que está evaluando robots;
- equipo de mantenimiento o safety que necesita evidencia antes y después de pruebas.

## 3. Entregable comercial V0

Por robot / sesión:

1. captura read-only cifrada;
2. inventario de componentes observados;
3. baseline por componente;
4. segmentación de fases;
5. comparación baseline → fase;
6. torque / velocity / temperature / voltage distributions;
7. state-code observations;
8. data-quality warnings;
9. provenance + SHA-256;
10. reporte Markdown/JSON reproducible;
11. revisión técnica humana de hallazgos.

El reporte no declara HEALTHY / UNHEALTHY, failure probability, RUL, safety certification ni OEM compliance sin reglas y evidencia calibradas adicionales.

## 4. Flujo técnico

~~~text
Robot
  ↓
Read-only telemetry
  ↓
Encrypted Capture
  ↓
Integrity verification
  ↓
Component baseline
  ↓
Human-confirmed phase manifest
  ↓
Per-phase telemetry statistics
  ↓
Baseline ↔ phase comparisons
  ↓
Field Evidence Pack
~~~

Evidence semantics:

~~~text
OBSERVED
  telemetry derivada directamente del robot

HUMAN_CONFIRMED
  contexto de operación / límites de fase confirmados por operador

DESCRIPTIVE_COMPARISON
  comparación estadística sin umbral de diagnosis
~~~

## 5. Dataset real de validación

Dataset #001:

~~~text
CAP-20261006-C7A52F
FINALIZED
1,031 frames
248,471 normalized events
~~~

Se usa como baseline histórico real.

Dataset #002:

~~~text
CAP-20261006-3A6982
OPEN
SALVAGED PARTIAL CAPTURE / INTEGRITY VERIFIED
15,000 frames
3,615,000 normalized events
~~~

Contiene fases reales de idle baseline, waist yaw, left shoulder roll, left shoulder pitch, forward/back locomotion, turning, mixed operation y recovery idle.

Dataset #002 permanece OPEN; Elaris no lo reescribe como FINALIZED. Para poder analizarlo, Field Evidence V0 exige el registro SHA-256 de salvage.

## 6. Seguridad / fail-closed

Una captura OPEN sólo puede entrar en Field Evidence V0 si existe un salvage SHA-256 registry y todos los archivos requeridos coinciden.

Archivos mínimos verificados:

~~~text
manifest.enc.json
raw.ndjson.enc
session.public.json
telemetry.ndjson.enc
~~~

Si cambia un byte después del salvage:

~~~text
analysis = REJECTED
~~~

El análisis nunca altera los captures originales.

## 7. Phase Manifest

Contrato V0:

~~~json
{
  "version": 1,
  "sessionId": "CAP-...",
  "contextEvidenceClass": "HUMAN_CONFIRMED",
  "phases": [
    {
      "id": "PHASE_ID",
      "label": "Human readable phase",
      "start": "ISO-8601",
      "end": "ISO-8601"
    }
  ]
}
~~~

Reglas:

- phase IDs únicos;
- ventanas no superpuestas;
- timestamps válidos;
- start < end;
- sessionId debe coincidir con el capture;
- contexto separado explícitamente de telemetría OBSERVED.

Manifest real del piloto:

~~~text
docs/pilots/siglo21/evidence/2026-10-06-dataset-002-phase-manifest.json
~~~

## 8. Comando de producto V0

~~~bash
pnpm edge health-report   <baseline-dir>   <observed-session-dir>   --phases <phase-manifest.json>   --salvage-hashes <sha256.txt>   --out <derived-output-dir>
~~~

Para Dataset #002:

~~~bash
pnpm edge health-report   /path/to/CAP-20261006-C7A52F   /path/to/CAP-20261006-3A6982   --phases docs/pilots/siglo21/evidence/2026-10-06-dataset-002-phase-manifest.json   --salvage-hashes /path/to/CAP-20261006-3A6982-salvage-meta/sha256.txt   --out /path/to/derived/CAP-20261006-3A6982-field-evidence-v0
~~~

Requiere localmente ELARIS_EDGE_PASSPHRASE. La passphrase no se incluye en reportes ni Git.

## 9. Outputs

~~~text
<out>/
├── field-evidence-report.json
├── field-evidence-report.md
└── phase-manifest.json
~~~

El JSON es la fuente estructurada para UI, dashboards, futuras reglas, audit, machine processing y Evidence Pack.

El Markdown es el reporte legible para integrador, maintenance engineer, safety, buyer y piloto comercial.

Incluye por fase:

- frame coverage;
- joint numeric event count;
- componentes observados;
- torque absP95 baseline → phase;
- velocity absP95 baseline → phase;
- winding temperature mean baseline → phase;
- voltage mean baseline → phase;
- nuevos state codes.

## 10. Comparaciones V0

Para cada señal comparable:

~~~text
baseline mean
observed mean
mean delta
mean delta %
baseline p95
observed p95
p95 delta
baseline absP95
observed absP95
absP95 delta
absP95 ratio
baseline range
observed range
range delta
quality before / after
~~~

Estas métricas son descriptivas. No existe todavía un umbral que convierta automáticamente una diferencia en fallo o riesgo.

## 11. Acceptance criteria

V0 está listo para demo comercial cuando:

- [x] Dataset #001 baseline analyzer existe;
- [x] Dataset #001 real validado;
- [x] Dataset #002 preservado con hashes;
- [x] canonical phase manifest existe;
- [x] OPEN capture requiere salvage hashes;
- [x] integridad falla cerrado si cambia un archivo;
- [x] analyzer segmenta por timestamp;
- [x] analyzer compara baseline ↔ phase;
- [x] genera JSON;
- [x] genera Markdown;
- [x] CLI health-report existe;
- [ ] TypeScript typecheck PASS en branch;
- [ ] field-evidence tests PASS;
- [ ] ejecución real sobre Dataset #002 PASS;
- [ ] reporte real revisado;
- [ ] versión cliente sanitizada/exportable definida.

## 12. Qué falta para vender

El gap restante es pequeño y concreto:

~~~text
1. correr tests
2. correr health-report sobre Dataset #002 real
3. revisar resultados
4. seleccionar hallazgos presentables
5. crear template comercial PDF / web
6. fijar protocolo de captura para próximo cliente
7. definir precio piloto
~~~

No hace falta construir una plataforma completa antes de vender.

## 13. Oferta comercial inicial propuesta

### Component Health Field Audit — Pilot

Qué hacemos:

- sesión read-only con el robot;
- captura de baseline;
- uno o varios escenarios operativos;
- análisis por componente;
- Field Evidence Report;
- revisión técnica;
- recomendaciones de qué monitorear/repetir.

Qué recibe el cliente:

~~~text
Component inventory
+
Baseline evidence
+
Operational phase comparison
+
Data-quality findings
+
Traceable evidence pack
+
Engineering review
~~~

Valor: el cliente obtiene una fotografía técnica reproducible del comportamiento del robot sin reemplazar su controlador ni depender de una integración de mando.

## 14. Evolución después de V0

Sólo después de tener sesiones repetidas:

~~~text
session A
+
session B
+
maintenance outcomes
+
known faults
+
validated context
↓
trend rules
↓
anomaly rules
↓
component degradation evidence
↓
predictive claims only if calibrated
~~~

La tesis comercial inmediata no necesita esperar esa etapa.

**V0 vende evidencia real y comparación operacional.**
