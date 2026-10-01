import { ActorProductShell } from "@/components/platform/ActorProductShell";

const nav = [
  { label: "Overview", href: "/platform/operational-readiness", icon: "home" as const },
  { label: "Deployment Review", href: "/platform/operational-readiness/deployments/DEP-0017", icon: "records" as const },
  { label: "Acceptance Gates", href: "/platform/operational-readiness/acceptance", icon: "decision" as const },
];

export default function OperationalReadinessLayout({ children }: { children: React.ReactNode }) {
  return (
    <ActorProductShell
      product="Operational Readiness"
      actor="Enterprise Buyer / Operator"
      accent="blue"
      nav={nav}
    >
      {children}
    </ActorProductShell>
  );
}
