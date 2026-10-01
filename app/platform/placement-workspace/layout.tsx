import { FullDemoProductShell } from "@/components/platform/FullDemoProductShell";

const nav = [
  { label: "Home", href: "/platform/placement-workspace", icon: "home" as const, exact: true },
  { label: "Clients", href: "/platform/placement-workspace/clients", icon: "clients" as const },
  { label: "Submissions", href: "/platform/placement-workspace/submissions", icon: "submissions" as const },
  { label: "Information Requests", href: "/platform/placement-workspace/requests", icon: "requests" as const },
  { label: "Market Questions", href: "/platform/placement-workspace/questions", icon: "questions" as const },
  { label: "Renewals", href: "/platform/placement-workspace/renewals", icon: "renewals" as const },
  { label: "Reports", href: "/platform/placement-workspace/reports", icon: "reports" as const },
];

export default function PlacementWorkspaceLayout({ children }: { children: React.ReactNode }) {
  return (
    <FullDemoProductShell
      product="Placement Workspace"
      subtitle="Technical Insurance Placement"
      organization="Vector Specialty Brokerage"
      persona="Alex Morgan"
      attentionCount={6}
      nav={nav}
    >
      {children}
    </FullDemoProductShell>
  );
}
