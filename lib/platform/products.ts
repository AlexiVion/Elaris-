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
    description: "A buyer/operator view focused on whether a robot deployment is ready to enter and remain in operation.",
    primaryQuestion: "Can this system operate here, what is still missing, and what changed since acceptance?",
    workflow: ["Review deployment", "Check requirements", "Resolve gaps", "Accept", "Monitor changes"],
    sharedObjects: ["Deployment", "Configuration", "Evidence", "Requirement", "Approval", "Change"],
  },
  {
    slug: "safety-change-control",
    name: "Safety Change Control",
    actor: "Safety / EHS",
    status: "PROTOTYPE",
    description: "A safety-focused queue for changes, affected controls, tests and named approvals.",
    primaryQuestion: "Which safety evidence, controls or approvals deserve review after a system change?",
    workflow: ["See change", "Review impact", "Re-test", "Re-approve", "Close review"],
    sharedObjects: ["Configuration", "Requirement", "Evidence", "Approval", "Change", "Incident"],
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
    description: "Reconstruct the deployed configuration, baseline and evidence context at the time of an incident.",
    primaryQuestion: "What exactly was deployed and approved when this incident happened?",
    workflow: ["Open incident", "Recover baseline", "Inspect configuration", "Trace prior changes", "Export chronology"],
    sharedObjects: ["Incident", "Robot", "Deployment", "Baseline", "Configuration", "Change", "Evidence", "Approval"],
  },
];

export function getPlatformProduct(slug: string) {
  return PLATFORM_PRODUCTS.find((product) => product.slug === slug) ?? null;
}
