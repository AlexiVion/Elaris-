import { EvidenceListView } from "@/components/elaris/EvidenceListView";
import { copy } from "@/lib/copy/en";

export default function EvidencePage({ searchParams }: { searchParams: { deployment?: string; status?: string; criticality?: string } }) {
  return (
    <EvidenceListView
      category="EVIDENCE"
      title={copy.nav.evidence}
      basePath="/evidence"
      filters={{ deploymentCode: searchParams.deployment, status: searchParams.status, criticality: searchParams.criticality }}
    />
  );
}
