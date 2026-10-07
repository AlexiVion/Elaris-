import { Database, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/elaris/PageHeader";
import { SectionCard } from "@/components/elaris/SectionCard";
import { StatusPill } from "@/components/elaris/StatusPill";

export function ComponentHealthWorkbenchEmpty({
  title = "Component Health · Audit Workbench",
}: {
  title?: string;
}) {
  return (
    <>
      <PageHeader
        title={title}
        actions={<StatusPill label="NO PRIVATE V0.3 ARTIFACT" tone="amber" />}
      />

      <div className="grid gap-6 xl:grid-cols-[1.2fr_.8fr]">
        <SectionCard title="Private evidence source required" icon={Database}>
          <p className="text-sm leading-6 text-muted-foreground">
            V0.4 does not bundle real Component Health evidence into the web app.
            It reads a private V0.3 artifact on the server at request time.
          </p>

          <div className="mt-4 rounded-lg border border-border bg-muted/40 p-4 text-sm">
            <div className="font-medium">Automatic local discovery</div>
            <p className="mt-1 text-muted-foreground">
              By default Elaris scans <code>$HOME/elaris-private</code> for
              <code> field-evidence-v03.json</code> files.
            </p>
          </div>

          <div className="mt-3 rounded-lg border border-border bg-muted/40 p-4 text-sm">
            <div className="font-medium">Explicit configuration</div>
            <p className="mt-1 text-muted-foreground">
              Set <code>ELARIS_COMPONENT_HEALTH_V03_REPORT</code> to one private
              report file, or <code>ELARIS_COMPONENT_HEALTH_V03_ROOT</code> to a
              private catalogue root.
            </p>
          </div>
        </SectionCard>

        <SectionCard title="Security boundary" icon={ShieldCheck}>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>SENSITIVE evidence is loaded server-side only.</p>
            <p>The Workbench refuses report paths inside the Git working tree.</p>
            <p>Raw ciphertext, registry SHA-256 values and verified-file lists are not rendered in the UI.</p>
            <p>Loading evidence never changes its export status.</p>
          </div>
        </SectionCard>
      </div>
    </>
  );
}
