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

El repositorio incluye:

`.github/workflows/local-self-hosted.yml`

Este workflow es **manual-only** mediante `workflow_dispatch`.

No escucha:

- `pull_request`;
- `push`;
- forks;
- branches externas.

Target:

~~~text
self-hosted
windows
x64
elaris-local
~~~

### Registro inicial en Windows

En GitHub:

~~~text
Repository
→ Settings
→ Actions
→ Runners
→ New self-hosted runner
→ Windows
→ x64
~~~

Ejecutar en PowerShell los comandos que GitHub genera en esa pantalla.

Durante la configuración:

- nombre recomendado: `elaris-local-win`;
- label custom: `elaris-local`;
- directorio recomendado por GitHub: `C:\actions-runner`;
- para V0, preferir ejecución interactiva con `.\run.cmd` antes que instalarlo como servicio.

La registration token generada por GitHub es temporal. No debe guardarse en el repo, en docs ni en scripts.

### Uso

1. iniciar el runner local con `.\run.cmd`;
2. abrir Actions → `Elaris Local Self-Hosted Verification`;
3. elegir `Run workflow`;
4. el job corre en tu máquina y ejecuta `pnpm verify:local`.

### Seguridad

El fork actual es público. Por eso el workflow self-hosted permanece manual-only.

No agregar `pull_request` a este workflow mientras el runner apunte a una workstation personal.

Mantener:

1. el runner apagado cuando no se usa;
2. secretos sensibles fuera del workspace;
3. Robot/Edge capture data fuera del runner workspace;
4. la VM/host de campo Siglo 21 fuera del pool de CI;
5. un label dedicado `elaris-local`.

Si en el futuro Elaris usa un runner dedicado/aislado o el repositorio cambia su exposición, esta política puede revisarse mediante ADR.

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
