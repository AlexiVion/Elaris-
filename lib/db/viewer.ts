import { cookies } from "next/headers";
import { prisma } from "./prisma";

const VIEWER_COOKIE = "elaris_viewer";

/**
 * Persona seed selector context (spec §2 — no real auth). Returns all persons
 * and the currently selected viewer id (from cookie, defaulting to the first
 * engineer / first person).
 */
export async function getViewerContext() {
  const persons = await prisma.person.findMany({ orderBy: { name: "asc" } });
  const cookieId = cookies().get(VIEWER_COOKIE)?.value;
  const viewer =
    persons.find((p) => p.id === cookieId) ??
    persons.find((p) => p.role === "ENGINEER") ??
    persons[0];

  return {
    persons: persons.map((p) => ({ id: p.id, name: p.name, role: p.role })),
    viewerId: viewer?.id ?? "",
    viewer,
  };
}
