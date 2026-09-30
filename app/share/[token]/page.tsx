import { Hexagon, Lock } from "lucide-react";
import { ReportView } from "@/components/elaris/ReportView";
import { resolveShareToken } from "@/lib/db/share";
import { getPassport, getReadinessPack, getImpactReport } from "@/lib/db/reports";
import { copy } from "@/lib/copy/en";

export const dynamic = "force-dynamic";

async function loadReport(view: string, targetId: string) {
  if (view === "SYSTEM_PASSPORT") return getPassport(targetId);
  if (view === "READINESS_PACK") return getReadinessPack(targetId);
  if (view === "CHANGE_IMPACT") return getImpactReport(targetId);
  return null;
}

export default async function SharePage({ params }: { params: { token: string } }) {
  const result = await resolveShareToken(params.token);

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between border-b border-border bg-card px-6 py-4">
        <div className="flex items-center gap-2">
          <Hexagon className="size-6 text-primary" strokeWidth={1.5} />
          <div>
            <div className="text-sm font-semibold">{copy.brand.name}</div>
            <div className="text-xs text-muted-foreground">{copy.brand.subtitle}</div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Lock className="size-3.5" /> Read-only shared view
        </div>
      </header>

      <main className="px-4 py-8">
        {result.status !== "ok" ? (
          <Invalid status={result.status} />
        ) : (
          <SharedReport view={result.link.view} targetId={result.link.targetId} audience={result.link.audienceLabel} />
        )}
      </main>
    </div>
  );
}

async function SharedReport({ view, targetId, audience }: { view: string; targetId: string; audience: string }) {
  const report = await loadReport(view, targetId);
  if (!report) return <Invalid status="not_found" />;
  return (
    <div className="mx-auto max-w-4xl">
      <p className="mb-3 text-center text-xs text-muted-foreground">Shared with: {audience}</p>
      <ReportView report={report} />
    </div>
  );
}

function Invalid({ status }: { status: "not_found" | "revoked" | "expired" }) {
  const message =
    status === "revoked" ? "This link has been revoked."
    : status === "expired" ? "This link has expired."
    : "This link is not valid.";
  return (
    <div className="mx-auto max-w-md rounded-lg border border-border bg-card p-10 text-center">
      <Lock className="mx-auto mb-3 size-8 text-muted-foreground" />
      <h1 className="text-lg font-semibold">Link unavailable</h1>
      <p className="mt-1 text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
