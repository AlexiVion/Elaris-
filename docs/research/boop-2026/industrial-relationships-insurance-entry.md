# La industria completa: grafo A01–A20 y vía de entrada aseguradora
**Estado:** `HYPOTHESIS_GRAPH_V1`, basado en `docs/industry/physical-ai-industry-map.md` y fichas existentes; **no** implica transacciones comprobadas entre empresas concretas. **Objetivo:** ampliar conocimiento horizontal y anclar primera vertical sin reducir Elaris a insurance.

## Modelo del grafo
**Nodos:** ActorArchetype, Organization, Product, Service, RobotModel, RobotUnit, Component, SoftwareRelease, Deployment/Site, Operator, Evidence, Change, Incident, Policy/Claim/FinanceRecord (solo si permitido).
**Aristas tipadas:** `SUPPLIES`, `LICENSES_SOFTWARE_TO`, `BUILDS`, `INTEGRATES`, `HOSTS`, `DEPLOYS`, `OPERATES`, `SERVICES`, `AUDITS`, `APPROVES`, `FINANCES`, `BROKERS`, `UNDERWRITES`, `REINSURES`, `CLAIMS_SERVICES`, `OBSERVES`, `PROVIDES_EVIDENCE_TO`, `OWNS_DATA`, `AUTHORIZES_USE`, `PAYS`, `IS_AFFECTED_BY_CHANGE`.
Cada arista debe poder guardar hechos, fuente, fechas de validez, costo/precio cuando público o autorizado, responsable y permisos. Sin evidencia una arista es `HYPOTHESIS`; para organizaciones concretas no generamos relaciones imaginarias.

## Inventario de los 20 actores con interconexiones
| ID | Actor | Recibe de / insumos | Entrega a / outputs | Quién puede pagar por valor Elaris | Nexo seguro/primer dossier |
|---|---|---|---|---|---|
| A01 | Componentes / subsistemas / materiales | materiales, maquinaria, especificaciones; A07 compras | partes, datasheets, lotes, advisories a A02/A04/A13 | OEM/QA o proveedor | identidad lote/parte, cambios y fallos atribuibles documentalmente |
| A02 | Robot OEM | A01 partes, A03 software, pruebas A11 | robot, documentación y releases a A04/A05/A13/A19 | OEM/Integrador | configuración, FMEA/release/certificados provistos |
| A03 | IA / software / modelos | hardware A02, infraestructura, datasets autorizados A20 | versión, pesos, software, licencias, actualizaciones a A02/A04/A19 | OEM/desarrollador | identidad versión/OTA; no copiar pesos |
| A04 | Integrador robótico | robot A02, software A03, site A06/A08 | solución configurada, ensayos y expediente para A05/A06/A11/A14 | **Integrador**, buyer inicial | **ICP primario**, datos de integración |
| A05 | Deployer / RaaS | sistema A04/A02, contratos A06, crédito A17 | robot instalado, uptime y operación a A06/A08/A19 | **Operador/Deployer**, buyer inicial | **ICP primario**, robot+entorno |
| A06 | Enterprise Buyer / dueño negocio | propuestas A04/A05, reglas A07/A09/A10 | contrato, criterios de aceptación, presupuesto | comprador enterprise | necesidad asegurable, contexto operativo |
| A07 | Procurement | A06 presupuesto, A11/EHS, A04 oferta | RFP, due diligence, órdenes, criterios a A04/A05 | corporativo | documentación exigida para compra |
| A08 | Operación de sitio | despliegue A05, formación A09/A13, telemetría A19 | observaciones, turnos, incidentes y condiciones a A05/A13/A18 | operador/site owner | exposición y modos observables |
| A09 | Safety / EHS | normas/ensayos A11, contexto A08, diseños A04 | controles, revisión humana y límites a A04/A05/A06 | buyer/sitio/integrador | evidencia safety, no aprobación Elaris |
| A10 | Cyber / IT / OT | software A03, red/teleop A19, contexto A08 | arquitectura, hallazgos, hardening y auditoría | buyer/operador | vectores cyber; no diagnóstico automático |
| A11 | Laboratorio / conformidad | especificación A02/A04, normas, pruebas | informe y evaluación de conformidad a A06/A09/A14/A15 | OEM/integrador/comprador | pruebas y certificación **de terceros** |
| A12 | Legal / riesgo / compliance | contratos A06/A14/A15, incidentes A18 | derechos, legal review, jurisdicción, responsabilidades | cliente/corredor/asegurador | consentimiento, propósito, cadena custodia |
| A13 | Mantenimiento / campo | robot A05, manual A02, observaciones A08/A19 | orden servicio, repuestos, test de retorno | fleet/owner | historial de mantenimiento verificado |
| A14 | Broker / PAS / mayorista | exposición A04/A05, evidencia A09/A11, necesidad A06 | submission, preguntas mercado, renovación a A15 | **broker (buyer candidato)** | **ICP de validación** para pack pre-underwriting |
| A15 | Insurer / MGA / suscriptor | submissions A14, ingeniería A11, datos A05/A18 | quote/condiciones, aceptación o negativa autorizadas | **suscriptor (buyer candidato)** | experto define campos decisorios |
| A16 | Reaseguro / capacidad | portfolio/pólizas A15, concentración A20 | capacidad, condiciones, reporting y capital a A15 | aseguradora/reaseguradora | agregación posible sólo con derechos/cohortes |
| A17 | Finance / leasing / dueño económico | activos A02/A05, contratos A06, historia A13 | financiamiento, leasing, garantías a A05/A06 | titular económico | valor asegurado / asset evidence |
| A18 | Claims / perito / forense | siniestro A08/A15, logs A19, historias A13 | línea temporal, dictamen de perito, expediente a A15/A12 | claims/aseguradora | reconstrucción, **no** causalidad legal automática |
| A19 | RobOps / telemetría / fleet | equipos A02, operaciones A08/A05, software A03 | alertas, logs, eventos y registros a A05/A13/A18 | operador/proveedor | evidencias telemétricas autorizadas |
| A20 | Datos / riesgo / analítica | datasets licenciados A01–A19, outcomes A15/A18 | benchmarks, modelos, agregaciones a actores autorizados | cliente de datos/modelos | inteligencia futura, no corpus propio hoy |

**Matices:**
- «Paga» es hipótesis de presupuesto, no prueba de contratación.
- El grafo admite varias clases de transacciones de dinero; **quién genera el dato, quién paga y quién tiene autoridad son nodos/aristas diferentes**.
- La extracción primaria/minería, fabricación de maquinaria y capital goods no están desagregados hoy dentro de A01. **Backlog:** auditar upstream antes de agregar A21+ o dividir A01.
- No confundir A15: MGA, MGU, carrier y underwriter comparten parte del problema pero NO son la misma entidad/autoridad; en fichas futuras deben dividirse en subroles.

## Cuatro cadenas interconectadas
### Cadena física
A01 → A02 → A04 → A05 → A08 → A13 → A01/A02 (repuestos) y A18 (incidentes). A03 alimenta A02/A04. A19 observa operación con permiso.

### Cadena aceptación/autoridad
A04/A05 → A09/A10/A11 → A07/A06 → A08; una aceptación es declaración firmada por responsable, no inferencia.

### Cadena aseguradora/financiera
A04/A05/A06 + A11/A09 → A14 → A15 → A16; A17 financia activo; A18 atiende potencial siniestro → A15/A12; renovaciones retroalimentan A14. **Frontera:** sólo actores autorizados pueden suscribir/emitir/asesorar/intermediar según jurisdicción.

### Cadena de conocimiento/propiedad intelectual
A19/A13/A18/A04/A02 generan eventos y cambios → Elaris organiza como repositorio técnico de procedencia → productos sectoriales con permiso → A20 puede generar insights en el futuro bajo contrato y derechos explícitos. No promover automáticamente datos del socio a dataset comercial.

## Qué ampliaría en cada ficha industrial (sin sobrescribir hipótesis como hechos)
`identity`, `industry_position`, `economic_function`, `inputs`, `outputs`, `machines_and_tools`, `software_stack`, `events`, `capital_flow`, `contracts`, `decision_rights`, `customer_segments`, `pain_map`, `source_systems`, `data_produced`, `data_needed`, `outbound_relations`, `inbound_relations`, `real_companies_cited`, `evidence_level`, `service_opportunities`, `product_roadmap`, `regulation_jurisdiction`, `unit_economics_hypotheses`, `last_verified_at`.

## Enlaces prioritarios a verificar con actores reales
- **A04→A14:** qué documentos falta completar antes de consultar al mercado.
- **A14→A15:** qué campos cambian preguntas o decisiones, no sólo «estaría bueno tener».
- **A15→A16:** qué agregados usa reaseguradora y bajo qué derechos.
- **A05→A19:** quién posee los registros de robot y puede autorizarnos el análisis.
- **A02→A05:** qué evento/versiones obliga a actualización de baseline.
- **A08→A18:** cómo se conserva evidencia de eventos y qué reloj/fuente es fiable.

Próximo paso para ficha 2.0: pedir a Juanma confirmación actor/empresa/decisor/proceso/artefacto/flujo de pago y versionar aristas confirmadas; no llenar «empresa real» con ejemplos hipotéticos.
