import { PageHeader } from "@/components/elaris/PageHeader";
import { Placeholder } from "@/components/elaris/Placeholder";
import { copy } from "@/lib/copy/en";

export default function HomePage() {
  return (
    <>
      <PageHeader title={copy.home.title} />
      <Placeholder note="Home dashboard (KPIs, Attention Required, deployments, changes…) is built in Phase 3." />
    </>
  );
}
