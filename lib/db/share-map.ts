import { getShareLinks } from "./share";
import type { ShareLinkRow } from "@/components/elaris/ShareDialog";

/** Fetch share links for a target and serialize dates for the client dialog. */
export async function shareLinkRows(view: string, targetId: string): Promise<ShareLinkRow[]> {
  const links = await getShareLinks(view, targetId);
  return links.map((l) => ({
    id: l.id,
    audienceLabel: l.audienceLabel,
    createdBy: l.createdBy,
    expiresAt: l.expiresAt.toISOString(),
    revokedAt: l.revokedAt ? l.revokedAt.toISOString() : null,
    active: l.active,
  }));
}
