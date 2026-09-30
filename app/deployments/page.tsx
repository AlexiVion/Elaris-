import { PageHeader } from "@/components/elaris/PageHeader";
import { Placeholder } from "@/components/elaris/Placeholder";
import { copy } from "@/lib/copy/en";

export default function DeploymentsPage() {
  return (
    <>
      <PageHeader title={copy.nav.deployments} />
      <Placeholder note="This screen is built in a later phase." />
    </>
  );
}
