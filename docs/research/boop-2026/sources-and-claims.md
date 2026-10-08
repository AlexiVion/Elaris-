# Registro de fuentes, fecha y afirmaciones — BOOP-2026
**Corte de investigación:** 2026-10-08. Las URLs son referencias; esta investigación no reproduce íntegramente obras ajenas.
**Estados:** `PRIMARY_SELF_DESCRIPTION`, `PRIMARY_WORKING_DRAFT`, `INDEPENDENT_CONTEXT`, `REGULATORY_PRIMARY`, `ELARIS_REPOSITORY`, `OUR_INFERENCE`, `UNVERIFIED`.

| ID | Fuente | Clase | Sustenta | No sustenta |
|---|---|---|---|---|
| B01 | https://www.trustboop.com/ | PRIMARY_SELF_DESCRIPTION | Boop publicita seguro robótico por daños humano/robot/máquina, robot, cyber+/interrupción y RDR | pólizas efectivamente emitidas, carriers identificados, capacidad legal |
| B02 | https://www.trustboop.com/pricing | PRIMARY_SELF_DESCRIPTION | pricing comercial por robot y cuatro propuestas Caged/Core/Cyber+/Enterprise | precio USD público, aprobación actuarial, siniestralidad |
| B03 | https://www.trustboop.com/research/white-paper | PRIMARY_WORKING_DRAFT | Boop v0.8 junio 2026, arquitectura en cuatro capas, MGA declarada, PAIDS/RDR, siete artículos, límites | estándar adoptado externamente, acceso RDR, reaseguro comprobado |
| B04 | https://www.trustboop.com/research/black-box-for-robots | PRIMARY_SELF_DESCRIPTION | diseño promocionado de RDR, ventanas acotadas, read-only, afirmaciones sobre contenedor y recursos | benchmark auditado del binario, publicación del contenedor efectivamente accesible |
| B05 | https://www.trustboop.com/research/out-of-the-loop | PRIMARY_SELF_DESCRIPTION | tesis del grafo de nodos de solo lectura, límites recursos y auditoría | prueba independiente de ausencia de publicadores/comandos |
| K01 | https://www.koop.ai/news/robots-are-earning-the-worlds-trust-and-koop-has-the-data-to-prove-it | COMPETITOR_SELF_DESCRIPTION | contrapunto de Koop basado en 392 firmas (según su comunicado de 2026-09-21) | acceso al corpus, extrapolación mercado completo |
| L01 | https://www.lloyds.com/market-resources/delegated-authorities/coverholders | REGULATORY/INDUSTRY_PRIMARY | delegación vía Binding Authority, diferencias MGA/coverholder/broker | habilitación Elaris o Boop en jurisdicción específica |
| L02 | https://www.lloyds.com/market-resources/delegated-authorities/coverholders/welcome/ | REGULATORY/INDUSTRY_PRIMARY | responsabilidades, aprobaciones y contratos del coverholder | licencias globales automáticas |
| AR01 | https://www.argentina.gob.ar/superintendencia-de-seguros/mercado-asegurador/productor-asesor-de-seguros | REGULATORY_PRIMARY | matrícula PAS para intermediación profesional en Argentina | vía libre a comisiones sin matrícula |
| AR02 | https://www.argentina.gob.ar/servicio/solicitar-la-inscripcion-en-el-registro-de-agentes-institorios | REGULATORY_PRIMARY | rol con mandato de aseguradora, persona jurídica y 2 años trayectoria principal como requisito de la vía descrita | que esta figura equivalga universalmente a MGA de Lloyd's |
| AR03 | https://www.argentina.gob.ar/inscripcion-en-el-registro-de-sociedades-de-productores-asesores-deseguros | REGULATORY_PRIMARY | inscripción y objeto exclusivo de sociedades de PAS | viabilidad de mezclar libremente un holding horizontal con intermediación |
| E01 | docs/portfolio/README.md | ELARIS_REPOSITORY | 14 Product Systems y estado |
| E02 | docs/portfolio/shared-capabilities.md | ELARIS_REPOSITORY | capacidades verificadas o reutilizables |
| E03 | docs/pilots/humandroid/pilot-spec.md | ELARIS_REPOSITORY | G1 Humandroid en Siglo 21, no producción, no caso asegurable probado |
| E04 | docs/product/placement-workspace/README.md | ELARIS_REPOSITORY | demo orientada a preparación, sin broker validado |
| E05 | docs/product/underwriting-workspace/README.md | ELARIS_REPOSITORY | prototipo conceptual, sin decisión de suscripción reproducida |

## Claim register / evidencia
| Claim | Fuente | Clasificación | Evaluación |
|---|---|---|---|
| Boop se presenta como MGA con fronting y reaseguro | B03 §6.4 | Declaración de la empresa | `SELF_REPORTED`; revisar entidad legal/licencia, contratos y capacidad si se intenta asociar. |
| Todo robot cubierto lleva RDR | B01/B02 | Mensaje marketing | `UNVERIFIED` instalación real y cobertura efectiva. |
| RDR firmado, read-only, sin publicaciones de comandos | B03 §7, B04, B05 | Diseño publicado | `NOT_INDEPENDENTLY_AUDITED`; no ejecutar contenedor por investigación. |
| CPU < 3,6 %, memoria ~0,3 %, medio día integración | B04/B05 | Métricas publicadas | `SELF_REPORTED`; hardware/ensayo no descrito de forma independiente. |
| PAIDS = estándar operativo de la industria | B03 | NO sustentado | Boop lo **propone**; no consta adopción industrial externa. |
| Boop usa modelos de pricing Bayesianos / BLP en producción | B03 §6 | Intención/diseño | `NOT_VERIFIED_AS_DEPLOYED`. |
| Certificación ISO es requisito binario universal | B03 §3, §6 | Política de diseño Boop | No extrapolar a todos los riesgos, normativas ni mercados. |
| Elaris puede construir un expediente de evidencia parcial | E01–E05 | Nuestra hipótesis técnica | Requiere ejecución reproducible y revisión; capacidad comercial NO validada. |
| Siglo21 G1 produce información suficiente para cotización | Ninguna | `FALSE/NOT_SUPPORTED` | Contexto institucional sin exposición productiva ni datos aseguradores verificados. |
| Mercado autoriza comisión de originación informal en Argentina | Ninguna | `NOT_SUPPORTED` | La figura y remuneración dependen de asesoramiento jurídico y contrato. |

## Incertidumbres de investigación a resolver
1. Denominación societaria real, jurisdicción y autorización de Boop; entidad fronting y reaseguradoras: `NOT_VERIFIED`.
2. Disponibilidad general, versión, auditoría independiente, modo de instalación y licencias de RDR: `NOT_VERIFIED`.
3. Estatus de PAIDS, esquema descargable, adopción por OEMs/capacidad regulatoria: `PROPOSED_BY_BOOP`.
4. Tamaño/coste/margen de pólizas reales para Physical AI en ARG/EU/US: `UNKNOWN`.
5. Aseguradoras y brokers que compren **un servicio técnico**: `UNKNOWN`.
6. Derecho de Elaris a analizar/compartir cualquier dato real de Humandroid con aseguradoras: `NO_GENERAL_AUTHORIZATION`.
7. Certificación/ley aplicable en cada uso (industrial, no industrial, teleop, jurisdicciones): consulta experta pendiente.

## Método de validación de citas
Separar siempre:
1) **Boop declara/propone**; 2) **otra fuente regulatoria confirma marco**; 3) **Elaris implementó**; 4) **Elaris observó**; 5) **nuestra inferencia**. No se convierten en una misma categoría por mera proximidad textual.
