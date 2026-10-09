# BOOP-T01/T02 — Build gate V0.1: diagnóstico y aislamiento SQLite
**Fecha:** 2026-10-09 · **Estado final del gate automatizado:** `FULL_LOCAL_GATE_PASS` (log WSL recibido 17:00); registros anteriores conservados para auditoría.  
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

## 7. Segundo gate — resultados WSL e incidencia Share View

**Log:** `/home/ubuntu/elaris-evidence-gate-20261009-162949.log` (salida final compartida el 2026-10-09). Rama descargada hasta `4adb3b2`.

La DB temporal se creó y permitió superar:
- Prisma / migraciones / seed (el script continuó hasta las siguientes etapas).
- 9/9 tests específicos Evidence Pack (el script alcanzó lint y Vitest).
- `pnpm lint` PASS, `pnpm typecheck` PASS.
- **Vitest: 18 archivos de tests PASS, un archivo de tests FAIL; 122 tests PASS y cuatro tests de Share View no ejecutados porque falló el setup de su suite.** Esto es un **FAIL global**, no «122/126 PASS» como gate superado.
- `pnpm build` NO SE EJECUTÓ debido al fail-fast de la suite.

**Causa concreta confirmada:** `tests/integration/share.test.ts` conservaba la referencia fija a `prisma/dev.db` y a la copia `test-share.db`. El worktree tenía una base de desarrollo incompleta; por eso `prisma.person.findFirst()` devolvió error `P2021`. El primer arreglo ya había aislado `actions.test.ts`, pero todavía no `share.test.ts`.

**Corrección documentada:** el test Share View ahora consume `ELARIS_TEST_SEEDED_DB` y `ELARIS_TEST_SHARE_DB_NAME` cuando el gate los proporciona; el script les asigna una segunda copia temporal exclusiva y la elimina al terminar. Los valores por defecto de la suite fuera del gate se conservan.

**Siguiente gate (pendiente de ejecutar por el usuario):**
```bash
cd /mnt/c/Users/alexi/Documents/Elaris-evidence-pack-v0
git pull --ff-only
bash scripts/ci/verify-evidence-pack-v01.sh
```
No reportar `FULL_GATE_PASS` ni `BUILD_PASS` hasta ver resultados nuevos. La revisión visual del PDF V0.1 sigue pendiente.

## 8. Tercer gate — FULL LOCAL GATE PASS

**Evidencia WSL proporcionada por Alexi:** rama actualizada `4adb3b2..d594453`; ejecución de `bash scripts/ci/verify-evidence-pack-v01.sh`, log local `/home/ubuntu/elaris-evidence-gate-20261009-170003.log`.

**Resultado explícito:** `GATE PASS` y última línea `=== EVIDENCE PACK V0.1 FULL LOCAL GATE PASS ===`.

El script es fail-fast. Por alcanzar esa salida final, ejecutó con exit code 0 todas las etapas previstas en su versión auditada:
- Prisma Client generation / migrations / status sobre **SQLite temporal**;
- seed de demostración en DB temporal;
- tests específicos Evidence Pack (9 tests, comprobados anteriormente; el extracto final de este log no muestra el detalle individual);
- `pnpm lint`, `pnpm typecheck`;
- `pnpm test` general (PASÓ, cantidad exacta no visible en las últimas 100 líneas compartidas);
- `pnpm build`: Next.js 14.2.15, `Compiled successfully`, `Generating static pages (59/59)`, `Finalizing page optimization`, trazas finalizadas y exit 0.

**Causa anterior resuelta:** las dos suites de integración (acciones y Share) ahora utilizan copias SQLite temporales distintas cuando el gate se ejecuta; no leen `prisma/dev.db` dentro de este gate.

**Nota temporal y alcance:** este build se validó con una base de datos temporal inicializada que el script elimina al salir. No demuestra que una instancia Next.js independiente esté lista para servir datos tras ejecutar el gate. Tampoco acredita flujos E2E con Playwright ni un deploy 24/7.

### Pendientes que NO bloquean el cierre del gate unitario/build
1. Inspección visual del PDF generado por la última versión de V0.1; solo se ha verificado previamente la generación del archivo.
2. Validación comercial del formato del expediente con Juanma y un actor sectorial.
3. Diseño y aceptación legal/técnica de la ruta **REAL** (actualmente rechazada intencionalmente).
4. Revisar dependencias de ramas apiladas PR #25 → #24 → #22 antes de cualquier merge.
5. Revisión de presentación pública / E2E si se prepara una demo interactiva de plataforma.

**Decisión:** `FULL_LOCAL_GATE_PASS` para implementación offline sintética; **PR #25 sigue draft** hasta revisión visual y reconciliación de dependencias.
