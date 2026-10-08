# Benchmark competitivo: Boop, Koop y Elaris — mapa de 14 sistemas
**Fuentes:** B01–B05, K01 en `sources-and-claims.md`; E01–E05 y catálogo de Elaris. **Corte:** 2026-10-08.  
**Leyenda Elaris:** `ENGINE_REFERENCE` implementación de referencia; `FIELD_PARTIAL` observación parcial; `DEMO`; `CONCEPT`; `SPEC`; `DATA_DEPENDENT`. **Comparabilidad:** función/tesis, no equivalencia funcional certificada.

## 1. Posicionamiento
- **Boop:** se presenta como asegurador especializado para robótica/Physical AI, basado en RDR/PAIDS, programa MGA y dinámica de tarifas por robot. Sus documentos aportan diseño conceptual detallado; implementación/operación no fueron auditadas.
- **Koop:** competidor adyacente con servicios de seguro/seguridad y datos de programas de suscripción; su nota de septiembre de 2026 afirma haber procesado casos de 392 empresas estadounidenses 2021–2025. Son datos publicados por la propia empresa, no dataset disponible para Elaris.
- **Elaris:** plataforma horizontal de datos técnicos, evidencias y operaciones en el mapa industrial A01–A20; vertical aseguradora en fase de hipótesis y prototipos. Puede servir tanto a proveedores como a compradores/aseguradoras/otros sectores con distintos permisos.

## 2. Matriz de todos los Product Systems
| Elaris Product System | Estado conocido | Equivalente/nexo en Boop | Cobertura actual defendible | Gap para seguro y siguiente validación |
|---|---|---|---|---|
| Deployment Control | ENGINE_REFERENCE; PR DC051 pendiente gate | versión, configuración, exposición/deployment | snapshots, hash, diffs, contexto de colocación en rama en prueba | baseline real y autorizada, modo/exposición reales. |
| Component Health | FIELD_PARTIAL / V0.4.3 | señales componentes, eventos, salud/condición | adapter/collector read-only, procedencia, revisión/captura | no diagnóstico actuarial ni señal de siniestro/altas tasas garantizadas. |
| Service & Configuration History | SPEC | historial posterior a servicio | identidad/diff son reusables | artefactos reales de intervenciones/retorno. |
| Product & Field Evidence | SPEC | releases OEM, OTA, dependencia firmware | hash/config actual | cadena real de release/advisory y propietario de dato. |
| Operational Readiness | DEMO | readiness gate Layer 3 | interfaz prototipo + motor base | criterio real de cliente/aseguradora, no aceptación normativa. |
| Safety Change Control | DEMO | constitución art. I, III, VI, retests | reglas de impacto de referencia + visual | EHS/reviewer real y controles reales. |
| Evidence Review | DEMO | verificación documental, estándares, evidencias | workbench/plantillas | revisión independiente con documentos y findings auténticos. |
| Cyber / OT Change Assurance | SPEC | cyber vectores + remote access | metadatos de software/cambio | fuentes IT/OT, método y experto real. |
| Incident Reconstruction | DEMO | PAIDS, atribución de siniestros | timeline/baseline demo | ventana real de eventos, relojes, custodia; no causalidad legal. |
| Placement Workspace | DEMO READY | intake, submissions, market questions | flujo de demo | expediente real de broker y disposición a pagar. |
| Underwriting Workspace | CONCEPT | Layers 1–3 risk-scoring/rating | pregunta/revisión de demo | requerimiento real de suscriptor; NO pricing/decision authority. |
| Asset Monitoring | SPEC | reemplazo del robot, suma asegurada y continuidad | identidad/servicio potencial | datos activos, valor económico, contrato con dueño. |
| Portfolio/Accumulation Intelligence | DATA_DEPENDENT | riesgo correlacionado Layer 1 | hipótesis de dependencias | cartera multi-cliente, cohortes comparables, permisos. |
| Risk Intelligence | DATA_DEPENDENT | BLP, Layer 2, corpus cross-OEM | arquitectura hipotética | outcomes + muestras + validación/consentimiento. |

Los enabling systems no constituyen Product System #15:
- **Edge Collector + Robot Adapter:** capturan señales read-only (relación funcional parcial con RDR).
- **Engine de evidencia, procedencia, hashes, diff, auditoría:** primitivos reutilizables.
- **Escenarios/simulaciones/Cosmos:** no usar como incidentes reales, pérdidas observadas ni base para pricing.

## 3. Benchmark funcional por eslabón
| Función | Boop publicado | Elaris hoy | Conclusión |
|---|---|---|---|
| Venta/cotización/condiciones | ofertas por robot (web comercial) | ninguno | No imitar en fase 1. |
| MGA/licencia/carriers | modelo declarado en draft | ninguno | Ruta de alianzas y validación legal, no feature. |
| Intake documental | implícito en §3/§6 del paper | placement demo + evidencias | Primer servicio vendible si hay un comprador. |
| Identidad/baseline | requiere contexto de robot y configuración | referencia existente | Mayor ventaja técnica próxima. |
| Change/version governance | art. VI | diff / impact de referencia | Segundo servicio vendible con dos estados válidos. |
| Incident recorder | RDR read-only firmado/PAIDS según whitepaper | collector read-only limitado | Gap grande: sampling, reloj, triggers, firma, custodia, ventanas. |
| Underwriting risk model | propuesto Layer 1 + 2 | no hay | No entrenar ni mostrar scores sin actuaría. |
| Historial de incidentes | PAIDS propuesto | demo de reconstrucción | Validar cadena de evidencias humanas y telemetría autorizada. |
| Cross-OEM data corpus | investigación bajo licencias | no corpus propio autorizado | Visión de futuro, no producto. |

## 4. Dónde no competir directamente
La propuesta de Elaris puede ser complementaria a una MGA: proveedor neutral de **technical evidence / source-of-truth**, no corredor/asegurador. Permite servir múltiples brokers y aseguradoras sin contaminar los hechos de origen con decisiones de una sola entidad. Si una alianza exige exclusividad sobre datos industriales comunes o reventa de datos ajenos, re-evaluar.

## 5. Potenciales ventajas estructurales (NO comprobadas)
1. Alcance multi-actor: expediente sirve al integrador antes de seguro y después a mantenimiento, auditoría o cliente.
2. Evidencia y decisiones con trazabilidad temporal.
3. Conector read-only reutilizable para capturas autorizadas.
4. Posibilidad de ofrecer servicio sin SaaS 24/7.
5. Coste marginal decreciente **sólo si** captura y plantillas llegan a ser repetibles.

## 6. Qué valida/no valida el benchmark
- `SUPPORTED`: Boop describe arquitectura que conecta seguros, datos y software. Elaris tiene primitives que solapan parcialmente.
- `NOT_SUPPORTED`: Elaris iguala funcionalidades Boop, tiene una MGA, está autorizado a compartir corpus, RDR es probado, hay 392 clientes disponibles para Elaris, existe tarifa aceptada.
- `RECOMMENDATION`: preparar un pack real con actor comprador, formato y autoridad confirmados; solo después automatizar o profundizar software.

## 7. Prueba de mercado: Boop no basta
Un competidor puede validar que existe una **hipótesis comercial articulada**, no garantiza qué pagará el comprador por un informe. Necesitamos entrevistar brokers (A14), suscriptores (A15), integradores (A04) y operadores (A05), reconstruir un expediente real y obtener pago o compromiso escrito.
