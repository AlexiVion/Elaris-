$ErrorActionPreference = "Stop"

Set-Location (Resolve-Path (Join-Path $PSScriptRoot "..\.."))

Write-Host "==============================================" -ForegroundColor Cyan
Write-Host "ELARIS SIGLO 21 FIELD KIT - WINDOWS DEV PREFLIGHT" -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan

$required = @("git", "node", "pnpm")
foreach ($cmd in $required) {
    $resolved = Get-Command $cmd -ErrorAction SilentlyContinue
    if (-not $resolved) {
        throw "Missing required command: $cmd"
    }
    Write-Host "PASS: $cmd -> $($resolved.Source)" -ForegroundColor Green
}

if (-not $env:ELARIS_EDGE_PASSPHRASE) {
    $env:ELARIS_EDGE_PASSPHRASE = "FIELD-KIT-PREFLIGHT-SYNTHETIC-ONLY"
    Write-Host "INFO: using synthetic-only temporary preflight passphrase." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Running Robot Adapter + Edge Collector tests..." -ForegroundColor Cyan
& pnpm exec vitest run tests/robot-adapters.test.ts tests/edge-collector.test.ts
if ($LASTEXITCODE -ne 0) {
    throw "Robot Adapter + Edge Collector tests failed with exit code $LASTEXITCODE"
}

Write-Host ""
Write-Host "Running synthetic replay capture..." -ForegroundColor Cyan
$root = Join-Path (Get-Location) ".field-kit\preflight-captures"
New-Item -ItemType Directory -Force -Path $root | Out-Null

& pnpm edge capture-replay `
  --fixture "apps/edge-collector/fixtures/unitree-g1-synthetic.json" `
  --robot-id "PREFLIGHT-G1" `
  --purpose "field-kit-preflight" `
  --root $root

if ($LASTEXITCODE -ne 0) {
    throw "Synthetic replay capture failed with exit code $LASTEXITCODE"
}

Write-Host ""
Write-Host "WINDOWS DEV PREFLIGHT COMPLETE" -ForegroundColor Green
Write-Host "This validates replay/development only." -ForegroundColor Yellow
Write-Host "The live Unitree SDK2/DDS field path is prepared for Linux and must be tested on the authorized robot network." -ForegroundColor Yellow
