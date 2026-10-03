param(
    [string]$RuleName = "Elaris-WSL-Multicast-Probe-UDP-42499",
    [int]$Port = 42499
)

$ErrorActionPreference = "Stop"
$WslCreatorId = "{40E0AC32-46A5-438A-A0B2-2B479E8F2E90}"

$principal = New-Object Security.Principal.WindowsPrincipal(
    [Security.Principal.WindowsIdentity]::GetCurrent()
)
$isAdmin = $principal.IsInRole(
    [Security.Principal.WindowsBuiltInRole]::Administrator
)

if (-not $isAdmin) {
    throw "Run this script from PowerShell as Administrator."
}

$existing = Get-NetFirewallHyperVRule -VMCreatorId $WslCreatorId -ErrorAction SilentlyContinue |
    Where-Object { $_.Name -eq $RuleName }

if ($existing) {
    Write-Host "Rule already exists: $RuleName" -ForegroundColor Yellow
} else {
    New-NetFirewallHyperVRule `
        -Name $RuleName `
        -DisplayName "Elaris WSL Multicast Probe UDP 42499" `
        -Direction Inbound `
        -VMCreatorId $WslCreatorId `
        -Protocol UDP `
        -LocalPorts $Port `
        -Action Allow | Out-Null
}

$rule = Get-NetFirewallHyperVRule -VMCreatorId $WslCreatorId -ErrorAction Stop |
    Where-Object { $_.Name -eq $RuleName }

if (-not $rule) {
    throw "Rule creation could not be verified."
}

Write-Host "HYPER-V PROBE RULE READY" -ForegroundColor Green
Write-Host "Name: $RuleName"
Write-Host "Direction: Inbound"
Write-Host "Protocol: UDP"
Write-Host "Local port: $Port"
Write-Host "Scope: WSL VMCreatorId only"
