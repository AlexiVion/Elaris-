import Link from "next/link";
import { PageHeader } from "@/components/elaris/PageHeader";
import { Card } from "@/components/ui/card";
import { StatusPill } from "@/components/elaris/StatusPill";
import { fieldRobot } from "@/lib/demo/component-health-field-data";

export default function ComponentHealthRobotsPage() {
  return (
    <>
      <PageHeader title="Robot evidence" />
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                {["Robot", "Model", "Acquisition", "Components", "Phases", "Disposition", "Evidence"].map((heading) => (
                  <th key={heading} className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border last:border-0 hover:bg-muted/30">
                <td className="px-4 py-3">
                  <Link href="/platform/component-health/robots/G1-FIELD-001" className="font-medium text-primary hover:underline">
                    {fieldRobot.code}
                  </Link>
                  <div className="mt-1 text-xs text-muted-foreground">Sanitized real-data demo</div>
                </td>
                <td className="px-4 py-3 font-medium">{fieldRobot.model}</td>
                <td className="px-4 py-3">{fieldRobot.captureMode}</td>
                <td className="px-4 py-3">{fieldRobot.usableComponents} usable / {fieldRobot.unresolvedComponents} unresolved</td>
                <td className="px-4 py-3">{fieldRobot.observedPhases}</td>
                <td className="px-4 py-3 text-xs">{fieldRobot.sessionState}</td>
                <td className="px-4 py-3"><StatusPill label={fieldRobot.evidenceClass} tone="green" /></td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
