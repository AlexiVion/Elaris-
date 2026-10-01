import { ActorProductShell } from "@/components/platform/ActorProductShell";

const nav = [
  { label: "Safety Overview", href: "/platform/safety-change-control", icon: "home" as const },
  { label: "Change Review", href: "/platform/safety-change-control/changes/CHG-0005", icon: "review" as const },
  { label: "Re-test Queue", href: "/platform/safety-change-control/retests", icon: "alert" as const },
];

export default function SafetyChangeControlLayout({ children }: { children: React.ReactNode }) {
  return (
    <ActorProductShell
      product="Safety Change Control"
      actor="Safety / EHS"
      accent="amber"
      nav={nav}
    >
      {children}
    </ActorProductShell>
  );
}
