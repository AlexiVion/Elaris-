import Link from "next/link";
import { ArrowRight, type LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { copy } from "@/lib/copy/en";

/** Card with a titled header and an optional "View all (n) →" link (spec §7.2). */
export function SectionCard({
  title,
  icon: Icon,
  viewAllHref,
  viewAllCount,
  action,
  children,
  className,
}: {
  title: string;
  icon?: LucideIcon;
  viewAllHref?: string;
  viewAllCount?: number;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("flex flex-col", className)}>
      <div className="flex items-center justify-between gap-2 px-5 pt-5 pb-3">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="size-4 text-muted-foreground" />}
          <h3 className="text-base font-semibold tracking-tight">{title}</h3>
        </div>
        {action}
        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            {copy.common.viewAll}
            {viewAllCount != null && ` (${viewAllCount})`}
            <ArrowRight className="size-3.5" />
          </Link>
        )}
      </div>
      <div className="px-5 pb-5">{children}</div>
    </Card>
  );
}
