import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "SUPERADMIN") redirect("/login?next=/admin");
  return session;
}

export async function audit(action: string, entity: string, entityId?: string, actorId?: string) {
  try {
    await prisma.auditLog.create({ data: { action, entity, entityId, actorId } });
  } catch (e) {
    console.error("audit falló", e);
  }
}
