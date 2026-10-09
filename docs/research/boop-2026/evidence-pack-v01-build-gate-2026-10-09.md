# BOOP-T01/T02 — Build gate V0.1: diagnóstico y aislamiento SQLite
**Fecha:** 2026-10-09 · **Estado:** `BUILD_FAILED_ENVIRONMENT_NOT_INITIALIZED / FIX_COMMITTED_PENDING_LOCAL_RERUN`.  
**Contexto:** worktree `/mnt/c/Users/alexi/Documents/Elaris-evidence-pack-v0`, rama `local/evidence-pack-v0`; log proporcionado por Alexi (aprox. 7.998 líneas), centrado en stderr del build.

## 1. Evidencia recibida
- Next.js `pnpm build` intentó prerenderizar páginas que leen Prisma/SQLite en modo servidor.
- Múltiples `PrismaClientKnownRequestError`, código `P2021`, indicando que no existen tablas `main.Person`, `main.Change`, `main.Approval`, `main.ImpactItem`, `main.Robot`, `main.Deployment`, `main.EvidenceItem`, `main.Incident`, `main.Baseline`, etc.
- `Generating static pages (59/59)` **no significa build PASS**; termina `Export encountered errors on following paths` y `ELIFECYCLE Command failed with exit code 1`.
- El log compartido **no permite confirmar el resultado global de `pnpm test`**: no aparece el resumen Vitest con recuento. No marcar tests generales PASS ni FAIL sin evidencia.
- La generación offline del Evidence Pack (9/9 tests, PDF/CSV, lint, typecheck) fue verificada en el gate anterior. La presente falla corresponde al prerender del sitio completo, no al generador Node.

## 2. Diagnóstico
La configuración actual de este nuevo worktree permite conectar Prisma a SQLite pero no asegura que se haya ejecutado migraciones/seed en la base que consume Next.js durante build. En ausencia de tablas, muchas rutas estáticas del sitio fallan a la vez. Es un problema **del estado del entorno de ejecución**, no evidencia de regresión en el Evidence Pack.

**Riesgo crítico del seed:** `prisma/seed.ts` comienza con `deleteMany` y recreación de demo data. Ejecutar `pnpm db:seed` o `pnpm db:reset` contra `prisma/dev.db` que contenga trabajo previo destruiría registros; prohibido como reparación genérica.

**Limitación previa del test de integración:** `tests/integration/actions.test.ts` copiaba `prisma/dev.db` de forma fija. El gate aislado necesita una fuente/objetivo únicos para no depender del archivo dev.

## 3. Corrección implementada en PR #25
1. `scripts/ci/verify-evidence-pack-v01.sh`: crea un nombre `prisma/.evidence-pack-gate-XXXXXXXX.db` único con `mktemp`; exporta `DATABASE_URL=file:./<nombre>`, relativo a `prisma/schema.prisma`; genera Prisma Client, aplica migraciones, valida estado, ejecuta seed **solamente en esa DB recién creada**, tests del dossier, lint, typecheck, suite general y build. Limpia las DB temporales al salir con status real de shell.
2. `tests/integration/actions.test.ts` acepta `ELARIS_TEST_SEEDED_DB` y `ELARIS_TEST_ACTIONS_DB_NAME`, conservando los defaults antiguos para entornos ya existentes. La copia del test no toca `dev.db` cuando el gate exporta las variables.
3. El gate no cambia esquema Prisma, no añade dependencias, no escribe datos reales de Humandroid ni modifica el programa de generación de informes.

## 4. Comando de ejecución de siguiente gate
```bash
cd /mnt/c/Users/alexi/Documents/Elaris-evidence-pack-v0
git pull --ff-only
bash scripts/ci/verify-evidence-pack-v01.sh
```
No encadenar comandos de seguimiento con `;` ignorando errores; script es fail-fast. Se puede capturar su salida en un log externo con `tee`, cuidando preservar `PIPESTATUS`.

## 5. Condiciones de cierre
- `pnpm test` debe devolver PASS con resumen visible.
- `pnpm build` debe finalizar con salida `EVIDENCE PACK V0.1 FULL LOCAL GATE PASS`.
- New PDF V0.1 visual audit remains pending (se confirmó generación del archivo, no su paginación).
- Cualquier fallo del gate se registra con primera causa, no se etiqueta `VERIFIED`.

## 6. Riesgos residuales
- El test de integración y otras suites pueden revelar fallos no asociados al entorno; no declarar PASS por anticipado.
- El programa genera múltiples operaciones Prisma sobre el seed *sintético*, pero ninguna operación contra robots físicos ni bases del usuario. 
- El `DATABASE_URL` exportado solo se aplica al proceso del script y sus hijos.
- Se requiere verificación local real porque los cambios se hicieron con GitHub connector y no fueron ejecutados en el WSL del usuario.
