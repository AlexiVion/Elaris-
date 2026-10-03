import type { RobotAdapter, RobotIdentity } from "./types";
import { UnitreeG1Adapter } from "./unitree-g1";

export class RobotAdapterRegistry {
  constructor(private readonly adapters: readonly RobotAdapter[]) {}

  list() {
    return [...this.adapters];
  }

  find(robot: RobotIdentity) {
    return this.adapters.find((adapter) => adapter.supports(robot)) ?? null;
  }

  require(robot: RobotIdentity) {
    const adapter = this.find(robot);
    if (!adapter) {
      throw new Error(`No Elaris Robot Adapter registered for ${robot.manufacturer} ${robot.model}`);
    }
    return adapter;
  }
}

export const robotAdapterRegistry = new RobotAdapterRegistry([
  new UnitreeG1Adapter(),
]);
