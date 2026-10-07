# Registro de versiones y aprobaciones — Component Health

**SOURCE OF TRUTH para estado de versiones.** Este archivo gobierna el estado del producto; el [roadmap](roadmap.md) expone el plan y [execution-backlog.md](execution-backlog.md) registra tareas.
**Estado del propio registro:** `DRAFT — PENDIENTE DE REVISION DE LOS SOCIOS`.
**Actualización:** cambios exclusivamente por PR en GitHub, con diff, evidencias y revisor humano identificado. Ningún agente se concede permisos de aprobación.

## 1. Máquina de estados

```text
IDEA → DRAFT → APPROVED_FOR_IMPLEMENTATION → IN_PROGRESS
                                          ↓
                                    IMPLEMENTED
                                          ↓
                                VERIFIED_LOCAL
                                          ↓
                                    REVIEW_READY
                                          ↓
                               APPROVED_BY_OWNER
                                          ↓
                                   RELEASED
```

Transiciones alternativas: `BLOCKED`, `DEFERRED`, `REJECTED`, `CANCELLED`, `SUPERSEDED`, `DEPRECATED_LEGACY`, `RESEARCH_ONLY`. `VISION` describe destino, no desarrollo autorizado.

**No confundir:**
- `DRAFT`: especificación en borrador.
- `APPROVED_FOR_IMPLEMENTATION`: el socio aceptó **hacer** el alcance, no su producto terminado.
- `IMPLEMENTED`: código subido, no necesariamente probado.
- `VERIFIED_LOCAL`: tests, build y aceptación declarada con pruebas de operador.
- `APPROVED_BY_OWNER`: aprobación explícita de alcance/entrega registrada por humano (no equivalente a data export).
- `RELEASED`: versión distribuida/controlada y soportada al público o clientes, con gates de seguridad/rights cumplidos.

## 2. Estados independientes obligatorios

**Estado del producto** y **estado de la evidencia/datos** no son lo mismo. Cada versión tiene como mínimo:

| Dimensión | Valores admisibles / política |
|---|---|
| Product maturity | estados de §1 |
| Technical checks | `NOT_RUN`, `PARTIAL`, `PASS`, `FAIL` + commit |
| Data classification | `PUBLIC`, `INTERNAL`, `SENSITIVE`, `RESTRICTED` |
| Data export approval | `NOT_APPROVED`, `REVIEW_PENDING`, `APPROVED_FOR_EXPLICIT_SCOPE`, `REVOKED` |
| Commercial status | `UNTESTED`, `DISCOVERY`, `PILOT_REQUESTED`, `PAID_PILOT`, `REPEATABLE` |
| Human scope approval | nombre, fecha UTC, PR/decisión, condiciones; vacío = **NO APROBADO** |
| Release authorization | destinatario/canal/dataset, derechos/ACL; vacío = **NO PUBLICABLE** |

La aprobación para exportar un extracto no convierte el capture fuente en `PUBLIC` ni autoriza automáticamente futuros extractos.

## 3. Registro de versiones (snapshot inicial de auditoría)

| Version | Tipo/objetivo | Estado producto | Chequeos técnicos | Data export | Comercial | PR o referencia | Owner approved |
|---|---|---|---|---|---|---|---|
| V0-hypothesis | Demo Humandroid sintética | `DEPRECATED_LEGACY` | historia demostrativa | no aplica a material sintético | UNTESTED | PR #1 viejo; docs piloto | no registrado |
| V0.1-baseline | Datos reales Dataset #001; baseline observado | `VERIFIED_LOCAL` limitado | tests 2/2 + baseline real reportado | **NOT_APPROVED** | UNTESTED | PR #12 draft | no registrado |
| V0.1-field-evidence | Dataset #002 OPEN salvage y Field Evidence | `VERIFIED_LOCAL` limitado | tests 3/3; reporte real ejecutado y hash local | **NOT_APPROVED** | UNTESTED | PR #13 draft | no registrado |
| V0.2 | Demo real-data-derived Component Health | `VERIFIED_LOCAL` | 5/5 tests, typecheck/build PASS y UI HTTP 200 en commit `41a8cce` | **NOT_APPROVED** | UNTESTED | PR #14 draft | no registrado |
| **V0.2.1** | Correcciones de integridad, metadata, legacy y E2E | **`VERIFIED_LOCAL`** | **PASS informado por operador: typecheck, 8/8 tests, build 52/52, E2E 1/1 y Dataset #002 real rerun con provenance separada; output sellado SHA-256** | **NOT_APPROVED** | UNTESTED | PR #15 draft | no registrado |
| V0.3 | Evidence Engine reproducible | **`VERIFIED_LOCAL`** | **PASS informado por operador: typecheck, 14/14 tests, build 52/52, Dataset #002 2× determinista, 8×29 slots, SHA-256 OK; benchmark ~514–521 MB RSS / 1:32–1:40** | **NOT_APPROVED** | DISCOVERY | PR #17 draft · CH-030… | Implementación: Alexi; release/owner approval: no registrado |
| V0.4 | Audit Workbench privado sobre artifacts V0.3; persistencia/notas todavía parciales | **`IN_PROGRESS`** (implementación autorizada por Alexi, 2026-10-07) | NOT_RUN sobre PR #18 | **NOT_APPROVED** | DISCOVERY | PR #18 draft · CH-040… | Implementación: Alexi; release/owner approval: no registrado |
| V0.5 | Human-approved export / client delivery | `DRAFT` | NOT_RUN | NOT_APPROVED | DISCOVERY | CH-050… | — |
| V0.6 | Comparación longitudinal controlada | `PROPOSED` | NOT_RUN | NOT_APPROVED | DISCOVERY | CH-060… | — |
| V0.7 | Operación repetible de auditorías | `PROPOSED` | NOT_RUN | NOT_APPROVED | DISCOVERY | CH-070… | — |
| V0.8 | Findings/Review/Service outcome reales | `PROPOSED` | NOT_RUN | NOT_APPROVED | DISCOVERY | CH-080… | — |
| V0.9 | Partner security/multi-organization | `PROPOSED` | NOT_RUN | NOT_APPROVED | DISCOVERY | CH-090… | — |
| V1.0 | Paid Field Evidence Audit repetible | `VISION` | NOT_RUN | NOT_APPROVED | UNTESTED | gate comercial | — |
| V1.5 | Segundo robot/OEM real | `VISION` | NOT_RUN | NOT_APPROVED | UNTESTED | segundo robot | — |
| V2.0 | Evidence + Engineering Decision Operations | `VISION` | NOT_RUN | NOT_APPROVED | UNTESTED | case outcomes | — |
| V2.5 | Cohortes/fleet reliability evidence | `VISION` | NOT_RUN | NOT_APPROVED | UNTESTED | cohorts reales | — |
| V3.0 | Modelos predictivos sólo con validación | `RESEARCH_ONLY` | NOT_RUN | NOT_APPROVED | UNTESTED | modelo etiquetado | — |

### Aclaraciones de snapshot

El PASS de V0.2 **no** implica PASS para commits posteriores de PR #15. Para V0.2.1 el operador informó typecheck PASS, 8/8 tests, build PASS (52/52 páginas), E2E Playwright 1/1 y regeneración real de Dataset #002 con source/derivative hash registries separados. El reporte conservó `OPEN`, informó `DERIVATIVE_SHA256_REGISTRY`, `SOURCE_SALVAGE_SHA256_REGISTRY`, `REKEYED_DERIVATIVE`, `NOT_INDEPENDENTLY_VERIFIED`, `RECOVERY_IDLE.observedTelemetryEnd=2026-10-06T15:45:55.399Z` y máxima cobertura `1`. Los artefactos fueron sellados localmente con SHA-256. Por eso el estado técnico pasa a **VERIFIED_LOCAL**. Los resultados provienen del operador, no de CI independiente; exportación y owner approval siguen separados.

Los datos originales y derivados de la sesión de campo siguen con **clasificación sensible** y **aprobación de export pendiente**. El repo de trabajo es público; requiere decisión formal sobre agregados derivados ya incluidos. Publicar un repo público no constituye consentimiento institucional.

## 4. Ficha obligatoria de aprobación de versión (copiar en PR)

```yaml
version: "V0.X"
scope_pr: "https://github.com/AlexiVion/Elaris-/pull/NN"
head_sha: ""
scope_status: "REVIEW_READY"
technical:
  status: "NOT_RUN"
  commands: []
  evidence: []
data:
  classification: "SENSITIVE"
  export_status: "NOT_APPROVED"
  data_owner: "UNCONFIRMED"
  recipient_scope: []
  authorization_reference: null
commercial:
  status: "UNTESTED"
  customer_signal_reference: null
decision:
  implementation_approved_by: null
  implementation_approved_at_utc: null
  release_approved_by: null
  release_approved_at_utc: null
  release_reference: null
  conditions: []
  next_review_date_utc: null
```

Aprobación humana exige firma/conformidad visible en PR o registro de decisión con identidad y UTC. Si el revisor sólo comenta «bien» sin aceptar el alcance, registrar `REVIEWED`, no `APPROVED_BY_OWNER`. El titular de los datos puede ser **distinto** del titular del repositorio.

## 5. Ritual GitHub para estados

1. Abrir PR de versión con checklist, pruebas y alcance acotado; **draft** mientras falta evidencia.
2. Ejecutar validaciones contra el SHA del PR, adjuntar stdout/capturas y hashes de artefactos **no sensibles**.
3. Obtener revisión técnica del otro socio; resolver findings.
4. Si afecta datos de terceros, obtener autorización externa por dataset/extracto/destinatario antes de marcar export `APPROVED_FOR_EXPLICIT_SCOPE`.
5. Registrar decisión en [decision-log.md](decision-log.md) y cambiar una sola fila aquí mediante PR.
6. Merge sólo respetando cadena de dependencias. Rama mergeada ≠ datos autorizados para publicación.
7. Luego de release, anotar versión inmutable, soporte/migración y rollback/retención.
8. Si no hay permisos GitHub Issues, usar [execution-backlog.md](execution-backlog.md) como backlog canónico provisional; migrarlo a Issues sin pérdida de IDs cuando esté habilitado.

## 6. Quién puede aprobar

**Propuesta pendiente de ratificación:** Alexi — ingeniería/evidencia/producto; Juanma — revisión de alcance e integración canónica; titular/operador autorizado del robot — liberación de datos y de cualquier claim público. Para release a terceros se precisan **dos aprobaciones diferentes**: producto y datos. El revisor responsable debe figurar en cada entrada.

### Registro de aprobaciones

| Decisión | Versión | Persona | Fecha UTC | Referencia | Condiciones |
|---|---|---|---|---|---|
| Ninguna registrada todavía | — | — | — | — | No inferir aprobación por tests o por push |


### Evidencia V0.3 — 2026-10-07

El operador ejecutó Dataset #002 dos veces con inputs idénticos sobre PR #17. Ambos runs produjeron el mismo `analysisId=CH-A03-5D9D0A2922AD460F245F`, mismo `inputFingerprint`, artefactos byte-identical, checksums válidos, 8 fases × 29 slots, `maxCoverage=1`, provenance source/derivative separada para observed y baseline, y Recovery Idle con último dato observado `2026-10-06T15:45:55.399Z`. Benchmark local: 520552 KB / 1:39.78 y 513852 KB / 1:31.61. `VERIFIED_LOCAL` no cambia `NOT_APPROVED` de export ni constituye aprobación humana de release.
