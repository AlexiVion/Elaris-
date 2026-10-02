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

  it("keeps field artifacts outside git", async () => {
    const gitignore = await readFile(resolve(".gitignore"), "utf8");
    expect(gitignore).toContain("/captures/");
    expect(gitignore).toContain("/.field-kit/");
  });
});
