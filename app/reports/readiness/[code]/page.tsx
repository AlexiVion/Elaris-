import { notFound } from "next/navigation";
import { ReportToolbar } from "@/components/elaris/ReportToolbar";
import { ReportView } from "@/components/elaris/ReportView";
import { getReadinessPack } from "@/lib/db/reports";
import { shareLinkRows } from "@/lib/db/share-map";

export default async function ReadinessReportPage({ params }: { params: { code: string } }) {
  const code = decodeURIComponent(params.code);
  const [report, links] = await Promise.all([getReadinessPack(code), shareLinkRows("READINESS_PACK", code)]);
  if (!report) notFound();
  return (
    <>
      <ReportToolbar jsonType="readiness" code={code} shareView="READINESS_PACK" shareTargetId={code} shareLinks={links} />
      <ReportView report={report} />
    </>
  );
}
