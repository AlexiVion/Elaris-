import { notFound } from "next/navigation";
import { ReportToolbar } from "@/components/elaris/ReportToolbar";
import { ReportView } from "@/components/elaris/ReportView";
import { getImpactReport } from "@/lib/db/reports";
import { shareLinkRows } from "@/lib/db/share-map";

export default async function ImpactReportPage({ params }: { params: { code: string } }) {
  const code = decodeURIComponent(params.code);
  const [report, links] = await Promise.all([getImpactReport(code), shareLinkRows("CHANGE_IMPACT", code)]);
  if (!report) notFound();
  return (
    <>
      <ReportToolbar jsonType="impact" code={code} shareView="CHANGE_IMPACT" shareTargetId={code} shareLinks={links} />
      <ReportView report={report} />
    </>
  );
}
