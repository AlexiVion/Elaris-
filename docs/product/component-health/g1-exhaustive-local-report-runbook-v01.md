# Unitree G1 — ejecución local del informe técnico exhaustivo
**Fecha:** 2026-10-19
**Estado:** CODE_COMMITTED / FOCUSED_SYNTHETIC_TEST_PENDING / REAL_G1_RENDER_PENDING
**Privacidad:** SENSITIVE / NO EXPORT / USO INTERNO

## Qué produce
`scripts/evidence-pack/g1-exhaustive-local-report.mjs` lee el mismo `field-evidence-v03.json` del G1 ya verificado en el equipo del operador. Importa el validador `inspectPack`: exige la integridad SHA-256 del pack antes de operar. No usa raw/decrypt, robot, redes, nube ni base de datos.

Salida bajo un directorio **nuevo** en `$HOME/elaris-private`:
- `g1-exhaustive-report.html`: 8 secciones por fase, 29 dossiers por articulación, siete familias de señales por fase, fingerprints de torque y advertencias interpretativas.
- `g1-exhaustive-report.pdf` (si se usa `--pdf`): versión extensa local en A4.
- `component-signals.csv`: hasta **1.624 registros** para 29 articulaciones × 8 fases × 7 señales, con cobertura, summary, disponibilidad/semántica, percentiles, state codes y diferencias a reposo, sólo si existen en V0.3.
- `quality-findings.csv`: todos los registros de QA con fase, componente y señal para auditoría; los records de QA no son fallos físicos.
- `phase-quality.csv`: ventanas, lags, gaps, continuidades, cobertura y muestras duplicadas.
- `manifest.json`: SHA256 de los archivos generados, ID de análisis y etiqueta explícita de que no se afirma autorización de difusión.

El reporteo se limita a `V0.3`. No genera series temporales crudas ni inferencias diagnósticas con resúmenes agregados. El PDF de 3 páginas era un resumen; esta salida usa todas las filas válidas del esquema por componente y fase.

## Uso WSL: una sola prueba focalizada, sin instalar paquetes

```bash
cd /mnt/c/Users/alexi/Documents/Elaris-g1-evidence-bridge-v02
git status --short
git pull --ff-only
node --check scripts/evidence-pack/g1-exhaustive-local-report.mjs
node --test tests/evidence-pack/g1-exhaustive-local-report.test.mjs
```

La prueba usa fixtures íntegramente ficticios. Valida conteos (8/29/1624), clasificación `NOT_APPROVED`, prohibición de sobreescritura o salida fuera del directorio privado y preservación del input. No ejecuta capturas ni pruebas de todo el monorepo.

Sólo si estas pruebas dan PASS, y si el uso local del corpus sigue autorizado, ejecutar sobre la ruta privada **ya comprobada** en el turno anterior:

```bash
A="$HOME/elaris-private/component-health-v03-validation-20261007T035703Z/run-a/field-evidence-v03.json"
export ELARIS_PLAYWRIGHT_FROM="/mnt/c/Users/alexi/Documents/Elaris-evidence-pack-v0"
OUT="$HOME/elaris-private/g1-exhaustive-report-20261019-v01"
test -f "$A" || { echo "MISSING PRIVATE PACK"; exit 1; }
test ! -e "$OUT" || { echo "OUTPUT ALREADY EXISTS: CHOOSE A NEW NAME"; exit 1; }
node scripts/evidence-pack/g1-exhaustive-local-report.mjs --input "$A" --out "$OUT" --pdf
test -s "$OUT/g1-exhaustive-report.pdf" && echo "PRIVATE G1 PDF GENERATED"
explorer.exe "$(wslpath -w "$OUT/g1-exhaustive-report.pdf")"
```

No se solicita el formulario interactivo antiguo porque este comando produce explícitamente un **borrador privado de ingeniería** sin afirmar autorizaciones que el script no puede comprobar. El workflow de preparación formal `create-g1-internal-authorization.mjs` y los gates de difusión externa no se modifican.

Si falla PDF por falta de Chromium, generar SIN `--pdf` en un **nuevo** directorio y abrir `g1-exhaustive-report.html` localmente con navegador; no reinstalar dependencias de forma masiva ni utilizar servicios externos.

## Revisión necesaria tras generar

- Confirmar `8` fases, `29` dossiers y `1624` filas del CSV de señales (la existencia de fila no garantiza que tenga resumen válido).
- Conciliar `14912` frames asignados por fase contra `15000` preservados en registro. Los `88` restantes no se declaran perdidos sin estudiar contadores/ventanas.
- Contrastar `RECOVERY_IDLE` final observado frente al declarado y verificar al menos una celda contra el JSON V0.3 original.
- Revisar todas las páginas y las unidades / splits de tablas; el PDF de gran tamaño puede requerir refinamiento editorial.
- Revisión humana específica para RightWristYaw y anomalía de ejecución código 3104; no declarar salud, seguridad o causa.
- No subir el PDF real, CSV o manifest a GitHub, chat, correo o Dropbox sin autorización de versión y destinatarios.

**Estado constatado desde GitHub:** el código y el test están commiteados; no se ha ejecutado este nuevo generador sobre archivos privados desde ChatGPT. No declarar PASS de sus tests hasta recibir su salida WSL.

**Posterior:** terminar revisión técnica del informe exhaustivo y sólo luego derivar una versión ejecutiva/sanitizada separada.
