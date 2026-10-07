import { FullDemoProductShell } from "@/components/platform/FullDemoProductShell";

const nav = [
  { label: "Overview", href: "/platform/component-health", icon: "home" as const, exact: true },
  { label: "Sessions", href: "/platform/component-health/sessions", icon: "robots" as const },
  { label: "Components", href: "/platform/component-health/components", icon: "attention" as const },
  { label: "Phases", href: "/platform/component-health/phases", icon: "phases" as const },
  { label: "Quality", href: "/platform/component-health/quality", icon: "service" as const },
  { label: "Review", href: "/platform/component-health/review", icon: "return" as const },
  { label: "Reports", href: "/platform/component-health/reports", icon: "reports" as const },
];

export default function ComponentHealthLayout({ children }: { children: React.ReactNode }) {
  return (
    <FullDemoProductShell
      product="Component Health"
      subtitle="Audit Workbench · V0.4"
      organization="Elaris Field Validation"
      persona="Reliability Lead"
      attentionCount={0}
      nav={nav}
      demoDataNotice="Private V0.3 evidence · Server-side Workbench · SENSITIVE · Export NOT APPROVED"
      demoNoticeTone="slate"
    >
      {children}
    </FullDemoProductShell>
  );
}
