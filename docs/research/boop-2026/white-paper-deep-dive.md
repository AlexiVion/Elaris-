# White paper de Boop — análisis técnico, económico y crítico
**Obra analizada:** *Architecture of a physical AI trust & safety model for embedded insurance and standardized incident collection*, Boop, working draft v0.8, junio 2026.  
**Fuente:** https://www.trustboop.com/research/white-paper · **Consulta:** 2026-10-08.  
**Estado:** ANÁLISIS DE DISEÑO PROPUESTO por competidor, no auditoría técnica del binario ni de pólizas.

## Resumen ejecutivo
La idea diferencial del documento **no es sólo vender pólizas para robots**, sino construir un ciclo que convierte documentación, telemetría de fallos, versión del robot, contexto de despliegue y consecuencias en insumos para suscripción, claims y eventualmente entrenamiento/validación robótica con licencias. La propuesta integra:
1. una **constitución de seguridad** medible;
2. estructura de **MGA + fronting/capacidad reaseguradora**;
3. un prior de riesgo basado en ingeniería más observaciones telemétricas;
4. un **registro PAIDS** firmado y atribuible, generado por **Robot Data Recorder**.

Para Elaris: adoptar principios de procedencia, contexto y gobernanza **como infraestructura horizontal**. No adoptar una póliza, una tasa, un riesgo certificado, un score universal ni dependencia del RDR de Boop. La vertical aseguradora es cliente de una capa de hechos que también sirve a OEMs, integradores, técnicos, operadores, auditorías y, eventualmente, aprendizaje robótico.

## §1–§2. Seis problemas de Physical AI
| Problema descrito por Boop | Implicación para Elaris | Evidencia actual / límite |
|---|---|---|
| Sin historial actuarial | Presentar limitaciones de datos por caso | Ningún corpus de siniestros propio. |
| Software actualiza riesgo | Baseline versionada, hash, diff, estado de revisión | Deployment Control referencia implementada. |
| Fallos correlacionados a gran escala | Enlace entre modelo/firmware/version/deployment | No hay población multi-OEM de campo ni acumulación calculada. |
| Responsabilidad difusa | Línea temporal con fuentes, cambios y partes | Puede ordenar artefactos; NO atribuye culpa. |
| Normas con alcance limitado | Registrar normas, su alcance real y pruebas existentes | No puede declarar conformidad. |
| Autonomía↔teleoperación híbrida | Modelar modos, transiciones y operadores como sujetos distintos | No hay teleop real validada en caso Siglo 21. |

Acierto conceptual: entender **versión de software + entorno + operador + control mode + tarea + tiempo** como identidad temporal del sistema, no como metadatos accesorios.
Punto crítico: la tesis de riesgo correlacionado sólo se convierte en modelo con exposiciones comparables, permiso para agregarlas, resultados y experiencia estadística suficiente.

## §3. Normas, clases y peligros físicos
Boop toma ISO 10218-1/-2:2025 y ISO/TS 15066 como referencias para robótica industrial y colaborativa; propone condiciones de elegibilidad basadas en certificación aplicable. No es una prescripción regulatoria universal.
- Separa clase de robot (límites de fuerza y velocidad) de peligros dinámicos de humanoide: pérdida de equilibrio, caída, altura de centro de masa, payload y velocidad. Esto impide inferir seguridad de un humanoide sólo a partir de fuerza de manipulador.
- Insiste en contexto de contacto: quasi-static y transient vs caída de cuerpo entero.
- Usa estabilidad, balance-recovery, IMU y estimaciones ZMP/ground-reaction como señales de investigación.

**Evaluación:** correcta distinción conceptual; las afirmaciones cuantitativas y citas concretas de normativa de Boop requieren revisión contra textos oficiales antes de incorporarse a criterios de conformidad. En Elaris, "hay lectura IMU" NO significa "puedo reconstruir una caída" ni "dispongo de tasas de recuperación de equilibrio".

## §3.2–§4. Teleoperación y responsabilidad tripartita
Boop distingue modos certificados de colaboración (SRMS, HG, SSM, PFL) de grados de autonomía/teleop:
1. full teleoperation;
2. assisted teleoperation con capa de seguridad local;
3. exception handling;
4. supervisory control;
5. full autonomy.

Punto fuerte: **transiciones de control como eventos explícitos**. Las fallas pueden surgir al retomar autonomía o al entregar el control a un operador sin contexto suficiente.
Boop considera a **OEM, plataforma de teleop y operador/cliente** fuentes diferentes de eventos/datos y posibles responsabilidades. La atribución legal es siempre contextual y no decidible por el registro telemétrico únicamente.
Hipótesis de métricas: RTT, P95, jitter, pérdida de paquetes, proporción operadores/robots, sesión, descanso, habilitación profesional, eventos de transferencia de control. Publica umbrales comerciales propuestos (p.ej. RTT medio ≤150 ms, P95 ≤300 ms, jitter ≤50 ms; sesiones ≤4 h continuas; ratios hasta 1:2 / 1:4 / 1:8 por tarea). **NO son umbrales de Elaris ni consenso normativo**.
Limitación de la tesis: las afirmaciones que equiparan analogías aviación/UAV con teleop de humanoides requieren validación empírica específica.

## §5. Constitución de siete artículos
Boop propone una constitución **ordenada por prioridad**, traducida a reglas instrumentables:
| Artículo Boop | Necesidad de dato / evento | Elaris: decisión |
|---|---|---|
| I — seguridad humana | contexto de exposición, ensayos, incidentes | Capturar hechos con fuente; nunca certificar seguridad. |
| II — seguridad sistémica | dependencias compartidas, despliegues, OTA | Modelar relaciones/versiones; acumulación futura. |
| III — control limitado | intentos de override, límites, control mode | Modelo de evento sin ejecutar ni autorizar comandos. |
| IV — percepción contextual | entorno, interfaces, sensores, condiciones | Documentar alcance de evidencia y sus ausencias. |
| V — auditabilidad | reconstrucción reproducible y firmas | Priorizar cadena de custodia; no reclamar inviolabilidad sin prueba. |
| VI — mutación gobernada | cambios de versión/firmware/modelo/proceso | Aprovechar diff/impact/approvals; notificación humana. |
| VII — privacidad | minimización, seudonimización, acuerdos | Permisos por dataset, propósito, actor y jurisdicción. |

Aprovechar el método "principio → evidencia → evaluación → autoridad humana → acción" sin copiar literalmente la constitución como si fuera un código ético validado.

## §6. Modelo de cuatro capas
### L1 — actuarial y precio
Ingeniería del producto y FMEA, analogías de siniestralidad, credibilidad (Bühlmann), segmentación por clase/ambiente/control e impactos de concentración. **Boop describe un enfoque propuesto**, no publica base actuarial ni fórmula apta para réplica. En Elaris: NO implementar rating ni primas.

### L2 — ML risk-scoring y claims
Variables telemétricas, Bayes, riesgo dinámico y árbol causal OEM/plataforma/operador; separación entre vector de cyberataque y potencial sujeto responsable. Sin corpus ni validación retrospectiva, **no hay modelo defendible**; mejor un inventario objetivo de preguntas, faltantes, cambios y fuentes.

### L3 — trust/safety/readiness
Gates basados en certificación/controles/evidencias. La **Behavioral Learnability Profile (BLP)** propone comparar: (i) límites absolutos, (ii) cohorte de despliegues similares, (iii) evolución temporal. El paper reconoce que la cohorte requiere aproximadamente 20–30 unidades comparables y meses de datos. Elaris hoy no tiene esa base; jamás mostrar BLP propio con apariencia de indicador técnico validado.

### L4 — estructura MGA/operativa
El texto declara delegación de suscripción, entidad aseguradora emisora y capacidad de reaseguro. **Esto describe el modelo empresarial alegado**, no prueba autorizaciones o contratos existentes ni su aplicabilidad en Argentina. Contratos de datos con OEM/plataforma serían insumo crítico. Elaris primero puede cobrar un servicio técnico B2B; la intermediación/manejo de pólizas requiere estructura y asesoría legales.

## §7. RDR y PAIDS — la parte más transferible
RDR se describe como software suscriptor pasivo de telemetría del robot, contenedor firmado, sin publicadores ni camino hacia actuadores. El paper NO presenta un repositorio auditable ni una prueba independiente de que la implementación real cumpla ese modelo.
Sus principales restricciones:
- **No interferencia** con control/safety. Leer telemetría no es enviar comandos.
- **Eventos acotados**: ventana de alta frecuencia para mecanismo físico, tendencia de baja frecuencia para contexto de sesión; conservar por referencia contenidos pesados cuando corresponda.
- **Frecuencias declaradas por canal** en vez de prometer reconstrucción con cualquier tasa. El paper da ejemplos orientativos: fuerzas de contacto ~100 Hz; proximidad/SSM ~50 Hz; eventos de parada requieren mejores registros del safety controller.
- **Firmas y procedencia**, cronología UTC, calidad de captura, fuente de cada campo.
- **Tres capas diferenciadas**: A=hecho medido en fuente y firmado; B=clasificación derivada y revisable; C=resultado legal con custodia y acceso restringidos.

**Elaris: no llamar PAIDS-compliant a un informe.** El PAIDS aquí es un estándar propuesto por Boop y el mapeo `paids-elaris-crosswalk.md` es investigación de compatibilidad, NO validación o certificación.

### Matiz técnico esencial: lectura ≠ evidencia forense
Un Edge Collector a 20 Hz sobre rt/lowstate no satisface ventanas de fuerza/contacto a 100 Hz ni garantiza reloj sincronizado, firma en origen, cobertura de safety controller, comandos de operador, control mode, alta temporal o chain-of-custody. Se pueden capturar observaciones útiles, **con límites explícitos**.

### Tensión aparente del paper a resolver
Boop habla de "no registrar toda la jornada" y a la vez propone `session_trend_lowrate` longitudinal. Compatibilidad posible: mantener sólo estadísticas/acumulados minimizados de sesión y persistir la ventana rica del evento. Requiere especificación de captura/retención/consentimiento y amenaza de re-identificación; no asumir resuelto.

## §8. Corpus de incidentes como segundo activo
Punto más alineado con visión Elaris: **datos de fallos con procedencia, contexto y etiquetas** pueden servir en investigación de robustez, ensayo, mantenimiento, simulación, desarrollo de modelos y seguros. Boop menciona exportaciones posibles a formatos de aprendizaje robótico como LeRobot.

**Límites clave**:
- Los hechos capturados pertenecen/están sujetos a derechos del originador, no automáticamente a quien almacena una copia.
- No revender pesos/modelos/secuencias privadas o identidad de personas.
- Un evento anotado por aseguradora puede ser inferencia, no verdad.
- Reutilización secundaria requiere permisos **separados** y finalidad declarada; anonimización no elimina todas las inferencias industriales.
- Un humanoide y un brazo fijo no comparten necesariamente una distribución de fallos; primero taxonomía/benchmark y sólo luego aprendizaje con pruebas.

**Nuestra oportunidad horizontal:** un registro neutral de eventos y evidencia que cada vertical consulta conforme a permisos. El propio negocio de seguros sería uno de varios consumidores.

## §9. Frontera de asegurabilidad
Boop divide escenarios en: certificado dentro de alcance, entorno extendido, evolución rápida con cambios gobernados y automodificación sin validación. También plantea límites de teleop por atención y ratio.
Elaris debe **registrar las condiciones y excepciones**, no transformarlas en aceptación, negación o exclusión automática. Las condiciones pertenecen a aseguradoras/autorizados y a documentos contractuales concretos.

## §10. Preguntas abiertas de Boop
- Criterios futuros de teleop y normativa.
- Calibración de peligros dinámicos de caída.
- Medición de fatiga/complacencia individual.
- Atribución de cyber y responsabilidad entre actores.
- Ambientes no industriales.
- Titularidad y licencias de datos secundarios.

Estas preguntas son **oportunidades de investigación**, no justificación para construir simultáneamente nuevos productos.

## Auditoría crítica: diez riesgos para replicar este modelo
1. Atribuir "estándar" a PAIDS sin adopción externa verificada.
2. Dar por operativa una MGA o su capacidad de suscripción por leer un white paper.
3. Confundir «RDR ofrece arquitectura» con «RDR superó auditoría».
4. Aplicar límites ISO industriales a cualquier humanoide/entorno.
5. Convertir una muestra G1 de baja frecuencia en prueba sobre causalidad, siniestros o peligros.
6. Aplicar scoring actuarial sin cohortes ni outcomes.
7. Medir incidentes sin denominador (horas, tasks, modo/entorno) o sin sesgo de captura.
8. Invadir privacidad/propiedad intelectual de fabricantes y sitios.
9. Dejar que un cliente de seguros controle la ontología común de Elaris.
10. Vender supuestas prestaciones 24/7, soporte, certificación o coberturas sin infraestructura/autoridad.

## Oportunidad comercial prioritaria derivada
**Underwriting Evidence Preparation Service**: recibir archivos consentidos → identificar activo/exposición → baseline declarada con fuentes → documentos/controles existentes → preguntas/faltantes → informe versionado con límites → revisión del cliente/broker. No implica instalar RDR ni generar un score ni comprometer un carrier.

## Preguntas de due diligence específicas para Boop
- ¿Entidad legal, jurisdicción y agencia licenciada? ¿Qué autoridad delegada en qué territorios y sobre qué líneas?
- ¿Cuáles carriers y reaseguradores están habilitados a ser nombrados y qué riesgos cubren realmente?
- ¿Existen pólizas emitidas, expedientes muestra y criterios de intake anonimizados?
- ¿Está RDR desplegado, con auditoría externa, en qué hardware/ROS2, con qué tópicos y sampling real?
- ¿Qué mecanismos concretos de firma, relojes, buffer, consentimiento, retención y exportación existen?
- ¿PAIDS tiene esquema versionado público, licencias y adopción externa? ¿Cómo se resuelven Layer B disputada y Layer C?
- ¿Cómo se asegura la separación entre datos de póliza, investigación de siniestros y uso para modelos?

**Fuentes:** B01–B05 de `sources-and-claims.md`; todas las cifras, umbrales y estructuras atribuidas a Boop son del borrador v0.8. Evaluaciones Elaris: análisis propio, sujeto a validación.
