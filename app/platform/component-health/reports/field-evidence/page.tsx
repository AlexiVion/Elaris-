import { redirect } from "next/navigation";

export default function LegacyFieldEvidenceReportRedirect() {
  redirect("/platform/component-health/reports/draft");
}
