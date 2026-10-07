import Link from "next/link";
import { Boxes } from "lucide-react";
import { PageHeader } from "@/components/elaris/PageHeader";
import { Card } from "@/components/ui/card";
import { StatusPill } from "@/components/elaris/StatusPill";
import { fieldComponents } from "@/lib/demo/component-health-field-data";

export default function FieldComponentsPage() {
  return (
    <>
      <PageHeader title="Observed components" />
      <Card className="overflow-hidden">
        <div className="border-b border-border px-5 py-4">
          <div className="flex items-center gap-2">
            <Boxes className="size-4 text-muted-foreground" />
            <div>
              <div className="text-sm font-semibold">29 mapped Unitree G1 joint slots</div>
              <div className="mt-1 text-xs text-muted-foreground">
                28 observed usable slots and 1 unresolved slot. This is an evidence inventory, not a health verdict.
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                {["OEM index", "Component", "Group", "Evidence status", "Detail"].map((heading) => (
                  <th key={heading} className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {fieldComponents.map((component) => {
                const unresolved = component.status === "OBSERVED_UNRESOLVED_SLOT";
                return (
                  <tr key={component.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-3 font-mono text-xs">{String(component.oemIndex).padStart(2, "0")}</td>
                    <td className="px-4 py-3 font-medium">{component.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{component.group}</td>
                    <td className="px-4 py-3">
                      <StatusPill label={unresolved ? "UNRESOLVED" : "OBSERVED USABLE"} tone={unresolved ? "amber" : "green"} />
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/platform/component-health/components/${component.id}`} className="font-medium text-primary hover:underline">
                        Open evidence →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
