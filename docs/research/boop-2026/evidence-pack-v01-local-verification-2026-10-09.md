# Evidence Pack V0.1 — verificación local del usuario
**Fecha:** 2026-10-09 · **Fuente:** salida terminal aportada por Alexi · **Estado:** `LOCAL_COMPONENT_GATE_PASS / FULL_REPO_AND_VISUAL_REVIEW_PENDING`

## Contexto
- Ubuntu WSL en Windows, worktree `/mnt/c/Users/alexi/Documents/Elaris-evidence-pack-v0`.
- Rama local `local/evidence-pack-v0`, tracking `alexi/feat/technical-evidence-pack-offline-v0`.
- `git pull --ff-only` actualizó `26b1cf1..0c61ea5`, con cambios en script, README y tests.
- **Tipo de datos:** exclusivamente fixture `SYNTHETIC`. Ningún dato real del G1 ni de clientes.

## Evidencia real del gate
| Comando | Evidencia observada | Estado |
|---|---|---|
| `node --test tests/evidence-pack/pack.test.mjs` | 9 tests PASS, 0 fail; duración ~452 ms | PASS |
| `node scripts/evidence-pack/generate.mjs --input examples/evidence-pack/synthetic-insurance-intake.json --out out/elaris-evidence-demo-v01 --pdf` | CLI finalizó y listó 7 archivos, incluido `report.pdf` | PASS |
| `pnpm lint` | `✔ No ESLint warnings or errors` | PASS |
| `pnpm typecheck` | `tsc --noEmit`, retorno al prompt sin mensajes de error | PASS |

Archivos declarados por el CLI: `report.html`, `facts_registry.csv`, `evidence_inventory.csv`, `open_questions.csv`, `sources.csv`, `manifest.json`, `report.pdf`.

La suite actual incluye comprobación de hashes SHA-256 de outputs HTML/CSV; las verificaciones cubiertas no equivalen a una firma digital ni cadena forense.

## Qué NO está demostrado aún
1. **Nueva paginación del PDF V0.1:** el log prueba la generación, pero no se compartió todavía el PDF revisado visualmente. El PDF anterior de 3 páginas correspondía al generador previo a la modificación compacta.
2. **Suite completa `pnpm test` y `pnpm build`:** no ejecutadas / no aportadas en este gate.
3. **Caso real:** está prohibido en V0 (`mode: REAL` rechazado); falta diseñar contrato de datos, derechos, custodia, revisor y autorización de entrega.
4. **Validación comercial:** no existen cliente pagado, aceptación de broker o decisión de suscripción comprobada.
5. **Deploy online 24/7:** no incluido; no se necesita para el servicio offline.

## Próximo gate
Desde worktree aislado:
```bash
pnpm test
pnpm build
```
Revisar el PDF actualizado `out/elaris-evidence-demo-v01/report.pdf` en todas sus páginas y registrar errores de corte/saltos/legibilidad, sin asumir que las mejoras de impresión son correctas sólo por haber compilado.

## Criterio de promoción
Pasar de `LOCAL_COMPONENT_GATE_PASS` a `REVIEW_READY` sólo si los controles generales no revelan regresiones y se inspecciona el nuevo PDF. Esta comprobación no convierte el sistema en apto para datos reales: el intake autorizado es un trabajo distinto.

## Referencias
- PR #25: https://github.com/AlexiVion/Elaris-/pull/25
- `scripts/evidence-pack/README.md`
- `docs/research/boop-2026/technical-evidence-pack-template.md`
- `docs/research/boop-2026/execution-and-decision-log.md`
