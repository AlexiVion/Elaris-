export type PlatformProductStatus = "LIVE" | "PROTOTYPE";

export type PlatformProduct = {
  slug: string;
  name: string;
  actor: string;
  status: PlatformProductStatus;
  description: string;
  primaryQuestion: string;
  workflow: string[];
  sharedObjects: string[];
};

export const PLATFORM_PRODUCTS: PlatformProduct[] = [
  {
    slug: "deployment-control",
    name: "Deployment Control",
    actor: "Robotics Integrator / Deployer",
    status: "LIVE",
    description: "Maintain deployment truth, evidence, approvals and change impact for deployed robot systems.",
    primaryQuestion: "What is deployed, what supports it, and what deserves review when it changes?",
    workflow: ["Baseline", "Evidence", "Change", "Impact", "Human review", "New baseline"],
    sharedObjects: ["Robot", "Configuration", "Deployment", "Evidence", "Requirement", "Approval", "Change", "Incident"],
  },
  {
    slug: "operational-readiness",
    name: "Operational Readiness",
    actor: "Enterprise Buyer / Operator",
    status: "PROTOTYPE",
    description: "Review whether a robot deployment can enter or continue operating at a site, under what conditions, and what changed since acceptance.",
    primaryQuestion: "Can this system operate here, what is still missing, and what changed since acceptance?",
    workflow: ["Review deployment", "Check gates", "Resolve gaps", "Record acceptance", "Monitor changes"],
    sharedObjects: ["Deployment", "Configuration", "Evidence", "Requirement", "Approval", "Change"],
  },
  {
    slug: "safety-change-control",
    name: "Safety Change Control",
    actor: "Safety / EHS",
    status: "PROTOTYPE",
    description: "Review safety-relevant changes, re-tests, evidence and named decisions without treating Elaris as a safety authority.",
    primaryQuestion: "Which safety evidence, controls or approvals deserve review after a system change?",
    workflow: ["See change", "Review impact", "Re-test", "Re-approve", "Close review"],
    sharedObjects: ["Configuration", "Requirement", "Evidence", "Approval", "Change", "Incident"],
  },
  {
    slug: "evidence-review",
    name: "Evidence Review",
    actor: "Test Lab / Certifier / Assurance",
    status: "PROTOTYPE",
    description: "Review assessment scope, submitted evidence, open findings and changes that may affect a prior review.",
    primaryQuestion: "What is in scope, what evidence is sufficient, what remains open, and what changed?",
    workflow: ["Define scope", "Review evidence", "Raise findings", "Review corrections", "Record decision"],
    sharedObjects: ["Configuration", "Deployment", "Evidence", "Requirement", "Approval", "Change", "Audit"],
  },
  {
    slug: "broker-workspace",
    name: "Broker Workspace",
    actor: "Insurance Broker",
    status: "PROTOTYPE",
    description: "Prepare a reusable placement/submission view from verified deployment and evidence data.",
    primaryQuestion: "What system is being presented, what evidence exists, and what information is still missing?",
    workflow: ["Select client", "Build submission", "Resolve missing info", "Share with carrier", "Track questions"],
    sharedObjects: ["Organization", "Robot", "Deployment", "Configuration", "Evidence", "Change", "Incident"],
  },
  {
    slug: "underwriting-workspace",
    name: "Underwriting Workspace",
    actor: "Insurer / MGA",
    status: "PROTOTYPE",
    description: "An underwriting decision view over the real deployed system, evidence and subsequent changes.",
    primaryQuestion: "What is the actual exposure, what supports the submission, and what changed since review?",
    workflow: ["Review submission", "Inspect deployment", "Ask questions", "Record decision", "Watch material changes"],
    sharedObjects: ["Organization", "Robot", "Deployment", "Configuration", "Evidence", "Requirement", "Change", "Incident"],
  },
  {
    slug: "incident-reconstruction",
    name: "Incident Reconstruction",
    actor: "Claims / Forensics",
    status: "PROTOTYPE",
    description: "Reconstruct the deployed configuration, baseline, timeline and evidence context at the time of an incident.",
    primaryQuestion: "What exactly was deployed and approved when this incident happened?",
    workflow: ["Open incident", "Recover baseline", "Inspect configuration", "Build timeline", "Preserve evidence"],
    sharedObjects: ["Incident", "Robot", "Deployment", "Baseline", "Configuration", "Change", "Evidence", "Approval"],
  },
];

export function getPlatformProduct(slug: string) {
  return PLATFORM_PRODUCTS.find((product) => product.slug === slug) ?? null;
}
