# Infraestructura neutral, permisos y evolución de Elaris
**Propósito:** encajar Insurance Vertical 1 sin reducir el sistema global de la industria a un backend MGA. **Estado:** arquitectura y gobierno propuestos; NO implementación entregada por esta investigación.

## 1. Separación lógica y económica
```text
                GLOBAL INDUSTRIAL INTELLIGENCE (A01..A20+)
               Actor Graph / Money Flows / Org Relations
                                |
                   RIGHTS & IDENTITY BOUNDARY
                                |
                 Shared Elaris Evidence Backbone
       Actor / Org / Robot / Site / Config / Version / Event
            Artifact / Hash / Source / Change / Custody
                     / Permission / Audit / Time
                        /      |       \
          Read-only sources   Documents   External partner imports
            /     |       \
       ENGINEERING  SAFETY/SERVICE    INSURANCE  ... FUTURE
        PRODUCTS       PRODUCTS       PRODUCTS       OPERATIONS
             |            |                |
        Named human     Named human     Licensed insurer
        authorities     authorities     /broker/MGA authority
```

**Principio:** el seguro agrega su `insurance_case`, `submission`, `market_question`, `policy_ref` y eventualmente `claims_outcome` a una vista autorizada. **No se convierte en dueño del robot, del evento físico ni del source-of-truth compartido.**

## 2. Esquema lógico mínimo
**Identidad/activos:**
- `organizations`: legal entity, role(s), jurisdiction(s);
- `assets`: robot, components, software packages, economic owner distinto de host y operador;
- `sites`: host/site sin presuponer cliente comercial;
- `config_snapshots`: canonical identity/hash, capturedAt, source; distinguir hash del snapshot de checksum safety OEM.

**Hechos y pruebas:**
- `sources`: documento/canal/export/operador, owner, confianza;
- `observations`: tipos, unidad, reloj, calidad, frecuencia, raw/derived;
- `events`: incident/near miss/change/OTA/service/transition; evento alegado vs confirmado;
- `evidence_links`: fuente↔afirmación↔sujeto, validFrom/To, responsable;
- `reviews`: named human assessment; nunca sustituir aprobación regulatoria.

**Derechos y economía:**
- `data_permissions`: entidad titular, finalidad, destinatarios, geografía, duración, revocación, retención, exportación, secondary-use rights;
- `commercial_relationships`: contrato/cliente/servicio/fee; no inventar primas ni comisiones;
- `products`: aplicaciones/suscripciones/alcance;
- `audit`: who did what + result + actor authority; evidencia de validación.

## 3. Estructura explícita de evidencia
- **Layer A (raw/source fact):** medición/autorización/documento primario que no se reescribe. Si se carga manualmente, registrar que fue `PROVIDED`, no `OBSERVED`.
- **Layer B (analysis):** clasificación y resumen de Elaris, versión del algoritmo, ventanas, incertidumbre, revisión.
- **Layer C (decision/outcome):** decisiones de EHS, certificadoras, comprador, aseguradora, juez y siniestro. **Solo se almacena con derecho/autoridad y no se propaga por defecto.**

Boop propone PAIDS A/B/C especialmente para siniestros. Elaris usa esa distinción como **principio de provenance transversal** no como implementación de su estándar.

## 4. Controles mínimos de un servicio manual
1. Acuerdo escrito con el comprador que define titularidad, finalidad del análisis y exportación.
2. Lista de archivos autorizados, datos personales mínimos, sin videos sensibles no necesarios.
3. Carpeta local cifrada/segura con control de acceso y política de borrado acordada.
4. Tabla de procedencia: archivo, versión, timestamp/autor cuando disponible, observación `UNKNOWN` si no.
5. No subir datos confidenciales a herramientas de terceros sin permiso contractual.
6. Revisión por alguien técnico de Elaris antes de entregar.
7. Revisión/aceptación de hechos por el responsable del cliente; decisión de aseguradora sólo por suscriptor autorizado.
8. Exportaciones a broker/reaseguro únicamente a destinatario autorizado; no reutilización multi-cliente.
9. Registro de correcciones post-entrega con ID y versión del expediente.
10. Política de retención y borrado, incluyendo copias del proveedor cloud si aplican.

## 5. Por qué NO desplegar el backend completo para vender
Para el primer expediente, basta usar importadores/validadores y reportes locales, con documentación de pruebas y capturas. Un VPS 24/7 sería un coste operativo, una superficie de seguridad y una promesa de servicio innecesarios.

**Demo pública gratuita:** puede mostrar un escenario `SYNTHETIC` estático en hosting gratuito con despliegue GitHub cuando se seleccione proveedor. No publicar observaciones G1 de Humandroid, nombres personales, serial, firmware, direcciones ni datos de sitio sin consentimiento. Elija proveedor después de medir límites/terminología del plan gratuito y requisitos de privacidad. Sin sitio dinámico no ofrecer guardado de expedientes reales.

## 6. Event recorder futuro — gates antes del desarrollo
El diseño de un RDR neutro (si algún comprador lo exige) requeriría:
- verificación negativa del grafo ROS2/DDS (no publishers/control paths), aislamiento por proceso y controles de recursos;
- límites de frecuencia/latencia/cpu sobre hardware real;
- firma en origen/clock quality/rotación de claves/cadena custodia;
- buffers event-triggered, retención y lectura posterior que no afecte control;
- catálogo de tipos de evento y no captura de datos irrelevantes;
- consentimiento por robot, sitio, operador; auditoría independiente para claims;
- vínculo entre evento y baseline/config real;
- datos sin propietario supuesto: permisos por actor y contrato;
- simulación/replay nunca etiquetados como siniestros/accidentes reales.

Ninguno de esos gates se deriva automáticamente de `pnpm edge inspect-unitree --interface enp0s8 --hz 20`. No iniciar un agente nuevo sobre robot físico sin autorización y protocolo.

## 7. Data flywheel real vs retórica
Flujo económicamente sostenible:
`empresa autoriza → evidencia primaria con tiempo/calidad → servicio paga operación de captura/revisión → resultado humano corregido → repetición del mismo problema → ontología/comparabilidad → nuevas verticales`.

Sólo se puede monetizar/entrenar sobre resultados ajenos con **licencias adicionales y valor compartido**, no por una cláusula genérica escondida. Cross-customer aggregation puede revelar diseños, defectos o secret trade patterns incluso sin identificadores directos.

## 8. Modelo organizativo a futuro
- **Elaris Core:** plataforma, IP, identidad, pruebas y permiso.
- **Elaris Services:** prestación de informes técnicos a robots/industria.
- **Elaris Insurance (posible unidad o entidad separada):** intermediación/MGA autorizada si se valida.
- **Elaris Robotics / Manufacturing (posible):** nuevos negocios cuando exista fundamento técnico y económico.

Las estructuras legales, participación societaria, conflictos de interés, marca y cesión de derechos requieren decisión de socios y abogado; el diagrama no crea personas jurídicas.
