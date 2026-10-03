param(
    [string]$Distro = "Ubuntu-24.04",
    [string]$Group = "239.255.42.99",
    [int]$Port = 42499,
    [int]$TimeoutSeconds = 8
)

$ErrorActionPreference = "Stop"

Write-Host "==============================================" -ForegroundColor Cyan
Write-Host "ELARIS WSL MULTICAST HOST-JOIN PROBE" -ForegroundColor Cyan
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

if ($receiverWindows.Length -lt 4 -or $receiverWindows[1] -ne [char]58 -or $receiverWindows[2] -ne [char]92) {
    throw "Expected a local Windows drive path, got: $receiverWindows"
}

$driveLetter = $receiverWindows.Substring(0, 1).ToLowerInvariant()
$relativePath = $receiverWindows.Substring(3).Replace([char]92, [char]47)
$receiverWsl = "/mnt/$driveLetter/$relativePath"
$token = "ELARIS-MCAST-HOSTJOIN-" + [guid]::NewGuid().ToString("N")

Write-Host "Windows interface: $($ipConfig.InterfaceAlias)"
Write-Host "Windows IPv4: $localIp"
Write-Host "WSL receiver: $receiverWsl"
Write-Host "Multicast group: ${Group}:${Port}"
Write-Host "Windows host multicast membership: ENABLED FOR THIS PROBE"
Write-Host "Robot connection: NOT ATTEMPTED"
Write-Host ""

$hostJob = Start-Job -ScriptBlock {
    param($MulticastGroup, $MulticastPort, $InterfaceIp, $ExpectedToken, $Timeout)

    $udp = New-Object System.Net.Sockets.UdpClient
    try {
        $udp.ExclusiveAddressUse = $false
        $udp.Client.SetSocketOption(
            [System.Net.Sockets.SocketOptionLevel]::Socket,
            [System.Net.Sockets.SocketOptionName]::ReuseAddress,
            $true
        )
        $udp.Client.Bind([System.Net.IPEndPoint]::new([System.Net.IPAddress]::Any, $MulticastPort))
        $udp.JoinMulticastGroup(
            [System.Net.IPAddress]::Parse($MulticastGroup),
            [System.Net.IPAddress]::Parse($InterfaceIp)
        )
        $udp.Client.ReceiveTimeout = $Timeout * 1000

        $remote = New-Object System.Net.IPEndPoint([System.Net.IPAddress]::Any, 0)
        try {
            $bytes = $udp.Receive([ref]$remote)
            $text = [System.Text.Encoding]::UTF8.GetString($bytes)
            if ($text -eq $ExpectedToken) {
                Write-Output "PASS:HOST:$ExpectedToken"
            } else {
                Write-Output "FAIL:HOST:UNEXPECTED_PAYLOAD"
            }
        } catch {
            Write-Output "FAIL:HOST:TIMEOUT"
        }
    } finally {
        if ($udp) { $udp.Dispose() }
    }
} -ArgumentList $Group, $Port, $localIp, $token, $TimeoutSeconds

$wslJob = Start-Job -ScriptBlock {
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

    [void](Wait-Job $hostJob -Timeout ($TimeoutSeconds + 4))
    [void](Wait-Job $wslJob -Timeout ($TimeoutSeconds + 4))

    $hostOutput = (Receive-Job $hostJob -ErrorAction SilentlyContinue | Out-String).Trim()
    $wslOutput = (Receive-Job $wslJob -ErrorAction SilentlyContinue | Out-String).Trim()

    if ($hostOutput) { Write-Host $hostOutput }
    if ($wslOutput) { Write-Host $wslOutput }

    $hostPass = $hostOutput -match [regex]::Escape("PASS:HOST:$token")
    $wslPass = $wslOutput -match [regex]::Escape("PASS:$token")

    if (-not $hostPass) {
        throw "Windows host did not receive its own multicast. The probe is not valid yet."
    }

    if (-not $wslPass) {
        throw "Windows joined the multicast group, but WSL still did not receive the packet."
    }

    Write-Host ""
    Write-Host "HOST-JOIN MULTICAST PROBE PASS" -ForegroundColor Green
    Write-Host "Windows host and WSL both received the multicast datagram." -ForegroundColor Green
    Write-Host "No robot connection was attempted." -ForegroundColor Yellow
} finally {
    foreach ($job in @($hostJob, $wslJob)) {
        if ($job) {
            Stop-Job $job -ErrorAction SilentlyContinue
            Remove-Job $job -Force -ErrorAction SilentlyContinue
        }
    }
}
