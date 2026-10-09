# Evidence Pack V0.1 — auditoría de los siete archivos entregados
**Fecha:** 2026-10-09 · **Tipo:** auditoría independiente de outputs del usuario, no ensayo de aseguramiento ni revisión comercial por tercero · **PR:** #25

## 1. Fuente de evidencia
El usuario adjuntó los siguientes siete outputs del **mismo paquete sintético** (nombres al guardar adjuntos con sufijo `(1)`):
- `report(1).pdf` ← `report.pdf`
- `report(1).html` ← `report.html`
- `facts_registry(1).csv` ← `facts_registry.csv`
- `evidence_inventory(1).csv` ← `evidence_inventory.csv`
- `open_questions(1).csv` ← `open_questions.csv`
- `sources(1).csv` ← `sources.csv`
- `manifest(1).json` ← `manifest.json`

Caso `ELARIS-DEMO-001`; `SYNTHETIC_DEMO_ONLY`, timestamp del manifiesto `2026-10-09T15:05:26.263Z`. El input del caso no fue adjuntado en este turno; el hash `sourceInputSha256` figura en manifiesto, pero **no se revalidó contra el JSON input original** en este control.

## 2. Comprobaciones binarias
Se recalculó SHA-256 a partir de los bytes adjuntos de cada uno de los **seis outputs** y se comparó con `manifest.outputSha256`.

| Salida | Bytes | Coincide SHA-256 manifest |
|---|---:|---|
| report.html | 8.644 | Sí |
| facts_registry.csv | 682 | Sí |
| evidence_inventory.csv | 406 | Sí |
| open_questions.csv | 438 | Sí |
| sources.csv | 419 | Sí |
| report.pdf | 46.111 | Sí |

Esto verifica **integridad respecto del manifiesto aportado**, no la identidad de quien lo creó, firma digital, tiempo confiable, ausencia de alteración coordinada de manifiesto+archivos, chain of custody ni evidencia aseguradora.

## 3. Comprobaciones semánticas
Los CSV se analizaron con un lector CSV estricto y encabezados esperados:
- `facts_registry.csv`: 8 filas; 5 campos `SYNTHETIC`, 3 `UNKNOWN`.
- `evidence_inventory.csv`: 3 filas; 1 marcador `SYNTHETIC`, 2 `UNKNOWN`. Un placeholder de documento **no equivale a test real**.
- `open_questions.csv`: 3 filas; 3 abiertas, 2 HIGH y 1 MEDIUM como **prioridad documental**, no severidad de riesgo físico.
- `sources.csv`: 3 filas con `SYNTHETIC_DOCUMENT`.
- Referencias `SRC-001`–`SRC-003` visibles en PDF/HTML y archivos de origen; filas `UNKNOWN` sin fuente se identifican como información ausente.
- El informe mantiene disclaimer de no certificación, no scoring de asegurabilidad/primas, no underwriting ni PAIDS compliance.

## 4. Auditoría visual PDF
PDF **válido, dos páginas A4** (~594.96×841.92 pt) extraído y renderizado para inspección visual. Texto legible, identidad visual coherente azul/navy, tablas regulares, sin recortes evidentes, caracteres legibles.
- **Página 1:** portada, alcance ficticio y métricas, sección 01 completa, sección 02 completa y la sección 03 **sólo encabezado + primera pregunta GAP-001**.
- **Página 2:** comienza con encabezados de tabla repetidos y GAP-002/GAP-003, sin el título de sección 03; después sección 04 registro de fuentes, limitaciones y pie. La segunda mitad de la hoja queda mayormente vacía.
- **Defecto real:** la tabla de preguntas está partida entre páginas y la segunda arranca sin contexto. Es un defecto de presentación, **no** de pérdida de datos. Mejora comercial necesaria para un documento de dos páginas deliberado.
- No hay evidencia para afirmar que la versión usada en el PDF tiene «page break intencional»: la captura inspeccionada es la versión anterior a la corrección siguiente.

## 5. Corrección puntual (pendiente de verificar tras cambio)
Commmit `0944f92a`: `scripts/evidence-pack/generate.mjs` agrega clase `report-section-next-page` al encabezado **03 / Information gaps and reviewer questions** y un `break-before:page` en CSS de impresión. Objetivo: comenzar la sección completa en una nueva página y evitar tabla partida.

**IMPORTANTE:** este control verifica el PDF adjuntado **antes** de esa modificación. Se requiere volver a generar PDF tras `git pull` y verificar página/corte. Un intento de render con Chromium en el entorno de auditoría no llegó a producir PDF; por tanto **NO se declara fix visualmente aprobado**.

## 6. Evaluación y siguiente decisión
- `DOCUMENT_INTEGRITY_PASS`: SI
- `SYNTHETIC_DOCUMENT_SEMANTICS_PASS`: SI
- `PDF_TEXT_READABILITY_PASS`: SI
- `COMMERCIAL_PAGINATION_FINAL_PASS`: **PENDIENTE DE NUEVA INSPECCIÓN**
- `GENERATE_REAL_CLIENT_REPORTS`: NO; V0 rechaza REAL de forma intencional
- `PAID_BUYER_VALIDATED`: NO; Juanma debe validar con actor real

**Siguiente acción técnica limitada:** actualizar rama, ejecutar 9 tests, regenerar PDF en carpeta nueva, confirmar que la página 2 comienza con el título 03 y sus tres preguntas. Este es el último ajuste visual programado para V0.1. No crear Product System adicional ni implementar pólizas/risk scoring.

## 7. Riesgo comercial y límites
V0.1 ejemplifica **ordenamiento de fuentes**. No demuestra que una aseguradora compre ese informe ni qué campos exige en un submission real. Antes de V0.2 con datos de terceros, acordar contractualmente licencias, custodia, protección de datos, revisión humana y política de borrado. Mantener Elaris horizontal para los 20 actores.
