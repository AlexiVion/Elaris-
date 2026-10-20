# Elaris — Plan maestro de cierre del informe técnico Unitree G1

**Fecha:** 2026-10-19  
**Estado:** PLAN APROBABLE / IMPLEMENTACIÓN POR GATES PENDIENTE  
**Producto:** Component Health / Field Evidence Audit  
**Rama de trabajo:** `feat/evidence-pack-g1-field-draft-v02`  
**PR de integración:** #26 (DRAFT; base `feat/technical-evidence-pack-offline-v0`, **NO** `main`)  
**Fuente real:** paquete V0.3 privado verificado localmente; jamás subirlo ni sus derivados a GitHub.
**Política:** el repositorio `AlexiVion/Elaris-` es PÚBLICO. Ningún dato real ni hash/ID sensible/registro de consentimiento se introduce en commits, issues, logs de CI o comentarios de PR.

## 0. Decisión central

El objetivo **no** es alargar el PDF de tablas ni producir un documento ejecutivo/comercial ahora.

Generar un **informe técnico integral, científico en sus límites y útil para ingeniería**, mediante un pipeline reproducible:

**Paquete V0.3 verificado → validación semántica y calidad → métricas comparativas → hallazgos trazables → revisión humana → volumen principal técnico + anexos completos + manifiesto privado.**

No hay captura nueva ni necesidad de volver a pedir atestaciones durante cada iteración interna. La verificación del permiso de uso y la autorización de compartir versiones son gates **separados**, sin falsificar ni inferir derechos.

### Definición de terminado (dos cierres separados)

**Cierre técnico interno:** fuente y salidas trazables; método y unidades explícitos; hallazgos por subsistema/fase con valores verificables, preguntas pendientes y acciones concretas; anexos exhaustivos; revisión humana de precisión y de diseño; controles de consistencia automatizados; documentación de diferencias no resueltas; archivo privado etiquetado `SENSITIVE / INTERNAL REVIEW / NOT APPROVED FOR EXPORT`.

**Cierre compartible/comercial:** se hace **después**, generando un archivo sanitizado independiente, con revisión legal/técnica y autorización auténtica vinculada a versión, derivados, finalidad y destinatarios. No se presume ninguna autorización por el hecho de generar el PDF.

## 1. Auditoría de situación: qué sí y qué no

- Verificación local del paquete V0.3 ya reportada como PASS; 8 fases, 29 slots por fase, 7 familias de señales, 1.624 filas de cobertura de esquema y registros QA. **Filas no equivalen a mediciones independientes ni a 1.624 señales con semántica OEM validada.**
- Generador V2 ejecutado con pruebas focalizadas 2/2 PASS y salida privada. El PDF V2 tiene ~80 páginas, mayormente tablas; carencia de análisis interpretativo suficiente y escasa navegación.
- `OPEN`/salvaged con integridad de archivos no significa captura `FINALIZED`, equivalencia de plaintext verificada por tercero ni custodia legal certificada.
- Diferencia captura versus asignación a ventanas de fase: investigar denominador usando timestamps y filtros, **no** llamar pérdida o corrupción de datos hasta demostrarlo.
- Calidad: timestamps duplicados, ceros constantes, semántica OEM, fin de fase declarado diferente del observado, slot RightWristYaw sin resolver. Clasificar por **calidad de evidencia**, no «fallas del robot».
- Estadísticas de torque **estimado** comparadas con `IDLE_BASELINE` de la misma sesión. No derivar umbral de alarma, salud, severidad, seguridad, conformidad, vida útil, diagnósticos OEM o predicciones.
- La nueva ampliación de interpretación por subsistemas y gráficas SVG fue escrita en la rama **después** de la V2; hasta ejecutar su prueba focalizada y el render real, permanece **NO VERIFICADA**.

## 2. Entregables: un producto técnico, tres piezas

**A — Informe técnico principal:** portada/confidencialidad/versión/revisores, índice navegable, objetivos y preguntas, diseño del experimento, equipos/canales/fases, instrumentación y adquisición, integridad y límites, estadística y semántica, cronología y continuidad, resultados por sistema corporal y por fase, hallazgos comentados por evidencia, conclusiones respaldadas, acciones discriminantes y exclusiones. Extensión determinada por relevancia (sin objetivo artificial de páginas).

**B — Anexo técnico exhaustivo:** 29 fichas de articulaciones; para cada una 8 fases × 7 señales donde los datos existan, unidades/semántica/cobertura/samples/percentiles/comparación interna, flags, preguntas; matriz 29×8; diccionario OEM/canales; tablas completas. La ausencia se representa como `NULL / NO OBSERVADO / SEMÁNTICA SIN CONFIRMAR`, nunca como «0» ni como «normal».

**C — Paquete reproducible privado:** CSV/JSON de señales y QA, registro de hallazgos/afirmaciones con fuentes, manifiesto con checksums de entradas y salidas, versión de motor/código, registro interno de revisiones y resultado de control de formato. El paquete no contiene autorización ficticia.

Todo en `$HOME/elaris-private/<salida-nueva>`. No duplicar archivos G1 reales en repositorios, issues o CI. No subir el PDF como artefacto de Actions.

## 3. Secuencia priorizada y condiciones de avance

### M0 — Congelar contrato editorial y base verificable (P0)
**Trabajo:** este plan y alcance; fijar análisis V0.3 por SHA en manifiesto *privado*; identificar versión actual del script y PR base; conservar V1/V2 inmutables; definir qué datos no se pueden interpretar por falta de semántica.
**Gate:** documentación del esquema, diccionario de señales, campos desconocidos y matriz fuente→afirmación; no se modifica el robot ni el paquete. 
**Entrega:** versión `G1_TECHNICAL_REPORT_CONTRACT_V1` + tabla de riesgos.

### M1 — Validación de integridad, universos y exactitud (P0; PRIMER BLOQUE DE CÓDIGO)
**Trabajo:** 
1. Pruebas con fixtures sintéticos para ID de fases/slots, 29×8, las 7 familias, duplicados, nulos, números no finitos, índices OEM y enum no validado.
2. Reconciliación explícita entre frames preservados, frames asignados, samples de canal y timestamps; nunca dividir conteos con denominadores distintos. Distinguir `sample` de `frame`.
3. QA de `summary`, `comparisonsToIdle`, cobertura/qualifiers, checksum de salida y que el CSV serialice numéricos negativos sin corrupción.
4. Etiqueta de evidencia insuficiente y de OEM no confirmado; tests de que no aparezcan `PASS`, `FAULT`, `HEALTHY` por inferencia.
**Gate:** suite focalizada PASS con casos negativos; `inspect` PASS en privado; faltantes expresados como `UNRESOLVED`, no encubiertos.
**Entrega:** `g1-evidence-validation.json` local y test sintético nuevo; sin raw en Git.

### M2 — Motor de hallazgos interpretables y trazables (P0)
**Trabajo:** cada hallazgo lleva `claim_id, phase, joint, channel, observed_metric, comparator, provenance, reliability, meaning, alternative_explanations, limitation, verification_action, reviewer_status`. Clasificación `OBSERVED / HUMAN_DECLARED / DERIVED / OEM_CONFIRMED / UNRESOLVED / NOT_ASSESSED`; `OEM_CONFIRMED` sólo con referencia auténtica. Separar prioridad para INVESTIGAR CALIDAD de severidad de avería.
**Gate:** cada conclusión tiene evidencia V0.3 y puede regenerarse sin IA; cero afirmaciones diagnósticas sin validación externa.
**Entrega:** `findings-ledger.json` privado + párrafos técnicos reproducibles sobre locomoción, giros, hombros, cintura, recuperación y slot sin resolver.

### M3 — Análisis de ingeniería por fase, articulación y subsistema (P0)
**Trabajo:** normalizar las comparaciones con reposo *dentro de la misma sesión*; mostrar diferencia absoluta con signo y ratio sólo si denominador válido, no confundir magnitud con riesgo. Estudiar patrones de posición/velocidad/torque estimado, cobertura, calidad, respuesta relativa por grupos anatómicos. Contrastar articulación solicitada con el resto sin inferir que órdenes implican movimiento exitoso. Preguntas abiertas sobre fase, state codes y relojes.
**Gate:** toda cifra/etiqueta de figura corresponde a fila de anexo y tiene unidad/estado semántico; no inventar series temporales a partir de agregados.
**Entrega:** capítulos técnicos por subsistema y 29 comentarios individuales sin diagnóstico.

### M4 — Visualización y diseño editorial profesional (P1)
**Trabajo:** volumen principal sin tablas kilométricas, gráficos de comparación entre fases y grupos con escala, denominador, notas de canal y legibilidad; matriz cobertura 29×8; línea temporal declarado vs observado; visual de distribución de QA; barras SVG descriptivas sólo cuando sustento. Volumen anexo con tablas paginadas, encabezados repetidos, índice, página, identificador de fuente y enlaces cruzados. No crear gráficos de señales continuas sin series temporales reales.
**Gate:** revisión de PDF a imágenes de portada, índice, gráficos, tablas intermedias y final; no cortes, solapes ni fuentes ilegibles; figura numerada y accesible.
**Entrega:** `G1 Technical Report INTERNAL vNext.pdf` y anexo separado en privado.

### M5 — Revisión científica y cierre técnico (P1)
**Trabajo:** dos rondas acotadas, no infinitas: QA automática y revisión humana técnica/editorial (Alexi + Juanma o revisor competente). Reconciliar discrepancias o registrar `OPEN QUESTION` con prueba discriminante. Comprobar vocabulario, unidades, sesgos de comparación, fuentes, afirmaciones sensibles, decisión next-steps y consistencia PDF/CSV.
**Gate:** checklist firmado en registro local, manifest checksums PASS, revisión de todos los hallazgos altos, sin `TBD` ocultos, clasificación interna clara.
**Entrega:** `INTERNAL TECHNICAL REVIEW COMPLETE`, no «certificado», no «habilitado para clientes».

### M6 — Versión comercial (P2, FUERA DEL CIERRE ACTUAL)
**Trabajo:** sólo después de M5 y con permiso verificable para esta versión/destinatarios, crear extracto anonimizado o evidencia sintética. Convertir el sistema en un SKU repetible y probarlo con compradores. Documento ejecutivo derivado y propuesta de venta.
**Gate:** autorización explícita y validación de mensaje comercial independiente.
**Entrega:** `CLIENT-SHAREABLE` sólo cuando esté efectivamente aprobado.

## 4. Backlog inmediato sin dispersión

- **T1 — Fijar pruebas negativas de calidad de datos y semántica** (M1).
- **T2 — Extraer matriz de afirmaciones/observaciones a ledger privado** (M2).
- **T3 — Crear capítulos por subsistema y acciones de verificación** (M3).
- **T4 — Reestructurar el PDF en cuerpo técnico + anexo navegable** (M4).
- **T5 — QA visual, firma técnica y gate de integridad** (M5).

**Dependencias:** T1 → T2 → T3 → T4 → T5. Las gráficas SVG actuales son un incremento **experimental** que pasa por T1 y T4; no reemplazan la interpretación.

## 5. Política de ejecución: evitar trabajo repetido

- Continuar en la rama y PR existentes; no crear una rama nueva ni múltiples PRs paralelos.
- Usar únicamente una suite focalizada de Node sintético por cambio; no abrir workflows grandes, reinstalar PNPM ni gastar tokens/servicios de IA.
- Generar sobre G1 real sólo en WSL con `inspect`, permisos existentes y directorio nuevo. Los borradores previos permanecen intactos.
- Compartir con el chat solo salidas `PASS/FAIL`, metadatos no sensibles y capturas previamente autorizadas. No pegar el registro de autorización, hashes, CSV ni mediciones privadas.
- Tras cada hito, actualizar este documento y el PR #26 (las issues están deshabilitadas en este repositorio) con `DONE / NEXT / BLOCKED / EVIDENCE`, enlazar commit y explicar qué falta. Ningún «PASS» antes de que corran las pruebas.
- La autorización es un gate real para compartir, no un formulario repetitivo en el bucle de desarrollo.

## 6. Estado al crear el plan

| Gate | Estado |
|---|---|
| Paquete V0.3 / generación V2 en WSL | PASS informado por operador |
| Tests focalizados V2 (2/2) | PASS informado por operador |
| Nueva ampliación SVG / subsistemas | CÓDIGO COMMITTEADO; TESTS NO EJECUTADOS EN WSL |
| Reconciliación de todos los contadores | PENDIENTE |
| Hallazgos interpretados por evidencia | PENDIENTE |
| Capítulos de ingeniería independientes de tablas | PENDIENTE |
| QA visual y científica de versión final | PENDIENTE |
| Autorización de difusión del caso real | NO APROBADA |

**Avance T1 (código en rama, aún NO probado en WSL):** se añadió una validación `validateReportEvidence` fail-closed para comprobar las identidades estables por OEM entre fases, las filas QA únicas, las estadísticas numéricas, la relación `uniqueTimestamps <= samples` y el rango de cobertura. Se añadieron cuatro escenarios negativos con paquetes totalmente sintéticos, incluidos fixtures independientes por fase. No se accedió a datos reales ni se abrió CI general.

**Próxima acción:** ejecutar un **único** gate focalizado WSL de las pruebas del nuevo código. Sólo si pasa, regenerar borrador privado en directorio nuevo (sin autorización repetida) y continuar T2; no marcar M1 DONE por un commit no ejecutado.


## Avance posterior — M1 + M2 (código completado, gate local pendiente)

**M1/T1:** contrato defensivo de coherencia por índice OEM, identidad entre fases, 7 canales, summary, comparaciones, timestamps, muestras y QA (fase única). Casos negativos sintéticos contemplan identidad modificada, muestra inválida, máximo no numérico y QA duplicada. La fuente real no se tocó.

**M2/T2:** módulo puro **scripts/evidence-pack/g1-report-findings.mjs**. Genera un ledger determinístico de ventanas de fase, contrastes descriptivos de torque estimado frente a reposo, observaciones de slots sin resolver y conteos agrupados de calidad, con fuente concreta, alternativas, limitaciones, acción y revisión pendiente. Se integra en el generador como **findings-ledger.json** privado, con conteo en el manifiesto; el PDF muestra una selección de claims que deben ser evaluados por humano. No atribuye diagnósticos ni daños.

**Pruebas:** se ampliaron los tests existentes sintéticos y su listado de afirmaciones. Por el momento NO están ejecutados por el operador en esta revisión. El gate focalizado único y generación nueva están documentados en **g1-exhaustive-local-report-runbook-v01.md**.

**Bloqueos reales para afirmar M1/M2 DONE:**
1. Gate focalizado sintético PASS en WSL tras actualizar la rama.
2. Generación real en NUEVA carpeta privada, verificación de manifiesto y 8/29/1624/1615.
3. Revisión humana de la nueva sección de hallazgos, consistencia de fuentes y unidades.

**NEXT:** recibir resultado del gate, resolver cualquier falla concreta, luego avanzar a M3 e informe principal independiente del anexo. No pedir otra captura ni publicar resultados sensibles.

## Gate de pruebas informado — 19/10/2026

El operador actualizó la rama a `b35c97b` y ejecutó el gate focalizado con `node --check` para el generador y el módulo de hallazgos, más `node --test tests/evidence-pack/g1-exhaustive-local-report.test.mjs`: **3 pruebas PASS, 0 FAIL**. Se incluyen la generación sintética, rechazo de salidas inseguras y los casos negativos de datos/QA. **Esto valida el código en fixtures sintéticos, no todavía la nueva generación V3 con el G1 real.** No publicar ni exponer esos datos.

**Pendiente de aceptación M1/M2:** generación privada V3 y QA sobre las métricas, fuentes y formato. Cualquier código posterior a `b35c97b` necesita prueba focalizada nueva antes de declarar PASS.

## M3 — Primera implementación de análisis por subsistema (19/10/2026)

**Código preparado, todavía no verificado por el operador:** nuevo módulo `g1-report-subsystems.mjs` y su integración con el generador. Produce 21 filas (7 fases vs `IDLE_BASELINE` × 3 grupos anatómicos) con recuento de slots esperados, comparables y excluidos; mediana de diferencia *con signo* en `absP95` de torque estimado; mayores incrementos/descensos cuando los hay, referencias por joint, cobertura y razones de exclusión. **No suma torques de articulaciones ni asigna salud, falla o severidad.**

Se genera `subsystem-evidence.json` y `subsystem-evidence.csv` **solo bajo la carpeta privada local**, y el PDF reemplaza la vieja tabla que seleccionaba máximos sin descartar correctamente semántica no confirmada. Se amplió el test sintético para comprobar comparaciones 21/21, exclusión del slot OEM no resuelto, cambios positivos y negativos ficticios y salida sin diagnósticos.

**Gate pendiente:** en WSL ejecutar una sola suite focalizada (4 tests esperados), comprobar que el análisis real produce 21 filas además de 8 fases / 29 slots / 1.624 filas y que ningún slot no resuelto se trate como comparable; generar un PDF V3 en directorio nuevo y hacer control de cifras y legibilidad. No marcar M3 DONE hasta revisar resultados reales.

## Incidencia de gate V3 y corrección de código — 20/10/2026

**Evidencia recibida del operador:**
- Actualización de la rama a `9cc567b`.
- `node --check` de los tres módulos: sin errores informados.
- Suite focalizada **3 PASS / 1 FAIL**. La falla estaba en una aserción de prueba que exigía un elemento SVG aun cuando el fixture tenía todas las diferencias de torque estimado en cero. El renderer muestra correctamente «No hay incrementos positivos medidos aptos para graficar» en ese caso.
- Generación privada real **V3 PASS** en WSL (nuevo PDF y anexos): 8 fases, 29 articulaciones, 1.624 filas de señales, 1.615 registros QA, 224 claims pendientes de revisión humana y 21 comparaciones por subsistema. **NO constituye revisión técnica ni autorización de exportación.**

**Correcciones preparadas posteriormente al gate:**
1. La prueba sin incrementos exige la nota explícita y que no se fabrique SVG. El fixture con incremento positivo sí exige SVG y verifica que no graficamos una señal con semántica no confirmada.
2. Los gráficos y la selección de incrementos ahora utilizan únicamente las comparaciones elegibles del análisis de subsistemas (observación, señal normalizada, cobertura y referencia intra-sesión).
3. Se eliminó el número fijo de 15.000 frames del PDF generado automáticamente: en el fixture sintético provocaba un falso `14172` de diferencia. La reconciliación real 15.000 vs. 14.912 se mantiene como cuestión documental a resolver con las fuentes originales y el manifest, no como una resta universal del motor.

**Estado:** V3 real generado; suite V3 anterior falló 1 aserción; fixes commiteados pero **no ejecutados aún en WSL**. La próxima acción es solamente `git pull --ff-only` + una suite focalizada. No regenerar la V3 para probar un assert. Posteriormente revisar y cerrar el ledger de 224 afirmaciones en privado, y recién entonces regenerar una versión siguiente.

## Gate real de auditoría V3 — 20/10/2026

**Comprobado por ejecución WSL del operador en el commit 1caee0c:**
- `node --check scripts/evidence-pack/g1-review-audit.mjs` PASS.
- Suite focalizada `g1-exhaustive-local-report.test.mjs`: **5 PASS, 0 FAIL**.
- Auditoría real **V3 local PASS**: `G1 PRIVATE REVIEW AUDIT PASS — HUMAN REVIEW PENDING; NO EXPORT`. Resultado: **224 claims** y **21 filas de subsistemas**; checklist creado localmente bajo `$HOME/elaris-private/g1-review-audit-20261020-v01`.

**Interpretación exacta:** los hashes y la correspondencia entre paquetes/anexos/comparaciones alcanzaron el criterio automático programado. El gate NO certifica la interpretación física, no confirma semántica OEM, calidad científica de las conclusiones ni derecho de distribución.

**Siguiente hito activo:** M4a — organizar los 224 claims por revisión humana, con campos de decisión explícitos y clasificación de prioridad de *revisión de evidencia*, jamás severidad física. Registrar el resultado en un directorio nuevo sin modificar la V3, el corpus ni el checklist ya emitido. Antes de afirmar cierre científico, exigir persona revisora, método y resolución documental de cada punto crítico o limitación explícita.
