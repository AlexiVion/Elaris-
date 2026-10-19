# Elaris — Definición comercial propuesta: Component Health Field Evidence Audit V0.1

**Fecha:** 2026-10-19  
**Estado:** PROPUESTA INTERNA / NO APROBADA PARA VENTA NI DIFUSIÓN DE EVIDENCIA REAL  
**Objeto:** definir QUÉ comprará el cliente y QUÉ debe decir el primer informe real, separando evidencia técnica, revisión humana, autorizaciones y validación comercial.  
**Caso de referencia (privado):** sesión Unitree G1 de Siglo 21 del 2026-10-06. Los resultados y datos reales siguen sujetos a restricciones del dueño de datos.

## Decisión propuesta

**Primera oferta a validar:** **Elaris Component Health — Field Evidence Audit** (auditoría descriptiva de evidencia operacional por componentes).

**Cliente inicial:** integradores de robótica, laboratorios de robótica, equipos de puesta en marcha y operadores de flotas pequeñas con acceso legítimo a un robot/sesión.

**Trabajo por resolver:** después de una sesión de operación o aceptación, estos equipos necesitan contestar con evidencia trazable: **qué fue observado realmente en cada componente durante cada actividad, qué información permite comparar la sesión consigo misma y qué observaciones requieren repetición, contexto u opinión OEM**.

**Promesa estricta y verificable:** entregar un registro de observaciones instrumentales por fase y componente, con calidad de datos, fuentes y límites; dar una lista concreta de preguntas/acciones para la siguiente evaluación técnica. **No** establecer salud del robot, severidad de falla, vida remanente, seguridad ni cumplimiento.

**Producto entregado, no plataforma SaaS:** PDF descriptivo revisado + anexo tabular/export estructurado y manifiesto de integridad; archivos permitidos únicamente según contrato, clasificación y destinatario. Captura/adquisición read-only, cuando esté autorizada y sea viable; no control remoto.

### Servicio piloto — alcance a validar (hipótesis comercial existente)

- 1 robot / 1 sesión controlada / hasta 6 escenarios operacionales acordados (más reposo o recuperación si se necesitan).
- Captura exclusivamente por lectura de los canales autorizados y disponibles; alternativa: análisis offline de captura válida aportada bajo derechos explícitos.
- Descripción por fase de posición, velocidad, estimación de torque, temperaturas, tensión y códigos de estado **sólo según disponibilidad y semántica confirmada**; si unidades o enums no están confirmados, se etiquetan como no interpretados.
- Comparación de la misma sesión frente a la fase de reposo confirmada, no frente a un umbral OEM ni a una referencia de máquina sana.
- Entrega objetivo: hasta 48 horas **después de captura exitosa, insumos completos y revisión técnica** (hipótesis a medir).
- Precio de prueba documentado: **USD 350 / piloto**, no precio de mercado confirmado ni presupuesto final.

### Estructura del informe para poder vender el RESULTADO

1. **Portada y objetivo.** Robot/sesión con identificadores permitidos; destinatario autorizado, propósito, versión, clasificación, estatus de revisión.
2. **Resumen ejecutivo accionable (1–2 páginas).** Qué actividades fueron cubiertas; qué señales existieron; tres categorías: «observado y trazable», «insuficiente/no concluyente», «requiere nueva verificación». Máximo 3–5 próximos pasos concretos, nunca una nota global de salud.
3. **Alcance y método.** Robot y configuración conocida/desconocida, canal, frecuencia de captura, timestamps, fase idle, marcadores humanos, read-only, límites de instrumento y línea de procedencia.
4. **Cronología operacional.** Tabla y visual de fases con inicio/fin declarados frente al periodo realmente observado. Señalar interrupciones, salvages y periodos sin datos.
5. **Matriz componente × fase.** Para cada componente observable: cobertura, disponibilidad de posición/velocidad/torque estimado y otras señales, clasificación OBSERVED/UNRESOLVED/NOT_OBSERVED, sin tratar ceros como prueba de ausencia ni de buen funcionamiento.
6. **Comparación descriptiva con reposo.** Resumen de variaciones/indicadores observados bajo la tarea, con métricas y unidades sólo cuando estén justificadas; nunca PASS/FAIL por magnitud de torque sin referencia validada.
7. **Hallazgos interpretados con límites.** Grupo A: respuesta instrumental observada; grupo B: limitación de captura/calidad; grupo C: semántica OEM pendiente; grupo D: observación operativa no atribuida. Cada hallazgo incluye evidencia, fase, componente, incertidumbre, interpretación permitida y siguiente verificación.
8. **Conclusiones técnicas permitidas.** Lo demostrado por esta sesión, lo que no demuestra y aquello que exige hardware/OEM u observaciones repetidas. Separar hechos medidos, contexto declarado y derivaciones del motor.
9. **Plan de siguiente verificación.** Pregunta concreta, razón, responsable humano, método autorizado y criterio de éxito observable. Ejemplo: discriminar wrist yaw bajo movimiento supervisado, o estudiar continuidad de timestamps.
10. **Anexo de evidencia y trazabilidad.** Identificadores/capturas de fuente sólo cuando autorizados, checksums o referencias restringidas, versiones de análisis, registro de revisión, correcciones y límites de licencia/compartición.

### Qué puede ilustrar hoy el caso G1 sin exceder las fuentes publicadas

- Se documentó una captura real inicial y una segunda captura multietapa salvada con integridad verificada; la segunda **no** debe describirse como FINALIZED.
- La salida privada V0.3 fue verificada con checksum, con fases marcadas por humano y referencia idle de la misma sesión; dos ejecuciones reproducidas del mismo análisis **no equivalen a dos robots**.
- Hay dudas conocidas sobre una señal de wrist yaw, timestamps duplicados, límites observados de fase y semántica de ciertos códigos y valores. Estas dudas **no** equivalen a defectos de componentes.
- El número de registros de calidad no es un conteo de fallas.
- Los valores/métricas exactas del informe real, sus gráficos y las observaciones sensibles requieren revisión dentro del entorno privado, no reescritura desde el índice público.
- Un código de ejecución registrado durante operaciones controladas debe permanecer «anomalía no atribuida» hasta validación OEM; no convertirlo automáticamente en diagnóstico de motor ni incidente de seguridad.

### Lo que se vende y lo que NO

**Se vende:** preparación y entrega documentada de evidencia operacional reproducible; inventario objetivo de información disponible/no disponible; reducción del esfuerzo para preparar una revisión técnica **como hipótesis de valor a medir**.

**No se vende:** «el robot está sano», «diagnosticamos X falla», predicción de fallas, vida útil restante, certificación, aprobación de puesta en servicio, score de seguridad, opinión de asegurabilidad o prima de seguro.

**Oferta distinta:** **Physical AI Technical Evidence Pack** para preparación documental de un caso de aseguramiento (precio experimental previo USD 490). Recibe perfil de sistema + documentos/fuentes + preguntas abiertas y **no** nace automáticamente de la telemetría G1. No confundir con el «Physical AI Risk Record» de otra hipótesis comercial ni presentar los tres como un único producto validado.

## Gate de cierre del informe G1 existente (V0.2a → eventual entrega autorizada)

**Hechos registrados al 2026-10-09** en `docs/research/boop-2026/g1-field-evidence-bridge-v02.md`:
- `inspect` sobre dos salidas privadas de V0.3: PASS, análisis determinístico e integridad de archivos verificados.
- Se generó un **primer PDF privado real** en WSL: `REAL_G1_DRAFT_GENERATION_PASS`.
- La metadata del registro interno de autorización aceptó campos insuficientes: **requiere rehacerla con hechos auténticos y verificables**.
- La corrección fail-closed de validación y sus tests posteriores estaban pendientes de gate local en el último registro.
- El PDF **no** tenía revisión visual/técnica final documentada.
- Export/difusión comercial **NOT_APPROVED**. La autorización referida por el operador cubre análisis interno, no terceros.

**Secuencia de cierre, sin tocar datos privados en GitHub:**

1. Actualizar el worktree existente de `feat/evidence-pack-g1-field-draft-v02` y correr **un único gate focalizado** de pruebas del bridge, sin reinstalaciones redundantes ni suites generales.
2. Verificar en privado la legitimidad y alcance del permiso ya otorgado; registrar identidad, rol, fecha, medio y referencia auténticos. Si falta alcance para otra persona o institución, no suponerlo. Asociar autorización de **uso interno** al SHA de entrada correcto.
3. Regenerar el borrador en un directorio privado nuevo usando el script preparado; conservar el borrador anterior como superseded/unreviewed.
4. Revisar visual y técnicamente el PDF completo: páginas, unidades, fases, valores derivados y etiquetas de incertidumbre, sin equiparar data-quality finding con avería.
5. Transformar el reporte-resumen en el informe de diez secciones de arriba; diferenciar cada frase entre OBSERVED, HUMAN_DECLARED, DERIVED, UNKNOWN y REVIEW_PENDING, con fuente.
6. Solicitar al titular, separadamente, **aprobación expresa de versión y destinatarios para compartir** un extracto sanitizado o un informe cliente. Registro real y review humano; no basta `AUTORIZO` local ni la autorización de uso interno.
7. Entregar sólo la versión autorizada; preservar manifest, edición, destinatario y registro de entrega. Hasta ese momento mantener estatus `PRIVATE_INTERNAL_DRAFT_NOT_APPROVED_FOR_EXPORT`.

**Criterio de cierre técnico interno:** documento legible y trazable, afirmaciones sustentadas, semántica revisada, incertidumbres abiertas explícitas, reviewer identificado, aprobación interna auténtica. Puede cerrarse internamente **sin resolver todas las dudas técnicas**, si el informe muestra qué datos harían falta.

**Criterio de cierre comercial:** además, autorización escrita por destinatario/version, informe sanitizado, aceptación explícita de alcance de un comprador y condiciones de entrega. **Un caso real no acredita por sí solo demanda pagada.**

## Decisión siguiente para Alexi + Juanma

Usar un solo SKU como hipótesis inicial: **Field Evidence Audit** para integrador/laboratorio con presupuesto de commissioning/QA. Juanma valida dolor, comprador y entrega; Alexi cierra el documento técnico y mide horas. El paquete para broker/seguro es posible extensión **solo si el broker confirma que ese formato responde a preguntas reales**.

**Fuentes canónicas (no duplicar datos privados):**
- `docs/pilots/siglo21/evidence/2026-10-06-unitree-g1-field-session.md`
- `docs/product/component-health/v0.3-evidence-engine.md`
- `docs/product/component-health/v0.4.2-technical-semantics.md`
- `docs/product/component-health-field-audit-pilot.md`
- `docs/research/boop-2026/g1-field-evidence-bridge-v02.md`
- `docs/research/boop-2026/technical-evidence-pack-template.md`

Este documento propone un contrato de producto; **no certifica resultados del G1 ni modifica el estado de autorizaciones**.
