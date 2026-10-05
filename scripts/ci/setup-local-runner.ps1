param(
    [string]$Repository = "AlexiVion/Elaris-",
    [string]$RunnerRoot = "$env:USERPROFILE\actions-runner\elaris",
    [string]$RunnerName = "$env:COMPUTERNAME-elaris",
    [string]$Labels = "elaris"
)

$ErrorActionPreference = "Stop"

function Require-Command {
    param([string]$Name)
    if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
        throw "Required command '$Name' was not found."
    }
}

Write-Host "Elaris local GitHub Actions runner setup"
Write-Host "Repository: $Repository"
Write-Host "Runner root: $RunnerRoot"
Write-Host "Runner name: $RunnerName"
Write-Host ""

Require-Command "gh"

Write-Host "Checking GitHub CLI authentication..."
gh auth status
if ($LASTEXITCODE -ne 0) {
    throw "GitHub CLI is not authenticated. Run: gh auth login"
}

Write-Host "Checking repository access..."
gh api "repos/$Repository" --silent
if ($LASTEXITCODE -ne 0) {
    throw "GitHub CLI cannot access $Repository."
}

if (Test-Path (Join-Path $RunnerRoot ".runner")) {
    throw "A GitHub Actions runner is already configured at $RunnerRoot. Use a different RunnerRoot or remove that runner first."
}

Write-Host "Resolving latest GitHub Actions runner release..."
$release = Invoke-RestMethod -Uri "https://api.github.com/repos/actions/runner/releases/latest" -Headers @{ "User-Agent" = "Elaris-Local-Runner-Setup" }

$asset = $release.assets | Where-Object { $_.name -match '^actions-runner-win-x64-.*\.zip$' } | Select-Object -First 1

if (-not $asset) {
    throw "Could not find the latest Windows x64 GitHub Actions runner package."
}

$zipPath = Join-Path $env:TEMP $asset.name

Write-Host "Downloading $($asset.name)..."
Invoke-WebRequest -Uri $asset.browser_download_url -OutFile $zipPath

New-Item -ItemType Directory -Path $RunnerRoot -Force | Out-Null

Write-Host "Extracting runner..."
Expand-Archive -Path $zipPath -DestinationPath $RunnerRoot -Force
Remove-Item $zipPath -Force -ErrorAction SilentlyContinue

Write-Host "Requesting short-lived registration token..."
$registration = gh api --method POST "repos/$Repository/actions/runners/registration-token" | ConvertFrom-Json

if (-not $registration.token) {
    throw "GitHub did not return a runner registration token. Repository admin permission may be required."
}

Push-Location $RunnerRoot
try {
    Write-Host "Registering local runner..."
    & .\config.cmd --url "https://github.com/$Repository" --token $registration.token --name $RunnerName --work "_work" --labels $Labels --unattended --replace

    if ($LASTEXITCODE -ne 0) {
        throw "Runner registration failed."
    }

    $principal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
    $isAdmin = $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

    if ($isAdmin -and (Test-Path ".\svc.cmd")) {
        Write-Host "Installing runner as Windows service..."
        & .\svc.cmd install

        if ($LASTEXITCODE -ne 0) {
            throw "Runner service installation failed."
        }

        & .\svc.cmd start

        if ($LASTEXITCODE -ne 0) {
            throw "Runner service start failed."
        }

        Write-Host ""
        Write-Host "RUNNER_READY_AS_SERVICE"
    }
    else {
        Write-Host ""
        Write-Host "Runner registered successfully."
        Write-Host "This PowerShell is not elevated, so the runner was not installed as a service."
        Write-Host "Starting the runner interactively in a separate window..."
        Start-Process -FilePath (Join-Path $RunnerRoot "run.cmd") -WorkingDirectory $RunnerRoot
        Write-Host ""
        Write-Host "Keep the runner window open while CI is running."
        Write-Host "RUNNER_READY_INTERACTIVE"
    }
}
finally {
    Pop-Location
}
