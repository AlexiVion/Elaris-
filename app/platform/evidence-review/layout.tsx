import { ActorProductShell } from "@/components/platform/ActorProductShell";

const nav = [
  { label: "Assessment Queue", href: "/platform/evidence-review", icon: "home" as const },
  { label: "Assessment", href: "/platform/evidence-review/assessments/ASMT-0017", icon: "evidence" as const },
  { label: "Findings", href: "/platform/evidence-review/findings", icon: "alert" as const },
];

export default function EvidenceReviewLayout({ children }: { children: React.ReactNode }) {
  return (
    <ActorProductShell
      product="Evidence Review"
      actor="Test Lab / Certifier / Assurance"
      accent="violet"
      nav={nav}
    >
      {children}
    </ActorProductShell>
  );
}
