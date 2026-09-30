import { cn } from "@/lib/utils";

/** Page title (28–32px semibold, spec §3.1) with optional actions/breadcrumb. */
export function PageHeader({
  title,
  breadcrumb,
  actions,
  className,
}: {
  title: string;
  breadcrumb?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-6", className)}>
      {breadcrumb && <div className="mb-1 text-sm text-muted-foreground">{breadcrumb}</div>}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}
