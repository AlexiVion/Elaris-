import { describe, expect, it } from "vitest";
import type {
  ComponentHealthEvidenceV03,
  PhaseComponentEvidenceV03,
} from "@/lib/component-health/evidence-engine-v03";
import {
  buildComponentHealthTechnicalVerification,
  resolveUnitreeG1DofFromModeMachine,
} from "@/lib/component-health/technical-semantics-v042";

function rightWristComponent(
  slotStatus: PhaseComponentEvidenceV03["slotStatus"] = "OBSERVED_UNRESOLVED_SLOT"
) {
  return {
    componentId: "unitree-g1-joint-28-right-wrist-yaw",
    componentName: "Right wrist yaw",
    oemIndex: 28,
    availability: "OBSERVED",
    slotStatus,
    signals: {
      "joint.position": {
        semanticsStatus: "NORMALIZED_OBSERVATION",
        summary: { quality: "CONSTANT_ZERO" },
      },
      "joint.velocity": {
        semanticsStatus: "NORMALIZED_OBSERVATION",
        summary: { quality: "CONSTANT_ZERO" },
      },
      "joint.torque_estimate": {
        semanticsStatus: "NORMALIZED_ESTIMATE",
        summary: { quality: "CONSTANT_ZERO" },
      },
      "motor.voltage": {
        semanticsStatus: "OEM_SEMANTICS_UNCONFIRMED",
        summary: { quality: "CONSTANT_ZERO" },
      },
      "motor.temperature.casing": {
        semanticsStatus: "OEM_SEMANTICS_UNCONFIRMED",
        summary: { quality: "CONSTANT_ZERO" },
      },
      "motor.temperature.winding": {
        semanticsStatus: "OEM_SEMANTICS_UNCONFIRMED",
        summary: { quality: "CONSTANT_ZERO" },
      },
      "motor.state_code": {
        semanticsStatus: "OEM_ENUM_UNCONFIRMED",
        summary: {
          quality: "CONSTANT",
          observedValues: [2147483648],
        },
      },
    },
    comparisonsToIdle: {},
    newStateCodesVsIdle: [],
  } as unknown as PhaseComponentEvidenceV03;
}

function report(): ComponentHealthEvidenceV03 {
  return {
    sourceClassification: "SENSITIVE",
    run: {
      analysisId: "CH-A03-TEST",
    },
    robot: {
      manufacturer: "Unitree",
      model: "G1",
      componentSlots: 29,
    },
    phases: [
      {
        phaseId: "IDLE_BASELINE",
        components: [rightWristComponent()],
      },
      {
        phaseId: "TURNING",
        components: [rightWristComponent()],
      },
    ],
    quality: {
      findings: [
        {
          code: "UNRESOLVED_COMPONENT_SLOT",
          severity: "WARNING",
          componentId: "unitree-g1-joint-28-right-wrist-yaw",
          message: "unresolved",
        },
        {
          code: "CONSTANT_ZERO_SIGNAL",
          severity: "INFO",
          componentId: "unitree-g1-joint-28-right-wrist-yaw",
          signal: "joint.position",
          message: "zero",
        },
        {
          code: "DUPLICATE_SIGNAL_TIMESTAMP",
          severity: "INFO",
          message: "duplicate",
        },
        {
          code: "PHASE_OBSERVATION_ENDS_BEFORE_DECLARED_END",
          severity: "WARNING",
          message: "end gap",
        },
      ],
      phaseQuality: [
        {
          phaseId: "TURNING",
          duplicateSignalSampleCount: 3,
          observedEndGapMs: 8_000,
        },
      ],
    },
  } as ComponentHealthEvidenceV03;
}

describe("Component Health Technical Semantics V0.4.2", () => {
  it("confirms the public OEM slot mapping without guessing physical availability", () => {
    const verification = buildComponentHealthTechnicalVerification(report());

    expect(
      verification.items.find(
        (item) => item.key === "G1_RIGHT_WRIST_YAW_MAPPING"
      )
    ).toMatchObject({
      status: "CONFIRMED_SUPPORTED",
    });

    expect(
      verification.items.find(
        (item) => item.key === "G1_RIGHT_WRIST_YAW_PHYSICAL_AVAILABILITY"
      )
    ).toMatchObject({
      status: "STILL_UNRESOLVED",
    });

    expect(verification.observed.rightWristYaw.observedInPhases).toBe(2);
    expect(verification.observed.rightWristYaw.unresolvedInPhases).toBe(2);
  });

  it("classifies wrist yaw as unsupported only when 23-DOF configuration evidence is explicit", () => {
    const verification = buildComponentHealthTechnicalVerification(report(), {
      declaredDof: 23,
      configurationEvidence: "Read-only configuration source",
    });

    expect(
      verification.items.find(
        (item) => item.key === "G1_RIGHT_WRIST_YAW_PHYSICAL_AVAILABILITY"
      )
    ).toMatchObject({
      status: "CONFIRMED_UNSUPPORTED",
    });
  });

  it("does not hide unresolved telemetry on a declared 29-DOF configuration", () => {
    const verification = buildComponentHealthTechnicalVerification(report(), {
      declaredDof: 29,
    });

    expect(
      verification.items.find(
        (item) => item.key === "G1_RIGHT_WRIST_YAW_PHYSICAL_AVAILABILITY"
      )
    ).toMatchObject({
      status: "STILL_UNRESOLVED",
    });
  });

  it("resolves mode_machine 5 to a 29-DOF Unitree profile while keeping unresolved wrist telemetry open", () => {
    const verification = buildComponentHealthTechnicalVerification(report(), {
      modeMachine: 5,
    });

    expect(verification.context.effectiveDof).toBe(29);
    expect(verification.context.configurationConflict).toBe(false);

    expect(
      verification.items.find(
        (item) => item.key === "G1_PHYSICAL_CONFIGURATION"
      )
    ).toMatchObject({
      status: "CONFIRMED_SUPPORTED",
    });

    expect(
      verification.items.find(
        (item) => item.key === "G1_RIGHT_WRIST_YAW_PHYSICAL_AVAILABILITY"
      )
    ).toMatchObject({
      status: "STILL_UNRESOLVED",
    });
  });

  it("resolves mode_machine 4 to 23-DOF and classifies wrist yaw as unsupported", () => {
    const verification = buildComponentHealthTechnicalVerification(report(), {
      modeMachine: 4,
    });

    expect(verification.context.effectiveDof).toBe(23);
    expect(
      verification.items.find(
        (item) => item.key === "G1_RIGHT_WRIST_YAW_PHYSICAL_AVAILABILITY"
      )
    ).toMatchObject({
      status: "CONFIRMED_UNSUPPORTED",
    });
  });

  it("fails closed when declared DOF conflicts with mode_machine", () => {
    const verification = buildComponentHealthTechnicalVerification(report(), {
      modeMachine: 5,
      declaredDof: 23,
    });

    expect(verification.context.configurationConflict).toBe(true);
    expect(verification.context.effectiveDof).toBeNull();
    expect(
      verification.items.find(
        (item) => item.key === "G1_PHYSICAL_CONFIGURATION"
      )
    ).toMatchObject({
      status: "STILL_UNRESOLVED",
    });
  });

  it("maps both legacy/rev1 and current Unitree mode_machine profiles", () => {
    expect(resolveUnitreeG1DofFromModeMachine(4)?.dof).toBe(23);
    expect(resolveUnitreeG1DofFromModeMachine(5)?.dof).toBe(29);
    expect(resolveUnitreeG1DofFromModeMachine(10)?.dof).toBe(23);
    expect(resolveUnitreeG1DofFromModeMachine(11)?.dof).toBe(29);
    expect(resolveUnitreeG1DofFromModeMachine(255)).toBeNull();
  });

  it("separates safe duplicate handling from the still-unknown source cause", () => {
    const verification = buildComponentHealthTechnicalVerification(report());

    const duplicates = verification.items.find(
      (item) => item.key === "DUPLICATE_TIMESTAMP_PIPELINE_HANDLING"
    );

    expect(duplicates?.status).toBe("CONFIRMED_NORMAL");
    expect(duplicates?.unresolvedQuestions).toHaveLength(1);
    expect(verification.observed.duplicateSignalSampleCount).toBe(3);
  });

  it("keeps timing gaps unresolved and produces no health/safety conclusion", () => {
    const verification = buildComponentHealthTechnicalVerification(report());

    expect(
      verification.items.find((item) => item.key === "CAPTURE_END_TIMING")
        ?.status
    ).toBe("STILL_UNRESOLVED");
    expect(verification.interpretation).toBe(
      "NO_HEALTH_OR_SAFETY_CONCLUSION"
    );
  });

  it("pins the OEM sources used by the verification layer", () => {
    const verification = buildComponentHealthTechnicalVerification(report());
    const ids = verification.references.map((reference) => reference.id);

    expect(ids).toContain("UNITREE_G1_JOINT_INDEX");
    expect(ids).toContain("UNITREE_G1_VARIANT_NOTE");
    expect(ids).toContain("UNITREE_G1_MODE_MACHINE_REV1");
    expect(ids).toContain("UNITREE_G1_MODE_MACHINE_CURRENT");
    expect(ids).toContain("UNITREE_HG_MOTORSTATE_SCHEMA");
    expect(ids).toContain("UNITREE_G1_TEMPERATURE_MEANING");
  });
});
