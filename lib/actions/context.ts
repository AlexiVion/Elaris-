import { cookies } from "next/headers";
import { prisma } from "@/lib/db/prisma";
import type { Role } from "@/lib/domain/enums";

export interface Actor {
  id: string;
  name: string;
  role: Role;
}

/**
 * The acting person = the "Viewing as" persona (spec §2 — no real auth). Server
 * Actions use this as the audit actor and for role gating (e.g. only a
 * SAFETY_LEAD approves a change, §6.4).
 */
export async function getActor(): Promise<Actor> {
  const id = cookies().get("elaris_viewer")?.value;
  const person =
    (id ? await prisma.person.findUnique({ where: { id } }) : null) ??
    (await prisma.person.findFirst({ where: { role: "ENGINEER" } })) ??
    (await prisma.person.findFirst());
  if (!person) throw new Error("No persons available for the demo.");
  return { id: person.id, name: person.name, role: person.role as Role };
}
