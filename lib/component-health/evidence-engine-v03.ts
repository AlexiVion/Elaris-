import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { basename, join, resolve } from "node:path";
import type {
  NumericSignalBaseline,
  SignalQuality,
  StateSignalBaseline,
} from "@/lib/component-health/baseline";
import {
  analyzeComponentHealthFieldEvidence,
  type FieldEvidencePack,
  type FieldPhaseManifest,
  type SignalComparison,
  verifySalvagedCaptureIntegrity,
} from "@/lib/component-health/field-evidence";
import type { CaptureSessionSummary } from "@/lib/edge-collector/types";
import { UnitreeG1Adapter, type RobotComponentDescriptor } from "@/lib/robot-adapters";

export const COMPONENT_HEALTH_V03_SCHEMA = "0.3.0" as const;
export const COMPONENT_HEALTH_V03_ENGINE =
  "component-health-evidence-engine-v03" as const;

export const COMPONENT_HEALTH_V03_SIGNALS = [
  "joint.position",
  "joint.velocity",
  "joint.torque_estimate",
  "motor.voltage",
  "motor.temperature.casing",
  "motor.temperature.winding",
  "motor.state_code",
] as const;

export type V03SignalName = (typeof COMPONENT_HEALTH_V03_SIGNALS)[number];

export type SignalSemanticsStatus =
  | "NORMALIZED_OBSERVATION"
  | "NORMALIZED_ESTIMATE"
  | "OEM_SEMANTICS_UNCONFIRMED"
  | "OEM_ENUM_UNCONFIRMED";

export type ComponentSlotStatus =
  | "OBSERVED_USABLE"
  | "OBSERVED_UNRESOLVED_SLOT"
  | "OBSERVED_NO_IDLE_REFERENCE"
  | "NOT_OBSERVED";

export type IntegrityMethodV03 =
  | "FINALIZED_SHA256_REGISTRY"
  | "SOURCE_FINALIZED_SHA256_REGISTRY"
  | "SALVAGE_SHA256_REGISTRY"
  | "SOURCE_SALVAGE_SHA256_REGISTRY"
  | "DERIVATIVE_SHA256_REGISTRY";

export type CaptureLineageV03 = {
  sessionId: string;
  sessionState: "FINALIZED" | "OPEN";
  workingCopyKind: "ORIGINAL_CAPTURE" | "REKEYED_DERIVATIVE";
  plaintextEquivalence: "NOT_APPLICABLE" | "NOT_INDEPENDENTLY_VERIFIED";
  sourceIntegrity: {
    verified: true;
    method: IntegrityMethodV03;
    verifiedFiles: string[];
    registrySha256: string;
  };
  workingCopyIntegrity: {
    verified: true;
    method: IntegrityMethodV03;
    verifiedFiles: string[];
    registrySha256: string;
  };
};

export type AnalysisRunV03 = {
  schemaVersion: typeof COMPONENT_HEALTH_V03_SCHEMA;
  engineVersion: typeof COMPONENT_HEALTH_V03_ENGINE;
  analysisId: string;
  inputFingerprint: string;
  referencePolicy: {
    primary: "SAME_SESSION_PHASE";
    referencePhaseId: "IDLE_BASELINE";
    historicalBaselineRole: "SECONDARY_CONTEXT_ONLY";
  };
  inputs: {
    observed: CaptureLineageV03;
    historicalBaseline: CaptureLineageV03;
    phaseManifestSha256: string;
  };
};

export type SignalEvidenceV03 = {
  semanticsStatus: SignalSemanticsStatus;
  summary: NumericSignalBaseline | StateSignalBaseline | null;
};

export type PhaseComponentEvidenceV03 = {
  componentId: string;
  componentName: string;
  oemIndex: number;
  availability: "OBSERVED" | "MISSING";
  slotStatus: ComponentSlotStatus;
  signals: Record<V03SignalName, SignalEvidenceV03>;
  comparisonsToIdle: Partial<Record<V03SignalName, SignalComparison>>;
  newStateCodesVsIdle: number[];
};

export type PhaseEvidenceV03 = {
  phaseId: string;
  label: string;
  contextEvidenceClass: "HUMAN_CONFIRMED";
  declaredStart: string;
  declaredEnd: string;
  observedTelemetryStart: string | null;
  observedTelemetryEnd: string | null;
  frameCount: number;
  jointEventCount: number;
  componentSlots: number;
  observedComponentCount: number;
  components: PhaseComponentEvidenceV03[];
};

export type OperationalFingerprintV03 = {
  phaseId: string;
  componentId: string;
  componentName: string;
  oemIndex: number;
  signal: "joint.torque_estimate";
  idleAbsP95: number;
  observedAbsP95: number;
  ratio: number;
};

export type QualityFindingV03 = {
  code:
    | "PHASE_NO_OBSERVED_TELEMETRY"
    | "PHASE_OBSERVATION_STARTS_AFTER_DECLARED_START"
    | "PHASE_OBSERVATION_ENDS_BEFORE_DECLARED_END"
    | "MISSING_COMPONENT_SLOTS"
    | "LOW_SIGNAL_COVERAGE"
    | "CONSTANT_ZERO_SIGNAL"
    | "UNRESOLVED_COMPONENT_SLOT"
    | "OEM_SEMANTICS_UNCONFIRMED";
  severity: "INFO" | "WARNING";
  phaseId?: string;
  componentId?: string;
  signal?: V03SignalName;
  message: string;
  details?: Record<string, string | number | boolean | string[] | null>;
};

export type PhaseQualityV03 = {
  phaseId: string;
  declaredDurationMs: number;
  observedDurationMs: number | null;
  observedStartLagMs: number | null;
  observedEndGapMs: number | null;
  missingComponentSlots: number;
  lowCoverageSignalCount: number;
  maxCoverage: number;
};

export type ComponentHealthEvidenceV03 = {
  schemaVersion: typeof COMPONENT_HEALTH_V03_SCHEMA;
  evidenceClass: "OBSERVED";
  contextEvidenceClass: "HUMAN_CONFIRMED";
  assessment: "DESCRIPTIVE_OPERATIONAL_EVIDENCE";
  sourceClassification: "SENSITIVE";
  run: AnalysisRunV03;
  robot: {
    manufacturer: "Unitree";
    model: "G1";
    componentSlots: number;
  };
  reference: {
    phaseId: "IDLE_BASELINE";
    label: string;
    rule: "SAME_SESSION_IDLE_PRIMARY";
    historicalBaselineSessionId: string;
    historicalBaselineRole: "SECONDARY_CONTEXT_ONLY";
  };
  phases: PhaseEvidenceV03[];
  operationalFingerprints: Record<string, OperationalFingerprintV03[]>;
  quality: {
    maxCoverage: number;
    phaseQuality: PhaseQualityV03[];
    findings: QualityFindingV03[];
  };
  limitations: string[];
};

export type ComponentHealthEvidenceV03Input = {
  baselineDir: string;
  sessionDir: string;
  passphrase: string;
  phaseManifest: FieldPhaseManifest;

  salvageHashFile?: string | null;
  sourceSessionDir?: string | null;
  sourceSalvageHashFile?: string | null;
  derivativeHashFile?: string | null;

  baselineSourceDir?: string | null;
  baselineSourceHashFile?: string | null;
  baselineDerivativeHashFile?: string | null;
};

const PHYSICAL_SIGNALS: readonly V03SignalName[] = [
  "joint.position",
  "joint.velocity",
  "joint.torque_estimate",
  "motor.voltage",
  "motor.temperature.casing",
  "motor.temperature.winding",
];

const SIGNAL_SEMANTICS: Record<V03SignalName, SignalSemanticsStatus> = {
  "joint.position": "NORMALIZED_OBSERVATION",
  "joint.velocity": "NORMALIZED_OBSERVATION",
  "joint.torque_estimate": "NORMALIZED_ESTIMATE",
  "motor.voltage": "OEM_SEMANTICS_UNCONFIRMED",
  "motor.temperature.casing": "OEM_SEMANTICS_UNCONFIRMED",
  "motor.temperature.winding": "OEM_SEMANTICS_UNCONFIRMED",
  "motor.state_code": "OEM_ENUM_UNCONFIRMED",
};

export async function analyzeComponentHealthEvidenceV03(
  input: ComponentHealthEvidenceV03Input
): Promise<ComponentHealthEvidenceV03> {
  const fieldPack = await analyzeComponentHealthFieldEvidence({
    baselineDir: input.baselineDir,
    sessionDir: input.sessionDir,
    passphrase: input.passphrase,
    phaseManifest: input.phaseManifest,
    salvageHashFile: input.salvageHashFile,
    sourceSessionDir: input.sourceSessionDir,
    sourceSalvageHashFile: input.sourceSalvageHashFile,
    derivativeHashFile: input.derivativeHashFile,
  });

  const referencePhase = fieldPack.phases.find(
    (phase) => phase.phase.id === "IDLE_BASELINE"
  );
  if (!referencePhase) {
    throw new Error(
      "V0.3 requires a HUMAN_CONFIRMED IDLE_BASELINE phase as the primary same-session reference"
    );
  }
  if (referencePhase.frameCount === 0) {
    throw new Error("IDLE_BASELINE has no observed telemetry frames");
  }

  const observedLineage = await resolveObservedLineage(input, fieldPack);
  const baselineLineage = await resolveBaselineLineage(input, fieldPack);

  const phaseManifestSha256 = sha256Text(canonicalJson(input.phaseManifest));
  const inputFingerprint = sha256Text(
    canonicalJson({
      engineVersion: COMPONENT_HEALTH_V03_ENGINE,
      observed: observedLineage,
      historicalBaseline: baselineLineage,
      phaseManifestSha256,
      referencePhaseId: "IDLE_BASELINE",
    })
  );
  const analysisId = `CH-A03-${inputFingerprint.slice(0, 20).toUpperCase()}`;

  const descriptors = new UnitreeG1Adapter()
    .components()
    .filter(isIndexedJoint)
    .sort((a, b) => a.oemIndex - b.oemIndex);

  if (descriptors.length !== 29) {
    throw new Error(
      `Unitree G1 V0.3 expects 29 joint slots, adapter exposed ${descriptors.length}`
    );
  }

  const referenceByComponent = new Map(
    referencePhase.components.map((component) => [
      component.componentId,
      component,
    ] as const)
  );

  const findings: QualityFindingV03[] = [];
  const phaseQuality: PhaseQualityV03[] = [];
  let maxCoverage = 0;

  const phases: PhaseEvidenceV03[] = fieldPack.phases.map((sourcePhase) => {
    const byComponent = new Map(
      sourcePhase.components.map((component) => [
        component.componentId,
        component,
      ] as const)
    );

    let lowCoverageSignalCount = 0;
    let phaseMaxCoverage = 0;
    const missingSlots: string[] = [];

    const components: PhaseComponentEvidenceV03[] = descriptors.map(
      (descriptor) => {
        const observed = byComponent.get(descriptor.id) ?? null;
        const idle = referenceByComponent.get(descriptor.id) ?? null;

        if (!observed) missingSlots.push(descriptor.id);

        const signals = Object.fromEntries(
          COMPONENT_HEALTH_V03_SIGNALS.map((signal) => {
            const summary = observed?.signals[signal] ?? null;
            if (summary) {
              phaseMaxCoverage = Math.max(phaseMaxCoverage, summary.coverage);
              maxCoverage = Math.max(maxCoverage, summary.coverage);

              if (summary.coverage > 1 + 1e-9) {
                throw new Error(
                  `Signal coverage exceeds 100%: ${sourcePhase.phase.id} / ${descriptor.id} / ${signal} = ${summary.coverage}`
                );
              }

              if (summary.coverage < 0.95) {
                lowCoverageSignalCount += 1;
                findings.push({
                  code: "LOW_SIGNAL_COVERAGE",
                  severity: "INFO",
                  phaseId: sourcePhase.phase.id,
                  componentId: descriptor.id,
                  signal,
                  message: "Observed signal coverage is below 95% of unique joint-frame timestamps in this phase.",
                  details: { coverage: summary.coverage },
                });
              }

              if (summary.quality === "CONSTANT_ZERO") {
                findings.push({
                  code: "CONSTANT_ZERO_SIGNAL",
                  severity: "INFO",
                  phaseId: sourcePhase.phase.id,
                  componentId: descriptor.id,
                  signal,
                  message: "Signal remained constant zero during the observed phase.",
                });
              }

              const semantics = SIGNAL_SEMANTICS[signal];
              if (
                semantics === "OEM_SEMANTICS_UNCONFIRMED" ||
                semantics === "OEM_ENUM_UNCONFIRMED"
              ) {
                findings.push({
                  code: "OEM_SEMANTICS_UNCONFIRMED",
                  severity: "INFO",
                  phaseId: sourcePhase.phase.id,
                  componentId: descriptor.id,
                  signal,
                  message:
                    "The normalized channel is preserved, but its OEM semantic interpretation is not validated by Component Health V0.3.",
                });
              }
            }

            return [
              signal,
              {
                semanticsStatus: SIGNAL_SEMANTICS[signal],
                summary,
              },
            ];
          })
        ) as Record<V03SignalName, SignalEvidenceV03>;

        const comparisonsToIdle: Partial<
          Record<V03SignalName, SignalComparison>
        > = {};

        if (observed && idle) {
          for (const signal of COMPONENT_HEALTH_V03_SIGNALS) {
            if (signal === "motor.state_code") continue;
            const idleSignal = idle.signals[signal];
            const observedSignal = observed.signals[signal];
            if (!idleSignal || !observedSignal) continue;
            comparisonsToIdle[signal] = compareSignal(
              signal,
              idleSignal,
              observedSignal
            );
          }
        }

        const idleState = idle?.signals["motor.state_code"];
        const observedState = observed?.signals["motor.state_code"];
        const idleCodes =
          idleState && "observedValues" in idleState
            ? new Set(idleState.observedValues)
            : new Set<number>();
        const observedCodes =
          observedState && "observedValues" in observedState
            ? observedState.observedValues
            : [];

        const slotStatus = inferSlotStatus(observed, idle);
        if (slotStatus === "OBSERVED_UNRESOLVED_SLOT") {
          findings.push({
            code: "UNRESOLVED_COMPONENT_SLOT",
            severity: "WARNING",
            phaseId: sourcePhase.phase.id,
            componentId: descriptor.id,
            message:
              "Physical channels are absent or all constant zero; this slot is unresolved, regardless of OEM state-code meaning.",
          });
        }

        return {
          componentId: descriptor.id,
          componentName: descriptor.name,
          oemIndex: descriptor.oemIndex,
          availability: observed ? "OBSERVED" : "MISSING",
          slotStatus,
          signals,
          comparisonsToIdle,
          newStateCodesVsIdle: observedCodes.filter(
            (code) => !idleCodes.has(code)
          ),
        };
      }
    );

    if (missingSlots.length > 0) {
      findings.push({
        code: "MISSING_COMPONENT_SLOTS",
        severity: "WARNING",
        phaseId: sourcePhase.phase.id,
        message: `${missingSlots.length} of 29 component slots have no selected joint telemetry in this phase.`,
        details: { componentIds: missingSlots },
      });
    }

    const declaredStartMs = Date.parse(sourcePhase.phase.start);
    const declaredEndMs = Date.parse(sourcePhase.phase.end);
    const observedStartMs = sourcePhase.observedTelemetryStart
      ? Date.parse(sourcePhase.observedTelemetryStart)
      : null;
    const observedEndMs = sourcePhase.observedTelemetryEnd
      ? Date.parse(sourcePhase.observedTelemetryEnd)
      : null;

    if (observedStartMs === null || observedEndMs === null) {
      findings.push({
        code: "PHASE_NO_OBSERVED_TELEMETRY",
        severity: "WARNING",
        phaseId: sourcePhase.phase.id,
        message: "The declared phase contains no selected joint telemetry.",
      });
    }

    const startLag =
      observedStartMs === null ? null : Math.max(0, observedStartMs - declaredStartMs);
    const endGap =
      observedEndMs === null ? null : Math.max(0, declaredEndMs - observedEndMs);

    if (startLag !== null && startLag > 2_000) {
      findings.push({
        code: "PHASE_OBSERVATION_STARTS_AFTER_DECLARED_START",
        severity: "INFO",
        phaseId: sourcePhase.phase.id,
        message:
          "Observed telemetry starts more than two seconds after the human-declared phase start.",
        details: { gapMs: startLag },
      });
    }

    if (endGap !== null && endGap > 2_000) {
      findings.push({
        code: "PHASE_OBSERVATION_ENDS_BEFORE_DECLARED_END",
        severity: "WARNING",
        phaseId: sourcePhase.phase.id,
        message:
          "Observed telemetry ends more than two seconds before the human-declared phase end.",
        details: { gapMs: endGap },
      });
    }

    phaseQuality.push({
      phaseId: sourcePhase.phase.id,
      declaredDurationMs: declaredEndMs - declaredStartMs,
      observedDurationMs:
        observedStartMs === null || observedEndMs === null
          ? null
          : observedEndMs - observedStartMs,
      observedStartLagMs: startLag,
      observedEndGapMs: endGap,
      missingComponentSlots: missingSlots.length,
      lowCoverageSignalCount,
      maxCoverage: phaseMaxCoverage,
    });

    return {
      phaseId: sourcePhase.phase.id,
      label: sourcePhase.phase.label,
      contextEvidenceClass: "HUMAN_CONFIRMED",
      declaredStart: sourcePhase.phase.start,
      declaredEnd: sourcePhase.phase.end,
      observedTelemetryStart: sourcePhase.observedTelemetryStart,
      observedTelemetryEnd: sourcePhase.observedTelemetryEnd,
      frameCount: sourcePhase.frameCount,
      jointEventCount: sourcePhase.jointEventCount,
      componentSlots: descriptors.length,
      observedComponentCount: sourcePhase.components.length,
      components,
    };
  });

  const operationalFingerprints = Object.fromEntries(
    phases.map((phase) => [
      phase.phaseId,
      phase.components
        .flatMap((component): OperationalFingerprintV03[] => {
          const comparison =
            component.comparisonsToIdle["joint.torque_estimate"];
          if (!comparison || comparison.absP95Ratio === null) return [];
          return [
            {
              phaseId: phase.phaseId,
              componentId: component.componentId,
              componentName: component.componentName,
              oemIndex: component.oemIndex,
              signal: "joint.torque_estimate",
              idleAbsP95: comparison.baselineAbsP95,
              observedAbsP95: comparison.observedAbsP95,
              ratio: comparison.absP95Ratio,
            },
          ];
        })
        .sort((a, b) => b.ratio - a.ratio || a.oemIndex - b.oemIndex),
    ])
  );

  return {
    schemaVersion: COMPONENT_HEALTH_V03_SCHEMA,
    evidenceClass: "OBSERVED",
    contextEvidenceClass: "HUMAN_CONFIRMED",
    assessment: "DESCRIPTIVE_OPERATIONAL_EVIDENCE",
    sourceClassification: "SENSITIVE",
    run: {
      schemaVersion: COMPONENT_HEALTH_V03_SCHEMA,
      engineVersion: COMPONENT_HEALTH_V03_ENGINE,
      analysisId,
      inputFingerprint,
      referencePolicy: {
        primary: "SAME_SESSION_PHASE",
        referencePhaseId: "IDLE_BASELINE",
        historicalBaselineRole: "SECONDARY_CONTEXT_ONLY",
      },
      inputs: {
        observed: observedLineage,
        historicalBaseline: baselineLineage,
        phaseManifestSha256,
      },
    },
    robot: {
      manufacturer: "Unitree",
      model: "G1",
      componentSlots: descriptors.length,
    },
    reference: {
      phaseId: "IDLE_BASELINE",
      label: referencePhase.phase.label,
      rule: "SAME_SESSION_IDLE_PRIMARY",
      historicalBaselineSessionId: fieldPack.baselineSessionId,
      historicalBaselineRole: "SECONDARY_CONTEXT_ONLY",
    },
    phases,
    operationalFingerprints,
    quality: {
      maxCoverage,
      phaseQuality,
      findings: dedupeFindings(findings),
    },
    limitations: [
      "Descriptive operational evidence only; no diagnosis, health score, failure probability or remaining useful life.",
      "Same-session HUMAN_CONFIRMED IDLE_BASELINE is the primary comparison reference.",
      "The historical baseline is preserved only as secondary context because its operating context is not sufficiently confirmed.",
      "A ratio expresses a difference from same-session idle for one signal and phase; it is not damage, risk or anomaly probability.",
      "OEM voltage, temperature-channel and state-code semantics remain explicitly unconfirmed until separately validated.",
      "OPEN captures remain OPEN even when their salvage registry is verified.",
      "Source and rekeyed working-copy registries are verified separately; plaintext equivalence remains NOT_INDEPENDENTLY_VERIFIED unless a separate authorized procedure proves it.",
      "Data classification and export authorization are independent from analysis validity.",
    ],
  };
}

export function renderComponentHealthEvidenceV03Markdown(
  report: ComponentHealthEvidenceV03
) {
  const rows: string[] = [];

  rows.push("# Elaris Component Health — Evidence Engine V0.3");
  rows.push("");
  rows.push(`- Analysis ID: \`${report.run.analysisId}\``);
  rows.push(`- Input fingerprint: \`${report.run.inputFingerprint}\``);
  rows.push(`- Schema: \`${report.schemaVersion}\``);
  rows.push(`- Primary reference: \`${report.reference.phaseId}\` (same session)`);
  rows.push(
    `- Historical baseline: \`${report.reference.historicalBaselineSessionId}\` — secondary context only`
  );
  rows.push(`- Classification: \`${report.sourceClassification}\``);
  rows.push("");
  rows.push(
    "> Descriptive operational evidence only. Ratios are not health, anomaly, damage, failure-probability or RUL scores."
  );
  rows.push("");

  rows.push("## Provenance");
  rows.push("");
  rows.push(
    `- Observed source integrity: \`${report.run.inputs.observed.sourceIntegrity.method}\``
  );
  rows.push(
    `- Observed working-copy integrity: \`${report.run.inputs.observed.workingCopyIntegrity.method}\``
  );
  rows.push(
    `- Observed working copy: \`${report.run.inputs.observed.workingCopyKind}\``
  );
  rows.push(
    `- Observed plaintext equivalence: \`${report.run.inputs.observed.plaintextEquivalence}\``
  );
  rows.push(
    `- Historical baseline source integrity: \`${report.run.inputs.historicalBaseline.sourceIntegrity.method}\``
  );
  rows.push(
    `- Historical baseline working-copy integrity: \`${report.run.inputs.historicalBaseline.workingCopyIntegrity.method}\``
  );
  rows.push(
    `- Historical baseline working copy: \`${report.run.inputs.historicalBaseline.workingCopyKind}\``
  );
  rows.push("");

  rows.push("## Phase quality");
  rows.push("");
  rows.push(
    "| Phase | Frames | Observed slots | Missing slots | Max coverage | Observed end gap |"
  );
  rows.push("|---|---:|---:|---:|---:|---:|");
  for (const phase of report.phases) {
    const quality = report.quality.phaseQuality.find(
      (candidate) => candidate.phaseId === phase.phaseId
    )!;
    rows.push(
      `| ${phase.label} | ${phase.frameCount} | ${phase.observedComponentCount} | ${quality.missingComponentSlots} | ${(quality.maxCoverage * 100).toFixed(1)}% | ${quality.observedEndGapMs === null ? "—" : Math.round(quality.observedEndGapMs / 1000) + " s"} |`
    );
  }

  for (const phase of report.phases) {
    rows.push("");
    rows.push(`## ${phase.label}`);
    rows.push("");
    rows.push(
      "| Component | Availability | Slot status | Torque absP95 idle → phase | Ratio | New state codes vs idle |"
    );
    rows.push("|---|---|---|---:|---:|---|");

    for (const component of phase.components) {
      const torque = component.comparisonsToIdle["joint.torque_estimate"];
      rows.push(
        `| [${String(component.oemIndex).padStart(2, "0")}] ${component.componentName} | ${component.availability} | ${component.slotStatus} | ${torque ? torque.baselineAbsP95.toFixed(3) + " → " + torque.observedAbsP95.toFixed(3) : "—"} | ${torque?.absP95Ratio == null ? "—" : "×" + torque.absP95Ratio.toFixed(2)} | ${component.newStateCodesVsIdle.length ? component.newStateCodesVsIdle.join(", ") : "—"} |`
      );
    }
  }

  rows.push("");
  rows.push("## Quality findings");
  rows.push("");
  if (report.quality.findings.length === 0) {
    rows.push("- No quality findings.");
  } else {
    for (const finding of report.quality.findings) {
      const context = [finding.phaseId, finding.componentId, finding.signal]
        .filter(Boolean)
        .join(" / ");
      rows.push(
        `- **${finding.severity} · ${finding.code}**${context ? " — " + context : ""}: ${finding.message}`
      );
    }
  }

  rows.push("");
  rows.push("## Limitations");
  rows.push("");
  for (const limitation of report.limitations) {
    rows.push(`- ${limitation}`);
  }
  rows.push("");

  return rows.join("\n");
}

export function extractComponentHealthQualityV03(
  report: ComponentHealthEvidenceV03
) {
  return {
    schemaVersion: report.schemaVersion,
    analysisId: report.run.analysisId,
    maxCoverage: report.quality.maxCoverage,
    phaseQuality: report.quality.phaseQuality,
    findings: report.quality.findings,
  };
}

async function resolveObservedLineage(
  input: ComponentHealthEvidenceV03Input,
  fieldPack: FieldEvidencePack
): Promise<CaptureLineageV03> {
  if (
    fieldPack.provenance.workingCopyKind === "REKEYED_DERIVATIVE"
  ) {
    if (
      !input.sourceSessionDir ||
      !input.sourceSalvageHashFile ||
      !input.derivativeHashFile
    ) {
      throw new Error("Observed rekeyed derivative provenance inputs are incomplete");
    }

    return {
      sessionId: fieldPack.sessionId,
      sessionState: fieldPack.sessionState,
      workingCopyKind: "REKEYED_DERIVATIVE",
      plaintextEquivalence: "NOT_INDEPENDENTLY_VERIFIED",
      sourceIntegrity: {
        verified: true,
        method: "SOURCE_SALVAGE_SHA256_REGISTRY",
        verifiedFiles: fieldPack.provenance.sourceIntegrity.verifiedFiles,
        registrySha256: await sha256File(input.sourceSalvageHashFile),
      },
      workingCopyIntegrity: {
        verified: true,
        method: "DERIVATIVE_SHA256_REGISTRY",
        verifiedFiles: fieldPack.integrity.verifiedFiles,
        registrySha256: await sha256File(input.derivativeHashFile),
      },
    };
  }

  const registry =
    fieldPack.sessionState === "FINALIZED"
      ? join(input.sessionDir, "checksums.sha256")
      : input.salvageHashFile;

  if (!registry) {
    throw new Error("Observed original capture registry is unavailable");
  }

  const method: IntegrityMethodV03 =
    fieldPack.sessionState === "FINALIZED"
      ? "FINALIZED_SHA256_REGISTRY"
      : "SALVAGE_SHA256_REGISTRY";

  return {
    sessionId: fieldPack.sessionId,
    sessionState: fieldPack.sessionState,
    workingCopyKind: "ORIGINAL_CAPTURE",
    plaintextEquivalence: "NOT_APPLICABLE",
    sourceIntegrity: {
      verified: true,
      method,
      verifiedFiles: fieldPack.integrity.verifiedFiles,
      registrySha256: await sha256File(registry),
    },
    workingCopyIntegrity: {
      verified: true,
      method,
      verifiedFiles: fieldPack.integrity.verifiedFiles,
      registrySha256: await sha256File(registry),
    },
  };
}

async function resolveBaselineLineage(
  input: ComponentHealthEvidenceV03Input,
  fieldPack: FieldEvidencePack
): Promise<CaptureLineageV03> {
  const baselineSummary = await readJson<CaptureSessionSummary>(
    join(input.baselineDir, "session.public.json")
  );

  if (baselineSummary.sessionId !== fieldPack.baselineSessionId) {
    throw new Error("Historical baseline identity changed between analysis and provenance verification");
  }
  if (baselineSummary.state !== "FINALIZED") {
    throw new Error("Historical baseline must remain FINALIZED");
  }

  const derivativeRequested = Boolean(
    input.baselineSourceDir ||
      input.baselineSourceHashFile ||
      input.baselineDerivativeHashFile
  );

  if (derivativeRequested) {
    if (
      !input.baselineSourceDir ||
      !input.baselineSourceHashFile ||
      !input.baselineDerivativeHashFile
    ) {
      throw new Error(
        "Rekeyed historical baseline requires --baseline-source-dir, --baseline-source-hashes and --baseline-derivative-hashes"
      );
    }

    if (resolve(input.baselineSourceDir) === resolve(input.baselineDir)) {
      throw new Error("Historical baseline source and derivative must be separate directories");
    }

    const sourceSummary = await readJson<CaptureSessionSummary>(
      join(input.baselineSourceDir, "session.public.json")
    );
    if (
      sourceSummary.sessionId !== baselineSummary.sessionId ||
      sourceSummary.state !== "FINALIZED"
    ) {
      throw new Error("Historical baseline source identity/state does not match derivative");
    }

    const sourceVerified = await verifySalvagedCaptureIntegrity(
      input.baselineSourceDir,
      input.baselineSourceHashFile
    );
    const derivativeVerified = await verifySalvagedCaptureIntegrity(
      input.baselineDir,
      input.baselineDerivativeHashFile
    );

    return {
      sessionId: baselineSummary.sessionId,
      sessionState: "FINALIZED",
      workingCopyKind: "REKEYED_DERIVATIVE",
      plaintextEquivalence: "NOT_INDEPENDENTLY_VERIFIED",
      sourceIntegrity: {
        verified: true,
        method: "SOURCE_FINALIZED_SHA256_REGISTRY",
        verifiedFiles: sourceVerified,
        registrySha256: await sha256File(input.baselineSourceHashFile),
      },
      workingCopyIntegrity: {
        verified: true,
        method: "DERIVATIVE_SHA256_REGISTRY",
        verifiedFiles: derivativeVerified,
        registrySha256: await sha256File(input.baselineDerivativeHashFile),
      },
    };
  }

  const registry = join(input.baselineDir, "checksums.sha256");
  const verified = await verifySalvagedCaptureIntegrity(input.baselineDir, registry);

  return {
    sessionId: baselineSummary.sessionId,
    sessionState: "FINALIZED",
    workingCopyKind: "ORIGINAL_CAPTURE",
    plaintextEquivalence: "NOT_APPLICABLE",
    sourceIntegrity: {
      verified: true,
      method: "FINALIZED_SHA256_REGISTRY",
      verifiedFiles: verified,
      registrySha256: await sha256File(registry),
    },
    workingCopyIntegrity: {
      verified: true,
      method: "FINALIZED_SHA256_REGISTRY",
      verifiedFiles: verified,
      registrySha256: await sha256File(registry),
    },
  };
}

function isIndexedJoint(
  component: RobotComponentDescriptor
): component is RobotComponentDescriptor & { oemIndex: number } {
  return component.kind === "joint" && typeof component.oemIndex === "number";
}

function inferSlotStatus(
  observed:
    | FieldEvidencePack["phases"][number]["components"][number]
    | null,
  idle:
    | FieldEvidencePack["phases"][number]["components"][number]
    | null
): ComponentSlotStatus {
  if (!observed) return "NOT_OBSERVED";
  if (!idle) return "OBSERVED_NO_IDLE_REFERENCE";

  const physical = PHYSICAL_SIGNALS.flatMap((signal) => {
    const summary = observed.signals[signal];
    return summary ? [summary] : [];
  });

  const allPhysicalConstantZero =
    physical.length > 0 &&
    physical.every(
      (summary) => summary.min === 0 && summary.max === 0
    );

  if (physical.length === 0 || allPhysicalConstantZero) {
    return "OBSERVED_UNRESOLVED_SLOT";
  }

  return "OBSERVED_USABLE";
}

function compareSignal(
  signal: string,
  baseline: NumericSignalBaseline | StateSignalBaseline,
  observed: NumericSignalBaseline | StateSignalBaseline
): SignalComparison {
  const meanDelta = observed.mean - baseline.mean;
  const baselineRange = baseline.max - baseline.min;
  const observedRange = observed.max - observed.min;

  return {
    signal,
    baselineQuality: baseline.quality as SignalQuality,
    observedQuality: observed.quality as SignalQuality,
    baselineMean: baseline.mean,
    observedMean: observed.mean,
    meanDelta,
    meanDeltaPct:
      baseline.mean === 0 ? null : (meanDelta / Math.abs(baseline.mean)) * 100,
    baselineP95: baseline.p95,
    observedP95: observed.p95,
    p95Delta: observed.p95 - baseline.p95,
    baselineAbsP95: baseline.absP95,
    observedAbsP95: observed.absP95,
    absP95Delta: observed.absP95 - baseline.absP95,
    absP95Ratio:
      baseline.absP95 === 0 ? null : observed.absP95 / baseline.absP95,
    baselineRange,
    observedRange,
    rangeDelta: observedRange - baselineRange,
  };
}

function dedupeFindings(findings: QualityFindingV03[]) {
  const unique = new Map<string, QualityFindingV03>();
  for (const finding of findings) {
    const key = canonicalJson({
      code: finding.code,
      phaseId: finding.phaseId ?? null,
      componentId: finding.componentId ?? null,
      signal: finding.signal ?? null,
      details: finding.details ?? null,
    });
    if (!unique.has(key)) unique.set(key, finding);
  }
  return [...unique.values()];
}

function canonicalJson(value: unknown): string {
  return JSON.stringify(sortForCanonicalJson(value));
}

function sortForCanonicalJson(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortForCanonicalJson);
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, child]) => [key, sortForCanonicalJson(child)])
    );
  }
  return value;
}

function sha256Text(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

async function sha256File(path: string) {
  return createHash("sha256").update(await readFile(path)).digest("hex");
}

async function readJson<T>(path: string) {
  return JSON.parse(await readFile(path, "utf8")) as T;
}
