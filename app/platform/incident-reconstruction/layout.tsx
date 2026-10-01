import { ActorProductShell } from "@/components/platform/ActorProductShell";

const nav = [
  { label: "Incident Queue", href: "/platform/incident-reconstruction", icon: "home" as const },
  { label: "Incident Overview", href: "/platform/incident-reconstruction/incidents/INC-2026-001", icon: "incident" as const },
  { label: "Evidence Room", href: "/platform/incident-reconstruction/evidence", icon: "evidence" as const },
];

export default function IncidentReconstructionLayout({ children }: { children: React.ReactNode }) {
  return (
    <ActorProductShell
      product="Incident Reconstruction"
      actor="Claims / Forensics / Investigation"
      accent="rose"
      nav={nav}
    >
      {children}
    </ActorProductShell>
  );
}
