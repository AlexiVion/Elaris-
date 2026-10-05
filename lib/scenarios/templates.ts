import type { ScenarioCapability, ScenarioSpec } from "./types";

export type ScenarioTemplate = {
  templateId: string;
  title: string;
  assumptions: readonly string[];
  disturbances: readonly string[];
  failureHypotheses: readonly string[];
  requestedCapabilities: readonly ScenarioCapability[];
};

/**
 * Generic V0 template for reviewing task implications under hypothetical
 * reduced component performance. It intentionally makes no failure-probability
 * or diagnostic claim.
 */
export const REDUCED_COMPONENT_PERFORMANCE_TEMPLATE: ScenarioTemplate =
  Object.freeze({
    templateId: "component-reduced-performance-v0",
    title: "Reduced component performance review",
    assumptions: [
      "Reduced component performance is a hypothesis unless supported by separately classified evidence.",
    ],
    disturbances: ["Reduced component performance"],
    failureHypotheses: [
      "Reduced component performance may alter task execution and should be reviewed against observed evidence.",
    ],
    requestedCapabilities: ["REASON"],
  });

export function applyScenarioTemplate(
  base: ScenarioSpec,
  template: ScenarioTemplate
): ScenarioSpec {
  return {
    ...base,
    assumptions: [...base.assumptions, ...template.assumptions],
    disturbances: [...base.disturbances, ...template.disturbances],
    failureHypotheses: [
      ...base.failureHypotheses,
      ...template.failureHypotheses,
    ],
    requestedCapabilities: [
      ...base.requestedCapabilities,
      ...template.requestedCapabilities,
    ],
  };
}
