import { prisma } from "./prisma";

/** Human-readable code generators (spec §5). All scan existing codes for max+1. */

function maxSeq(codes: string[], re: RegExp): number {
  let max = 0;
  for (const c of codes) {
    const m = c.match(re);
    if (m) max = Math.max(max, parseInt(m[1]!, 10));
  }
  return max;
}

export async function nextChangeCode(): Promise<string> {
  const rows = await prisma.change.findMany({ select: { code: true } });
  return `CHG-${String(maxSeq(rows.map((r) => r.code), /^CHG-(\d+)$/) + 1).padStart(4, "0")}`;
}

/** Snapshot codes are per-robot (C003 → C004 → …) so the golden chain stays tidy. */
export async function nextSnapshotCodeForRobot(robotId: string): Promise<string> {
  const rows = await prisma.configurationSnapshot.findMany({ where: { robotId }, select: { code: true } });
  return `C${String(maxSeq(rows.map((r) => r.code), /^C(\d+)$/) + 1).padStart(3, "0")}`;
}

export async function nextBaselineCode(deploymentCode: string): Promise<string> {
  const num = deploymentCode.replace(/^DEP-/, "");
  const rows = await prisma.baseline.findMany({
    where: { code: { startsWith: `B-${num}-` } },
    select: { code: true },
  });
  const re = new RegExp(`^B-${num}-(\\d+)$`);
  return `B-${num}-${String(maxSeq(rows.map((r) => r.code), re) + 1).padStart(2, "0")}`;
}

export async function nextIncidentCode(year: number): Promise<string> {
  const rows = await prisma.incident.findMany({
    where: { code: { startsWith: `INC-${year}-` } },
    select: { code: true },
  });
  const re = new RegExp(`^INC-${year}-(\\d+)$`);
  return `INC-${year}-${String(maxSeq(rows.map((r) => r.code), re) + 1).padStart(3, "0")}`;
}
