# Vertical 1 — Oferta comercial de Elaris con servicios técnicos (SIN MGA inicial)
**Hipótesis, no producto contratado.** Vertical insurance/risk es punto de entrada, NO posicionamiento total Elaris. Dueño comercial: **Juanma**. Dueño técnico/instrumentación/entrega: **Alexi**. Ninguna comisión sobre pólizas presumida.

## 1. Tres actores pueden comprar servicios técnicos diferentes
| Ruta | Comprador | Disparador | Valor que compra | Estado |
|---|---|---|---|---|
| V1A | Integrador/deployer A04/A05 | pretende asegurar, renovar, vender o desplegar robot y debe ordenar documentos | **Technical Exposure & Evidence Pack** | HIPÓTESIS PRIORITARIA |
| V1B | Broker/MGA A14 | recibe submission robótica técnica incompleta | **Underwriting Submission Preparation** por encargo del intermediario | HIPÓTESIS ALTERNATIVA (pago a confirmar) |
| V1C | Aseguradora/suscriptor A15 | quiere aclaraciones y evidencias antes de decidir | **Technical Evidence Gap Review** | HIPÓTESIS; exige evitar conflicto y no emitir opinión actuarial |

**No vender las tres simultáneamente como catálogos terminados:** entrevistarlas y elegir una con presupuesto decisor y expediente real. Una variación del mismo motor de servicio, no tres backends.

## 2. Oferta para test A/B (una sola capacidad reutilizable)
**Nombre:** Elaris — Physical AI Technical Evidence Pack (for insurance review).  
**Promesa verificable:** «En lugar de revisar carpetas sueltas, recibís una ficha técnica versionada de los robots, documentos vinculados y una lista transparente de campos faltantes para que un profesional autorizado haga su propia revisión».
**No prometer:** «acelera aprobaciones», «reduce primas», «asegura/certifica la flota», «establece la tasa de siniestros», «es PAIDS compliant».

### Input contratado
- 1 empresa, 1 unidad o sistema, 1 contexto de instalación.
- Hasta 10 documentos/fuentes por paquete piloto, o máximo de horas acordado.
- Aprobación escrita de uso/tratamiento, fuente/fecha/versión de cada documento.
- Un responsable técnico cliente/broker para validar hechos.
- Criterio de exclusión: manipulación activa del robot, extracción no autorizada, datos personales no necesarios, información confidencial de terceros sin derecho de uso.

### Output entregado (PDF + XLSX/CSV + ZIP opcional sólo autorizado)
1. **Deployment profile:** fabricante/modelo, responsable, host, tarea y exposición sólo si verificadas.
2. **Configuration register:** versiones/componentes con origen, fecha, estado y sin ficciones.
3. **Evidence inventory:** archivo, owner, tipo, aplicabilidad, localización segura, estado.
4. **Gap matrix:** pregunta aseguradora/seguridad técnica, campo disponible/no disponible y quién debería confirmar.
5. **Open questions for reviewer:** preguntas sin sugerir primas/cobertura.
6. **Technical change appendix** únicamente si existen 2 baseline comparables y autorización.
7. **Disclaimer & provenance annex:** método, límites, quién revisó, campos desconocidos, permisos de redistribución.

Entrega **semiautomática y humana**, sin login, operación continua, API ni SLA 24/7. Los PDF/CSV deben ser revisados y aceptados por actor autorizado.

### Precios experimentales: hipótesis, NO benchmark de mercado
- Primera propuesta por alcance limitado: USD 490 (o equivalente acordado) por 1 sistema.
- Variación de validación: USD 300–1.000 según complejidad/documentos; nunca prometer plazo fijo sin ver archivos.
- Trabajo adicional: tarifa/hora o alcance aparte por revisión de cambios y múltiples sitios.
- Condiciones de cobro: anticipo a negociar; impuestos/facturación/moneda sujetos al país.
- Umbral económico a medir: ingresos menos horas reales de ingesta, limpieza, revisión y rectificaciones. Si costo excede margen, modificar antes de repetir.

## 3. Modelo de empresa posible y frontera legal
```text
NOW:  technical services contract → cliente/broker compra expediente
LATER: partner broker/MGA autorizado → colaboración y servicios con contrato
FUTURE: separate authorized insurance vehicle → MGA / delegated authority
ALWAYS: shared Elaris infrastructure → neutral source & governed products
```
- **No** presentar Elaris como MGA, PAS, broker, aseguradora, agente institorio o asesor de coberturas.
- No ofrecer intermediación, cotizaciones, ofertas o comisión de póliza sin determinar licencia, función exacta, estructura contractual y jurisdicción con asesor jurídico. Un «referral fee» puede ser remuneración regulada.
- En Argentina la SSN exige matrícula PAS; la vía agente institorio con mandato tiene requisitos para persona jurídica; las sociedades PAS tienen objeto exclusivo según guía SSN. Ver AR01–AR03. Se estudia vehículo separado si se pretende conservar matriz Elaris horizontal.
- Una posible alianza inicial **no** da autoridad para citar logos, usar datos de cliente o transferir corpus.

## 4. Guía de entrevistas basada en artefactos
### Broker / MGA (Juanma)
- «Mostrame, con datos anonimizados, la última propuesta robótica que costó completar».
- ¿Qué campos y adjuntos pidieron por robot/site/task/control mode?
- ¿Quién pagó por recolectar eso? ¿Cuántos intercambios/cuántas horas?
- ¿Qué cambió tras un update/renovación? ¿Tienen obligación de notificar?
- ¿Qué falta disparó una consulta, condición, declinación o revisión (sin revelar información protegida)?
- ¿Un servicio tercero de 1 robot y 10 docs por USD 490 resolvería un problema o contratarían distinto? ¿Quién aprueba gasto?
- ¿Cómo manejan confidencialidad, auditoría, interés del cliente, derecho a exportar?
- ¿Aceptarían piloto pagado con alcance delimitado?

### Integrador / desplegador
- ¿Cuál fue el último proceso de seguro, aprobación de sitio o venta donde hubo que reconstruir documentos?
- ¿Quién conserva firmware/part numbers/ensayos/manuales/releases?
- ¿Qué documentación puede compartir? ¿Qué terceros deben autorizar?
- ¿Cuánto tiempo costó el último pack? ¿Quién lo firmó?
- ¿Qué dolería más: informe inicial, actualización, soporte por cambio?

### Suscriptor / risk engineer
- ¿Qué mínimo de datos realmente necesita para decir «revisable», sin confundirlo con «asegurable»?
- ¿Cuáles son 5 preguntas que más se repiten y qué fuente consideran confiable?
- ¿Qué debe venir firmado por fabricante/integrador/cliente, y qué puede elaborar un tercero documental?
- ¿Quién podría contratar el procesamiento y con qué conflictos?

## 5. Secuencia comercial de 10–15 días hábiles
| Fecha relativa | Juanma: canal/negocio | Alexi: entrega técnica | Gate |
|---|---|---|---|
| D1–D2 | seleccionar 20 cuentas (A04, A05, A14, A15) y 2 segmentos | plantilla genérica con caso SINTÉTICO; flujo de datos local | oferta explicable en 2 min |
| D3–D7 | 20 contactos personalizados, 6 respuestas deseadas | demo documentada, sin datos reales del G1 | 2–4 llamadas reales |
| D5–D10 | entrevistar con artifacts redacted, registrar workflow + quién paga | mapa campo→fuente/limitación, costo de producción | 1 comprador explícito |
| D8–D15 | propuesta firmable, aclaración legal, contrato de servicio | entregar 1 piloto manual revisado | **1 pago o compromiso contractual con presupuesto** |

Los números son **objetivos de experimentación**, no forecast.

## 6. Indicadores y condiciones de decisión
`contacts`, `positive_replies`, `discovery_calls`, `real_artifact_sets_permitted`, `proposal_requested`, `paid_trials`, `delivery_hours`, `gross_margin`, `repeat_request`, `legal_blockers`.
- **GO:** comprador con tarea dolorosa + autorización de datos + pago y alcance viable.
- **MODIFY:** problema existe, pero formato/precio/actor distinto.
- **PAUSE:** no hay acceso/permisos, documentos confidenciales o preguntas reguladas.
- **KILL este SKU:** reiteradas entrevistas sin trabajo repetido ni presupuesto. Mantener horizontal Elaris.

## 7. Intención de colaboración vs falsa validación
Un socio técnico (Humandroid), una demo convincente, un proveedor que ofrece seguro (Boop) y una entrevista exploratoria NO constituyen cliente asegurador. Son etapas independientes. La venta y el servicio se contabilizan sólo con acuerdo y cobro correspondientes.

## 8. Futuras unidades de negocio posibles, condicionadas
- actualización de expediente tras software/OTA;
- evidence room para integración OEM;
- seguimiento documental de mantenimiento;
- reporte de cambios para auditoría independiente;
- servicio para originación/placement bajo marco jurídico;
- más adelante servicio de captura tipo event recorder con cadena de custodia;
- eventualmente MGA/robots/skills/fabricación si hay demanda, capital y permisos.

La primera vertical NO impone que otras áreas deban depender de una aseguradora. 
