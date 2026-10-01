import { ActorProductShell } from "@/components/platform/ActorProductShell";

const nav = [
  { label: "Placement Pipeline", href: "/platform/placement-workspace", icon: "home" as const },
  { label: "Submission", href: "/platform/placement-workspace/submissions/SUB-0042", icon: "records" as const },
  { label: "Market Questions", href: "/platform/placement-workspace/questions", icon: "review" as const },
  { label: "Renewal Changes", href: "/platform/placement-workspace/renewal", icon: "alert" as const },
  { label: "Share / Export", href: "/platform/placement-workspace/share", icon: "evidence" as const },
];

export default function PlacementWorkspaceLayout({ children }: { children: React.ReactNode }) {
  return (
    <ActorProductShell
      product="Placement Workspace"
      actor="Insurance Broker / PAS / Wholesale Broker"
      accent="violet"
      nav={nav}
    >
      {children}
    </ActorProductShell>
  );
}
