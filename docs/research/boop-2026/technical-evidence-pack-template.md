# Plantilla de entregable — Elaris Physical AI Technical Evidence Pack (V0)
**Estado:** `TEMPLATE_DRAFT_NOT_CLIENT_VALIDATED`. Uso interno de preparación, nunca copia de informe de Boop o demostración de underwriting.

## Portada y metadatos
- Expediente: `ELARIS-TECH-YYYY-NNN` (solo tras abrir trabajo).
- Cliente contratante, propietario de evidencia, responsable técnico revisor.
- Sujeto: robot/sistema/configuración/contexto; tipos de evidencia autorizados.
- Versión y fecha UTC; período de observación; jurisdicción; finalidad.
- Estado: `DRAFT` / `TECHNICALLY_REVIEWED` / `CLIENT_FACTS_CONFIRMED`.
- Autoridad: «Elaris documenta información técnica recibida y observaciones con su procedencia; no certifica seguridad ni recomienda coberturas».

## Tabla 1 — Inventario del sistema
| Campo | Valor | Estado | Fuente | Fecha/versión | Confirmó |
|---|---|---|---|---|---|
| Fabricante/modelo | UNKNOWN | UNKNOWN | — | — | — |
| Unidad/serial | UNKNOWN | UNKNOWN | — | — | — |
| Propietario/proveedor | UNKNOWN | UNKNOWN | — | — | — |
| Host / sitio | UNKNOWN | UNKNOWN | — | — | — |
| Operador | UNKNOWN | UNKNOWN | — | — | — |
| Tarea/actividad | UNKNOWN | UNKNOWN | — | — | — |
| Entorno/zonas | UNKNOWN | UNKNOWN | — | — | — |
| Personas en exposición | UNKNOWN | UNKNOWN | — | — | — |
| Modos operativos/teleop | UNKNOWN | UNKNOWN | — | — | — |

## Tabla 2 — Configuración/versiones
`robot/component/software/firmware/model_version/value/source/valid_from/valid_to/observed_at/status`. Cada ítem sujeto a una fuente. No sustituir checksum de control de seguridad por hash de archivo Elaris.

## Tabla 3 — Evidencias
`evidence_id / artifact_title / provided_by / type / target / valid_date / hash_if_available / observed_or_provided / allowed_recipient / review_status`. Las evidencias no proporcionadas se marcan missing; no inferir test PASS de un nombre de archivo.

## Tabla 4 — Preguntas y faltantes
`question / rationale / expected_source / received? / validation_owner / priority / status / impact_on_review`. Las prioridades reflejan revisión documental, no severidad actuarial ni requisito normativo universal.

## Tabla 5 — Cambios (opcional)
Comparación únicamente si baseline inicial y final comparten sujeto y fuentes verificadas:
`field / before / after / technical_context / potential_dependents / review_suggested / responsible_human`.
Etiquetas: `NO_DIFF`, `DIFF_OBSERVED`, `UNCERTAIN`, `REVIEW_SUGGESTED`; no `SAFE` o `COVERED`.

## Tabla 6 — Preguntas para suscriptor/broker autorizado
Campos técnicos no contestados, formatos solicitados y artefactos esperados; el propio profesional define condiciones de cobertura y criterios de decisión.

## Anexos obligatorios
1. Índice de fuentes y titularidad.
2. Alcance, permisos, destinatarios.
3. Método de extracción/revisión y límites instrumentales.
4. Separación `OBSERVED`/`PROVIDED`/`INFERRED`/`SIMULATED`/`UNKNOWN`.
5. Registro de discrepancias y correcciones.
6. Firma de revisión **técnica/documental**; no firma de conformidad normativa.
7. Fecha y versión de la entrega, procedimiento de rectificación.

## Criterios de aceptación del MVP del informe
- Toda afirmación factual lleva a fuente, fecha o explícito UNKNOWN.
- Datos privados fuera de demo; demo tiene watermark SYNTHETIC.
- Revisor humano puede corregir; no se inventan serial, tests, riesgos, tareas o aprobaciones.
- Con 10 documentos y 1 robot, se puede reconstruir manualmente lo producido.
- Producto final reproducible en PDF y planilla sin VPS ni SaaS.
- Firma/aceptación del cliente no reemplaza decisión de organismo/aseguradora.
