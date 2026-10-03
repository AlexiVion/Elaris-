param(
    [string]$Distro = "Ubuntu-24.04"
)

$ErrorActionPreference = "Stop"

$principal = New-Object Security.Principal.WindowsPrincipal(
    [Security.Principal.WindowsIdentity]::GetCurrent()
)
$isAdmin = $principal.IsInRole(
    [Security.Principal.WindowsBuiltInRole]::Administrator
)

if (-not $isAdmin) {
    Write-Host "Administrator rights are required for the narrow Hyper-V rule." -ForegroundColor Yellow
    Write-Host "Requesting elevation via UAC..." -ForegroundColor Yellow

    $argList = @(
        "-NoProfile",
        "-ExecutionPolicy", "Bypass",
        "-File", "`"$PSCommandPath`"",
        "-Distro", "`"$Distro`""
    )

    Start-Process -FilePath "powershell.exe" -Verb RunAs -ArgumentList $argList
    exit 0
}

$repoPath = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
Set-Location $repoPath

Write-Host "==============================================" -ForegroundColor Cyan
Write-Host "ELARIS ADMIN MULTICAST PROBE" -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host "Administrator: True" -ForegroundColor Green
Write-Host ""

& powershell.exe -NoProfile -ExecutionPolicy Bypass -File `
    (Join-Path $PSScriptRoot "enable_wsl_multicast_probe_rule.ps1")

if ($LASTEXITCODE -ne 0) {
    throw "Failed to enable the narrow Hyper-V multicast probe rule."
}

Write-Host ""
& powershell.exe -NoProfile -ExecutionPolicy Bypass -File `
    (Join-Path $PSScriptRoot "test_wsl_multicast.ps1") `
    -Distro $Distro

if ($LASTEXITCODE -ne 0) {
    throw "Multicast probe failed after the narrow Hyper-V rule was enabled."
}

Write-Host ""
Write-Host "ADMIN MULTICAST PROBE COMPLETE" -ForegroundColor Green
Write-Host "The temporary narrow UDP 42499 WSL rule remains installed for review." -ForegroundColor Yellow
Write-Host "No robot connection was attempted." -ForegroundColor Yellow
