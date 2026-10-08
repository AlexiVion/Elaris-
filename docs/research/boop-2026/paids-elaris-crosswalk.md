# Crosswalk de datos — PAIDS Layer A (Boop) frente a Elaris
**Estado:** `RESEARCH_MAPPING_ONLY` · **Boop:** §7.1 white paper v0.8, https://www.trustboop.com/research/white-paper · **Elaris:** registro catálogo + collector read-only G1, DC branch DC-051 pendiente gate.  
**No compatible/certificado:** el paper presenta PAIDS como estándar propuesto por Boop. No se afirma conformidad Elaris/PAIDS ni compatibilidad de mensajes con un schema formal publicado.

## Estados de disponibilidad
- `SCHEMA`: campo/objeto representable como metadato, no medición observada.
- `READABLE_PARTIAL`: canal o señal relacionado leído, insuficiente para evidencia del campo preciso.
- `POSSIBLE_EXTERNAL`: sólo con archivo/atestado/OEM autorizado.
- `MISSING`: no existe lectura ni fuente suficiente validada.
- `CONDITIONAL`: no aplica hasta que exista el modo/evento/contexto relevante.
- No se asigna el estado `VERIFIED_MEASURED` en esta tabla: este benchmark no inspecciona datasets con atribución y consentimiento por campo.

## Matriz de campos/categorías PAIDS
| Grupo | Campo(s) de Boop | Elaris actual | Fuente/método probable y límite |
|---|---|---|---|
| Sistema | robot_model_id | SCHEMA | Robot.model / OEM; identidad debe verificarse por responsable. |
| Sistema | unit_serial (seudonimizado) | SCHEMA; valor G1 desconocido | No inventar serial. Identidad seudonimizada sólo con esquema autorizado. |
| Sistema | firmware_version | POSSIBLE_EXTERNAL | inventario firmware/OEM; no deducir de versión de SDK. |
| Sistema | safety_config_checksum | MISSING | controlador safety + proceso OEM; hash del snapshot app NO equivale. |
| Sistema | robot_class | POSSIBLE_EXTERNAL | documentación/certificación aplicable, no inferir por modelo. |
| Sistema | fmpm_rated | POSSIBLE_EXTERNAL | ficha/rating de seguridad, no IMU. |
| Sistema | max_speed_rated | POSSIBLE_EXTERNAL | documentación de producto/config verificada. |
| Sistema | com_height_m | POSSIBLE_EXTERNAL | diseño/config y carga actual; no confundir con postura estimada. |
| Sistema | total_mass_kg | POSSIBLE_EXTERNAL | ficha OEM/medición verificada. |
| Sistema | declared_sampling_rates | READABLE_PARTIAL | collector cap 20 Hz para `rt/lowstate` en sesión previa; no reemplaza tasa nativa safety por canal. |
| Control | control_mode | SCHEMA/CONDITIONAL | deployment.operatingMode opcional; ausencia de transición observada. |
| Control | control_mode_transition_preceding | MISSING | requiere eventos de modo + reloj; no se observó. |
| Contexto | incident_timestamp ms UTC | MISSING (incidente real) | no hubo evento real registrado como incidente. |
| Contexto | deployment_environment | SCHEMA; valor G1 desconocido | site.environmentType nullable; acuerdo institucional no define peligros físicos. |
| Contexto | collaborative_operation_mode | MISSING | clasificación de operación verificada. |
| Contexto | humans_in_workspace | MISSING | observación de sitio/evento, no presumir por universidad. |
| Contexto | operator_present | MISSING | registro/evento operador real. |
| Evento | event_type | SCHEMA posible | taxonomía de incidentes/observaciones, no hay evento forense. |
| Evento | event_trigger | MISSING | trigger instrumentado/autorizado. |
| Evento | event_window_highrate | MISSING | 20 Hz `rt/lowstate` NO demuestra captura alta frecuencia fuerza/contacto. |
| Evento | event_perception_snapshot | MISSING | video/lidar/percepción no autorizados ni capturados para este fin. |
| Evento | session_trend_lowrate | READABLE_PARTIAL | posible señal bajo muestreo; falta sesión tipada, ventana y consentimiento. |
| Evento | safety_function_override_attempted | MISSING | log controlador safety; no inferir desde `rt/lowstate`. |
| Evento | ota_update_preceding | MISSING | version history cronológico de OEM/controlador. |
| Estabilidad | balance_recovery_activated | MISSING | telemetría/evento dedicado; IMU no da flag verificable. |
| Estabilidad | zmp_margin_min | MISSING | controlador/datos force-ground; no inferir numéricamente. |
| Estabilidad | payload_mass_kg | POSSIBLE_EXTERNAL | tarea/carga/documento. |
| Estabilidad | payload_velocity_envelope | MISSING | robot/tarea/sampling e interpretación. |
| Estabilidad | floor_condition | MISSING | registro humano con evidencia de sitio. |
| Teleop | teleop_session_duration_minutes | CONDITIONAL | no existe teleop de este caso validada. |
| Teleop | teleop_operator_to_robot_ratio | CONDITIONAL | no existe cohorte supervisión validada. |
| Teleop | teleop_operator_certification_tier | CONDITIONAL | credenciales revisadas por autoridad. |
| Teleop | teleop_platform_id | CONDITIONAL | proveedor real. |
| Teleop | teleop_operator_anonymous_id | CONDITIONAL | esquema de privacidad/pseudonimización. |
| Teleop | latency RTT mean/p95/jitter/loss | CONDITIONAL | pruebas de red en sesión teleop si corresponde. |
| Contacto | contact_type | MISSING | evento de contacto confirmado. |
| Contacto | contact_body_region | MISSING | evento/persona; dato sensible. |
| Contacto | measured_force_N | MISSING | sensor/calibración y tasa adecuados. |
| Contacto | estimated_force_N | MISSING | estimación derivada debe marcarse inferida. |
| Contacto | pfl_limit_active_N | MISSING | seguridad funcional y config activa. |
| Severidad | severity_grade 0..5 | MISSING | incidente + evidencia + criterio explícito, con autoridad humana. |
| Causa | root_cause_category | MISSING | hipótesis de investigación, no hecho medido. |

## Data model propuesto (no PR de implementación)
Para todo campo técnico:
```yaml
subject: robot/deployment/component/event
field: canonical_path
value: unknown | typed_value
observation_class: OBSERVED | PROVIDED | INFERRED | SIMULATED | UNKNOWN
source_ref: artifact_id
source_owner: legal_entity_id
captured_at_utc: optional
recorded_at_utc: timestamp
clock_quality: optional
sampling_hz: optional
authorization_ref: permission_id
purpose: technical_report | insurance_submission | safety | research
reviewer: optional_person_id
data_version: semantic_version
hash: content_hash_optional
retention_policy: policy_id
sharing_scope: allowed_recipients
```
No colocar una tasa observada en un campo marcado como "certified". Identificar que los event streams pueden necesitar claves, seriales y timestamps protegidos.

## Separation of concerns
- `OBSERVED RAW`: archivos/canales originales con custodia y fuentes; idealmente hashes y controles de acceso.
- `DERIVED`: resúmenes, clasificación, anomalía y gaps revisables y atribuibles al método.
- `DECISION`: dictamen de auditor, asegurador, responsable safety, legal u operador, no alterable por una inferencia Elaris.

Para una futura compatibilidad con PAIDS de terceros, requerir antes: licencia del esquema, definición exacta, versionado, ejemplos válidos, reglas de identidad, firma, retención, interoperabilidad y autorización legal de exportación.

## Gate del G1 de Siglo 21
Para el G1 únicamente consta el contexto Humandroid-proveedor / Siglo21-institución anfitriona y lectura parcial de `rt/lowstate` en una sesión de laboratorio. El estado DC-051 es un fixture de contexto **no** una evaluación aseguradora. **Sin exposición, tareas, operación productiva, serial autenticado y canal safety, NO hay dossier PAIDS ni underwriting listo.** No convertir placeholders/seed en prueba comercial.

## Priorización de los gaps
- **P0 ahora:** identidad, configuración declarada, origen de archivos, site/actor/rights, faltantes y límites; sólo fuentes autorizadas.
- **P1 si comprador demanda:** versión/cambios, pruebas con responsables, cronología y evidencia verificable.
- **P2 si caso real exige event recorder:** event time, per-channel rate, trigger, rings, firma en origen, separación control.
- **P3 sólo tras incidentes y autorización:** clasificación, transferencias transversales, modelos de riesgo y corpus multi-OEM.
