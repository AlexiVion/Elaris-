import type {
  ComponentHealthEvidenceV03,
  PhaseComponentEvidenceV03,
  V03SignalName,
} from "@/lib/component-health/evidence-engine-v03";

export const COMPONENT_HEALTH_V042_SCHEMA = "0.4.2" as const;

export const COMPONENT_HEALTH_TECHNICAL_STATUSES = [
  "CONFIRMED_NORMAL",
  "CONFIRMED_SUPPORTED",
  "CONFIRMED_UNSUPPORTED",
  "STILL_UNRESOLVED",
] as const;

export type ComponentHealthTechnicalStatus =
  (typeof COMPONENT_HEALTH_TECHNICAL_STATUSES)[number];

export type ComponentHealthTechnicalReference = {
  id: string;
  authority: "UNITREE_PUBLIC_SDK";
  repository: string;
  path: string;
  supports: string;
};

export type ComponentHealthTechnicalItem = {
  key: string;
  title: string;
  status: ComponentHealthTechnicalStatus;
  findingCodes: string[];
  confirmedFacts: string[];
  unresolvedQuestions: string[];
  nextAction: string | null;
  referenceIds: string[];
};

export type ComponentHealthTechnicalVerification = {
  schemaVersion: typeof COMPONENT_HEALTH_V042_SCHEMA;
  assessment: "TECHNICAL_SEMANTICS_VERIFICATION";
  interpretation:
    "NO_HEALTH_OR_SAFETY_CONCLUSION";
  sourceClassification: ComponentHealthEvidenceV03["sourceClassification"];
  analysisId: string;
  robot: ComponentHealthEvidenceV03["robot"];
  context: {
    declaredDof: 23 | 29 | null;
    configurationEvidence: string | null;
  };
  observed: {
    unresolvedSlotCount: number;
    rightWristYaw: {
      observedInPhases: number;
      unresolvedInPhases: number;
      constantZeroPhysicalSignals: V03SignalName[];
      observedStateCodes: number[];
    };
    duplicateSignalSampleCount: number;
    largestObservedEndGapMs: number | null;
    constantZeroFindingCount: number;
  };
  references: ComponentHealthTechnicalReference[];
  items: ComponentHealthTechnicalItem[];
  summary: {
    confirmedNormal: number;
    confirmedSupported: number;
    confirmedUnsupported: number;
    stillUnresolved: number;
  };
};

export type ComponentHealthTechnicalContext = {
  declaredDof?: 23 | 29 | null;
  configurationEvidence?: string | null;
};

const PHYSICAL_SIGNALS: readonly V03SignalName[] = [
  "joint.position",
  "joint.velocity",
  "joint.torque_estimate",
  "motor.voltage",
  "motor.temperature.casing",
  "motor.temperature.winding",
];

export const COMPONENT_HEALTH_V042_REFERENCES: readonly ComponentHealthTechnicalReference[] = [
  {
    id: "UNITREE_G1_JOINT_INDEX",
    authority: "UNITREE_PUBLIC_SDK",
    repository: "unitreerobotics/unitree_sdk2",
    path: "include/unitree/dds_wrapper/robots/g1/defines.h",
    supports:
      "The public G1 joint map assigns RightWristYaw to OEM motor slot/index 28.",
  },
  {
    id: "UNITREE_G1_VARIANT_NOTE",
    authority: "UNITREE_PUBLIC_SDK",
    repository: "unitreerobotics/unitree_sdk2_python",
    path: "example/g1/low_level/g1_low_level_example.py",
    supports:
      "The public G1 example marks wrist pitch/yaw slots as invalid for the 23-DOF G1 configuration.",
  },
  {
    id: "UNITREE_HG_MOTORSTATE_SCHEMA",
    authority: "UNITREE_PUBLIC_SDK",
    repository: "unitreerobotics/unitree_sdk2",
    path: "include/unitree/idl/hg/MotorState_.hpp",
    supports:
      "The HG MotorState schema exposes q, dq, ddq, tau_est, temperature[2], vol and motorstate fields.",
  },
  {
    id: "UNITREE_G1_TEMPERATURE_MEANING",
    authority: "UNITREE_PUBLIC_SDK",
    repository: "unitreerobotics/unitree_sdk2",
    path: "include/unitree/robot/g1/common/terminations.hpp",
    supports:
      "Unitree's G1 termination helpers interpret temperature[0] as motor casing temperature and temperature[1] as motor winding temperature.",
  },
] as const;

export function buildComponentHealthTechnicalVerification(
  report: ComponentHealthEvidenceV03,
  context: ComponentHealthTechnicalContext = {}
): ComponentHealthTechnicalVerification {
  const declaredDof = context.declaredDof ?? null;
  const configurationEvidence = cleanContext(context.configurationEvidence);

  const rightWristRows = report.phases
    .map((phase) =>
      phase.components.find((component) => component.oemIndex === 28)
    )
    .filter(
      (component): component is PhaseComponentEvidenceV03 =>
        component !== undefined
    );

  const unresolvedRightWristRows = rightWristRows.filter(
    (component) => component.slotStatus === "OBSERVED_UNRESOLVED_SLOT"
  );

  const constantZeroPhysicalSignals = PHYSICAL_SIGNALS.filter((signal) => {
    const observed = rightWristRows
      .map((component) => component.signals[signal]?.summary)
      .filter((summary) => summary !== null && summary !== undefined);

    return (
      observed.length > 0 &&
      observed.every((summary) => summary.quality === "CONSTANT_ZERO")
    );
  });

  const observedStateCodes = [
    ...new Set(
      rightWristRows.flatMap((component) => {
        const summary = component.signals["motor.state_code"]?.summary;
        return summary && "observedValues" in summary
          ? summary.observedValues
          : [];
      })
    ),
  ].sort((a, b) => a - b);

  const unresolvedSlotCount = report.quality.findings.filter(
    (finding) => finding.code === "UNRESOLVED_COMPONENT_SLOT"
  ).length;

  const duplicateSignalSampleCount = report.quality.phaseQuality.reduce(
    (sum, phase) => sum + phase.duplicateSignalSampleCount,
    0
  );

  const endGaps = report.quality.phaseQuality
    .map((phase) => phase.observedEndGapMs)
    .filter((value): value is number => value !== null);

  const largestObservedEndGapMs =
    endGaps.length > 0 ? Math.max(...endGaps) : null;

  const constantZeroFindingCount = report.quality.findings.filter(
    (finding) => finding.code === "CONSTANT_ZERO_SIGNAL"
  ).length;

  const items: ComponentHealthTechnicalItem[] = [
    {
      key: "G1_RIGHT_WRIST_YAW_MAPPING",
      title: "Right wrist yaw OEM mapping",
      status: "CONFIRMED_SUPPORTED",
      findingCodes: ["UNRESOLVED_COMPONENT_SLOT"],
      confirmedFacts: [
        "Unitree's public G1 joint map assigns RightWristYaw to OEM index 28.",
        "The Elaris adapter mapping for OEM index 28 is therefore consistent with the public OEM map.",
      ],
      unresolvedQuestions: [],
      nextAction: null,
      referenceIds: ["UNITREE_G1_JOINT_INDEX"],
    },
    buildRightWristAvailabilityItem({
      declaredDof,
      configurationEvidence,
      unresolvedRightWristRows,
    }),
    {
      key: "HG_TEMPERATURE_CHANNEL_LABELS",
      title: "Motor temperature channel labels",
      status: "CONFIRMED_SUPPORTED",
      findingCodes: ["OEM_SEMANTICS_UNCONFIRMED"],
      confirmedFacts: [
        "The HG MotorState schema exposes two temperature values.",
        "Unitree's G1 termination helpers treat temperature[0] as casing temperature and temperature[1] as winding temperature.",
      ],
      unresolvedQuestions: [
        "The reviewed HG declarations/helpers do not by themselves establish the complete measurement contract needed for engineering thresholds in Elaris.",
      ],
      nextAction:
        "Keep the observed values descriptive until the engineering-unit/threshold contract is separately pinned to an authoritative OEM source.",
      referenceIds: [
        "UNITREE_HG_MOTORSTATE_SCHEMA",
        "UNITREE_G1_TEMPERATURE_MEANING",
      ],
    },
    {
      key: "HG_MOTOR_VOLTAGE_FIELD",
      title: "Motor voltage field",
      status: "CONFIRMED_SUPPORTED",
      findingCodes: ["OEM_SEMANTICS_UNCONFIRMED"],
      confirmedFacts: [
        "The HG MotorState schema contains a floating-point field named vol.",
      ],
      unresolvedQuestions: [
        "The reviewed HG schema declaration does not explicitly state the engineering unit or scaling contract for vol.",
      ],
      nextAction:
        "Do not use motor.voltage for engineering pass/fail rules until the unit/scaling contract is confirmed from authoritative OEM documentation.",
      referenceIds: ["UNITREE_HG_MOTORSTATE_SCHEMA"],
    },
    {
      key: "HG_MOTORSTATE_ENUM",
      title: "Motor state-code meaning",
      status: "STILL_UNRESOLVED",
      findingCodes: ["OEM_SEMANTICS_UNCONFIRMED", "CONSTANT_ZERO_SIGNAL"],
      confirmedFacts: [
        "The HG MotorState schema exposes motorstate as a uint32 field.",
        "Elaris can preserve the observed numeric value without interpreting it.",
      ],
      unresolvedQuestions: [
        "No authoritative enum/bitfield meaning for motorstate is established by the public sources pinned in V0.4.2.",
      ],
      nextAction:
        "Locate an authoritative Unitree enum/bitfield definition or obtain OEM-confirmed semantics before interpreting any state-code value.",
      referenceIds: ["UNITREE_HG_MOTORSTATE_SCHEMA"],
    },
    {
      key: "DUPLICATE_TIMESTAMP_PIPELINE_HANDLING",
      title: "Duplicate timestamp handling",
      status: "CONFIRMED_NORMAL",
      findingCodes: ["DUPLICATE_SIGNAL_TIMESTAMP"],
      confirmedFacts: [
        "V0.3 counts unique timestamps for coverage, so duplicate samples do not inflate coverage.",
        "Duplicate sample count remains explicit evidence-quality metadata.",
      ],
      unresolvedQuestions: [
        "The source-level reason for duplicate samples is not yet established.",
      ],
      nextAction:
        duplicateSignalSampleCount > 0
          ? "Characterize whether duplicates originate in DDS delivery, batch normalization or capture serialization using a read-only trace."
          : null,
      referenceIds: [],
    },
    {
      key: "CAPTURE_END_TIMING",
      title: "Declared phase end versus observed telemetry end",
      status:
        largestObservedEndGapMs !== null && largestObservedEndGapMs > 2_000
          ? "STILL_UNRESOLVED"
          : "CONFIRMED_NORMAL",
      findingCodes: ["PHASE_OBSERVATION_ENDS_BEFORE_DECLARED_END"],
      confirmedFacts: [
        "Elaris stores human-declared phase boundaries separately from observed telemetry boundaries.",
      ],
      unresolvedQuestions:
        largestObservedEndGapMs !== null && largestObservedEndGapMs > 2_000
          ? [
              "The current evidence does not establish why telemetry ended before the declared phase boundary.",
            ]
          : [],
      nextAction:
        largestObservedEndGapMs !== null && largestObservedEndGapMs > 2_000
          ? "Reconcile operator timing, capture lifecycle and last DDS frame in the next read-only field run."
          : null,
      referenceIds: [],
    },
    {
      key: "CONSTANT_ZERO_INTERPRETATION",
      title: "Constant-zero signal interpretation",
      status:
        constantZeroFindingCount > 0
          ? "STILL_UNRESOLVED"
          : "CONFIRMED_NORMAL",
      findingCodes: ["CONSTANT_ZERO_SIGNAL"],
      confirmedFacts: [
        "Elaris distinguishes constant-zero observations from missing signals.",
      ],
      unresolvedQuestions:
        constantZeroFindingCount > 0
          ? [
              "A zero value alone cannot distinguish a true physical zero, unsupported slot, unavailable instrumentation or undocumented state encoding.",
            ]
          : [],
      nextAction:
        constantZeroFindingCount > 0
          ? "Classify zero-valued channels only after component availability and signal semantics are independently established."
          : null,
      referenceIds: [],
    },
  ];

  return {
    schemaVersion: COMPONENT_HEALTH_V042_SCHEMA,
    assessment: "TECHNICAL_SEMANTICS_VERIFICATION",
    interpretation: "NO_HEALTH_OR_SAFETY_CONCLUSION",
    sourceClassification: report.sourceClassification,
    analysisId: report.run.analysisId,
    robot: report.robot,
    context: {
      declaredDof,
      configurationEvidence,
    },
    observed: {
      unresolvedSlotCount,
      rightWristYaw: {
        observedInPhases: rightWristRows.length,
        unresolvedInPhases: unresolvedRightWristRows.length,
        constantZeroPhysicalSignals,
        observedStateCodes,
      },
      duplicateSignalSampleCount,
      largestObservedEndGapMs,
      constantZeroFindingCount,
    },
    references: [...COMPONENT_HEALTH_V042_REFERENCES],
    items,
    summary: summarize(items),
  };
}

function buildRightWristAvailabilityItem(input: {
  declaredDof: 23 | 29 | null;
  configurationEvidence: string | null;
  unresolvedRightWristRows: PhaseComponentEvidenceV03[];
}): ComponentHealthTechnicalItem {
  if (input.declaredDof === 23) {
    return {
      key: "G1_RIGHT_WRIST_YAW_PHYSICAL_AVAILABILITY",
      title: "Right wrist yaw availability on this robot",
      status: "CONFIRMED_UNSUPPORTED",
      findingCodes: ["UNRESOLVED_COMPONENT_SLOT", "CONSTANT_ZERO_SIGNAL"],
      confirmedFacts: [
        "The robot configuration is declared as 23-DOF.",
        "Unitree's public G1 example marks wrist pitch/yaw slots as invalid for G1 23-DOF.",
      ],
      unresolvedQuestions: [],
      nextAction: null,
      referenceIds: ["UNITREE_G1_VARIANT_NOTE"],
    };
  }

  if (input.declaredDof === 29) {
    return {
      key: "G1_RIGHT_WRIST_YAW_PHYSICAL_AVAILABILITY",
      title: "Right wrist yaw availability on this robot",
      status:
        input.unresolvedRightWristRows.length > 0
          ? "STILL_UNRESOLVED"
          : "CONFIRMED_SUPPORTED",
      findingCodes: ["UNRESOLVED_COMPONENT_SLOT", "CONSTANT_ZERO_SIGNAL"],
      confirmedFacts: [
        "The robot configuration is declared as 29-DOF.",
        "OEM index 28 belongs to RightWristYaw in the public G1 joint map.",
      ],
      unresolvedQuestions:
        input.unresolvedRightWristRows.length > 0
          ? [
              "The current telemetry still does not establish usable physical behavior for the mapped slot.",
            ]
          : [],
      nextAction:
        input.unresolvedRightWristRows.length > 0
          ? "Run a read-only wrist-slot discrimination capture while an authorized operator moves the already-supported mechanism through its normal procedure; Elaris must not command motion."
          : null,
      referenceIds: [
        "UNITREE_G1_JOINT_INDEX",
        "UNITREE_G1_VARIANT_NOTE",
      ],
    };
  }

  return {
    key: "G1_RIGHT_WRIST_YAW_PHYSICAL_AVAILABILITY",
    title: "Right wrist yaw availability on this robot",
    status: "STILL_UNRESOLVED",
    findingCodes: ["UNRESOLVED_COMPONENT_SLOT", "CONSTANT_ZERO_SIGNAL"],
    confirmedFacts: [
      "OEM index 28 maps to RightWristYaw.",
      "Unitree documents that wrist pitch/yaw slots are invalid on G1 23-DOF.",
      ...(input.configurationEvidence
        ? [`Configuration note recorded: ${input.configurationEvidence}`]
        : []),
    ],
    unresolvedQuestions: [
      "The physical robot's 23-DOF versus 29-DOF configuration has not been established in the evidence contract.",
    ],
    nextAction:
      "Identify the physical G1 DOF/variant from read-only configuration evidence before interpreting constant-zero wrist channels.",
    referenceIds: [
      "UNITREE_G1_JOINT_INDEX",
      "UNITREE_G1_VARIANT_NOTE",
    ],
  };
}

function summarize(items: ComponentHealthTechnicalItem[]) {
  return {
    confirmedNormal: items.filter(
      (item) => item.status === "CONFIRMED_NORMAL"
    ).length,
    confirmedSupported: items.filter(
      (item) => item.status === "CONFIRMED_SUPPORTED"
    ).length,
    confirmedUnsupported: items.filter(
      (item) => item.status === "CONFIRMED_UNSUPPORTED"
    ).length,
    stillUnresolved: items.filter(
      (item) => item.status === "STILL_UNRESOLVED"
    ).length,
  };
}

function cleanContext(value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed.slice(0, 500) : null;
}
