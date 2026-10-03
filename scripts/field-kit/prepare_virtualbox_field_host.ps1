param(
    [string]$VmName = "Elaris-Unitree-Field",
    [string]$VmRoot = "D:\Elaris-VM",
    [string]$BridgeAdapter = "Realtek PCIe GbE Family Controller"
)

$ErrorActionPreference = "Stop"

$UbuntuIsoName = "ubuntu-24.04.5-live-server-amd64.iso"
$UbuntuIsoUrl = "https://releases.ubuntu.com/24.04/ubuntu-24.04.5-live-server-amd64.iso"
$UbuntuIsoSha256 = "97f3d7ffb032c3eb3b23d2c8be9cc76e60c2c1f2c0146ba5ba9fe01cafae0fd8"
$DiskSizeMB = 16384

function Invoke-VBox {
    param([Parameter(ValueFromRemainingArguments = $true)][string[]]$Args)
    & $script:VBoxManage @Args
    if ($LASTEXITCODE -ne 0) {
        throw "VBoxManage failed: $($Args -join ' ')"
    }
}

Write-Host "==============================================" -ForegroundColor Cyan
Write-Host "ELARIS VIRTUALBOX FIELD HOST PREPARATION" -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host ""

$script:VBoxManage = @(
    "$env:ProgramFiles\Oracle\VirtualBox\VBoxManage.exe",
    "$env:ProgramFiles(x86)\Oracle\VirtualBox\VBoxManage.exe"
) | Where-Object { Test-Path $_ } | Select-Object -First 1

if (-not $script:VBoxManage) {
    throw "VirtualBox VBoxManage.exe was not found."
}

$drive = Get-Volume -DriveLetter D
if (-not $drive) {
    throw "Drive D: was not found."
}

if ($drive.SizeRemaining -lt 12GB) {
    throw "At least 12 GB free is required on D: for the VM workflow."
}

$bridged = & $script:VBoxManage list bridgedifs
if ($bridged -notmatch [regex]::Escape($BridgeAdapter)) {
    throw "Bridged adapter not found in VirtualBox: $BridgeAdapter"
}

New-Item -ItemType Directory -Force -Path $VmRoot | Out-Null

$isoPath = Join-Path $VmRoot $UbuntuIsoName
$diskPath = Join-Path $VmRoot "$VmName.vmdk"

Write-Host "VirtualBox: $(& $script:VBoxManage --version)" -ForegroundColor Green
Write-Host "VM folder: $VmRoot"
Write-Host "External drive filesystem: $($drive.FileSystem)"
Write-Host "External drive free GB: $([math]::Round($drive.SizeRemaining / 1GB, 1))"
Write-Host "Robot bridge adapter: $BridgeAdapter"
Write-Host "Robot connection: NOT ATTEMPTED"
Write-Host ""

if (-not (Test-Path $isoPath)) {
    Write-Host "Downloading Ubuntu Server 24.04.5 (~3.8 GB)..." -ForegroundColor Cyan
    $curl = Get-Command curl.exe -ErrorAction SilentlyContinue
    if (-not $curl) {
        throw "curl.exe was not found."
    }

    & $curl.Source -L --fail --progress-bar -o $isoPath $UbuntuIsoUrl
    if ($LASTEXITCODE -ne 0) {
        throw "Ubuntu ISO download failed."
    }
} else {
    Write-Host "Ubuntu ISO already exists; verifying it." -ForegroundColor Yellow
}

$isoHash = (Get-FileHash -Path $isoPath -Algorithm SHA256).Hash.ToLowerInvariant()
if ($isoHash -ne $UbuntuIsoSha256) {
    throw "Ubuntu ISO SHA256 mismatch. Expected $UbuntuIsoSha256 but got $isoHash"
}
Write-Host "Ubuntu ISO SHA256: PASS" -ForegroundColor Green

$vmExists = $false
& $script:VBoxManage showvminfo $VmName *> $null
if ($LASTEXITCODE -eq 0) {
    $vmExists = $true
}

if (-not $vmExists) {
    Write-Host ""
    Write-Host "Creating VM..." -ForegroundColor Cyan
    Invoke-VBox createvm --name $VmName --basefolder $VmRoot --ostype Ubuntu_64 --register

    $hostRamMB = [int]((Get-CimInstance Win32_ComputerSystem).TotalPhysicalMemory / 1MB)
    $vmRamMB = if ($hostRamMB -ge 12288) { 4096 } elseif ($hostRamMB -ge 8192) { 3072 } else { 2048 }
    $logicalCpu = [Environment]::ProcessorCount
    $vmCpu = if ($logicalCpu -ge 4) { 2 } else { 1 }

    Invoke-VBox modifyvm $VmName `
        --memory $vmRamMB `
        --cpus $vmCpu `
        --ioapic on `
        --boot1 dvd `
        --boot2 disk `
        --boot3 none `
        --boot4 none `
        --nic1 nat `
        --nictype1 82540EM `
        --nic2 bridged `
        --bridgeadapter2 $BridgeAdapter `
        --nictype2 82540EM `
        --cableconnected2 on `
        --audio-enabled off `
        --clipboard-mode disabled `
        --drag-and-drop disabled

    Write-Host "Creating dynamic 16 GB VMDK split into <=2 GB segments for FAT32..." -ForegroundColor Cyan
    Invoke-VBox createmedium disk `
        --filename $diskPath `
        --size $DiskSizeMB `
        --format VMDK `
        --variant Split2G

    Invoke-VBox storagectl $VmName `
        --name "SATA" `
        --add sata `
        --controller IntelAhci `
        --portcount 2 `
        --bootable on

    Invoke-VBox storageattach $VmName `
        --storagectl "SATA" `
        --port 0 `
        --device 0 `
        --type hdd `
        --medium $diskPath

    Invoke-VBox storageattach $VmName `
        --storagectl "SATA" `
        --port 1 `
        --device 0 `
        --type dvddrive `
        --medium $isoPath

    Write-Host "VM created." -ForegroundColor Green
} else {
    Write-Host "VM already exists; no destructive changes applied." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host "VM SUMMARY" -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan
Invoke-VBox showvminfo $VmName

Write-Host ""
Write-Host "Starting Ubuntu installer..." -ForegroundColor Cyan
Invoke-VBox startvm $VmName --type gui

Write-Host ""
Write-Host "VIRTUALBOX FIELD HOST STARTED" -ForegroundColor Green
Write-Host "Install Ubuntu only inside the virtual disk shown in the VM." -ForegroundColor Yellow
Write-Host "Do not select or modify any physical Windows disk." -ForegroundColor Yellow
Write-Host "The VM uses NAT for internet and a second bridged NIC for the Realtek robot network." -ForegroundColor Yellow
Write-Host "No robot connection was attempted." -ForegroundColor Yellow
