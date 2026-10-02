export const componentHealthRobots = [
  { code: "HMND-0002", model: "Unitree G1", site: "TGN", task: "Valve operation", configuration: "CFG-HMND-0002-05", health: "ATTENTION", attentionComponents: 1, operatingHours: 426, taskCycles: 1284, lastService: "30 Sep 2026" },
  { code: "HMND-0004", model: "UBTECH Walker S2", site: "Humandroid Lab", task: "Handling validation", configuration: "CFG-HMND-0004-02", health: "NORMAL", attentionComponents: 0, operatingHours: 188, taskCycles: 742, lastService: "24 Sep 2026" },
  { code: "HMND-0007", model: "Unitree H2", site: "Training Center", task: "Mobility training", configuration: "CFG-HMND-0007-01", health: "NORMAL", attentionComponents: 0, operatingHours: 96, taskCycles: 311, lastService: "18 Sep 2026" },
] as const;

export const focusRobot = componentHealthRobots[0];

export const componentHealthComponents = [
  { code: "CMP-KNEE-L-002", robot: "HMND-0002", name: "Left knee actuator", position: "Left knee", part: "Demo actuator assembly", serial: "SYN-LKA-29183", installed: "12 May 2026", runtimeHours: 426, cycles: 1284, status: "ATTENTION", lastSignal: "01 Oct 2026 · 18:40" },
  { code: "CMP-KNEE-R-002", robot: "HMND-0002", name: "Right knee actuator", position: "Right knee", part: "Demo actuator assembly", serial: "SYN-RKA-29184", installed: "12 May 2026", runtimeHours: 426, cycles: 1284, status: "NORMAL", lastSignal: "01 Oct 2026 · 18:40" },
  { code: "CMP-HIP-L-002", robot: "HMND-0002", name: "Left hip actuator", position: "Left hip", part: "Demo actuator assembly", serial: "SYN-LHA-18440", installed: "12 May 2026", runtimeHours: 426, cycles: 1284, status: "NORMAL", lastSignal: "01 Oct 2026 · 18:40" },
  { code: "CMP-HAND-R-002", robot: "HMND-0002", name: "Right dexterous hand", position: "Right hand", part: "Demo dexterous hand", serial: "SYN-RH-88401", installed: "03 Jun 2026", runtimeHours: 371, cycles: 1102, status: "MONITOR", lastSignal: "01 Oct 2026 · 18:40" },
  { code: "CMP-BATT-002", robot: "HMND-0002", name: "Battery pack", position: "Torso", part: "Demo battery pack", serial: "SYN-BAT-07321", installed: "12 May 2026", runtimeHours: 426, cycles: 1284, status: "NORMAL", lastSignal: "01 Oct 2026 · 18:40" },
] as const;

export const healthCase = {
  code: "CH-0028",
  robot: "HMND-0002",
  component: "CMP-KNEE-L-002",
  componentName: "Left knee actuator",
  status: "ATTENTION",
  opened: "01 Oct 2026 · 18:40",
  summary: "Persistent deviation across three synthetic signals under a comparable valve-operation workload.",
  suggestedAction: "Inspect before the next field deployment.",
  signals: [
    { metric: "Torque demand", observation: "+11.8% vs own synthetic baseline", status: "DEVIATION", evidence: "Last 32 comparable task cycles" },
    { metric: "Median temperature", observation: "+7.4°C vs synthetic baseline", status: "DEVIATION", evidence: "Comparable workload window" },
    { metric: "Motor error events", observation: "3 events / last 50 cycles", status: "REVIEW", evidence: "Synthetic controller event log" },
  ],
} as const;

export const componentTimeline = [
  { date: "01 Oct 2026 · 18:40", event: "Health case CH-0028 opened", detail: "Three synthetic signals crossed the demo review rule." },
  { date: "29 Sep 2026", event: "Temperature deviation observed", detail: "Synthetic median temperature moved above the component baseline." },
  { date: "18 Sep 2026", event: "Motor error event", detail: "Synthetic event E07 recorded during valve-operation cycle." },
  { date: "10 Sep 2026", event: "Scheduled inspection", detail: "No replacement recorded in the synthetic service history." },
  { date: "12 May 2026", event: "Component installed", detail: "Synthetic serial SYN-LKA-29183 associated with configuration CFG-HMND-0002-01." },
] as const;

export const serviceEvents = [
  { code: "SV-0014", robot: "HMND-0002", component: "Left knee actuator", trigger: "CH-0028", status: "INSPECTION PLANNED", owner: "Humandroid service team", due: "Before next field deployment", outcome: "Pending demo action" },
  { code: "SV-0012", robot: "HMND-0002", component: "Whole robot", trigger: "Scheduled", status: "COMPLETED", owner: "Humandroid service team", due: "30 Sep 2026", outcome: "Routine checks recorded" },
] as const;

export const syntheticReplacement = {
  oldSerial: "SYN-LKA-29183",
  newSerial: "SYN-LKA-34129",
  beforeConfiguration: "CFG-HMND-0002-05",
  afterConfiguration: "CFG-HMND-0002-06",
  impact: ["Re-run joint calibration", "Review mobility validation for the updated configuration", "Re-run Valve Operation skill physical check", "Record named return-to-service decision"],
} as const;

export const returnToService = {
  code: "RTS-0007",
  robot: "HMND-0002",
  configuration: "CFG-HMND-0002-06",
  status: "DEMO READY FOR REVIEW",
  checks: [
    { name: "Component replacement recorded", result: "COMPLETE" },
    { name: "Joint calibration", result: "PASSED" },
    { name: "Mobility functional check", result: "PASSED" },
    { name: "Valve Operation physical check", result: "PASSED" },
  ],
  authority: "Named Humandroid reviewer — synthetic placeholder",
  statement: "This record documents the checks performed. Elaris does not declare the robot safe, certified or compliant.",
} as const;
