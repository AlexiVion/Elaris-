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

## Registro histórico

| Fecha UTC | ID | Cambio | Autor | Aprobación | Evidencia |
|---|---|---|---|---|---|
| 2026-10-06 | Inicio del registro | Decisiones y gates propuestos, ninguno ratificado aquí | Auditoría Elaris | PENDIENTE | Este PR |

**Editar al tomar una decisión:** copiar template, completar aprobador, fecha y referencia PR/comentario; actualizar el estado correspondiente en [version-registry.md](version-registry.md). No reemplazar silenciosamente la historia: añadir nueva decisión que supersede la anterior.
