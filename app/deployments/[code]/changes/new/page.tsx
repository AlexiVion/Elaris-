import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/elaris/PageHeader";
import { NewChangeForm } from "@/components/elaris/NewChangeForm";
import { prisma } from "@/lib/db/prisma";
import { SLOTS } from "@/lib/domain/enums";

const SLOT_INDEX = new Map(SLOTS.map((s, i) => [s, i]));

export default async function NewChangePage({ params }: { params: { code: string } }) {
  const dep = await prisma.deployment.findUnique({
    where: { code: params.code },
    include: { activeBaseline: { include: { snapshot: { include: { items: true } } } } },
  });
  if (!dep) notFound();
  if (!dep.activeBaseline) {
    return (
      <>
        <PageHeader title="New change" />
        <p className="text-sm text-muted-foreground">This deployment has no active baseline to change from.</p>
      </>
    );
  }
  if (!dep.humanExposure) {
    return (
      <>
        <PageHeader title="New change" />
        <p className="text-sm text-muted-foreground">
          Change-impact analysis is blocked until the human-exposure context is explicitly recorded.
        </p>
      </>
    );
  }

  const initialItems = [...dep.activeBaseline.snapshot.items]
    .sort((a, b) => (SLOT_INDEX.get(a.slot as never) ?? 99) - (SLOT_INDEX.get(b.slot as never) ?? 99))
    .map((i) => ({ slot: i.slot, value: i.value }));

  return (
    <>
      <PageHeader
        breadcrumb={
          <span className="flex items-center gap-1">
            <Link href="/deployments" className="hover:underline">Deployments</Link>
            <span>/</span>
            <Link href={`/deployments/${dep.code}`} className="hover:underline">{dep.name}</Link>
            <span>/</span>
            <span>New change</span>
          </span>
        }
        title="New change"
      />
      <NewChangeForm deploymentCode={dep.code} initialItems={initialItems} />
    </>
  );
}
