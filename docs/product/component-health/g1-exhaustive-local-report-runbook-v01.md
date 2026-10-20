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


## Actualización de ingeniería M1+M2 — 2026-10-19 (pendiente de gate WSL)

Se añadió validación fail-closed de identidad del OEM, esquema de 8 fases × 29 slots, 7 señales, cobertura, muestras, timestamps y QA; también se generan hallazgos reproducibles como **registro privado independiente** y una selección revisable dentro del PDF. Ningún claim acredita fallas físicas.

Nuevo artefacto generado bajo salida privada:
- **findings-ledger.json**: identificador de análisis, checksum de fuente, registros de ventanas de fase, diferencias descriptivas frente a IDLE, slots no resueltos, grupos QA, referencias a la fuente, alternativas, limitaciones, verificaciones recomendadas y estado de revisión humana pendiente.
- **manifest.json** registra cantidad de claims y revisión pendiente.

**Una única verificación focalizada** (no repetir el gate V2 ya aprobado, no abrir jobs nuevos):

~~~bash
cd /mnt/c/Users/alexi/Documents/Elaris-g1-evidence-bridge-v02
git status --short
git pull --ff-only
node --check scripts/evidence-pack/g1-exhaustive-local-report.mjs
node --check scripts/evidence-pack/g1-report-findings.mjs
node --test tests/evidence-pack/g1-exhaustive-local-report.test.mjs
~~~

Sólo si la suite da PASS, usar el paquete ya verificado y crear **una salida nueva**:

~~~bash
A="$HOME/elaris-private/component-health-v03-validation-20261007T035703Z/run-a/field-evidence-v03.json"
OUT="$HOME/elaris-private/g1-exhaustive-report-20261019-v03"
export ELARIS_PLAYWRIGHT_FROM="/mnt/c/Users/alexi/Documents/Elaris-evidence-pack-v0"
node scripts/evidence-pack/g1-exhaustive-local-report.mjs \
  --input "$A" --out "$OUT" --pdf
test -s "$OUT/findings-ledger.json" && test -s "$OUT/g1-exhaustive-report.pdf" && echo "G1_PRIVATE_REPORT_AND_LEDGER_GENERATED"
explorer.exe "$(wslpath -w "$OUT/g1-exhaustive-report.pdf")"
~~~

Usar otra ruta si v03 ya existe. No reejecutar el asistente interactivo de autorización durante iteraciones internas. La salida sigue **SENSITIVE / NOT APPROVED FOR EXPORT**. Si el permiso de uso existente no cubre trabajo interno, detenerse antes de procesar datos reales. Los registros de permisos y derechos siguen fuera de GitHub.

**Estado hasta que se ejecute WSL:** código y tests sintéticos commiteados; NO afirmamos PASS, precisión del informe real, revisión humana ni finalización de M1/M2.

## Gate consolidado M1+M2+M3: una sola ejecución focalizada

El PASS anterior de 3/3 pruebas corresponde al código anterior. La nueva integración añade un módulo de subsistemas y una cuarta prueba sintética, aún no ejecutados por el operador.

~~~bash
cd /mnt/c/Users/alexi/Documents/Elaris-g1-evidence-bridge-v02
git status --short
git pull --ff-only
node --check scripts/evidence-pack/g1-exhaustive-local-report.mjs
node --check scripts/evidence-pack/g1-report-findings.mjs
node --check scripts/evidence-pack/g1-report-subsystems.mjs
node --test tests/evidence-pack/g1-exhaustive-local-report.test.mjs
~~~

Sólo si PASS y el trabajo interno está autorizado, crear una única salida nueva:

~~~bash
A="$HOME/elaris-private/component-health-v03-validation-20261007T035703Z/run-a/field-evidence-v03.json"
OUT="$HOME/elaris-private/g1-exhaustive-report-20261019-v03"
export ELARIS_PLAYWRIGHT_FROM="/mnt/c/Users/alexi/Documents/Elaris-evidence-pack-v0"
if test -e "$OUT"; then echo "OUT YA EXISTE: ELEGIR OTRO NOMBRE"; else
  node scripts/evidence-pack/g1-exhaustive-local-report.mjs --input "$A" --out "$OUT" --pdf
fi
if test -s "$OUT/g1-exhaustive-report.pdf" && test -s "$OUT/findings-ledger.json" && test -s "$OUT/subsystem-evidence.json"; then
  echo "G1_PRIVATE_REPORT_LEDGER_SUBSYSTEMS_GENERATED"
fi
~~~

Revisar localmente el manifiesto con 8 fases, 29 articulaciones, 1624 filas de señales, 1615 registros QA y 21 filas de subsistemas. No enviar al chat ni guardar en GitHub PDF, CSV, JSON o hashes de evidencia real. Todo sigue SENSITIVE / NOT APPROVED FOR EXPORT. El gate siguiente es una sola revisión del documento con fuentes, unidades, exclusiones y formato.

## Corrección del test SVG tras V3 — 20/10/2026

La suite sintética de V3 registró **3 PASS / 1 FAIL**. El único fallo fue editorial en el test: exigía un gráfico con cambios positivos pese a que sus datos ficticios tenían `absP95Delta=0` en todas las articulaciones. La ejecución real V3 posterior **sí produjo** el PDF y los anexos (224 claims; 21 comparaciones).

La nueva prueba distingue explícitamente: (a) cero cambios positivos: se muestra una nota sin SVG inventado; (b) cambios positivos ficticios elegibles: se produce un SVG; (c) un canal con semántica OEM sin confirmar nunca aparece como barra interpretada. También se elimina la resta estática de 15.000 frames del motor (la reconciliación 15.000 vs 14.912 permanece documentada para análisis del caso real, no para cualquier fixture).

**Único gate correctivo; NO repetir la generación real ya completada:**

~~~bash
cd /mnt/c/Users/alexi/Documents/Elaris-g1-evidence-bridge-v02
git status --short
git pull --ff-only
node --check scripts/evidence-pack/g1-exhaustive-local-report.mjs &&
node --check scripts/evidence-pack/g1-report-findings.mjs &&
node --check scripts/evidence-pack/g1-report-subsystems.mjs &&
node --test tests/evidence-pack/g1-exhaustive-local-report.test.mjs
~~~

**Criterio PASS:** cuatro tests, cuatro aprobados, cero fallos. Si vuelve a fallar, no generar otro PDF: registrar únicamente el mensaje breve del test, NO todo el HTML (Node imprime un objeto enorme). La V3 privada existente se conserva intacta; las mejoras de visualización se aplicarán al siguiente render cuando la revisión técnica lo justifique.


## Cola humana M4a — ejecutar SOLO tras superar el nuevo gate (2026-10-20)

Anteriormente el operador verificó la V3 existente, sin exportar: **5/5 tests PASS; 224 claims y 21 filas de subsistemas**. La extensión que produce review-worklist.json, review-worklist.csv y review-memo.md aún requiere nueva prueba.

**Un solo gate focalizado:**

~~~bash
cd /mnt/c/Users/alexi/Documents/Elaris-g1-evidence-bridge-v02
git status --short
git pull --ff-only
node --check scripts/evidence-pack/g1-review-worklist.mjs &&
node --check scripts/evidence-pack/g1-review-audit.mjs &&
node --test tests/evidence-pack/g1-exhaustive-local-report.test.mjs
~~~

Si PASS, **NO regenerar** el informe V3 ni sobrescribir la auditoría previa. Ejecutar la misma auditoría de fuente y artefactos, ahora con un destino NUEVO:

~~~bash
A="$HOME/elaris-private/component-health-v03-validation-20261007T035703Z/run-a/field-evidence-v03.json"
DRAFT="$HOME/elaris-private/g1-exhaustive-report-20261019-v03"
REVIEW="$HOME/elaris-private/g1-review-audit-20261020-v02"
if test -e "$REVIEW"; then
  echo "REVIEW YA EXISTE: ELEGIR OTRA CARPETA NUEVA"
else
  node scripts/evidence-pack/g1-review-audit.mjs --input "$A" --draft "$DRAFT" --out "$REVIEW"
fi
test -s "$REVIEW/review-worklist.csv" && test -s "$REVIEW/review-memo.md" &&
  echo "PRIVATE_G1_REVIEW_WORKLIST_CREATED"
~~~

Todos los archivos permanecen locales con clasificación SENSITIVE / NOT APPROVED FOR EXPORT. El CSV es la lista de trabajo: **no editar la versión generada**; si hace falta registrar decisiones técnicas, crear una copia dentro del espacio privado con revisor, fecha, motivación y referencia original. No cargar al chat, al repositorio público ni a servicios externos sin autorización expresa de uso de datos y destinatarios.

**Lo que sigue:** revisar primero calidad y semántica de las señales; luego el slot no resuelto, fases y ventanas; finalmente los contrastes de torque estimado, contexto de movimiento, unidades, fuentes y conclusiones del volumen principal. La ordenación es por dependencia de calidad de la evidencia, **no por severidad mecánica**. El programa no firma ni aprueba el trabajo.


## Borrador privado de discusión técnica: 21 apartados de ingeniería (2026-10-20)

El operador ya validó la suite anterior **5/5 PASS**. El código agregado desde entonces genera un borrador interpretativo preliminar para revisión humana; aún requiere su gate sintético.

**Única tanda focalizada (sin regenerar el PDF V3):**

~~~bash
cd /mnt/c/Users/alexi/Documents/Elaris-g1-evidence-bridge-v02
git pull --ff-only
node --check scripts/evidence-pack/g1-engineering-discussion.mjs &&
node --check scripts/evidence-pack/g1-review-audit.mjs &&
node --test tests/evidence-pack/g1-exhaustive-local-report.test.mjs
~~~

Si pasa, un único comando reutiliza el V0.3 íntegro y el directorio V3 para crear otra carpeta privada de auditoría, sin cambios destructivos:

~~~bash
A="$HOME/elaris-private/component-health-v03-validation-20261007T035703Z/run-a/field-evidence-v03.json"
DRAFT="$HOME/elaris-private/g1-exhaustive-report-20261019-v03"
REVIEW="$HOME/elaris-private/g1-review-audit-20261020-v03"
if test -e "$REVIEW"; then
  echo "DESTINO EXISTENTE: CAMBIAR NOMBRE"
else
  node scripts/evidence-pack/g1-review-audit.mjs \
    --input "$A" --draft "$DRAFT" --out "$REVIEW"
fi
test -s "$REVIEW/engineering-discussion-draft.md" &&
  echo "PRIVATE_ENGINEERING_DISCUSSION_READY_FOR_HUMAN_REVIEW"
~~~

En la nueva carpeta privada: engineering-discussion-draft.md incluye 8 cronologías y 21 bloques fase/grupo; review-worklist.csv conserva los 224 claims del corpus real; review-memo.md prioriza las preguntas. No colocar textos derivados, hashes ni información de titulares en GitHub. El estado permanece HUMAN REVIEW PENDING / NO EXPORT.

**No confundir:** pruebas sintéticas, auditoría SHA, generación de resumen y aprobación científica son cuatro etapas diferentes. El siguiente paso es revisión de unidades, contexto operacional y conclusiones por revisor competente; después redactar y maquetar el informe final técnico, no seguir multiplicando PDFs de datos.
