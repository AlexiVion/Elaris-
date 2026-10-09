# Elaris — G1 Field Evidence Bridge V0.2a
**Fecha:** 2026-10-09 · **Estado:** `IMPLEMENTED_PENDING_WSL_TEST / REAL_INPUT_PENDING` · **Responsable técnico:** Alexi · **Dependencia:** Component Health V0.3 output pack, no robot físico requerido.

## Propósito
Tomar **el informe privado ya existente del Unitree G1 real** (`field-evidence-v03.json`) y sus cinco artefactos versionados con `checksums.sha256`, validar que la fuente cumple el contrato del Evidence Engine V0.3 y producir un **borrador privado de análisis técnico**.

Esto es **una conexión REAL a la salida del análisis previo**, no una conexión en directo al robot ni un paquete preparado para una aseguradora. Se fundamenta en `docs/product/component-health/v0.3-evidence-engine.md` y `lib/component-health/workbench-v04.ts`. No se fabrican mediciones, diagnósticos ni conclusiones de seguridad.

## Por qué aprovechar V0.3 existente
El historial documenta Dataset #002 real y reproducciones deterministas:
- analysisId `CH-A03-5D9D0A2922AD460F245F`;
- 8 fases con contexto humano confirmado;
- 29 slots G1 por fase;
- referencia primaria de idle de la **misma sesión**;
- entradas originales y copias derivadas con hashes separados;
- 1.615 findings de calidad/semántica, **no fallos mecánicos**;
- artefactos sensibles (SENSITIVE), sin permiso confirmado de exportación;
- dudas no resueltas (wrist yaw OEM 28, duplicados de timestamps y fin de observación).

**Importante:** el anterior estado `VERIFIED_LOCAL` documenta la ejecución real de otro gate; el nuevo Bridge aún no se probó en WSL del usuario. No usar el ID histórico si un informe encontrado presenta otro ID sin comprobar el origen.

## Alcance técnico V0.2a
`scripts/evidence-pack/g1-private-draft.mjs` ofrece dos operaciones offline:
1. `inspect`: verifica checksum de **todos** los archivos declarados por `checksums.sha256`, exige los 5 de V0.3, valida schema, 29 slots, report classification/assessment, lineage y misma sesión idle. Imprime sólo metadatos resumidos. No escribe nada.
2. `prepare`: realiza las mismas verificaciones, solicita un **registro privado de autorización para análisis interno** y prepara HTML / PDF opcional en un directorio nuevo bajo `$HOME/elaris-private`. **SENSITIVE / PRIVATE_INTERNAL_DRAFT_NOT_APPROVED_FOR_EXPORT** figura prominente. Jamás crea el Evidence Pack público/comercial de V0.1 ni cambia la lógica `SYNTHETIC` del generador anterior.

No se lee telemetry raw cifrada, no se extrae passphrase, no se conecta por DDS/SDK2, no hay datos subidos ni solicitudes HTTP, no se crean tablas ni se modifica `prisma/dev.db`.

### Protecciones
- Entrada y salida exclusivamente dentro de `$HOME/elaris-private`, **fuera del repositorio**; rutas absolutas, sin symlink en componentes existentes; output nuevo, sin sobrescritura.
- Validación strict de digest de cinco archivos y paths listados en checksum.
- Sólo Component Health V0.3 observado, sensible, 29 slots, `SAME_SESSION_IDLE_PRIMARY`, source+working copy lineage marcados verified.
- Si el input report cambia respecto al registro, se interrumpe antes de redactar.
- Resumen de quality findings por clase; no se generan scores de salud/falla, ni señales físicas interpoladas.
- Requiere autorización concreta atada al SHA del informe y con finalidad **INTERNAL** y `externalSharing: PROHIBITED`; la herramienta comprueba que se presentó el registro, no que el firmante tiene realmente facultades. Confirmar esto con Humandroid y con la institución si sus contratos lo requieren.
- Ficheros escritos con permisos 0600, directorio 0700. **No implica cifrado del volumen**; revisar configuración de dispositivo/WSL antes de procesar material confidencial.
- Salidas: `internal-g1-draft.html`, `internal-g1-draft.pdf` (opcional) y `internal-draft-manifest.json` con hashes. **No enviar esos archivos al chat, Dropbox o GitHub sin una autorización externa independiente**.

## Verificación inmediata SIN export
Primero localizar el análisis privado en la WSL que efectivamente contiene la evidencia:
```bash
cd /mnt/c/Users/alexi/Documents/Elaris-field-evidence-v0
git fetch alexi feat/evidence-pack-g1-field-draft-v02
git worktree add ../Elaris-g1-evidence-bridge-v02 -b local/g1-evidence-bridge-v02 alexi/feat/evidence-pack-g1-field-draft-v02
cd ../Elaris-g1-evidence-bridge-v02
node --test tests/evidence-pack/g1-private-draft.test.mjs
find "$HOME/elaris-private" -type f -name field-evidence-v03.json
```
**No copiar el archivo real al nuevo worktree.** Si aparece un path y se confirma que su análisis interno estaba permitido:
```bash
node scripts/evidence-pack/g1-private-draft.mjs inspect --input "/home/ubuntu/elaris-private/.../field-evidence-v03.json"
```
Sustituir la ruta completa por una encontrada realmente; no adivinar nombres, ni reutilizar semillas/datos simulados como robot real. El comando no escribe datos y no habilita export.

## Gate para crear el primer borrador PRIVADO
Antes de `prepare` se necesita un **registro formal del dueño de datos** (Humandroid y cualquier otra entidad cuyos derechos apliquen) aceptando el uso técnico **local** del análisis específico. Guardarlo dentro de `$HOME/elaris-private`, nunca en Git. Campos requeridos:

| Campo | Requisito |
|---|---|
| `schemaVersion` | `elaris-field-internal-use/v1` |
| `status` | `AUTHORIZED_FOR_LOCAL_INTERNAL_REVIEW` |
| `purpose` | `PREPARE_DESCRIPTIVE_G1_FIELD_DRAFT` |
| `externalSharing` | `PROHIBITED` |
| `dataOwner` | organización responsable real |
| `authorizedBy` | persona con facultades reales |
| `recordReference` | ID del acuerdo/documento auténtico |
| `authorizedAt` | fecha ISO de autorización |
| `sourceReportSha256` | SHA-256 completo del `field-evidence-v03.json` autorizado |

El script verifica `sourceReportSha256` contra el archivo cargado. No verifica la autenticidad jurídica de una declaración; esa validación es humana. **No completar estos campos con nombres inventados para desbloquear REAL.**

Con registro válido, y siempre en WSL/entorno privado:
```bash
node scripts/evidence-pack/g1-private-draft.mjs prepare \
  --input "/absolute/private/path/field-evidence-v03.json" \
  --authorization "/absolute/private/path/internal-authorization.json" \
  --out "$HOME/elaris-private/g1-internal-draft-001" \
  --pdf
```

**La salida no autoriza publicación.** Para un reporte a clientes se necesita un gate V0.2b de revisión humana, minimización por destinatario y autorización de difusión/exportación **separada**; aún NO está implementado.

## Criterios de cierre V0.2a
1. Test unitario local para checksum/provenance/paths/autorización.
2. `inspect` pasa sobre el paquete privado **real** V0.3 y conserva clasificación `SENSITIVE`, sin publicar el input.
3. Bajo permiso real, `prepare` genera reporte privado con cifras derivadas del V0.3, referencias y límites; se verifica que la lectura fue offline.
4. Alexi valida internamente el PDF, cuidando no enviarlo a terceros sin permiso.
5. PR en draft documenta logs **sanitizados**; no almacenar hashes o identificadores sensibles no autorizados en documentación pública.
6. V0.2b (trabajo posterior) permite entrega externa con permisos/QA que todavía faltan.

## Estado de negocio
La parte de captura y análisis real del G1 existe como antecedente verificable en el repositorio, pero **todavía no hay un informe comercial autorizado para export**, ni cliente asegurador. Se puede vender un servicio de organización documental bajo contrato y comenzar trabajo técnico interno sin esperar ser MGA.

**Tareas complementarias:**
- Juanma: identificar comprador, campos y condiciones; conseguir permiso formal del socio para preparar/difundir caso si interesa.
- Alexi: validar pipeline local y su integridad; preparar documento interno, sin inventar outcomes.
- Humandroid/propietario: confirmar alcance de uso, titularidad y destinatarios.

**Repositorio:** documentos y software; **datos del robot y autorización auténtica**: sólo almacenamiento privado.

## Registro WSL — primer gate del adaptador, 2026-10-09

**Fuente:** log terminal provisto por Alexi (no se recibieron documentos sensibles).
- Worktree `local/g1-evidence-bridge-v02` creado desde `feat/evidence-pack-g1-field-draft-v02` en commit `d4c86d6`.
- `node --check scripts/evidence-pack/g1-private-draft.mjs`: PASS (sin errores).
- `node --test tests/evidence-pack/g1-private-draft.test.mjs`: **9 tests PASS, 0 FAIL**, usando fixtures de test, no material real del G1.
- El comando `find` identificó **dos** artefactos `field-evidence-v03.json` dentro de `$HOME/elaris-private/component-health-v03-validation-20261007T035703Z/`, subdirectorios `run-a` y `run-b`.
- Se trata de ejecuciones A/B del procesamiento V0.3 documentado; **NO** dos robots independientes.
- Ningún `inspect` se ejecutó aún sobre esos archivos según el log recibido: integridad, schema y cifras reales siguen `PENDING_REAL_FILE_INSPECT`.
- El paquete permanece `SENSITIVE`, sin autorización verificada para compartir/descargar un PDF real.

**Próxima comprobación segura de solo lectura:** ejecutar el subcomando `inspect` sobre los dos informes localmente. Solo comunica metadatos mínimos y no escribe archivos ni accede al robot. Compartir únicamente la salida sintética de estado/cantidad, no los ficheros privados ni el manifiesto de datos reales. La generación `prepare` continúa bloqueada hasta autorización auténtica de análisis interno.
