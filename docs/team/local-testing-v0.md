# Elaris Local Testing V0

## Estado

**CANONICAL LOCAL VERIFICATION PATH · NO GITHUB-HOSTED RUNNER REQUIRED**

Este documento define cómo verificar Elaris sin consumir GitHub-hosted Actions minutes.

## Objetivo

Reemplazar la dependencia operativa de GitHub-hosted CI por un gate reproducible que corre en la máquina local y deja evidencia durable por commit.

El flujo es:

~~~text
task branch
    ↓
local verification
    ↓
.local-runs/<timestamp>/
    ├── summary.json
    └── run.log
    ↓
PR evidence
    ↓
review / merge
~~~

Los artefactos bajo `.local-runs/` son locales y están excluidos de Git.

## Requisitos

- Node >= 20
- pnpm 9.x compatible con el lockfile
- Git
- dependencias del repositorio
- Playwright Chromium para E2E
- SQLite/Prisma local según la configuración actual

El runner usa `DATABASE_URL=file:./dev.db` si no existe un `DATABASE_URL` explícito.

## Primera preparación — Windows

Desde PowerShell:

~~~powershell
cd C:\Users\alexi\Documents\Elaris-
pnpm install --frozen-lockfile
pnpm exec playwright install chromium
~~~

Luego ejecutar:

~~~powershell
pnpm verify:local
~~~

## Primera preparación — Ubuntu / VM

~~~bash
cd ~/Elaris-
pnpm install --frozen-lockfile
pnpm exec playwright install --with-deps chromium
pnpm verify:local
~~~

## Gate completo

~~~bash
pnpm verify:local
~~~

Ejecuta, en orden:

~~~text
pnpm install --frozen-lockfile
pnpm db:reset
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
~~~

El runner se detiene en el primer fallo y devuelve exit code distinto de cero.

## Iteración rápida

~~~bash
pnpm verify:quick
~~~

Ejecuta:

~~~text
pnpm lint
pnpm typecheck
pnpm test
~~~

No reemplaza al gate completo antes de review/merge.

## Tests del Scenario Domain

~~~bash
pnpm test:scenarios
~~~

Este comando sirve para iterar sobre COSMOS-002, pero tampoco reemplaza el gate completo.

## Flags

El runner acepta:

~~~text
--quick
--skip-install
--skip-db
--skip-e2e
~~~

Ejemplo después de una instalación ya validada:

~~~powershell
pnpm verify:local -- --skip-install
~~~

Un run sin E2E no debe registrarse como full verification.

## Evidencia local

Cada ejecución crea:

~~~text
.local-runs/
└── <timestamp>/
    ├── summary.json
    └── run.log
~~~

`summary.json` registra:

- commit SHA;
- branch;
- Node;
- pnpm;
- plataforma/arquitectura;
- comandos;
- PASS/FAIL;
- exit code;
- duración;
- timestamps.

Cuando un PR se prepare para review, copiar al body o comentario:

- commit SHA;
- comando ejecutado;
- resultado;
- path local del summary;
- cualquier warning relevante.

No subir automáticamente `.local-runs/` al repositorio.

## Regla para GitHub Actions

Mientras no haya GitHub-hosted credits disponibles, los workflows cloud no son un requisito operativo para desarrollar en este track.

No se debe degradar el estándar de verificación: se mueve el cómputo al entorno local, no se eliminan los gates.

## Self-hosted GitHub runner

Un self-hosted runner puede añadirse más adelante para que GitHub orqueste jobs sobre una máquina propia.

No se habilita automáticamente en V0 porque el fork actual es público. Un runner conectado a un repositorio público amplía la superficie de ejecución de código no confiable.

Si se habilita después:

1. usar un runner dedicado;
2. evitar triggers automáticos desde pull requests públicos;
3. preferir `workflow_dispatch` o ramas controladas;
4. usar labels dedicados como `elaris-local`;
5. no guardar secretos sensibles en el workspace del runner;
6. mantener Robot/Edge capture data fuera del runner workspace;
7. no convertir la máquina de campo Siglo 21 en runner de CI.

## Relación con la verificación anterior

El path oficial del repositorio sigue siendo conceptualmente:

~~~text
db:reset
→ lint
→ typecheck
→ tests
→ build
→ E2E
~~~

`pnpm verify:local` lo vuelve un único comando y agrega evidencia local reproducible.
