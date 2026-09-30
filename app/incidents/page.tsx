import { PageHeader } from "@/components/elaris/PageHeader";
import { Placeholder } from "@/components/elaris/Placeholder";
import { copy } from "@/lib/copy/en";

export default function IncidentsPage() {
  return (
    <>
      <PageHeader title={copy.nav.incidents} />
      <Placeholder note="This screen is built in a later phase." />
    </>
  );
}
