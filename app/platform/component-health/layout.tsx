import { FullDemoProductShell } from "@/components/platform/FullDemoProductShell";

const nav = [
  { label: "Fleet Health", href: "/platform/component-health", icon: "home" as const, exact: true },
  { label: "Robots", href: "/platform/component-health/robots", icon: "robots" as const },
  { label: "Attention", href: "/platform/component-health/attention", icon: "attention" as const },
  { label: "Service", href: "/platform/component-health/service", icon: "service" as const },
  { label: "Return to Service", href: "/platform/component-health/return-to-service", icon: "return" as const },
  { label: "Reports", href: "/platform/component-health/reports", icon: "reports" as const },
];

export default function ComponentHealthLayout({ children }: { children: React.ReactNode }) {
  return (
    <FullDemoProductShell
      product="Component Health"
      subtitle="Physical Reliability"
      organization="Humandroid"
      persona="Reliability Lead"
      attentionCount={1}
      nav={nav}
      demoDataNotice="Humandroid pilot concept — HMND-0002 / TGN are scenario context. All health values, component serials, telemetry, service events and outcomes shown here are SYNTHETIC DEMO DATA."
    >
      {children}
    </FullDemoProductShell>
  );
}
