# BOOP-2026 — Registro de decisiones, plan y tareas
**Fecha:** 2026-10-08. **Estado general:** `RESEARCH_DOCUMENTED / COMMERCIAL_UNVALIDATED`.  
**Principio:** documentos en GitHub son entregables de investigación, NO autorizan desarrollo, publicación de datos ni actividades aseguradoras.

## Decisiones y evidencias
| ID | Decisión/conclusión | Evidencia | Estado | Condición de cambio |
|---|---|---|---|---|
| BOOP-DEC-001 | Elaris es horizontal multi-actor; insurance es vertical temporal prioritaria | declaración fundadores; vision doc | `FOUNDER_DIRECTION` | founders aprueban cambios |
| BOOP-DEC-002 | Boop = referencia arquitectónica, no producto clonable íntegro | B01–B05 | `RESEARCH_CONCLUSION` | producto/benchmark verificado |
| BOOP-DEC-003 | El primer entregable razonable es dossier de evidencias, no prima ni riesgo legal | capacidades E01–E05 y gaps §7 | `HYPOTHESIS` | comprador demuestra otro valor |
| BOOP-DEC-004 | PAIDS es propuesta Boop, no requisito universal | B03 v0.8 | `SOURCE_VERIFIED` | evidencia de estandarización externa |
| BOOP-DEC-005 | Siglo21 G1 es contexto institucional, no despliegue productivo asegurado | E03 | `CASE_SCOPE` | datos/aprobación real de Humandroid |
| BOOP-DEC-006 | No se ofrecen pólizas ni comisiones sin revisión legal/jurisdiccional | AR01–AR03, L01–L02 | `LEGAL_GATE` | opinión legal + acuerdos efectivos |
| BOOP-DEC-007 | No se integrará RDR ni realizará risk scoring en primer SKU | gaps sin datos/sampling/authority | `DEFERRED` | comprador real y captura validada |
| BOOP-DEC-008 | No mezclar datos sin permisos; múltiples verticales consumen hechos compartidos | visión, §8 Boop, arquitectura | `ARCHITECTURAL_RULE` | nueva autorización explícita |

## Workstreams
### WS1 — Comercial (Juanma)
| ID | Acción | Entregable verificable | Prioridad | Estado |
|---|---|---|---|---|
| BOOP-C01 | Definir ICP comprador inicial entre A04/A05 vs A14/A15 | ficha con actor, job, payer y disparador | P0 | NOT_STARTED |
| BOOP-C02 | Mapear 20 cuentas nombradas con fuente, contacto y jurisdicción | CRM/CSV verificable, no leads inventados | P0 | NOT_STARTED |
| BOOP-C03 | 6 entrevistas sobre expedientes recientes reales/redactados | 6 fichas actor/job/artefactos/tiempo/dinero | P0 | NOT_STARTED |
| BOOP-C04 | Verificar demanda pagada del expediente técnico | 1 alcance con presupuesto y comprador | P0 | NOT_STARTED |
| BOOP-C05 | Investigar estructura de broker/MGA/referral con abogado según mercado | memo jurídico por jurisdicción, actividades permitidas | P0 | NOT_STARTED |
| BOOP-C06 | Explorar 2 alianzas con broker/MGA existente | requisitos, factibilidad y términos, no comisión implícita | P1 | NOT_STARTED |
| BOOP-C07 | Verificar a Boop: actividad regulada, entidades, carrier, reaseguro, auditoría | independent due diligence | P1 | NOT_STARTED |

### WS2 — Producto/entregable (Alexi)
| ID | Acción | Entregable verificable | Prioridad | Estado |
|---|---|---|---|---|
| BOOP-T01 | Construir esquema de dossier técnico semiautomático | generador offline: HTML/CSV/manifest + PDF opcional, datos sintéticos | P0 | SYNTHETIC_DEMO_ACCEPTED |
| BOOP-T02 | Crear demo 100% `SYNTHETIC` con disclosure | fixture y render determinista para generar un pack, revisión visual pendiente | P0 | SYNTHETIC_DEMO_ACCEPTED |
| BOOP-T03 | Ejecutar tiempo de producción real de dossier | coste/hora, quality review, errores, margen | P0 | NOT_STARTED |
| BOOP-T04 | Finalizar gate local DC-051 (PR23), sin mezclar con investigación | tests, lint, build, E2E PASS | P0 | IN_PROGRESS_EXTERNAL |
| BOOP-T05 | Diseñar legal/permissions checklist para intake | contrato/protocolo aprobados por asesor cuando corresponda | P0 | NOT_STARTED |
| BOOP-T06 | Mapear requisitos del primer broker/suscriptor a la ontología Elaris | campos y fuentes versión 1, con gaps | P1 | BLOCKED_BY_C03 |
| BOOP-T07 | Link G1 baseline real con Component Health si Humandroid autoriza | evidencia real/no-claims y review | P1 | BLOCKED_BY_PARTNER |
| BOOP-T08 | Publicar demo estática con datos ficticios, CI GitHub | URL 24/7 sin backend ni datos privados | P1 | NOT_STARTED |
| BOOP-T09 | RDR/event recorder/PAIDS formal/risk model | SÓLO propuesta futura | P3 | DEFERRED |

### WS3 — Industria y plataforma (fundadores)
| ID | Acción | Resultado | Prioridad | Estado |
|---|---|---|---|---|
| BOOP-I01 | Revisar fichas completas A01–A20 con grafo y transacciones | relaciones validadas, no únicamente matriz conceptual | P1 | PLANNED |
| BOOP-I02 | Auditar cadena upstream extracción/materiales/maquinaria | dividir o crear arquetipos tras fuentes reales | P2 | PLANNED |
| BOOP-I03 | Definir ontología mínima compartida y políticas de uso secundario | schema versionado + permisos | P1 | PLANNED |
| BOOP-I04 | Documentar otros negocios potenciales sin comprometer engineering | options register/GO signals | P2 | PLANNED |

## Gate comercial 1 — el único que abre primera venta
**Input:** un comprador nombrado, un expediente real/redactado **con permiso**, su última pregunta o revisión.
**Método:** mapear fuentes/campos/gaps, horas, forma de entrega, revisión humana, hipótesis económica.
**Output:** entrega piloto que cliente pueda revisar y un precio/contrato aceptados.
**No claims:** underwriting, conformidad, certificación, causación de siniestro, solvencia, baja de prima.
**Decision:** GO/MODIFY/PAUSE/KILL con registro de quién respondió qué.

## Gate comercial 2 — seguro intermediado
**Input:** asesor jurídico por mercado + broker/MGA autorizado + entidad que requiere seguro.
**Output:** acuerdo legal de servicios o canal con responsabilidades, quién cotiza/asesora/emite y base válida de remuneración.
**NO** iniciar actividad regulada por tener logos, contactos o un demo.

## Gate técnico de integridad
**Input:** schema/archivos del cliente y rights log.
**Output:** cada afirmación en el PDF trazable a una fuente, marcada `OBSERVED`, `PROVIDED`, `DERIVED`, `UNKNOWN` o `SYNTHETIC`; anexo de limitaciones.
**Tests:** unknown remains unknown; no formula de riesgo; no identidad o certificación inventada; no export no consent.

## Supuestos medibles que podrían fallar
- A1: intermediario compra preparación independiente y no la hace internamente.
- A2: integrador/deployer está dispuesto a pagar por organizar información ya dispersa.
- A3: nuestro coste de elaboración deja margen a la tarifa piloto.
- A4: documentos/permiso son suficientes y no bloquean el trabajo.
- A5: cliente desea actualizaciones; puede generar recurrencia.
- A6: broker y underwriter requieren objetos configuraciones/versions distintos de formulario estándar.
- A7: Elaris puede vender servicio sin confundirse con autoridad aseguradora.

Si A1/A2 no se confirman, priorizar otros actores del mapa, no abandonar la misión horizontal ni construir MGA a ciegas.

## Artefactos creados por ESTA investigación
- Visión institucional `docs/company/long-term-vision-industrial-intelligence.md`
- Source/claims registry
- White paper deep-dive
- Benchmark 14 productos
- Crosswalk PAIDS / Elaris
- Grafo de 20 actores
- Oferta y experimento comercial
- Arquitectura/derechos
- Este registro de decisiones

**No realizados:** software, adquisición de clientes, pruebas del RDR, contacto con Boop, análisis jurídico individualizado, pólizas, ingresos, un nuevo deployment público 24/7.

## Technical implementation track — issue fallback

**2026-10-08:** GitHub Issues are **disabled** in this repository (API returned HTTP 410). As permitted by the repository docs, the versioned backlog serves as the executable work unit. One branch/PR is maintained and the Issue link is marked `UNAVAILABLE_REPOSITORY_SETTING`, not invented.

### BOOP-T01/T02-V0 — Offline Evidence Pack Generator
- **Owner:** Alexi (technical); **review:** Juanma (commercial format).
- **Actor:** A04/A05 integrator/deployer, A14 broker as buyer hypothesis.
- **Trigger:** prepare a source-referenced technical evidence dossier before formal underwriting review.
- **Input V0:** structured JSON, `SYNTHETIC` only; no Humandroid/G1 intake, no real-client data.
- **Output V0:** printable HTML, CSV fact/evidence/gap registers, hash manifest, optional PDF using existing Playwright.
- **Deterministic role:** validate and escape facts/sources, retain UNKNOWN, preserve traceability; no risk/coverage score.
- **Human authority:** commercial user must review presentation; customer/broker/suscriptor decide actual content and its meaning.
- **Non-claims:** no MGA, brokerage, certification, safety approval, insurability, premium or PAIDS compliance.
- **Acceptance:** fail-closed on REAL input and unsupported source ID; synthetic watermark; CLI/test sample; no new dependencies/DB; local suite/build pending external run.
- **Branch:** `feat/technical-evidence-pack-offline-v0` (stacked on research PR #24; does not depend on unfinished DC051).
- **Owner action after PR:** run local offline CLI and tests, inspect PDF quality, record reproducible results; **do not merge without verification**.
- **Current state (2026-10-09):** `FULL_LOCAL_GATE_PASS` — Evidence Pack CLI/PDF, 9/9 Node tests, lint, typecheck, suite general y Next.js build de 59 páginas pasaron en gate aislado WSL. **PDF V0.1 validado visualmente:** paquete de 2 páginas, sección 03 completa en página 2 y SHA-256 de seis outputs verificados. **Pendiente:** validación comercial. Sin intake real, sin E2E ni deployment público. [Gate final](evidence-pack-v01-build-gate-2026-10-09.md).


### BOOP-T10 — Evidence Pack V0.2: ingesta documental REAL bajo permisos
- **Estado:** `SPEC_WRITTEN / IMPLEMENTATION_NOT_STARTED`.
- **Requisito de entrada:** V0.1 sintética aceptada; siguiente implementación en rama/PR separados.
- **Alcance:** case permissions, inventario hash por fuente, trazabilidad por dato, revisión humana y exportación a destinatarios expresamente permitidos. Primero fixtures sintéticos; nunca copiar/ingestar datos Humandroid sin autorización.
- **Owner técnico:** Alexi. **Validación comercial:** Juanma.
- **Prohibido:** convertir `mode: REAL` en un simple flag, incluir carpetas privadas en Git, crear rating asegurador o MGA, reclamar PAIDS.
- **Especificación y gates:** [Evidence Pack V0.2 — secure real-client intake](evidence-pack-v02-real-intake-spec.md).

## BOOP-T11 — G1 Real Field Evidence Bridge V0.2a (2026-10-09)

**Owner técnico:** Alexi · **Actor piloto:** Humandroid A04/A05, no comprador asegurador · **Estado:** `CODE_COMMITTED / PENDING_WSL_LOCAL_GATE / NO_REAL_FILE_INSPECTED`.

**Necesidad específica:** probar que la capa Elaris de expedientes puede organizar los resultados técnicos **existentes** del Unitree G1 real sin fabricar observaciones, alterar datos originales ni imponer un modelo asegurador.

**Entrada fuente:** el output pack verificado de Component Health V0.3 `field-evidence-v03.json` + `checksums.sha256` + cuatro artefactos complementarios, clasificados SENSITIVE; información documentada en `docs/product/component-health/v0.3-evidence-engine.md`.

**Entregable técnico actual:** `scripts/evidence-pack/g1-private-draft.mjs`:
- `inspect` valida integridad y schema, sin escritura y sin capturar datos del robot;
- `prepare` produce informe HTML/PDF **INTERNO** únicamente con autorización local por caso y SHA exacto; exportación externa bloqueada;
- `tests/evidence-pack/g1-private-draft.test.mjs` cubre validación de hashes, directorios, autorización y honestidad del resumen sobre fixture artificial.

**Gates de cierre:**
1. Local `node --test tests/evidence-pack/g1-private-draft.test.mjs` PASS.
2. Local `inspect` sobre output privado **auténtico** V0.3 PASS; identificador coherente con registro histórico si es Dataset #002.
3. Humandroid confirma por medio verificable si la elaboración de un informe interno está dentro de los permisos originales o requiere autorización adicional. No publicar información en GitHub, repositorio, chats o cloud.
4. `prepare` y revisión visual privada SÓLO después de autorización aplicable. La lectura ya existente del G1 no concede automáticamente derechos comerciales.
5. V0.2b requiere proceso de redacción/revisión, permisos por destinatario y autorización de exportación independiente para entrega cliente. No implementado.

**Prohibido:** nueva captura sin protocolo, comandos del robot, simplificar `mode: REAL` en el Evidence Pack V0.1, publicar informes internos, scoring/diagnóstico/MGA.

**Documentación:** [G1 Field Evidence Bridge v0.2a](g1-field-evidence-bridge-v02.md). **Rama:** `feat/evidence-pack-g1-field-draft-v02`, basada en PR #25 (dependencia apilada).
