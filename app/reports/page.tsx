import { PageHeader } from "@/components/elaris/PageHeader";
import { Placeholder } from "@/components/elaris/Placeholder";
import { copy } from "@/lib/copy/en";

export default function ReportsPage() {
  return (
    <>
      <PageHeader title={copy.nav.reports} />
      <Placeholder note="This screen is built in a later phase." />
    </>
  );
}
