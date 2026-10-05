import { describe, expect, it } from "vitest";
import {
  MockWorldModelProvider,
  UnsupportedWorldModelCapabilityError,
  WorldModelProviderRegistry,
} from "@/lib/world-models";

describe("WorldModelProviderRegistry", () => {
  it("registers and retrieves providers by stable provider id", () => {
    const registry = new WorldModelProviderRegistry();
    const provider = new MockWorldModelProvider();

    registry.register(provider);

    expect(registry.get("mock-world-model")).toBe(provider);
    expect(registry.list()).toEqual([provider]);
  });

  it("rejects duplicate provider ids", () => {
    const registry = new WorldModelProviderRegistry();
    registry.register(new MockWorldModelProvider());

    expect(() =>
      registry.register(new MockWorldModelProvider())
    ).toThrow(/already registered/i);
  });

  it("requires declared capability instead of assuming provider support", async () => {
    const registry = new WorldModelProviderRegistry();
    registry.register(
      new MockWorldModelProvider({
        capabilities: ["REASON"],
      })
    );

    await expect(
      registry.requireCapability(
        "mock-world-model",
        "FORWARD_DYNAMICS"
      )
    ).rejects.toBeInstanceOf(
      UnsupportedWorldModelCapabilityError
    );
  });
});
