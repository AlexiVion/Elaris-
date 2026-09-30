"use client";

import { Printer, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShareDialog, type ShareLinkRow } from "./ShareDialog";
import type { ShareView } from "@/lib/domain/enums";

/** Print / JSON / Share actions for a report. Hidden when printing (no-print). */
export function ReportToolbar({
  jsonType,
  code,
  shareView,
  shareTargetId,
  shareLinks = [],
}: {
  jsonType: "passport" | "readiness" | "impact";
  code: string;
  shareView: ShareView;
  shareTargetId: string;
  shareLinks?: ShareLinkRow[];
}) {
  return (
    <div className="no-print mb-6 flex flex-wrap items-center gap-2">
      <Button onClick={() => window.print()}>
        <Printer className="size-4" /> Print / PDF
      </Button>
      <Button variant="outline" asChild>
        <a href={`/api/reports/${jsonType}/${encodeURIComponent(code)}`} download>
          <Download className="size-4" /> Export JSON
        </a>
      </Button>
      <ShareDialog view={shareView} targetId={shareTargetId} links={shareLinks} />
    </div>
  );
}
