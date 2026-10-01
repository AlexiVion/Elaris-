export const placementClients = [
  { code: "CL-001", name: "Humandroid", segment: "Robotics integrator / humanoids", deployments: 3, openSubmissions: 1, renewal: "18 Nov 2026", status: "ACTIVE" },
  { code: "CL-002", name: "Atlas Automation", segment: "Warehouse robotics", deployments: 12, openSubmissions: 1, renewal: "04 Dec 2026", status: "ACTIVE" },
  { code: "CL-003", name: "Nova Handling", segment: "Industrial manipulators", deployments: 7, openSubmissions: 1, renewal: "12 Oct 2026", status: "RENEWAL DUE" },
  { code: "CL-004", name: "Field Robotics Labs", segment: "Outdoor autonomy", deployments: 5, openSubmissions: 0, renewal: "21 Jan 2027", status: "ACTIVE" },
] as const;

export const placementSubmissions = [
  { code: "SUB-0042", client: "Humandroid", subject: "Robotics deployment programme", version: "v2", markets: 2, gaps: 2, questions: 3, status: "QUESTIONS OPEN", updated: "01 Oct 2026" },
  { code: "SUB-0039", client: "Atlas Automation", subject: "Warehouse AMR fleet", version: "v1", markets: 0, gaps: 3, questions: 0, status: "COLLECTING INFO", updated: "29 Sep 2026" },
  { code: "SUB-0035", client: "Nova Handling", subject: "Manipulator renewal", version: "renewal", markets: 1, gaps: 1, questions: 1, status: "RENEWAL DUE", updated: "28 Sep 2026" },
] as const;

export const placementRequests = [
  { code: "REQ-104", client: "Humandroid", submission: "SUB-0042", item: "Operator training record", owner: "Client engineering", due: "03 Oct 2026", status: "OPEN", priority: "HIGH" },
  { code: "REQ-105", client: "Humandroid", submission: "SUB-0042", item: "Site acceptance test", owner: "Customer engineering", due: "04 Oct 2026", status: "OPEN", priority: "HIGH" },
  { code: "REQ-097", client: "Atlas Automation", submission: "SUB-0039", item: "Remote support architecture", owner: "Client IT", due: "07 Oct 2026", status: "WAITING", priority: "MEDIUM" },
] as const;

export const placementQuestions = [
  { code: "MQ-221", market: "Atlas Specialty", submission: "SUB-0042", question: "How is restricted-zone entry controlled when the robot operates near personnel?", owner: "Broker technical desk", status: "DRAFT RESPONSE" },
  { code: "MQ-222", market: "Meridian Risk", submission: "SUB-0042", question: "Which exact hand/end-effector and control-stack versions are currently deployed?", owner: "Shared Elaris record", status: "ANSWERABLE" },
  { code: "MQ-223", market: "Atlas Specialty", submission: "SUB-0042", question: "Has the deployed system changed since the original technical submission?", owner: "Broker technical desk", status: "OPEN" },
  { code: "MQ-204", market: "Northstar Capacity", submission: "SUB-0035", question: "Provide updated maintenance and incident history for renewal.", owner: "Client service team", status: "WAITING" },
] as const;

export const placementRenewals = [
  { code: "REN-0035", client: "Nova Handling", submission: "SUB-0035", due: "12 Oct 2026", changes: 2, incidents: 0, status: "REVIEW REQUIRED" },
  { code: "REN-0042", client: "Humandroid", submission: "SUB-0042", due: "18 Nov 2026", changes: 1, incidents: 1, status: "PREPARING" },
] as const;

export const placementReports = [
  { code: "RPT-042-A", name: "Technical Submission Pack", subject: "SUB-0042 · v2", audience: "Atlas Specialty", status: "DRAFT" },
  { code: "RPT-042-B", name: "Missing Information List", subject: "SUB-0042", audience: "Humandroid", status: "CURRENT" },
  { code: "RPT-042-C", name: "Renewal Change Summary", subject: "SUB-0042", audience: "Broker internal", status: "CURRENT" },
] as const;
