"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CircleCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { approveChange } from "@/lib/actions/changes";

/**
 * Approve Change (spec §6.4). The button explains WHY it is disabled: HIGH items
 * still open, or the viewer is not a Safety Lead. The server re-enforces both.
 */
export function ApproveChangeButton({
  changeCode,
  highOpen,
  isSafetyLead,
  alreadyApproved,
}: {
  changeCode: string;
  highOpen: boolean;
  isSafetyLead: boolean;
  alreadyApproved: boolean;
}) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const blockedReason = alreadyApproved
    ? "This change is already approved."
    : !isSafetyLead
      ? "Only a Safety Lead can approve. Switch persona in “Viewing as”."
      : highOpen
        ? "Resolve or waive all high-impact items before approving."
        : null;

  const disabled = pending || blockedReason !== null;

  function onClick() {
    setError(null);
    start(async () => {
      const res = await approveChange({ changeCode });
      if (!res.ok) setError(res.error);
      else router.refresh();
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button onClick={onClick} disabled={disabled} title={blockedReason ?? undefined}>
        <CircleCheck className="size-4" /> {pending ? "Approving…" : "Approve Change"}
      </Button>
      {(blockedReason || error) && (
        <span className="max-w-xs text-right text-xs text-muted-foreground">{error ?? blockedReason}</span>
      )}
    </div>
  );
}
