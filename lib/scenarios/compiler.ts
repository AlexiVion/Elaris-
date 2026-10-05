import type { EvidenceProvenance } from "./evidence-class";
import { canonicalScenarioSpec, hashScenario } from "./hash";
import { buildScenarioProvenance } from "./provenance";
import { scenarioSpecSchema } from "./schema";
import type { CompiledScenario, ScenarioSpec } from "./types";

export type CompileScenarioInput = {
  spec: ScenarioSpec;
  evidence?: readonly EvidenceProvenance[];
};

/**
 * Deterministic, provider-neutral Scenario Compiler V0.
 *
 * It validates explicit refs/assumptions, canonicalizes set-like fields,
 * enforces observed-evidence provenance and returns an immutable compiled
 * object. It does not call NVIDIA, a simulator, a database or the robot.
 */
export function compileScenario(
  input: CompileScenarioInput
): CompiledScenario {
  const parsed = scenarioSpecSchema.parse(input.spec) as ScenarioSpec;
  const spec = canonicalScenarioSpec(parsed);
  const hash = hashScenario(spec);
  const provenance = buildScenarioProvenance(
    spec,
    hash,
    input.evidence ?? []
  );

  return deepFreeze({
    spec,
    hash,
    provenance,
  });
}

function deepFreeze<T>(value: T): T {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) {
    return value;
  }

  for (const nested of Object.values(value as Record<string, unknown>)) {
    deepFreeze(nested);
  }

  Object.freeze(value);
  return value;
}
