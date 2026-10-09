# Elaris Evidence Pack V0.2 — especificación de ingesta documental autorizada
**Fecha:** 2026-10-09 · **Estado:** `SPEC_APPROVAL_PENDING / NOT_IMPLEMENTED` · **Responsable técnico:** Alexi · **Revisión comercial:** Juanma · **Predecesor:** Evidence Pack V0.1 (demo sintética verificada).  
**Misión:** convertir el motor de expedientes técnicos en una herramienta de **servicio B2B bajo contrato** para cualquier actor del mapa industrial, empezando por una necesidad cercana a seguros. **No** se convierte en una MGA ni en un producto exclusivo de aseguradoras.

## 1. Trigger / primer buyer / negocio
- Comprador hipotético: integrador/deployer A04/A05, broker autorizado A14 o profesional de revisión técnica por contrato.
- Trigger: documentos dispersos sobre **una unidad/sistema en un sitio/contexto**, que deben convertirse en una ficha comprobable con fuentes y preguntas abiertas.
- Producto que se factura inicialmente: **servicio de preparación documental técnica**, no software self-service, seguro, scoring ni certificación.
- Éxito: un cliente puede suministrar un conjunto autorizado de documentos y recibir un PDF + registros estructurados, con cada afirmación atribuida a documento exacto, revisión humana y permiso de entrega verificables.

## 2. Alcance piloto (máximo deliberado)
- 1 organización contratante, 1 unidad/sistema, 1 contexto y hasta 10 documentos de entrada por caso.
- Entrega local/bajo control del operador Elaris: PDF y CSV; no cuenta, plataforma pública ni uploads automáticos.
- Fuentes iniciales: PDF, TXT, CSV, JSON **sólo si existe control de ingestión seguro para el formato**. No aceptar enlaces remotos ni ZIP arbitrarios por defecto.
- No lectura ni control del robot físico en este flujo. Component Health y Deployment Control podrán ser fuentes autorizadas en iteración posterior, cuando se describan APIs/export schemas.
- No uso de LLM externo ni envío a SaaS de terceros sin consentimiento contractual explícito. Es posible empezar transcribiendo y confirmando facts manualmente.

## 3. Gate previo de derechos y contrato (BLOQUEA REAL)
**Antes de importar archivos reales debe existir:**
- `case_id` y entidad contratante con responsable.
- Consentimiento/contrato firmado que cubre **posesión lícita de documentos, autorización de tratamiento, finalidad, ubicación de almacenamiento, tipos de datos personales, destinatarios/exportación, confidencialidad, retención/borrado, uso de proveedores y cualquier reutilización**.
- Lista de fuentes y titular/custodio legítimo; restricciones de redistribución por fuente.
- Lista de destinatarios expresamente habilitados. Sin autorización no se exportan copias del documento, sólo el índice si el cliente lo permite.
- Revisor técnico humano nombrado por caso y punto de contacto para verificar hechos.
- Asesoramiento legal por jurisdicción cuando el servicio involucre secretos empresariales, datos personales o actividades aseguradoras reguladas.

**No habilitar REAL simplemente cambiando una condición `mode !== SYNTHETIC`.** Requiere una ruta de código revisada, pruebas, procedimientos y política de protección de datos.

## 4. Contrato de datos propuesto (no persistir aún en Prisma)
```text
case/
  authorization.json         # referencia a contrato firmado; NO contrato público
  input/                      # documentos originales, bajo permisos de OS
  intake_manifest.json        # inventario SHA-256 por archivo, tamaño, formato, dueño, uso permitido
  extracted_facts.json        # afirmaciones PROVIDED/UNKNOWN, con citas verificables
  review.json                 # revisión humana y correcciones versionadas
  output/                     # sólo material aprobado, PDF/CSV/manifest
```

Campos por afirmación:
```yaml
id: F-001
subject: unit/site/configuration/component/operation
field: model_and_identifier
value: "..." # or null when unknown
classification: PROVIDED | OBSERVED | DERIVED | UNKNOWN
source_id: DOC-001 | null
source_location: "page 2 / table 1" | null
source_hash: sha256 | null
valid_at: timestamp | null
recorded_at: timestamp
review_status: DRAFT | NEEDS_SOURCE | VERIFIED_AGAINST_SOURCE | CHALLENGED
reviewer: identifier | null
sharing_scope: recipient_list
confidence_note: "..." | null
```
- `PROVIDED` = afirmado por archivo/persona cliente; **no** medido por Elaris.
- `OBSERVED` = constatación instrumental con sesión, método y versión comprobables.
- `DERIVED` = transformación con regla/procedimiento versionado y posibilidad de reproducir.
- `UNKNOWN` = valor y fuente nulos; no inferencia implícita.
- `VERIFIED_AGAINST_SOURCE` = revisor comprobó fidelidad al archivo, **no** aprobó conformidad normativa ni garantía sobre robot.

## 5. Pipeline de servicio
```text
autorización formal por caso
  → recepción segura fuera del repositorio Git
  → validación de tipos/tamaño, existencia y derechos por documento
  → inventario de hashes por documento
  → extracción asistida o ingreso manual con citas a fuente/página
  → normalización estructurada + UNKNOWN
  → review del responsable técnico (afirmaciones, discrepancias, faltantes)
  → preview interno
  → autorización de destinatarios/exportación
  → PDF + CSV + manifiesto del output
  → entrega segura + registro de aceptación + política de retención
```

## 6. Seguridad e integridad (bloqueos reales)
- Nunca versionar documentos de cliente, tokens, seriales privados, contraseñas, grabaciones personales ni expedientes en Git.
- El intake local **rechaza** rutas fuera del directorio del caso, symlinks externos, archivos demasiado grandes, extensiones no permitidas, nombres no esperados y documentos sin autorización. No confiar en extensión sola; verificar tipo básico y no ejecutar macros/scripts.
- Sólo lectura sobre originales. El cliente aporta copia y se preserva su hash. No editar contenido fuente para ajustar conclusiones.
- Los hashes demuestran integridad relativa a un manifiesto, **no firma digital de origen ni cadena de custodia forense**.
- Los CSV deben neutralizar fórmulas y el HTML escapar contenido, como en V0.1.
- Evitar almacenar secretos en rutas sincronizadas públicamente o compartir directamente el filesystem de desarrollo.
- Política de acceso OS, cifrado de volumen/equipo, backups, retención y eliminación según contrato; no prometer borrado forense de SSD sin método verificable.
- Fallar cerrado ante fuente desconocida, permiso insuficiente, revisión no completada o destinatario no aprobado.
- Pruebas sintéticas para permisos, path traversal, source mismatch, hashes erróneos, duplicados, falta de aprobación, csv injection, PDFs corruptos y fuga de datos.
- No capturar más datos de los necesarios para documentar el caso contratado.

## 7. Hito de implementación A: intake sin exportación de información real
Implementar **en nueva rama/PR**:
1. Esquema y validador `case_manifest` con propietario, autorización y propósito.
2. Registro SHA-256 de documentos + referencias `DOC-001...`; originales en carpeta local excluida de Git.
3. Bloqueo absoluto de rutas externas, documentos sin permiso y modo REAL no revisado.
4. CLI offline que permita inspeccionar la estructura y producir solo **resumen local sin datos sensibles** para verificar flujo.
5. Tests de seguridad y fuentes con fixtures sintéticos. Sin datos reales en la suite CI.

**Gate A:** no existe camino que exporte REAL sin autorización y revisión.

## 8. Hito de implementación B: mapping + revisión humana + exportación
1. Mapear campos del caso a fuente exacta y ubicación.
2. Ciclo de estados `DRAFT → HUMAN_REVIEWED → EXPORT_APPROVED`.
3. Distinguir rol del técnico Elaris y responsable del cliente. Log de correcciones.
4. Exportar sólo hechos y documentos permitidos para destinatarios autorizados; PDF incluye alcance, límites, fuente, revisión y fecha.
5. Verificar output SHA-256 y detener export si faltan gates.

**Gate B:** un caso sintético end-to-end y un ensayo controlado con datos aportados legalmente por un primer cliente; validez y derechos documentados. Los checks de código no sustituyen contrato.

## 9. Fuera de alcance
MGA, intermediación, cotizaciones, primas, decisión de asegurabilidad, certificaciones, PAIDS, RDR, grabación de incidentes, scoring/ML actuarial, entrenamiento en datos privados, web upload self-service, pagos, portal cliente, multi-tenancy, schema Prisma extra, nuevo Product System. No simular que estas capacidades existen.

## 10. Responsabilidades
**Juanma:** validar buyer específico, ejemplo redactado de documentación necesaria, contrato/términos y límites de remuneración; conseguir piloto pagado y confirmación de destinatarios.  
**Alexi:** diseño de schema/manifest, implementación, protección de archivos locales, plantillas, tests, revisión técnica y proceso reproducible.  
**Cliente:** proporcionar documentos y permisos válidos, confirmar los hechos técnicos del sistema y aprobar la lista de destinatarios.  
**Intermediario/suscriptor autorizado:** revisar, solicitar evidencia y decidir cobertura cuando corresponda; Elaris no reemplaza ese rol.

## 11. Criterios de inicio y cierre
**START implementación:** este documento revisado, worktree/PR separados, análisis de threat model, fixtures sintéticos, owner, checklist de permisos. **No requiere documentos reales para comenzar el código.**

**DONE primer servicio REAL:** contrato de alcance y datos aprobado; originales autorizados almacenados correctamente; facts trazables y revisados por humano; PDF/CSV limpios y permitidos; log de export y aceptación; costes/horas registrados; factura o compromiso del comprador. Hasta entonces: `TECHNICAL_READINESS` no `COMMERCIAL_VALIDATION`.

**Dependencias:** V0.1 completo; revisar las ramas apiladas PR #25 → #24 → #22 antes de integrar; no escribir el esquema nuevo sobre DC051. 
