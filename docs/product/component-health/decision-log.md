# Decision Log — Component Health

**Estado:** `DRAFT`.
El propósito es distinguir **hechos verificados**, **propuestas**, **decisiones tomadas por personas** y **cuestiones sin resolver**. Ninguna decisión aquí escrita se presume aprobada por el solo hecho de estar en GitHub.

## Formato de decisión

```yaml
decision_id: CH-DEC-YYYYMMDD-NN
date_utc: null
decision: "GO | MODIFY | PAUSE | REJECT | APPROVE | RELEASE | REVOKE"
subject: ""
version: ""
proposed_by: ""
approved_by: null
evidence_refs: []
alternatives_considered: []
data_classification: "SENSITIVE"
data_export_status: "NOT_APPROVED"
rationale: ""
conditions: []
review_date_utc: null
related_prs: []
```

## Inventario de decisiones pendientes y recomendaciones

### CH-DEC-20261006-01 — ¿Cuál es el wedge comercial?

**Estado:** `PROPOSED` (no formalmente aprobado).
**Recomendación:** comenzar con *Component Health — Field Evidence Audit*, evidencia descriptiva por robot/sesión/phase; no predictive maintenance.
**Base:** captura G1 real + analyzer + validation pack + demo V0.2, sin clientes pagos registrados.
**Alternativa:** vender monitor de flota o diagnóstico; rechazar provisionalmente por datos insuficientes.
**Gate de ratificación:** entrevistas/piloto pago; precio USD 350 como hipótesis.
**Aprobado por:** —.

### CH-DEC-20261006-02 — Data export del Unitree G1

**Estado:** `PAUSE / APPROVAL_REQUIRED`.
**Recomendación:** detener distribución externa de reportes/agregados reales hasta identificar titular/autorizaciones, finalidad, destinarios y términos. Documentar la exposición previa de agregados en GitHub público sin presuponer derechos.
**Gate:** decisión firmada del owner de datos y revisión de seguridad de la distribución ya realizada.
**Aprobado por:** —.

### CH-DEC-20261006-03 — Origen y copia recifrada

**Estado:** `PROPOSED / VALIDATION_PENDING`.
**Recomendación:** informe con dos verificaciones SHA-256 independientes; plaintext equivalence `NOT_INDEPENDENTLY_VERIFIED` hasta test autorizado; baseline debe tener lineage propia.
**Gate:** PR #15 verde + regeneración real fuente/derivada + audit de report.
**Aprobado por:** —.

### CH-DEC-20261006-04 — Persistencia de Component Health

**Estado:** `DEFERRED`.
**Recomendación:** no añadir 15 tablas ni stack multi-tenant antes de tener contrato de datos/piloto repetido. En V0.4 persistir sólo identidades y runs con workflow confirmado.
**Gate:** motor V0.3 reproducible y campo estable.
**Aprobado por:** —.

### CH-DEC-20261006-05 — Predictive maintenance

**Estado:** `RESEARCH_ONLY`.
**Recomendación:** NO implementar score, RUL o clasificación de fallo sin labels/outcomes comparables, calibración, costes de falsa alarma y validación temporal independiente. Se preserva como opción futura.
**Gate:** datos longitudinales y autoridad de decisión.
**Aprobado por:** —.

### CH-DEC-20261006-06 — Integración de PRs y repo canónico

**Estado:** `PENDING_OWNER_REVIEW`.
**Propuesta:** preservar cadena PR #12 → #13 → #14 → #15 → PR de documentación, revisar y fusionar en orden acordado. Coordinación con Juanma para importación al repo canónico; no afirmar «merged» antes de verificar.
**Gate:** revisión/CI, derechos de datos, permisos y criterios de versión.
**Aprobado por:** —.

### CH-DEC-20261007-07 — Autorización de implementación V0.3

**Estado:** `APPROVED_FOR_IMPLEMENTATION` por Alexi Vion en conversación del proyecto (2026-10-07): «perfecto, implementalo».
**Versión:** V0.3 Evidence Engine reproducible.
**Rama/PR:** `feat/component-health-evidence-engine-v03` · PR #17 (draft).
**Alcance aprobado:** motor reproducible, referencia primaria intra-sesión, 29×fases, lineage baseline+observado, quality y CLI privado.
**Límites:** no aprobación de release, distribución externa, cambios físicos al robot, inferencias diagnósticas, prediction/RUL o integración pública de datasets. Aprobación de Juanma y titular de los datos aún pendientes donde corresponda.
**Gate:** TypeScript, tests, build, 2 ejecuciones Dataset #002 idénticas con trazabilidad completa, revisión de claims y actualización del registro.
**Fecha UTC de decisión:** 2026-10-07 (sin hora UTC firmada en GitHub; solicitud original en conversación).

### CH-DEC-20261007-08 — V0.3 alcanza VERIFIED_LOCAL

**Estado:** `VERIFIED_LOCAL` técnico; no `APPROVED_BY_OWNER` ni `RELEASED`.
**Versión:** V0.3 Evidence Engine.
**Evidencia:** typecheck PASS, 14/14 tests, build PASS, Dataset #002 ejecutado 2× con mismos IDs/artefactos/checksums, 8×29 slots, max coverage 1 y benchmark registrado.
**Performance local:** ~1:32–1:40 por run; máximo RSS ~514–521 MB.
**Riesgos que permanecen:** export `NOT_APPROVED`, semánticas OEM no validadas, plaintext equivalence `NOT_INDEPENDENTLY_VERIFIED`, bounded-memory no implementado.
**Siguiente alcance propuesto:** V0.4 Audit Workbench, todavía requiere aprobación separada para implementación.

## Registro histórico

| Fecha UTC | ID | Cambio | Autor | Aprobación | Evidencia |
|---|---|---|---|---|---|
| 2026-10-06 | Inicio del registro | Decisiones y gates propuestos | Auditoría Elaris | PENDIENTE | Este PR |
| 2026-10-07 | CH-DEC-20261007-07 | Inicio implementación V0.3 Evidence Engine | Alexi Vion | APPROVED_FOR_IMPLEMENTATION (no release ni datos) | PR #17 / solicitud explícita de implementación |
| 2026-10-07 | CH-DEC-20261007-08 | V0.3 alcanza VERIFIED_LOCAL | Evidencia de operador | VERIFIED_LOCAL técnico; no release | PR #17 + doble run Dataset #002 |

**Editar al tomar una decisión:** copiar template, completar aprobador, fecha y referencia PR/comentario; actualizar el estado correspondiente en [version-registry.md](version-registry.md). No reemplazar silenciosamente la historia: añadir nueva decisión que supersede la anterior.
