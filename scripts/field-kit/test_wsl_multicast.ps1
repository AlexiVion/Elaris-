param(
    [string]$Distro = "Ubuntu-24.04",
    [string]$Group = "239.255.42.99",
    [int]$Port = 42499,
    [int]$TimeoutSeconds = 8
)

$ErrorActionPreference = "Stop"

Write-Host "==============================================" -ForegroundColor Cyan
Write-Host "ELARIS WSL MIRRORED MULTICAST PROBE" -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan

$route = Get-NetRoute -DestinationPrefix "0.0.0.0/0" |
    Where-Object { $_.State -eq "Alive" } |
    Sort-Object RouteMetric, InterfaceMetric |
    Select-Object -First 1

if (-not $route) {
    throw "No active IPv4 default route found."
}

$ipConfig = Get-NetIPConfiguration -InterfaceIndex $route.InterfaceIndex
$localIp = ($ipConfig.IPv4Address | Select-Object -First 1).IPAddress

if (-not $localIp) {
    throw "No IPv4 address found on the active Windows interface."
}

$repoPath = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
$receiverWindows = [System.IO.Path]::GetFullPath(
    (Join-Path $repoPath "scripts\field-kit\multicast_receiver.py")
)

if (-not (Test-Path $receiverWindows)) {
    throw "Multicast receiver not found: $receiverWindows"
}

if ($receiverWindows -notmatch '^([A-Za-z]):\\(.*)

$token = "ELARIS-MCAST-" + [guid]::NewGuid().ToString("N")

Write-Host "Windows interface: $($ipConfig.InterfaceAlias)"
Write-Host "Windows IPv4: $localIp"
Write-Host "Multicast group: ${Group}:${Port}"
Write-Host "Robot connection: NOT ATTEMPTED"
Write-Host ""

$job = Start-Job -ScriptBlock {
    param($DistroName, $ScriptPath, $MulticastGroup, $MulticastPort, $InterfaceIp, $ExpectedToken, $Timeout)
    & wsl -d $DistroName -- python3 $ScriptPath `
        --group $MulticastGroup `
        --port $MulticastPort `
        --interface-ip $InterfaceIp `
        --expect-token $ExpectedToken `
        --timeout $Timeout
} -ArgumentList $Distro, $receiverWsl, $Group, $Port, $localIp, $token, $TimeoutSeconds

try {
    Start-Sleep -Seconds 2

    $client = [System.Net.Sockets.UdpClient]::new()
    try {
        $address = [System.Net.IPAddress]::Parse($localIp)
        $client.Client.Bind([System.Net.IPEndPoint]::new($address, 0))
        $client.MulticastLoopback = $true
        $endpoint = [System.Net.IPEndPoint]::new([System.Net.IPAddress]::Parse($Group), $Port)
        $bytes = [System.Text.Encoding]::UTF8.GetBytes($token)

        1..3 | ForEach-Object {
            [void]$client.Send($bytes, $bytes.Length, $endpoint)
            Start-Sleep -Milliseconds 250
        }
    } finally {
        if ($client) { $client.Dispose() }
    }

    [void](Wait-Job $job -Timeout ($TimeoutSeconds + 4))
    $output = (Receive-Job $job -ErrorAction SilentlyContinue | Out-String).Trim()
    if ($output) { Write-Host $output }

    if ($output -notmatch [regex]::Escape("PASS:$token")) {
        throw "Multicast probe failed. Do not change firewall broadly; inspect Hyper-V/Windows firewall next."
    }

    Write-Host ""
    Write-Host "MULTICAST PROBE PASS" -ForegroundColor Green
    Write-Host "Windows -> WSL mirrored multicast received successfully." -ForegroundColor Green
    Write-Host "No robot connection was attempted." -ForegroundColor Yellow
} finally {
    if ($job) {
        Stop-Job $job -ErrorAction SilentlyContinue
        Remove-Job $job -Force -ErrorAction SilentlyContinue
    }
}
) {
    throw "Expected a local Windows drive path, got: $receiverWindows"
}

$driveLetter = $Matches[1].ToLowerInvariant()
$relativePath = $Matches[2] -replace '\\', '/'
$receiverWsl = "/mnt/$driveLetter/$relativePath"

$token = "ELARIS-MCAST-" + [guid]::NewGuid().ToString("N")

Write-Host "Windows interface: $($ipConfig.InterfaceAlias)"
Write-Host "Windows IPv4: $localIp"
Write-Host "Multicast group: ${Group}:${Port}"
Write-Host "Robot connection: NOT ATTEMPTED"
Write-Host ""

$job = Start-Job -ScriptBlock {
    param($DistroName, $ScriptPath, $MulticastGroup, $MulticastPort, $InterfaceIp, $ExpectedToken, $Timeout)
    & wsl -d $DistroName -- python3 $ScriptPath `
        --group $MulticastGroup `
        --port $MulticastPort `
        --interface-ip $InterfaceIp `
        --expect-token $ExpectedToken `
        --timeout $Timeout
} -ArgumentList $Distro, $receiverWsl, $Group, $Port, $localIp, $token, $TimeoutSeconds

try {
    Start-Sleep -Seconds 2

    $client = [System.Net.Sockets.UdpClient]::new()
    try {
        $address = [System.Net.IPAddress]::Parse($localIp)
        $client.Client.Bind([System.Net.IPEndPoint]::new($address, 0))
        $client.MulticastLoopback = $true
        $endpoint = [System.Net.IPEndPoint]::new([System.Net.IPAddress]::Parse($Group), $Port)
        $bytes = [System.Text.Encoding]::UTF8.GetBytes($token)

        1..3 | ForEach-Object {
            [void]$client.Send($bytes, $bytes.Length, $endpoint)
            Start-Sleep -Milliseconds 250
        }
    } finally {
        if ($client) { $client.Dispose() }
    }

    [void](Wait-Job $job -Timeout ($TimeoutSeconds + 4))
    $output = (Receive-Job $job -ErrorAction SilentlyContinue | Out-String).Trim()
    if ($output) { Write-Host $output }

    if ($output -notmatch [regex]::Escape("PASS:$token")) {
        throw "Multicast probe failed. Do not change firewall broadly; inspect Hyper-V/Windows firewall next."
    }

    Write-Host ""
    Write-Host "MULTICAST PROBE PASS" -ForegroundColor Green
    Write-Host "Windows -> WSL mirrored multicast received successfully." -ForegroundColor Green
    Write-Host "No robot connection was attempted." -ForegroundColor Yellow
} finally {
    if ($job) {
        Stop-Job $job -ErrorAction SilentlyContinue
        Remove-Job $job -Force -ErrorAction SilentlyContinue
    }
}
