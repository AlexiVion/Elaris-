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
  });

  it("provides a no-robot Unitree doctor", async () => {
    const preflight = await readFile(
      resolve("apps/edge-collector/unitree_g1_preflight.py"),
      "utf8"
    );

    expect(preflight).toContain("socket.if_nameindex()");
    expect(preflight).toContain('check_import("unitree_sdk2py")');
    expect(preflight).toContain('check_import("cyclonedds")');
    expect(preflight).toContain('"This preflight does not connect to the robot."');
  });

  it("keeps the Windows preflight ASCII-safe for Windows PowerShell 5.1", async () => {
    const script = await readFile(
      resolve("scripts/field-kit/preflight_windows.ps1"),
      "utf8"
    );

    expect([...script].every((character) => character.charCodeAt(0) < 128)).toBe(true);
    expect(script).toContain("WINDOWS DEV PREFLIGHT COMPLETE");
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
  it("keeps field artifacts outside git", async () => {
    const gitignore = await readFile(resolve(".gitignore"), "utf8");
    expect(gitignore).toContain("/captures/");
    expect(gitignore).toContain("/.field-kit/");
  });
});
