import { FullDemoProductShell } from "@/components/platform/FullDemoProductShell";
import { publicDemoNotice } from "@/lib/demo/component-health-field-data";

const nav = [
  { label: "Overview", href: "/platform/component-health", icon: "home" as const, exact: true },
  { label: "Robot", href: "/platform/component-health/robots", icon: "robots" as const },
  { label: "Components", href: "/platform/component-health/components", icon: "attention" as const },
  { label: "Phases", href: "/platform/component-health/phases", icon: "phases" as const },
  { label: "Reports", href: "/platform/component-health/reports", icon: "reports" as const },
];

export default function ComponentHealthLayout({ children }: { children: React.ReactNode }) {
  return (
    <FullDemoProductShell
      product="Component Health"
      subtitle="Field Evidence Audit"
      organization="Elaris Field Validation"
      persona="Reliability Lead"
      attentionCount={1}
      nav={nav}
      demoDataNotice={publicDemoNotice}
      demoNoticeTone="slate"
    >
      {children}
    </FullDemoProductShell>
  );
}
