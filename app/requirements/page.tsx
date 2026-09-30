import { EvidenceListView } from "@/components/elaris/EvidenceListView";
import { copy } from "@/lib/copy/en";

export default function RequirementsPage({ searchParams }: { searchParams: { deployment?: string; status?: string; criticality?: string } }) {
  return (
    <EvidenceListView
      category="REQUIREMENT"
      title={copy.nav.requirements}
      basePath="/requirements"
      filters={{ deploymentCode: searchParams.deployment, status: searchParams.status, criticality: searchParams.criticality }}
    />
  );
}
