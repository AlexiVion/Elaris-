import { NextResponse } from "next/server";
import { getPassport, getReadinessPack, getImpactReport } from "@/lib/db/reports";

/** JSON export of the three reports (spec §7.8). */
export async function GET(_req: Request, { params }: { params: { type: string; code: string } }) {
  const code = decodeURIComponent(params.code);
  const report =
    params.type === "passport" ? await getPassport(code)
    : params.type === "readiness" ? await getReadinessPack(code)
    : params.type === "impact" ? await getImpactReport(code)
    : null;

  if (!report) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return new NextResponse(JSON.stringify(report, null, 2), {
    headers: {
      "content-type": "application/json",
      "content-disposition": `attachment; filename="elaris-${params.type}-${code}.json"`,
    },
  });
}
