import { FullDemoProductShell } from "@/components/platform/FullDemoProductShell";

const nav = [
  { label: "Overview", href: "/platform/component-health", icon: "home" as const, exact: true },
  { label: "Robot", href: "/platform/component-health/robots", icon: "robots" as const },
  { label: "Components", href: "/platform/component-health/components", icon: "attention" as const },
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
      demoDataNotice="REAL-DATA-DERIVED DEMO · Aggregated and sanitized from a Unitree G1 field session. Raw telemetry, source hashes and sensitive provenance are not embedded. Descriptive evidence only — no diagnosis, health score, failure probability or RUL."
    >
      {children}
    </FullDemoProductShell>
  );
}
