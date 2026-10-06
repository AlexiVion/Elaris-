# Elaris — Guía de descarga y uso de datos de campo Unitree G1

## Objetivo

Esta guía permite que Juanma descargue desde Google Drive, verifique, extraiga y use en su computadora los datos reales capturados el 2026-10-06.

Regla de trabajo:

**descargar → verificar → extraer → volver a verificar → trabajar sobre copias derivadas, nunca sobre los captures originales.**

Los datos siguen clasificados como **SENSITIVE / NOT_APPROVED**. No deben subirse al repositorio público de GitHub.

## 1. Archivos a descargar desde Drive

Descargar desde la carpeta privada compartida por Alexi:

~~~text
ELARIS_FIELD_HANDOFF_2026-10-06.tar
ELARIS_FIELD_HANDOFF_2026-10-06.tar.sha256
~~~

Tamaño esperado del TAR:

~~~text
2,128,363,520 bytes
~~~

SHA-256 canónico esperado:

~~~text
6BF5F63A39831E96E3EC9960129979FE6F3D53595300F7BA581F69BE30EC04A1
~~~

El paquete incluye:

- Dataset #001 completo;
- Dataset #002 salvado;
- metadata de salvage;
- markers de fases;
- inventario de archivos;
- documentación de evidencia;
- SOURCE_SHA256SUMS.txt;
- un git bundle portable del repo.

## 2. Preparar la carpeta local en Windows

Abrir PowerShell:

~~~powershell
$ROOT = "C:\ElarisData\2026-10-06"
New-Item -ItemType Directory -Force $ROOT | Out-Null
~~~

Mover allí los dos archivos descargados.

Comprobar:

~~~powershell
Get-ChildItem $ROOT
~~~

Debe aparecer:

~~~text
ELARIS_FIELD_HANDOFF_2026-10-06.tar
ELARIS_FIELD_HANDOFF_2026-10-06.tar.sha256
~~~

## 3. Verificar la descarga ANTES de extraer

~~~powershell
$ROOT = "C:\ElarisData\2026-10-06"
$Archive = "$ROOT\ELARIS_FIELD_HANDOFF_2026-10-06.tar"
$HashFile = "$ROOT\ELARIS_FIELD_HANDOFF_2026-10-06.tar.sha256"

$Expected = ((Get-Content $HashFile).Split()[0]).ToUpper()
$Actual = (Get-FileHash -Algorithm SHA256 $Archive).Hash.ToUpper()

Write-Host "EXPECTED: $Expected"
Write-Host "ACTUAL  : $Actual"

if ($Expected -ne $Actual) {
    throw "DOWNLOAD CORRUPTED - DO NOT EXTRACT"
}

Write-Host "GOOGLE DRIVE DOWNLOAD VERIFIED"
~~~

Resultado esperado:

~~~text
EXPECTED: 6BF5F63A39831E96E3EC9960129979FE6F3D53595300F7BA581F69BE30EC04A1
ACTUAL  : 6BF5F63A39831E96E3EC9960129979FE6F3D53595300F7BA581F69BE30EC04A1
GOOGLE DRIVE DOWNLOAD VERIFIED
~~~

Si no coincide, no extraer. Volver a descargar el TAR.

## 4. Extraer el handoff

~~~powershell
$ROOT = "C:\ElarisData\2026-10-06"
$EXTRACTED = "$ROOT\extracted"

New-Item -ItemType Directory -Force $EXTRACTED | Out-Null
tar -xf "$ROOT\ELARIS_FIELD_HANDOFF_2026-10-06.tar" -C $EXTRACTED
~~~

Comprobar:

~~~powershell
Get-ChildItem $EXTRACTED
Get-ChildItem "$EXTRACTED\captures"
~~~

Estructura esperada:

~~~text
extracted\
├── captures\
│   ├── CAP-20261006-C7A52F\
│   ├── CAP-20261006-3A6982\
│   ├── CAP-20261006-3A6982-salvage-meta\
│   ├── component-health-field-markers-corrected-20261006-152241.tsv
│   └── 2026-10-06-field-file-inventory.txt
├── docs\
├── git\
├── SOURCE_METADATA.txt
└── SOURCE_SHA256SUMS.txt
~~~

## 5. Verificar todos los archivos internos

~~~powershell
$ROOT = "C:\ElarisData\2026-10-06\extracted"
$Manifest = "$ROOT\SOURCE_SHA256SUMS.txt"

$failed = 0
$checked = 0

foreach ($line in Get-Content $Manifest) {
    if ($line -match '^([0-9a-fA-F]{64})\s+\*?(.+)$') {
        $expected = $matches[1].ToUpper()
        $relative = $matches[2] -replace '/', '\'
        $path = Join-Path $ROOT $relative

        if (-not (Test-Path -LiteralPath $path)) {
            Write-Host "MISSING  $relative"
            $failed++
            continue
        }

        $actual = (Get-FileHash -Algorithm SHA256 -LiteralPath $path).Hash.ToUpper()
        $checked++

        if ($actual -eq $expected) {
            Write-Host "OK       $relative"
        } else {
            Write-Host "FAIL     $relative"
            $failed++
        }
    }
}

Write-Host "Checked: $checked"
Write-Host "Failed : $failed"

if ($failed -ne 0) {
    throw "INTERNAL DATA VERIFICATION FAILED"
}

Write-Host "ALL ELARIS FIELD DATA VERIFIED OK"
~~~

Resultado esperado:

~~~text
Checked: 17
Failed : 0
ALL ELARIS FIELD DATA VERIFIED OK
~~~

No empezar análisis hasta obtener Failed : 0.

## 6. Estado de los datasets

### Dataset #001

~~~text
Session: CAP-20261006-C7A52F
State: FINALIZED
Classification: SENSITIVE
Export approval: NOT_APPROVED
Frames: 1,031
Normalized events: 248,471
~~~

Ruta:

~~~text
C:\ElarisData\2026-10-06\extracted\captures\CAP-20261006-C7A52F
~~~

### Dataset #002

~~~text
Session: CAP-20261006-3A6982
State: OPEN
Disposition: SALVAGED PARTIAL CAPTURE / INTEGRITY VERIFIED
Classification: SENSITIVE
Export approval: NOT_APPROVED
Frames preserved: 15,000
Normalized events preserved: 3,615,000
~~~

Ruta:

~~~text
C:\ElarisData\2026-10-06\extracted\captures\CAP-20261006-3A6982
~~~

Dataset #002 fue interrumpido por el apagado físico del robot. No modificar su estado ni presentarlo como FINALIZED.

## 7. Mantener datos y código separados

Estructura recomendada:

~~~text
C:\
├── ElarisWork\
│   └── Elaris-\
└── ElarisData\
    └── 2026-10-06\
        ├── ELARIS_FIELD_HANDOFF_2026-10-06.tar
        ├── ELARIS_FIELD_HANDOFF_2026-10-06.tar.sha256
        └── extracted\
~~~

No copiar los captures dentro del repositorio Git.

Para resultados derivados usar:

~~~text
C:\ElarisData\2026-10-06\derived\
~~~

## 8. Obtener el código Elaris

### Opción recomendada: GitHub

~~~powershell
New-Item -ItemType Directory -Force "C:\ElarisWork" | Out-Null
cd C:\ElarisWork
git clone https://github.com/Juanmarossi/Elaris-.git Elaris-
cd C:\ElarisWork\Elaris-
git remote add alexi https://github.com/AlexiVion/Elaris-.git
git fetch alexi
git fetch alexi feat/component-health-real-baseline-v0
git switch -c feat/component-health-real-baseline-v0 --track alexi/feat/component-health-real-baseline-v0
git log -5 --oneline
~~~

### Opción offline: bundle incluido

~~~powershell
New-Item -ItemType Directory -Force "C:\ElarisWork" | Out-Null
git clone "C:\ElarisData\2026-10-06\extracted\git\elaris-repository.bundle" "C:\ElarisWork\Elaris-"
cd C:\ElarisWork\Elaris-
git branch -a
~~~

## 9. Trabajar desde WSL / Ubuntu

Abrir:

~~~powershell
wsl
~~~

Repo:

~~~bash
cd /mnt/c/ElarisWork/Elaris-
~~~

Datos:

~~~text
/mnt/c/ElarisData/2026-10-06/extracted/captures/
~~~

Comprobar tamaños:

~~~bash
du -sh /mnt/c/ElarisData/2026-10-06/extracted/captures/CAP-20261006-C7A52F /mnt/c/ElarisData/2026-10-06/extracted/captures/CAP-20261006-3A6982
~~~

Valores aproximados:

~~~text
131M    Dataset #001
1.9G    Dataset #002
~~~

## 10. Cargar la passphrase

La passphrase no está incluida en Drive, GitHub ni esta documentación.

Obtenerla directamente de Alexi.

En WSL/Ubuntu:

~~~bash
read -s -p "Elaris dataset passphrase: " ELARIS_EDGE_PASSPHRASE
echo
export ELARIS_EDGE_PASSPHRASE
~~~

Comprobar sin imprimirla:

~~~bash
if [ -n "$ELARIS_EDGE_PASSPHRASE" ]; then
  echo "PASS: passphrase loaded"
else
  echo "FAIL: passphrase empty"
fi
~~~

No guardarla en Git, README ni scripts.

## 11. Instalar dependencias

~~~bash
cd /mnt/c/ElarisWork/Elaris-
corepack enable
pnpm install
pnpm typecheck
~~~

## 12. Reproducir Dataset #001

~~~bash
cd /mnt/c/ElarisWork/Elaris-
pnpm edge health-baseline /mnt/c/ElarisData/2026-10-06/extracted/captures/CAP-20261006-C7A52F
~~~

Resultado estructural esperado:

~~~text
Evidence class: OBSERVED
Assessment: BASELINE_ONLY
Frames: 1031
Normalized events: 248471
Mapped joint slots observed: 29
Usable observed components: 28
Unresolved motor slots: 1
~~~

Esto es un baseline descriptivo, no un diagnóstico ni un health score.

## 13. Cómo tratar Dataset #002

Dataset #002 debe mantenerse inmutable.

No:

- cambiar OPEN por FINALIZED;
- editar manifest.enc.json;
- editar los archivos .enc;
- reescribir markers originales;
- usarlo como si la captura hubiera terminado normalmente.

Toda recuperación, segmentación o análisis debe generar archivos nuevos en derived/.

Markers:

~~~text
C:\ElarisData\2026-10-06\extracted\captures\component-health-field-markers-corrected-20261006-152241.tsv
~~~

Segmentación canónica:

| Fase | Inicio UTC | Fin UTC |
|---|---:|---:|
| IDLE_BASELINE | 15:22:41 | 15:25:00 |
| WAIST_YAW | 15:25:00 | 15:35:05 |
| LEFT_SHOULDER_ROLL | 15:35:05 | 15:37:19 |
| LEFT_SHOULDER_PITCH | 15:37:19 | 15:39:41 |
| LOCOMOTION_FORWARD_BACK | 15:39:41 | 15:41:10 |
| TURNING | 15:41:11 | 15:42:40 |
| MIXED_OPERATION | 15:42:41 | 15:44:31 |
| RECOVERY_IDLE | 15:44:31 | 15:53:49 |

Final físico real:

~~~text
2026-10-06T15:53:49+00:00
ROBOT POWER OFF / CONNECTION LOST — UNPLANNED SESSION END
~~~

## 14. Qué no subir a GitHub público

Mientras los datos sigan SENSITIVE / NOT_APPROVED, no subir:

~~~text
raw.ndjson.enc
telemetry.ndjson.enc
manifest.enc.json
datasets descifrados
passphrases
credenciales
exports derivados sensibles
~~~

Sí pueden versionarse código, tests, documentación, hashes, IDs de sesión, provenance y herramientas de análisis.

## 15. Checklist final

El handoff está completo cuando se cumplen:

~~~text
[ ] GOOGLE DRIVE DOWNLOAD VERIFIED
[ ] Checked: 17 / Failed: 0
[ ] ALL ELARIS FIELD DATA VERIFIED OK
[ ] Dataset #001 health-baseline ejecuta correctamente
~~~

A partir de ahí, ambos miembros de Elaris trabajan sobre los mismos datasets verificables.

Siguiente paso técnico recomendado:

~~~text
Dataset #002 salvaged capture
→ recovery reader
→ timestamp segmentation
→ per-phase statistics
→ component comparison
→ derived evidence pack
~~~

sin modificar nunca los captures originales.
