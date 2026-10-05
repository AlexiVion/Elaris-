import type { WorldModelProvider } from "./provider";
import {
  UnsupportedWorldModelCapabilityError,
} from "./provider";
import type { WorldModelCapability } from "./types";

export class WorldModelProviderRegistry {
  private readonly providers = new Map<
    string,
    WorldModelProvider
  >();

  register(provider: WorldModelProvider) {
    const id = provider.descriptor.provider.trim();
    if (!id) {
      throw new Error("World-model provider requires a provider id");
    }
    if (this.providers.has(id)) {
      throw new Error(
        `World-model provider already registered: ${id}`
      );
    }
    this.providers.set(id, provider);
    return provider;
  }

  get(providerId: string) {
    const provider = this.providers.get(providerId);
    if (!provider) {
      throw new Error(
        `World-model provider not registered: ${providerId}`
      );
    }
    return provider;
  }

  list() {
    return [...this.providers.values()];
  }

  async requireCapability(
    providerId: string,
    capability: WorldModelCapability
  ) {
    const provider = this.get(providerId);
    const profile = await provider.capabilities();
    if (!profile.supported.includes(capability)) {
      throw new UnsupportedWorldModelCapabilityError(
        provider.descriptor.provider,
        capability
      );
    }
    return provider;
  }
}
