param(
    [string]$Distro = "Ubuntu-24.04",
    [switch]$ElevatedRun,
    [string]$LogPath = ""
)

$ErrorActionPreference = "Stop"

$repoPath = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
$fieldKitDir = Join-Path $repoPath ".field-kit"
if (-not (Test-Path $fieldKitDir)) {
    New-Item -ItemType Directory -Path $fieldKitDir | Out-Null
}

if (-not $LogPath) {
    $LogPath = Join-Path $fieldKitDir "wsl-multicast-admin.log"
}

$principal = New-Object Security.Principal.WindowsPrincipal(
    [Security.Principal.WindowsIdentity]::GetCurrent()
)
$isAdmin = $principal.IsInRole(
    [Security.Principal.WindowsBuiltInRole]::Administrator
)

if (-not $isAdmin) {
    Write-Host "Administrator rights are required for the narrow Hyper-V rule." -ForegroundColor Yellow
    Write-Host "Requesting elevation via UAC..." -ForegroundColor Yellow

    if (Test-Path $LogPath) {
        Remove-Item $LogPath -Force
    }

    $argList = @(
        "-NoProfile",
        "-ExecutionPolicy", "Bypass",
        "-File", "`"$PSCommandPath`"",
        "-Distro", "`"$Distro`"",
        "-ElevatedRun",
        "-LogPath", "`"$LogPath`""
    )

    $process = Start-Process -FilePath "powershell.exe" -Verb RunAs -ArgumentList $argList -Wait -PassThru

    Write-Host ""
    Write-Host "==============================================" -ForegroundColor Cyan
    Write-Host "ELEVATED PROBE RESULT" -ForegroundColor Cyan
    Write-Host "==============================================" -ForegroundColor Cyan

    if (Test-Path $LogPath) {
        Get-Content $LogPath
    } else {
        Write-Host "No elevated log was produced." -ForegroundColor Red
    }

    if ($process.ExitCode -ne 0) {
        throw "Elevated multicast probe failed with exit code $($process.ExitCode)."
    }

    exit 0
}

if (-not $ElevatedRun) {
    throw "Elevated execution marker missing."
}

Set-Location $repoPath
Start-Transcript -Path $LogPath -Force | Out-Null

try {
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
} finally {
    Stop-Transcript | Out-Null
}
