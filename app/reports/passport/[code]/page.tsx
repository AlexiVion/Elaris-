import { notFound } from "next/navigation";
import { ReportToolbar } from "@/components/elaris/ReportToolbar";
import { ReportView } from "@/components/elaris/ReportView";
import { getPassport } from "@/lib/db/reports";
import { shareLinkRows } from "@/lib/db/share-map";

export default async function PassportReportPage({ params }: { params: { code: string } }) {
  const code = decodeURIComponent(params.code);
  const [report, links] = await Promise.all([getPassport(code), shareLinkRows("SYSTEM_PASSPORT", code)]);
  if (!report) notFound();
  return (
    <>
      <ReportToolbar jsonType="passport" code={code} shareView="SYSTEM_PASSPORT" shareTargetId={code} shareLinks={links} />
      <ReportView report={report} />
    </>
  );
}
