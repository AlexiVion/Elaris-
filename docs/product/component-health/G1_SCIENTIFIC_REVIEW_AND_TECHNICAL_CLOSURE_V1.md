# G1 — Protocolo de revisión científica y cierre del informe técnico integral

**Versión:** 1.0 · **Estado:** REVISIÓN HUMANA PENDIENTE · **Clasificación:** metodología pública, sin datos reales del robot.  
**Alcance:** proyecto Elaris / Component Health V0.3 / evidencia de campo Unitree G1.  
**Regla:** este protocolo no certifica seguridad, salud, fiabilidad, conformidad OEM ni derecho de publicación.

## Decisión metodológica

El informe técnico no se considera concluido sólo porque el archivo se genere, un checksum coincida o una suite de pruebas pase. Los artefactos privados ya existen: fuente V0.3, V3 y sus anexos, ledger de afirmaciones, auditorías, cola de revisión y borrador de discusión. **El siguiente paso es revisar el significado físico y los límites de la evidencia.**

El número de filas/claims **no** representa número de anomalías, experimentos independientes, averías ni decisiones revisadas. Distinguir:
- **Frame** recibido/preservado vs frame **asignado a ventana** vs evento normalizado por señal.
- **Observación de señal** vs semántica/calibración OEM demostrada.
- **Comando emitido** vs respuesta de software vs movimiento observado.
- **Integridad de archivos** vs completitud de la sesión y equivalencia del contenido.
- **Comparación descriptiva** vs estudio controlado / evidencia causal / umbral de diagnóstico.
- **Revisión científica interna** vs autorización del titular para compartir.

El repositorio público contiene sólo algoritmos, fixtures sintéticos, metodologías y estado de gates. Todo resultado real o identificador sensible permanece en la carpeta privada ya configurada.

## Principio de revisión: primero limitaciones, después resultados

Revisión dividida en cinco **áreas científicas**, no en 224 aprobaciones mecánicas. El ledger conserva la trazabilidad individual y todos los claims continúan pendientes hasta que sean evaluados o queden incluidos explícitamente en una decisión metodológica documentada. Una decisión sobre la categoría no valida automáticamente los valores individuales.

### Área 1. Adquisición, fuentes e integridad

**Pregunta:** ¿de dónde proviene cada resultado, qué captura representa, qué se perdió/no se asignó y cuál es el límite temporal de observación?

Controlar en documentos y metadatos privados:
1. Proveniencia de Dataset histórico vs sesión de campo usada para inferir comparaciones.
2. Estado de captura: **OPEN** no equivale a FINALIZED; integridad de archivo no prueba sesión experimental completa.
3. Definición precisa de los denominadores: total de frames preservados, frames asignados a ocho fases, timestamps distintos por canal, muestras totales.
4. Límite temporal declarado por humano frente a primera/última telemetría; anotar origen de reloj/timezone y de los marcadores.
5. Significado de duplicaciones de timestamp: definir si son muestras de canal, mensajes, frames o efecto del normalizador antes de interpretar.
6. Diferencias entre contadores: investigar límites inclusivos/exclusivos, muestras previas a primera fase, huecos, solapes y filtrado, sin asumir automáticamente corrupción ni pérdida.

**Aceptar sólo:** conclusión descriptiva con universos comparables y origen reproducible, o pregunta abierta con explicación explícita.

**Estado por defecto:** UNRESOLVED_UNTIL_SOURCE_RECONCILED.

### Área 2. Instrumentación y semántica OEM

**Pregunta:** ¿qué mide físicamente cada canal y en qué unidad, precisión y escala?

- Mapear la variante G1, firmware, esquema OEM de joints e índice 0–28 usando documentación específica del modelo/variante; los campos faltantes permanecen UNKNOWN.
- Para cada una de siete familias de señal, distinguir magnitud bruta, normalizada, estimada, reinterpretada y unidad OEM confirmada. Las temperaturas no son necesariamente equivalentes entre carcasa y bobinado.
- Tratar `motor.state_code` como valor observado sin traducirlo a enum causal ni fallo hasta que exista documentación aplicable.
- `joint.torque_estimate` es una estimación, no un transductor de torque calibrado: absP95 e incrementos son perfiles descriptivos, no niveles de desgaste o riesgo.
- Reconciliar `availability`, `slotStatus`, presencia de muestras y observabilidad física (son conceptos diferentes).
- Caso de un slot de muñeca sin resolver: diferenciar articulación no presente en esa variante, mapeo incorrecto, canal no activo, telemetría constante y problema real del actuador. Una sola sesión no permite seleccionar una causa.

**Aceptar sólo:** unidades, niveles de interpretación y afirmaciones con evidencia OEM/documentación trazada o declaradas no confirmadas.

**Estado por defecto:** OEM_UNCONFIRMED_UNTIL_VERIFIED.

### Área 3. Diseño experimental y comparación intra-sesión

**Pregunta:** ¿qué cambia frente a reposo y qué otras variables pudieron provocar ese cambio?

- La referencia `IDLE_BASELINE` es de la misma sesión. El dataset histórico no es otra repetición bajo condiciones idénticas.
- Las fases de giro, locomoción, hombro y cintura difieren en cargas, postura, velocidad, amplitud de movimiento y estabilización: no comparar las magnitudes como si fueran tareas equivalentes.
- Para cada combinación fase × subsistema registrar slots elegibles/excluidos y su razón, muestras, cobertura y si el comparador de reposo existe. El denominador de un grupo es número de articulaciones comparables, no masa/carga del robot.
- Para cada contraste destacado, cotejar `joint.position` y `joint.velocity` cuando la semántica y calidad del canal permitan análisis; no llamar a estos canales corroboración independiente de un comando ejecutado.
- Un Δ de absP95 positivo/negativo no implica anormalidad/normalidad. Ratios con denominador cercano a cero son particularmente frágiles.
- Sin un diseño repetido y controlado, evitar lenguaje de causalidad, significación estadística, fiabilidad poblacional y umbrales de mantenimiento.

**Aceptar sólo:** observación + comparador + contexto + incertidumbre + alternativa plausible + verificación siguiente.

**Estado por defecto:** DESCRIPTIVE_ONLY.

### Área 4. Interpretación y acciones discriminantes

Para cada hallazgo relevante:
- Especificar **lo observado** con referencia exacta al esquema V0.3 o ledger privado.
- Mostrar la **comparación matemática** y el estado semántico.
- Escribir **qué se puede concluir** (descriptivamente) y qué no.
- Incluir al menos una **explicación alternativa**.
- Proponer una **prueba discriminante**: nueva captura solo si realmente hace falta, con autorización de operador/titular y protocolo seguro. No proponer actuar sobre robot mediante un auditor read-only.
- Mantener `NOT_ASSESSED` para estado físico, salud, seguridad, daños, criticidad o vida útil.

**Prioridad de revisión** significa dependencia epistémica y utilidad para redactar; **no es un ranking de averías**.

### Área 5. Presentación del informe y aprobación interna

**Volumen principal:** preguntas → método → observabilidad/integridad → hallazgos técnico-operacionales por subsistema/fase → limitaciones → conclusiones justificadas → próximos ensayos.  
**Anexo:** 29 articulaciones × ocho fases y las siete familias de señales cuando existan; no convertir `null` en cero ni declarar válidas unidades no confirmadas.  
**Paquete reproducible:** SHA256 de salidas, ledger trazable, exportación privada tabular y estado de revisión.

Criterios de cierre editorial:
- Todo hallazgo importante enlaza evidencia comprobable en el equipo local.
- Al menos un revisor técnico competente revisa datos/semántica/limitaciones; se registra revisor, fecha y decisión en un artefacto **privado independiente**, nunca en el resultado generado sin alteraciones.
- Cada pregunta crítica queda `CLOSED_WITH_EVIDENCE`, `OPEN_WITH_LIMITATION` o `NOT_ASSESSED`; no forzar falsas respuestas ni autorizar por silencio.
- Las tablas, gráficos, ejes y unidades se inspeccionan visualmente; las gráficas no ocultan exclusiones ni agregan series no observadas.
- La conclusión general permanece limitada a la captura/variante/protocolo y no es un “robot saludable” ni "robot defectuoso".
- La portada deja visible **SENSITIVE / INTERNAL REVIEW / NOT APPROVED FOR EXPORT**.

## Matriz de decisión que debe completar el revisor en privado

| Evidencia crítica | Pregunta de verificación | Respuestas permitidas | Evidencia exigida |
|---|---|---|---|
| Custodia/captura | ¿Integridad ≠ completitud expresado correctamente? | CLOSED_WITH_EVIDENCE / OPEN_WITH_LIMITATION | Manifest, check de hash, estado de sesión |
| Frames/ventanas | ¿Contadores conciliados por universos y timestamps? | CLOSED_WITH_EVIDENCE / OPEN_WITH_LIMITATION | Source phase/capture timelines |
| Timestamps repetidos | ¿Se identificó el nivel instrumental de repetición? | CLOSED_WITH_EVIDENCE / OPEN_WITH_LIMITATION | Muestras y pipeline adquisición |
| OEM/units | ¿Código/escala/unidad realmente comprobados? | OEM_CONFIRMED / OEM_UNCONFIRMED | Manual/vendor software version |
| Slots | ¿Cada unresolved permanece sin inferencia física? | OPEN_WITH_LIMITATION / CLOSED_WITH_EVIDENCE | Mapeo, observabilidad y prueba discriminante |
| Señales descriptivas | ¿Comparador, muestra, cobertura y exclusiones correctos? | DESCRIPTIVE_ONLY / REJECT_UNSUPPORTED | V0.3 + ledger + anexo |
| Comandos | ¿Separación de comando y movimiento observado? | CLOSED_WITH_EVIDENCE / OPEN_WITH_LIMITATION | Logs command / observable |
| Reporte | ¿Hallazgos/figuras/citas y límites revisados? | TECHNICAL_EDIT_COMPLETE / NEEDS_REVISION | PDF y fuentes locales |
| Difusión | ¿Existe autorización para la versión y destinatarios? | APPROVED_WITH_RECORD / NOT_APPROVED | Registro de consentimiento independiente |

Esta tabla es un protocolo, **no está rellenada**. Ningún valor de aprobación es generado por software.

## Conclusiones permitidas antes de la revisión

“Se observaron señales normalizadas y agregaciones reproducibles en fases declaradas de una sesión de campo. Algunas familias de señal tienen semántica OEM no confirmada, observaciones de calidad de adquisición y slots no resueltos. Las diferencias de magnitud frente a reposo son descriptivas y requieren contexto.”

**Conclusiones no permitidas:** “falló actuador X”, “el robot es seguro”, “alto riesgo”, “vida útil reducida”, “apto para seguros”, “certificación OEM”, “el movimiento se ejecutó porque un comando devolvió éxito”.

## Trabajo restante y dependencia real

1. [ ] Revisar científicamente semántica/canales y registrar fuentes OEM o UNKNOWN.
2. [ ] Conciliar frames/timestamps/fases o formalizar imposibilidad.
3. [ ] Revisar hallazgos destacados contra canales, calidad y protocolo humano.
4. [ ] Aplicar decisiones en artefacto privado con trazabilidad, revisor y fecha.
5. [ ] Redactar volumen principal definitivo y paginar anexo; inspección visual y lingüística.
6. [ ] Cerrar únicamente la versión **técnica interna**. Una versión externa será un producto diferente, sujeta a autorización independiente.

**Nunca publicar datos privados, resultados reales, titularidades o aprobaciones dentro de este documento público.**
