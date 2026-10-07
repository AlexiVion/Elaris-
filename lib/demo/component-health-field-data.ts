export const fieldRobot = {
  code: "G1-FIELD-001",
  model: "Unitree G1",
  source: "Real field session · sanitized derived aggregates",
  captureMode: "READ_ONLY",
  evidenceClass: "OBSERVED",
  contextEvidence: "HUMAN_CONFIRMED",
  sessionState: "SALVAGED_OPEN_VERIFIED",
  technicalValidation: "PASS",
  componentSlots: 29,
  usableComponents: 28,
  unresolvedComponents: 1,
  baselineFrames: 1031,
  baselineEvents: 248471,
  observedPhases: 8,
} as const;

export const fieldPhases = [
  { id: "IDLE_BASELINE", label: "Idle baseline", kind: "REFERENCE", frames: 1498, jointEvents: 347536 },
  { id: "WAIST_YAW", label: "Waist yaw controlled motion", kind: "CONTROLLED_PROBE", frames: 6492, jointEvents: 1506376 },
  { id: "LEFT_SHOULDER_ROLL", label: "Left shoulder roll controlled probe", kind: "CONTROLLED_PROBE", frames: 1447, jointEvents: 335704 },
  { id: "LEFT_SHOULDER_PITCH", label: "Left shoulder pitch controlled probe", kind: "CONTROLLED_PROBE", frames: 1522, jointEvents: 353336 },
  { id: "LOCOMOTION_FORWARD_BACK", label: "Forward / backward locomotion", kind: "LOCOMOTION", frames: 933, jointEvents: 216456 },
  { id: "TURNING", label: "Left / right turning", kind: "LOCOMOTION", frames: 953, jointEvents: 221096 },
  { id: "MIXED_OPERATION", label: "Mixed operation", kind: "LOCOMOTION", frames: 1178, jointEvents: 273296 },
  { id: "RECOVERY_IDLE", label: "Recovery idle", kind: "RECOVERY", frames: 889, jointEvents: 206248 },
] as const;

export const fieldComponents = [
  { oemIndex: 0, id: "joint-00-left-hip-pitch", name: "Left hip pitch", group: "Lower body", status: "OBSERVED_USABLE" },
  { oemIndex: 1, id: "joint-01-left-hip-roll", name: "Left hip roll", group: "Lower body", status: "OBSERVED_USABLE" },
  { oemIndex: 2, id: "joint-02-left-hip-yaw", name: "Left hip yaw", group: "Lower body", status: "OBSERVED_USABLE" },
  { oemIndex: 3, id: "joint-03-left-knee", name: "Left knee", group: "Lower body", status: "OBSERVED_USABLE" },
  { oemIndex: 4, id: "joint-04-left-ankle-pitch", name: "Left ankle pitch", group: "Lower body", status: "OBSERVED_USABLE" },
  { oemIndex: 5, id: "joint-05-left-ankle-roll", name: "Left ankle roll", group: "Lower body", status: "OBSERVED_USABLE" },
  { oemIndex: 6, id: "joint-06-right-hip-pitch", name: "Right hip pitch", group: "Lower body", status: "OBSERVED_USABLE" },
  { oemIndex: 7, id: "joint-07-right-hip-roll", name: "Right hip roll", group: "Lower body", status: "OBSERVED_USABLE" },
  { oemIndex: 8, id: "joint-08-right-hip-yaw", name: "Right hip yaw", group: "Lower body", status: "OBSERVED_USABLE" },
  { oemIndex: 9, id: "joint-09-right-knee", name: "Right knee", group: "Lower body", status: "OBSERVED_USABLE" },
  { oemIndex: 10, id: "joint-10-right-ankle-pitch", name: "Right ankle pitch", group: "Lower body", status: "OBSERVED_USABLE" },
  { oemIndex: 11, id: "joint-11-right-ankle-roll", name: "Right ankle roll", group: "Lower body", status: "OBSERVED_USABLE" },
  { oemIndex: 12, id: "joint-12-waist-yaw", name: "Waist yaw", group: "Torso", status: "OBSERVED_USABLE" },
  { oemIndex: 13, id: "joint-13-waist-roll", name: "Waist roll", group: "Torso", status: "OBSERVED_USABLE" },
  { oemIndex: 14, id: "joint-14-waist-pitch", name: "Waist pitch", group: "Torso", status: "OBSERVED_USABLE" },
  { oemIndex: 15, id: "joint-15-left-shoulder-pitch", name: "Left shoulder pitch", group: "Upper body", status: "OBSERVED_USABLE" },
  { oemIndex: 16, id: "joint-16-left-shoulder-roll", name: "Left shoulder roll", group: "Upper body", status: "OBSERVED_USABLE" },
  { oemIndex: 17, id: "joint-17-left-shoulder-yaw", name: "Left shoulder yaw", group: "Upper body", status: "OBSERVED_USABLE" },
  { oemIndex: 18, id: "joint-18-left-elbow", name: "Left elbow", group: "Upper body", status: "OBSERVED_USABLE" },
  { oemIndex: 19, id: "joint-19-left-wrist-roll", name: "Left wrist roll", group: "Upper body", status: "OBSERVED_USABLE" },
  { oemIndex: 20, id: "joint-20-left-wrist-pitch", name: "Left wrist pitch", group: "Upper body", status: "OBSERVED_USABLE" },
  { oemIndex: 21, id: "joint-21-left-wrist-yaw", name: "Left wrist yaw", group: "Upper body", status: "OBSERVED_USABLE" },
  { oemIndex: 22, id: "joint-22-right-shoulder-pitch", name: "Right shoulder pitch", group: "Upper body", status: "OBSERVED_USABLE" },
  { oemIndex: 23, id: "joint-23-right-shoulder-roll", name: "Right shoulder roll", group: "Upper body", status: "OBSERVED_USABLE" },
  { oemIndex: 24, id: "joint-24-right-shoulder-yaw", name: "Right shoulder yaw", group: "Upper body", status: "OBSERVED_USABLE" },
  { oemIndex: 25, id: "joint-25-right-elbow", name: "Right elbow", group: "Upper body", status: "OBSERVED_USABLE" },
  { oemIndex: 26, id: "joint-26-right-wrist-roll", name: "Right wrist roll", group: "Upper body", status: "OBSERVED_USABLE" },
  { oemIndex: 27, id: "joint-27-right-wrist-pitch", name: "Right wrist pitch", group: "Upper body", status: "OBSERVED_USABLE" },
  { oemIndex: 28, id: "joint-28-right-wrist-yaw", name: "Right wrist yaw", group: "Upper body", status: "OBSERVED_UNRESOLVED_SLOT" },
] as const;

export const controlledProbeEvidence = [
  {
    componentId: "joint-12-waist-yaw",
    oemIndex: 12,
    component: "Waist yaw",
    phase: "WAIST_YAW",
    positionRange: { idle: 0.00010713515803217888, observed: 0.17579541425220668, unit: "rad" },
    velocityAbsP95: { idle: 0.027683726698159935, observed: 0.04456822946667671, ratio: 1.6099071469896806, unit: "rad/s" },
    torqueAbsP95: { idle: 0.9508167505264282, observed: 1.2863991260528564, ratio: 1.3529411690955486, unit: "N·m" },
  },
  {
    componentId: "joint-16-left-shoulder-roll",
    oemIndex: 16,
    component: "Left shoulder roll",
    phase: "LEFT_SHOULDER_ROLL",
    positionRange: { idle: 0.00004793703556060791, observed: 0.128159299492836, unit: "rad" },
    velocityAbsP95: { idle: 0.015339808538556099, observed: 0.09357283264398575, ratio: 6.100000036427674, unit: "rad/s" },
    torqueAbsP95: { idle: 1.5, observed: 2, ratio: 1.3333333333333333, unit: "N·m" },
  },
  {
    componentId: "joint-15-left-shoulder-pitch",
    oemIndex: 15,
    component: "Left shoulder pitch",
    phase: "LEFT_SHOULDER_PITCH",
    positionRange: { idle: 0.0000718832015991211, observed: 0.09902563691139221, unit: "rad" },
    velocityAbsP95: { idle: 0.026077674701809883, observed: 0.07056312263011932, ratio: 2.7058824621821818, unit: "rad/s" },
    torqueAbsP95: { idle: 0.875, observed: 1.875, ratio: 2.142857142857143, unit: "N·m" },
  },
] as const;

export type OperationalPhaseId =
  | "LOCOMOTION_FORWARD_BACK"
  | "TURNING"
  | "MIXED_OPERATION";

export type OperationalFingerprintRow = {
  component: string;
  oemIndex: number;
  idleTorque: number;
  observedTorque: number;
  ratio: number;
};

export const operationalFingerprints: Record<
  OperationalPhaseId,
  readonly OperationalFingerprintRow[]
> = {
  LOCOMOTION_FORWARD_BACK: [
    { component: "Left hip pitch", oemIndex: 0, idleTorque: 0.352, observedTorque: 1.705, ratio: 4.85 },
    { component: "Left ankle pitch", oemIndex: 4, idleTorque: 1.455, observedTorque: 6.653, ratio: 4.57 },
    { component: "Waist roll", oemIndex: 13, idleTorque: 0.294, observedTorque: 1.077, ratio: 3.66 },
    { component: "Waist pitch", oemIndex: 14, idleTorque: 0.314, observedTorque: 1.043, ratio: 3.32 },
    { component: "Right hip pitch", oemIndex: 6, idleTorque: 1.055, observedTorque: 2.76, ratio: 2.62 },
    { component: "Right ankle pitch", oemIndex: 10, idleTorque: 1.82, observedTorque: 4.156, ratio: 2.28 },
  ],
  TURNING: [
    { component: "Left hip pitch", oemIndex: 0, idleTorque: 0.352, observedTorque: 9.527, ratio: 27.1 },
    { component: "Waist roll", oemIndex: 13, idleTorque: 0.294, observedTorque: 4.156, ratio: 14.14 },
    { component: "Left ankle roll", oemIndex: 5, idleTorque: 0.703, observedTorque: 7.714, ratio: 10.97 },
    { component: "Left hip roll", oemIndex: 1, idleTorque: 3.076, observedTorque: 33.486, ratio: 10.89 },
    { component: "Left ankle pitch", oemIndex: 4, idleTorque: 1.455, observedTorque: 12.604, ratio: 8.66 },
    { component: "Waist pitch", oemIndex: 14, idleTorque: 0.314, observedTorque: 2.555, ratio: 8.14 },
  ],
  MIXED_OPERATION: [
    { component: "Left hip pitch", oemIndex: 0, idleTorque: 0.352, observedTorque: 7.119, ratio: 20.25 },
    { component: "Waist roll", oemIndex: 13, idleTorque: 0.294, observedTorque: 3.175, ratio: 10.8 },
    { component: "Left hip roll", oemIndex: 1, idleTorque: 3.076, observedTorque: 27.8, ratio: 9.04 },
    { component: "Right hip pitch", oemIndex: 6, idleTorque: 1.055, observedTorque: 6.429, ratio: 6.1 },
    { component: "Waist pitch", oemIndex: 14, idleTorque: 0.314, observedTorque: 1.91, ratio: 6.09 },
    { component: "Left ankle roll", oemIndex: 5, idleTorque: 0.703, observedTorque: 3.639, ratio: 5.17 },
  ],
};

export const operationalPhaseMetadata: Record<
  OperationalPhaseId,
  { label: string; context: string; description: string }
> = {
  LOCOMOTION_FORWARD_BACK: {
    label: "Forward / backward",
    context: "Locomotion",
    description: "Relative torque signature during the human-confirmed forward/back locomotion phase.",
  },
  TURNING: {
    label: "Turning",
    context: "Locomotion",
    description: "Relative torque signature during the human-confirmed left/right turning phase.",
  },
  MIXED_OPERATION: {
    label: "Mixed operation",
    context: "Locomotion",
    description: "Relative torque signature during the human-confirmed mixed-operation phase.",
  },
};

export const unresolvedObservation = {
  componentId: "joint-28-right-wrist-yaw",
  component: "Right wrist yaw",
  oemIndex: 28,
  observation: "Physical signals remained constant zero while the OEM state code was non-zero.",
  stateCode: 2147483648,
  interpretation: "Configuration / slot unresolved. It is not treated as healthy or as an active component.",
} as const;

export const evidenceBoundary = [
  "Descriptive operational evidence only.",
  "No diagnosis or health score.",
  "No failure probability or remaining useful life.",
  "No predictive-maintenance or safety-certification claim.",
  "Same-session idle is the primary operational reference.",
  "Raw telemetry and sensitive provenance remain outside this public demo dataset.",
] as const;

export const publicDemoNotice =
  "Real field evidence · Unitree G1 · Internal validation demo · Export NOT APPROVED";

export function getFieldComponent(componentId: string) {
  return fieldComponents.find((component) => component.id === componentId) ?? null;
}

export function getProbeEvidence(componentId: string) {
  return controlledProbeEvidence.find((probe) => probe.componentId === componentId) ?? null;
}

export function getOperationalEvidence(oemIndex: number) {
  const phases = Object.keys(operationalFingerprints) as OperationalPhaseId[];

  return phases.flatMap((phaseId) => {
    const row = operationalFingerprints[phaseId].find((item) => item.oemIndex === oemIndex);
    if (!row) return [];

    return [{
      phaseId,
      phaseLabel: operationalPhaseMetadata[phaseId].label,
      phaseContext: operationalPhaseMetadata[phaseId].context,
      component: row.component,
      oemIndex: row.oemIndex,
      idleTorque: row.idleTorque,
      observedTorque: row.observedTorque,
      ratio: row.ratio,
    }];
  });
}

export function humanizeSessionDisposition(value: string) {
  if (value === "SALVAGED_OPEN_VERIFIED") return "Salvaged capture · integrity verified";
  return value.replaceAll("_", " ").toLowerCase();
}
