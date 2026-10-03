import { describe, expect, it } from "vitest";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

describe("Siglo 21 Field Kit V0", () => {
  it("keeps the live Unitree bridge subscriber-only", async () => {
    const bridge = await readFile(
      resolve("apps/edge-collector/unitree_g1_readonly_bridge.py"),
      "utf8"
    );

    expect(bridge).toContain("ChannelSubscriber");
    expect(bridge).not.toMatch(/import\s+ChannelPublisher/);
    expect(bridge).not.toMatch(/ChannelPublisher\s*\(/);
    expect(bridge).not.toContain("rt/lowcmd");
    expect(bridge).not.toContain("rt/arm_sdk");
  }, 120_000);

  it("provides a no-robot Unitree doctor", async () => {
    const preflight = await readFile(
      resolve("apps/edge-collector/unitree_g1_preflight.py"),
      "utf8"
    );

    expect(preflight).toContain("socket.if_nameindex()");
    expect(preflight).toContain('check_import("unitree_sdk2py")');
    expect(preflight).toContain('check_import("cyclonedds")');
    expect(preflight).toContain('"This preflight does not connect to the robot."');
    expect(preflight).toContain('operstate_path = Path("/sys/class/net")');
    expect(preflight).toContain("iff_multicast = bool(flags & 0x1000)");
    expect(preflight).toContain("and network_link_ready");
    expect(preflight).toContain("return 0 if software_ready else 2");
    expect(preflight).not.toContain("return 0 if ready else 2");
  });

  it("keeps the Windows preflight ASCII-safe for Windows PowerShell 5.1", async () => {
    const script = await readFile(
      resolve("scripts/field-kit/preflight_windows.ps1"),
      "utf8"
    );

    expect([...script].every((character) => character.charCodeAt(0) < 128)).toBe(true);
    expect(script).toContain("WINDOWS DEV PREFLIGHT COMPLETE");
  });
  it("pins CycloneDDS 0.10.2 before installing Unitree SDK2 Python", async () => {
    const script = await readFile(
      resolve("scripts/field-kit/setup_unitree_linux.sh"),
      "utf8"
    );

    expect(script).toContain("git clone --branch 0.10.2");
    expect(script).toContain('export CYCLONEDDS_HOME="$DDS_INSTALL_DIR"');
    expect(script).toContain('export CMAKE_PREFIX_PATH="$CYCLONEDDS_HOME"');
    expect(script).toContain('python -m pip install -e "$SDK_DIR"');
    expect(script.indexOf("git clone --branch 0.10.2")).toBeLessThan(
      script.indexOf('python -m pip install -e "$SDK_DIR"')
    );
  });
  it("avoids the NodeSource nodejs/npm apt conflict", async () => {
    const script = await readFile(
      resolve("scripts/field-kit/prepare_wsl_software.sh"),
      "utf8"
    );

    expect(script).not.toMatch(/apt-get install[\\s\\S]*?nodejs[\\s\\S]*?npm/);
    expect(script).toContain("command -v node");
    expect(script).toContain("command -v npm");
    expect(script).toContain("pnpm@9.15.4");
  });
  it("provides a WSL software-only preparation script", async () => {
    const script = await readFile(
      resolve("scripts/field-kit/prepare_wsl_software.sh"),
      "utf8"
    );

    expect(script).toContain("pnpm edge doctor-unitree");
    expect(script).toContain("LIVE ROBOT HOST READY: NO");
    expect(script).not.toContain("inspect-unitree");
    expect(script).not.toContain("capture-unitree");
  });
  it("provides a no-robot mirrored multicast probe", async () => {
    const powershell = await readFile(
      resolve("scripts/field-kit/test_wsl_multicast.ps1"),
      "utf8"
    );
    const receiver = await readFile(
      resolve("scripts/field-kit/multicast_receiver.py"),
      "utf8"
    );

    expect(powershell).toContain("MULTICAST PROBE PASS");
    expect(powershell).toContain("Robot connection: NOT ATTEMPTED");
    expect(powershell).toContain("239.255.42.99");
    expect(powershell).toContain('"/mnt/$driveLetter/$relativePath"');
    expect(powershell).toContain("Substring(3).Replace([char]92, [char]47)");
    expect(powershell).not.toContain("wslpath");
    expect((powershell.match(/\$token = "ELARIS-MCAST-"/g) ?? []).length).toBe(1);
    expect(receiver).toContain("IP_ADD_MEMBERSHIP");
    expect(powershell).not.toContain("Set-NetFirewallHyperVVMSetting");
  });
  it("keeps the WSL multicast firewall exception narrow and removable", async () => {
    const enable = await readFile(
      resolve("scripts/field-kit/enable_wsl_multicast_probe_rule.ps1"),
      "utf8"
    );
    const disable = await readFile(
      resolve("scripts/field-kit/disable_wsl_multicast_probe_rule.ps1"),
      "utf8"
    );

    expect(enable).toContain("-Direction Inbound");
    expect(enable).toContain("-Protocol UDP");
    expect(enable).toContain("-LocalPorts $Port");
    expect(enable).toContain("-VMCreatorId $WslCreatorId");
    expect(enable).toContain("-Action Allow");
    expect(enable).not.toContain("DefaultInboundAction");
    expect(disable).toContain("Remove-NetFirewallHyperVRule");
  });
  it("self-elevates the multicast probe runner before changing Hyper-V firewall state", async () => {
    const runner = await readFile(
      resolve("scripts/field-kit/run_wsl_multicast_probe_admin.ps1"),
      "utf8"
    );

    expect(runner).toContain('Start-Process -FilePath "powershell.exe" -Verb RunAs');
    expect(runner).toContain("-Wait -PassThru");
    expect(runner).toContain("Start-Transcript");
    expect(runner).toContain("Get-Content $LogPath");
    expect(runner).toContain("enable_wsl_multicast_probe_rule.ps1");
    expect(runner).toContain("test_wsl_multicast.ps1");
    expect(runner).toContain("No robot connection was attempted.");
  });
  it("diagnoses the mirrored multicast host-membership path", async () => {
    const script = await readFile(
      resolve("scripts/field-kit/test_wsl_multicast_host_join.ps1"),
      "utf8"
    );

    expect(script).toContain("JoinMulticastGroup");
    expect(script).toContain("PASS:HOST:");
    expect(script).toContain("HOST-JOIN MULTICAST PROBE PASS");
    expect(script).toContain("No robot connection was attempted.");
  });
  it("normalizes VirtualBox bridged interface output before matching", async () => {
    const script = await readFile(
      resolve("scripts/field-kit/prepare_virtualbox_field_host.ps1"),
      "utf8"
    );

    expect(script).toContain("$bridgedLines = & $script:VBoxManage list bridgedifs");
    expect(script).toContain("$bridged = $bridgedLines | Out-String");
    expect(script).toContain("[regex]::Escape($BridgeAdapter)");
  });
  it("detects an absent VirtualBox VM without calling showvminfo", async () => {
    const script = await readFile(
      resolve("scripts/field-kit/prepare_virtualbox_field_host.ps1"),
      "utf8"
    );

    expect(script).toContain("$registeredVms = (& $script:VBoxManage list vms 2>$null) | Out-String");
    expect(script).toContain("$vmExists = $registeredVms -match");
    expect(script).not.toContain("showvminfo $VmName *> $null");
  });
  it("blocks live Linux preflight when the selected interface link is not active or multicast-capable", async () => {
    const script = await readFile(
      resolve("scripts/field-kit/preflight_live_linux.sh"),
      "utf8"
    );

    expect(script).toContain('SYSFS_IFACE="/sys/class/net/$IFACE"');
    expect(script).toContain('$SYSFS_IFACE/operstate');
    expect(script).toContain('$SYSFS_IFACE/flags');
    expect(script).toContain('OPERSTATE" != "up"');
    expect(script).toContain("FLAGS_RAW & 0x1000");
    expect(script).toContain("FAIL: interface link is not active");
    expect(script).toContain("FAIL: interface is not multicast-capable");
  });

  it("prepares the VirtualBox candidate without repartitioning physical disks", async () => {
    const script = await readFile(
      resolve("scripts/field-kit/prepare_virtualbox_field_host.ps1"),
      "utf8"
    );

    expect(script).toContain("--variant Split2G");
    expect(script).toContain("--nic1 nat");
    expect(script).toContain("--nic2 bridged");
    expect(script).toContain("Realtek PCIe GbE Family Controller");
    expect(script).toContain("97f3d7ffb032c3eb3b23d2c8be9cc76e60c2c1f2c0146ba5ba9fe01cafae0fd8");
    expect(script).not.toContain("Clear-Disk");
    expect(script).not.toContain("Format-Volume");
    expect(script).not.toContain("Resize-Partition");
  });
  it("keeps field artifacts outside git", async () => {
    const gitignore = await readFile(resolve(".gitignore"), "utf8");
    expect(gitignore).toContain("/captures/");
    expect(gitignore).toContain("/.field-kit/");
  });
  it("provides a no-robot Field Session Pack dry run that cannot enter live acquisition", async () => {
    const script = await readFile(
      resolve("scripts/field-kit/run_field_session_dry_run.sh"),
      "utf8"
    );

    expect(script).toContain("preflight_live_linux.sh");
    expect(script).toContain("capture-replay");
    expect(script).toContain("pnpm edge review");
    expect(script).toContain("State: FINALIZED");
    expect(script).toContain("Classification: SENSITIVE");
    expect(script).toContain("Export approval: NOT_APPROVED");
    expect(script).toContain(".field-kit/field-session-dry-run");
    expect(script).not.toContain("inspect-unitree");
    expect(script).not.toContain("capture-unitree");
    expect(script).not.toContain("approve-export");
  });

});
