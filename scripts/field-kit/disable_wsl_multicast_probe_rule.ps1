param(
    [string]$RuleName = "Elaris-WSL-Multicast-Probe-UDP-42499"
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
    Remove-NetFirewallHyperVRule -Name $RuleName -ErrorAction Stop
    Write-Host "HYPER-V PROBE RULE REMOVED" -ForegroundColor Green
} else {
    Write-Host "Probe rule is already absent." -ForegroundColor Yellow
}
