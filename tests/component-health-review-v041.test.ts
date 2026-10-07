import { describe, expect, it } from "vitest";
import type { ComponentHealthEvidenceV03 } from "@/lib/component-health/evidence-engine-v03";
import {
  buildComponentHealthReviewQueue,
  reviewStatusExplanation,
} from "@/lib/component-health/review-v041";

describe("Component Health Review V0.4.1", () => {
  it("turns repeated QA records into a short plain-language action queue", () => {
    const report = {
      quality: {
        findings: [
          {
            code: "OEM_SEMANTICS_UNCONFIRMED",
            severity: "INFO",
            phaseId: "IDLE_BASELINE",
            componentId: "joint-00",
            signal: "motor.state_code",
            message: "OEM enum unconfirmed",
          },
          {
            code: "OEM_SEMANTICS_UNCONFIRMED",
            severity: "INFO",
            phaseId: "TURNING",
            componentId: "joint-00",
            signal: "motor.state_code",
            message: "OEM enum unconfirmed",
          },
          {
            code: "UNRESOLVED_COMPONENT_SLOT",
            severity: "WARNING",
            phaseId: "TURNING",
            componentId: "joint-28",
            message: "slot unresolved",
          },
          {
            code: "CONSTANT_ZERO_SIGNAL",
            severity: "INFO",
            phaseId: "IDLE_BASELINE",
            componentId: "joint-00",
            signal: "motor.state_code",
            message: "constant zero",
          },
        ],
      },
    } as ComponentHealthEvidenceV03;

    const queue = buildComponentHealthReviewQueue(report);

    expect(queue).toHaveLength(3);
    expect(queue[0]).toMatchObject({
      code: "UNRESOLVED_COMPONENT_SLOT",
      priority: "HIGH",
      evidenceCount: 1,
    });

    const semantics = queue.find(
      (item) => item.code === "OEM_SEMANTICS_UNCONFIRMED"
    );
    expect(semantics).toMatchObject({
      priority: "MEDIUM",
      evidenceCount: 2,
      phaseCount: 2,
      componentCount: 1,
    });
    expect(semantics?.recommendedAction).toContain("OEM");

    const zero = queue.find((item) => item.code === "CONSTANT_ZERO_SIGNAL");
    expect(zero?.priority).toBe("LOW");
    expect(zero?.plainLanguage.toLowerCase()).toContain("zero");
  });

  it("never equates completeness review with robot health or release approval", () => {
    const text = reviewStatusExplanation("REVIEWED_FOR_COMPLETENESS");

    expect(text).toContain("not a health");
    expect(text).toContain("release approval");
  });

  it("explains blocked reviews as unresolved evidence work", () => {
    expect(reviewStatusExplanation("BLOCKED")).toContain(
      "evidence or semantics question"
    );
  });
});
