"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Share2, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
import { Input, Label } from "@/components/ui/input";
import { createShareLink, revokeShareLink } from "@/lib/actions/share";
import type { ShareView } from "@/lib/domain/enums";

export interface ShareLinkRow {
  id: string;
  audienceLabel: string;
  createdBy: string;
  expiresAt: string; // ISO
  revokedAt: string | null;
  active: boolean;
}

export function ShareDialog({
  view,
  targetId,
  links = [],
}: {
  view: ShareView;
  targetId: string;
  links?: ShareLinkRow[];
}) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [audience, setAudience] = useState("Customer");
  const [days, setDays] = useState(30);
  const [createdUrl, setCreatedUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  function create() {
    setError(null); setCreatedUrl(null);
    start(async () => {
      const res = await createShareLink({ view, targetId, audienceLabel: audience, expiresInDays: days });
      if (!res.ok) setError(res.error);
      else {
        setCreatedUrl(`${window.location.origin}/share/${res.data.token}`);
        router.refresh();
      }
    });
  }

  function revoke(id: string) {
    start(async () => {
      await revokeShareLink(id);
      router.refresh();
    });
  }

  function copy() {
    if (!createdUrl) return;
    navigator.clipboard?.writeText(createdUrl).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline"><Share2 className="size-4" /> Share View</Button>
      </DialogTrigger>
      <DialogContent title="Share View" description="A read-only link with an audience label, expiry and revocation (spec §7.8).">
        <div className="space-y-4">
          {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

          <div className="grid grid-cols-[1fr_auto] items-end gap-2">
            <div>
              <Label htmlFor="audience">Audience label</Label>
              <Input id="audience" value={audience} onChange={(e) => setAudience(e.target.value)} placeholder="Customer / Insurer / Safety" />
            </div>
            <div className="w-24">
              <Label htmlFor="days">Expires (days)</Label>
              <Input id="days" type="number" min={1} max={365} value={days} onChange={(e) => setDays(Number(e.target.value))} />
            </div>
          </div>
          <Button onClick={create} disabled={pending}>{pending ? "Creating…" : "Create link"}</Button>

          {createdUrl && (
            <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3">
              <div className="mb-1 text-xs font-medium text-emerald-800">Link created — copy it now:</div>
              <div className="flex items-center gap-2">
                <code className="flex-1 truncate rounded bg-white px-2 py-1 text-xs">{createdUrl}</code>
                <Button size="sm" variant="outline" onClick={copy}>{copied ? <Check className="size-4" /> : <Copy className="size-4" />}</Button>
              </div>
            </div>
          )}

          {links.length > 0 && (
            <div>
              <div className="mb-1 text-sm font-medium">Existing links</div>
              <ul className="divide-y divide-border text-sm">
                {links.map((l) => (
                  <li key={l.id} className="flex items-center gap-2 py-2">
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium">{l.audienceLabel}</div>
                      <div className="text-xs text-muted-foreground">
                        {l.revokedAt ? "Revoked" : l.active ? `Expires ${new Date(l.expiresAt).toLocaleDateString("en-US")}` : "Expired"} · by {l.createdBy}
                      </div>
                    </div>
                    {l.active && (
                      <Button size="sm" variant="ghost" className="text-red-600" onClick={() => revoke(l.id)} disabled={pending}>Revoke</Button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
